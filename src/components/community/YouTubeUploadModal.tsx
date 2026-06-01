import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Youtube, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function parseYouTube(url: string): { id: string | null; isShort: boolean; reason?: string } {
  if (!url) return { id: null, isShort: false };
  if (!/^https?:\/\//i.test(url)) {
    return { id: null, isShort: false, reason: "URL must start with http:// or https://" };
  }
  if (!/(youtube\.com|youtu\.be)/i.test(url)) {
    return { id: null, isShort: false, reason: "Only YouTube links are supported" };
  }
  const patterns: { re: RegExp; isShort?: boolean }[] = [
    { re: /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, isShort: true },
    { re: /youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/ },
    { re: /youtu\.be\/([a-zA-Z0-9_-]{11})/ },
    { re: /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/ },
  ];
  for (const { re, isShort } of patterns) {
    const m = url.match(re);
    if (m) return { id: m[1], isShort: !!isShort };
  }
  return { id: null, isShort: false, reason: "Could not find a valid 11-character video ID in this link" };
}

export const YouTubeUploadModal = ({ open, onOpenChange }: Props) => {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();

  // Existing youtube_ids for client-side duplicate detection
  const { data: existingIds } = useQuery({
    queryKey: ["youtube-videos-existing-ids"],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("youtube_id").limit(1000);
      if (error) throw error;
      return new Set((data || []).map((v: any) => v.youtube_id as string));
    },
    enabled: open,
    staleTime: 1000 * 30,
  });

  const trimmed = url.trim();
  const preview = useMemo(() => parseYouTube(trimmed), [trimmed]);
  const isDuplicate = !!(preview.id && existingIds?.has(preview.id));
  const canSubmit = !!preview.id && !isDuplicate && !submitting && !!user;

  const reset = () => {
    setUrl("");
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!user) {
      setServerError("Please sign in to add a video.");
      return;
    }
    if (!preview.id) {
      setServerError(preview.reason || "Paste a valid YouTube link.");
      return;
    }
    if (isDuplicate) {
      setServerError("This video is already in the feed.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-ingest", {
        body: { url: trimmed },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({ title: "Added to feed", description: "Your YouTube video is now live." });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["community-reels-infinite"] }),
        qc.invalidateQueries({ queryKey: ["youtube-videos-for-reels"] }),
        qc.invalidateQueries({ queryKey: ["youtube-videos-existing-ids"] }),
      ]);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.message || "Try a different link.";
      setServerError(msg);
      toast({ title: "Could not add video", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!submitting) { if (!o) reset(); onOpenChange(o); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Add a YouTube video
          </DialogTitle>
          <DialogDescription>
            Paste a YouTube link to share it in the reels feed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => { setUrl(e.target.value); setServerError(null); }}
            disabled={submitting}
            aria-invalid={!!(trimmed && (!preview.id || isDuplicate))}
          />

          {preview.id && !isDuplicate && (
            <div className="flex gap-3 items-start rounded-lg border p-3 bg-muted/30">
              <img
                src={`https://i.ytimg.com/vi/${preview.id}/hqdefault.jpg`}
                alt="Video preview"
                className="w-28 h-20 object-cover rounded-md flex-shrink-0"
              />
              <div className="text-sm">
                <p className="font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Preview ready
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Type: {preview.isShort ? "YouTube Short" : "Long-form video"}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5 break-all">ID: {preview.id}</p>
              </div>
            </div>
          )}

          {trimmed && !preview.id && (
            <p className="text-sm text-destructive flex items-start gap-1">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {preview.reason || "Not a recognized YouTube URL."}
            </p>
          )}

          {isDuplicate && (
            <p className="text-sm text-amber-600 flex items-start gap-1">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              This video is already in the feed.
            </p>
          )}

          {serverError && !isDuplicate && (
            <p className="text-sm text-destructive flex items-start gap-1">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {serverError}
            </p>
          )}

          {!user && (
            <p className="text-xs text-muted-foreground">Sign in to share a video.</p>
          )}

          {submitting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching video details and publishing…
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {submitting ? "Adding…" : "Add to feed"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
