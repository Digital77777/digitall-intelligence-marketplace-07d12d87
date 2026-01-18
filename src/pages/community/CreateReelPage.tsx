import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Video, Loader2, Scissors, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useBackgroundUpload } from "@/contexts/BackgroundUploadContext";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { VideoTrimmer } from "@/components/media/VideoTrimmer";
import { validateVideoDuration, MAX_VIDEO_DURATION_SECONDS, formatDuration } from "@/lib/videoValidation";
import { cn } from "@/lib/utils";

const CreateReelPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadReel, hasActiveUploads } = useBackgroundUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [isTrimmed, setIsTrimmed] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isStartingUpload, setIsStartingUpload] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP4, WebM, MOV, or AVI video files.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 100MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate video duration
    setIsValidating(true);
    const durationResult = await validateVideoDuration(file, MAX_VIDEO_DURATION_SECONDS);
    setIsValidating(false);
    setVideoDuration(durationResult.duration);

    if (!durationResult.valid) {
      toast({
        title: "Video too long",
        description: durationResult.message || `Video must be ${formatDuration(MAX_VIDEO_DURATION_SECONDS)} or less. You can trim it to fit.`,
        variant: "destructive",
      });
    }

    // Cleanup previous preview
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setShowTrimmer(true);
    setIsTrimmed(false);
  }, [toast, videoPreview]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleFileSelect(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please drop a video file.",
        variant: "destructive",
      });
    }
  }, [handleFileSelect, toast]);

  const handleTrimComplete = useCallback((trimmedBlob: Blob) => {
    // Cleanup old preview
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    
    const trimmedFile = new File([trimmedBlob], videoFile?.name || "trimmed-video.webm", {
      type: trimmedBlob.type,
    });
    
    setVideoFile(trimmedFile);
    setVideoPreview(URL.createObjectURL(trimmedBlob));
    setShowTrimmer(false);
    setIsTrimmed(true);
    
    toast({
      title: "Video trimmed",
      description: "Your video has been trimmed successfully.",
    });
  }, [toast, videoFile?.name, videoPreview]);

  const handleCancelTrim = useCallback(() => {
    setShowTrimmer(false);
  }, []);

  const removeVideo = useCallback(() => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setVideoDuration(null);
    setIsTrimmed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [videoPreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!videoFile) {
      toast({
        title: "No video selected",
        description: "Please select a video to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your reel.",
        variant: "destructive",
      });
      return;
    }

    setIsStartingUpload(true);

    try {
      // Generate a thumbnail from the video for the upload indicator
      let thumbnail: string | undefined;
      try {
        const video = document.createElement('video');
        video.src = videoPreview || '';
        video.currentTime = 0.5;
        await new Promise(resolve => { video.onloadeddata = resolve; video.load(); });
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, 80, 80);
        thumbnail = canvas.toDataURL('image/jpeg', 0.5);
      } catch (e) {
        // Thumbnail generation failed, continue without it
      }

      // Start background upload
      await uploadReel({
        userId: user.id,
        videoFile,
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnail,
      });

      toast({
        title: "Upload started!",
        description: "Your reel is uploading in the background. You can continue browsing.",
      });

      // Navigate away immediately - upload continues in background
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
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Please log in to create a reel</p>
            <Button onClick={() => navigate("/auth")}>
              Log In
            </Button>
          </CardContent>
        </Card>
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
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Create a Reel
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Share short videos up to {MAX_VIDEO_DURATION_SECONDS} seconds with the community
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Video Upload */}
                <div className="space-y-2">
                  <Label>Video *</Label>
                  {!videoPreview ? (
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                        isDragging 
                          ? "border-primary bg-primary/5 scale-[1.02]" 
                          : "border-muted-foreground/25 hover:border-primary/50",
                        isValidating && "pointer-events-none opacity-70"
                      )}
                      onClick={() => !isValidating && fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                      aria-label="Upload video"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">
                            Validating video...
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            {isDragging ? "Drop your video here" : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            MP4, WebM, MOV, AVI (max 100MB, up to {MAX_VIDEO_DURATION_SECONDS}s)
                          </p>
                        </>
                      )}
                    </div>
                  ) : showTrimmer ? (
                    <VideoTrimmer
                      videoFile={videoFile!}
                      videoUrl={videoPreview}
                      onTrimComplete={handleTrimComplete}
                      onCancel={handleCancelTrim}
                      maxDuration={MAX_VIDEO_DURATION_SECONDS}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] max-w-xs mx-auto shadow-lg">
                        <video
                          src={videoPreview}
                          className="w-full h-full object-contain"
                          controls
                          playsInline
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 shadow-md"
                          onClick={removeVideo}
                          aria-label="Remove video"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        {isTrimmed && (
                          <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Scissors className="w-3 h-3" />
                            Trimmed
                          </div>
                        )}
                        {/* Duration badge */}
                        {videoDuration && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            {Math.floor(videoDuration)}s
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTrimmer(true)}
                        >
                          <Scissors className="w-4 h-4 mr-2" />
                          {isTrimmed ? "Trim Again" : "Trim Video"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            removeVideo();
                            fileInputRef.current?.click();
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Replace
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    className="hidden"
                    onChange={handleInputChange}
                    aria-label="Select video file"
                  />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your reel a catchy title"
                    maxLength={100}
                    disabled={isStartingUpload}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {title.length}/100
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description for your reel..."
                    rows={3}
                    maxLength={500}
                    disabled={isStartingUpload}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {description.length}/500
                  </p>
                </div>

                {/* Background Upload Info */}
                {hasActiveUploads && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-primary flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Previous upload in progress...
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-ai text-white"
                  disabled={isStartingUpload || !videoFile || !title.trim() || isValidating}
                >
                  {isStartingUpload ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Upload...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Publish & Continue Browsing
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateReelPage;
