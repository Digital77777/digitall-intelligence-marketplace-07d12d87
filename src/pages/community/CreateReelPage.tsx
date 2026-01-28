import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useBackgroundUpload } from "@/contexts/BackgroundUploadContext";
import { SEOHead } from "@/components/SEOHead";
import { QuickVideoUploader } from "@/components/reels";
import { MAX_VIDEO_DURATION_SECONDS } from "@/lib/videoValidation";
import { cn } from "@/lib/utils";

const CreateReelPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadReel, hasActiveUploads } = useBackgroundUpload();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoData, setVideoData] = useState<{
    file: File;
    trimStart: number;
    trimEnd: number;
  } | null>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isStartingUpload, setIsStartingUpload] = useState(false);

  const handleVideoReady = useCallback((file: File, trimStart: number, trimEnd: number) => {
    setVideoData({ file, trimStart, trimEnd });
  }, []);

  const handleVideoRemove = useCallback(() => {
    setVideoData(null);
  }, []);

  const isFormValid = useMemo(() => {
    return videoData && title.trim().length > 0;
  }, [videoData, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!videoData || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a video and title.",
        variant: "destructive",
      });
      return;
    }

    setIsStartingUpload(true);

    try {
      // Generate thumbnail
      let thumbnail: string | undefined;
      try {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoData.file);
        video.currentTime = videoData.trimStart + 0.5;
        await new Promise(resolve => { video.onloadeddata = resolve; video.load(); });
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, 80, 80);
        thumbnail = canvas.toDataURL('image/jpeg', 0.5);
        URL.revokeObjectURL(video.src);
      } catch (e) {
        // Continue without thumbnail
      }

      // Start background upload with the original file
      // Note: For instant upload, we skip re-encoding and upload original
      await uploadReel({
        userId: user.id,
        videoFile: videoData.file,
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnail,
      });

      toast({
        title: "Upload started!",
        description: "Your reel is uploading in the background.",
      });

      navigate("/community/reels");
    } catch (error: any) {
      console.error("Upload start error:", error);
      toast({
        title: "Failed to start upload",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStartingUpload(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Sign in to create reels</h2>
          <p className="text-muted-foreground">Share your moments with the community</p>
          <Button onClick={() => navigate("/auth")} size="lg">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Create Reel - Digital Intelligence Marketplace"
        description="Upload and share short video content with the community"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 h-14">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">New Reel</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </header>

        <form onSubmit={handleSubmit} className="pb-24">
          <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
            {/* Video Uploader */}
            <QuickVideoUploader
              onVideoReady={handleVideoReady}
              onVideoRemove={handleVideoRemove}
              disabled={isStartingUpload}
            />

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your reel a catchy title"
                maxLength={100}
                disabled={isStartingUpload}
                className="h-12 text-base"
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/100
              </p>
            </div>

            {/* Collapsible Description */}
            <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between h-12 px-3"
                >
                  <span className="text-sm">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </span>
                  {isDescriptionOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="space-y-2">
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more context to your reel..."
                    rows={3}
                    maxLength={500}
                    disabled={isStartingUpload}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {description.length}/500
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Active upload indicator */}
            {hasActiveUploads && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Previous upload in progress...
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t safe-area-pb">
          <div className="max-w-lg mx-auto">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isStartingUpload || !isFormValid}
              className={cn(
                "w-full h-14 text-base font-semibold rounded-xl transition-all",
                "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                "shadow-lg hover:shadow-xl",
                !isFormValid && "opacity-50"
              )}
            >
              {isStartingUpload ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Starting Upload...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Publish & Continue Browsing
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Upload happens in the background • Max {MAX_VIDEO_DURATION_SECONDS}s
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateReelPage;
