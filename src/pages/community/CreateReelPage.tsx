import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Video, Loader2, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { VideoTrimmer } from "@/components/media/VideoTrimmer";
import { validateVideoDuration, MAX_VIDEO_DURATION_SECONDS, formatDuration } from "@/lib/videoValidation";

const CreateReelPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [isTrimmed, setIsTrimmed] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    // Validate video duration (max 1 minute)
    setIsValidating(true);
    const durationResult = await validateVideoDuration(file, MAX_VIDEO_DURATION_SECONDS);
    setIsValidating(false);

    if (!durationResult.valid) {
      toast({
        title: "Video too long",
        description: durationResult.message || `Video must be ${formatDuration(MAX_VIDEO_DURATION_SECONDS)} or less. You can use the trimmer to shorten it.`,
        variant: "destructive",
      });
      // Still allow the user to trim the video
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setShowTrimmer(true);
    setIsTrimmed(false);
  };

  const handleTrimComplete = (trimmedBlob: Blob) => {
    // Clean up old preview
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    
    // Create new file from trimmed blob
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
  };

  const handleCancelTrim = () => {
    setShowTrimmer(false);
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Create a placeholder insight first (reels require an insight_id)
      const { data: insight, error: insightError } = await supabase
        .from("community_insights")
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: description.trim() || title.trim(),
          category: "reel",
          is_published: true,
        })
        .select()
        .single();

      if (insightError) throw insightError;
      setUploadProgress(30);

      // Upload video to storage
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("reels")
        .upload(fileName, videoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;
      setUploadProgress(70);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("reels")
        .getPublicUrl(fileName);

      // Create reel record
      const { error: reelError } = await supabase
        .from("community_reels")
        .insert({
          user_id: user.id,
          insight_id: insight.id,
          video_url: publicUrl,
          title: title.trim(),
        });

      if (reelError) throw reelError;
      setUploadProgress(100);

      toast({
        title: "Reel uploaded!",
        description: "Your reel has been published successfully.",
      });

      navigate("/community/reels");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload reel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please log in to create a reel</p>
            <Button onClick={() => navigate("/auth")} className="mt-4">
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
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Video Upload */}
                <div className="space-y-2">
                  <Label>Video *</Label>
                  {!videoPreview ? (
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, WebM, MOV, AVI (max 100MB)
                      </p>
                    </div>
                  ) : showTrimmer ? (
                    <VideoTrimmer
                      videoFile={videoFile!}
                      videoUrl={videoPreview}
                      onTrimComplete={handleTrimComplete}
                      onCancel={handleCancelTrim}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] max-w-xs mx-auto">
                        <video
                          src={videoPreview}
                          className="w-full h-full object-contain"
                          controls
                          muted
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeVideo}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        {isTrimmed && (
                          <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Scissors className="w-3 h-3" />
                            Trimmed
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full max-w-xs mx-auto flex"
                        onClick={() => setShowTrimmer(true)}
                      >
                        <Scissors className="w-4 h-4 mr-2" />
                        {isTrimmed ? "Trim Again" : "Trim Video"}
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    className="hidden"
                    onChange={handleFileSelect}
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
                  />
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
                  />
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-ai text-white"
                  disabled={isUploading || !videoFile || !title.trim()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Publish Reel
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
