import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function parseYouTube(url: string): { id: string | null; isShort: boolean } {
  if (!url) return { id: null, isShort: false };
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
  return { id: null, isShort: false };
}

export const YouTubeUploadModal = ({ open, onOpenChange }: Props) => {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const preview = useMemo(() => parseYouTube(url.trim()), [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview.id) {
      toast({ title: "Invalid URL", description: "Paste a valid YouTube link.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-ingest", {
        body: { url: url.trim() },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({ title: "Added to feed", description: "Your YouTube video is now live." });
      await qc.invalidateQueries({ queryKey: ["community-reels-infinite"] });
      await qc.invalidateQueries({ queryKey: ["youtube-videos-for-reels"] });
      setUrl("");
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Could not add video",
        description: err?.message || "Try a different link.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onChange={(e) => setUrl(e.target.value)}
            disabled={submitting}
          />

          {preview.id && (
            <div className="flex gap-3 items-start rounded-lg border p-3 bg-muted/30">
              <img
                src={`https://i.ytimg.com/vi/${preview.id}/hqdefault.jpg`}
                alt="Video preview"
                className="w-28 h-20 object-cover rounded-md flex-shrink-0"
              />
              <div className="text-sm">
                <p className="font-medium">Preview ready</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Type: {preview.isShort ? "YouTube Short" : "Long-form video"}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5 break-all">
                  ID: {preview.id}
                </p>
              </div>
            </div>
          )}

          {url.trim() && !preview.id && (
            <p className="text-sm text-destructive">Not a recognized YouTube URL.</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!preview.id || submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add to feed
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
