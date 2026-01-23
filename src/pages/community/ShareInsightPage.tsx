import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, Eye, Edit, X, Scissors, Upload, Video as VideoIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { MediaUploader } from "@/components/media/MediaUploader";
import { generateVideoThumbnail } from "@/lib/videoThumbnail";
import { useToast } from "@/hooks/use-toast";
import { InsightPreview } from "@/components/community/InsightPreview";
import { VideoTrimmer } from "@/components/media/VideoTrimmer";
import { validateVideoDuration, MAX_VIDEO_DURATION_SECONDS, formatDuration } from "@/lib/videoValidation";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const ShareInsightPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createInsight } = useCommunity();
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    readTime: ""
  });
  const [coverImages, setCoverImages] = useState<string[]>([]);
  const [coverVideos, setCoverVideos] = useState<string[]>([]);
  const [videoThumbnails, setVideoThumbnails] = useState<string[]>([]);
  
  // Video trimming states
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingVideoPreview, setPendingVideoPreview] = useState<string | null>(null);
  const [showVideoTrimmer, setShowVideoTrimmer] = useState(false);
  const [isVideoTrimmed, setIsVideoTrimmed] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (pendingVideoPreview) {
        URL.revokeObjectURL(pendingVideoPreview);
      }
    };
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle direct video file selection for trimming
  const handleVideoFileSelect = useCallback(async (file: File) => {
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

    // Check video duration
    setIsValidating(true);
    const durationResult = await validateVideoDuration(file, MAX_VIDEO_DURATION_SECONDS);
    setIsValidating(false);
    
    if (!durationResult.valid) {
      toast({
        title: "Video too long",
        description: `Video must be ${formatDuration(MAX_VIDEO_DURATION_SECONDS)} or less. You can trim it to fit.`,
        variant: "destructive",
      });
    }

    // Cleanup previous preview
    if (pendingVideoPreview) {
      URL.revokeObjectURL(pendingVideoPreview);
    }

    setPendingVideoFile(file);
    setPendingVideoPreview(URL.createObjectURL(file));
    setShowVideoTrimmer(true);
    setIsVideoTrimmed(false);
  }, [toast, pendingVideoPreview]);

  const handleVideoInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVideoFileSelect(file);
  }, [handleVideoFileSelect]);

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
      handleVideoFileSelect(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please drop a video file.",
        variant: "destructive",
      });
    }
  }, [handleVideoFileSelect, toast]);

  const handleTrimComplete = useCallback(async (trimmedBlob: Blob) => {
    if (!user) return;
    
    setIsUploadingVideo(true);
    setUploadProgress(0);
    
    try {
      // Upload trimmed video to storage
      setUploadProgress(20);
      const fileExt = pendingVideoFile?.name.split('.').pop() || 'webm';
      const fileName = `${user.id}/videos/${Date.now()}.${fileExt}`;
      
      setUploadProgress(40);
      const { data, error } = await supabase.storage
        .from('community-insights')
        .upload(fileName, trimmedBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      setUploadProgress(70);

      const { data: { publicUrl } } = supabase.storage
        .from('community-insights')
        .getPublicUrl(data.path);

      // Generate thumbnail
      setUploadProgress(85);
      const thumbnail = await generateVideoThumbnail(publicUrl, 1);
      
      setCoverVideos([publicUrl]);
      setVideoThumbnails([thumbnail]);
      setShowVideoTrimmer(false);
      setIsVideoTrimmed(true);
      setUploadProgress(100);
      
      // Cleanup preview URL
      if (pendingVideoPreview) {
        URL.revokeObjectURL(pendingVideoPreview);
      }
      setPendingVideoFile(null);
      setPendingVideoPreview(null);

      toast({
        title: "Video uploaded",
        description: "Your trimmed video has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error('Video upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(0);
    }
  }, [user, pendingVideoFile, pendingVideoPreview, toast]);

  const handleCancelTrim = useCallback(() => {
    if (pendingVideoPreview) {
      URL.revokeObjectURL(pendingVideoPreview);
    }
    setPendingVideoFile(null);
    setPendingVideoPreview(null);
    setShowVideoTrimmer(false);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }, [pendingVideoPreview]);

  const removeUploadedVideo = useCallback(async () => {
    // Try to delete from storage
    if (coverVideos[0]?.includes('supabase.co/storage')) {
      try {
        const url = new URL(coverVideos[0]);
        const pathParts = url.pathname.split('/storage/v1/object/public/');
        if (pathParts.length > 1) {
          const [bucketName, ...filePath] = pathParts[1].split('/');
          await supabase.storage.from(bucketName).remove([filePath.join('/')]);
        }
      } catch (error) {
        console.error('Failed to delete from storage:', error);
      }
    }
    
    setCoverVideos([]);
    setVideoThumbnails([]);
    setIsVideoTrimmed(false);
    
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }, [coverVideos]);

  const handleVideosChange = async (videos: string[]) => {
    setCoverVideos(videos);
    
    // Generate thumbnails for new videos
    if (videos.length > 0) {
      try {
        const thumbnails: string[] = [];
        for (const videoUrl of videos) {
          const thumbnail = await generateVideoThumbnail(videoUrl, 1);
          thumbnails.push(thumbnail);
        }
        setVideoThumbnails(thumbnails);
      } catch (error) {
        console.error('Error generating video thumbnails:', error);
        toast({
          title: "Thumbnail Generation Failed",
          description: "Could not generate video preview, but video will still be uploaded.",
          variant: "destructive",
        });
      }
    } else {
      setVideoThumbnails([]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to publish your insight.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your insight.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Content Required", 
        description: "Please add some content to your insight.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.content.trim().length < 50) {
      toast({
        title: "Content Too Short",
        description: "Your insight content must be at least 50 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a category for your insight.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createInsight.mutateAsync({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        read_time: formData.readTime || undefined,
        cover_image: coverImages.length > 0 ? coverImages[0] : undefined,
        images: coverImages.length > 1 ? coverImages : undefined,
        videos: coverVideos.length > 0 ? coverVideos : undefined,
        video_thumbnails: videoThumbnails.length > 0 ? videoThumbnails : undefined,
      });
      toast({
        title: "Success!",
        description: "Your insight has been published.",
      });
      navigate("/community");
    } catch (error: any) {
      console.error('Error creating insight:', error);
      toast({
        title: "Failed to Publish",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/community")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>

        {isPreviewMode ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Preview Mode</h2>
              <p className="text-sm text-muted-foreground">This is how your insight will appear to others</p>
            </div>
            <InsightPreview
              title={formData.title}
              content={formData.content}
              category={formData.category}
              readTime={formData.readTime}
              coverImage={coverImages[0]}
              coverImages={coverImages}
              coverVideo={coverVideos[0]}
              videoThumbnail={videoThumbnails[0]}
            />
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(false)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <Button
                className="bg-gradient-ai text-white"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title || !formData.content || !formData.category}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {isSubmitting ? "Publishing..." : "Publish Insight"}
              </Button>
            </div>
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Share Your Insight</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Share your knowledge, experiences, and learnings with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Insight Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., The Future of AI in Education"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">
                    Make it compelling and descriptive
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai-tools">AI Tools</SelectItem>
                        <SelectItem value="machine-learning">Machine Learning</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readTime">Estimated Read Time</Label>
                    <Input
                      id="readTime"
                      placeholder="e.g., 5 min"
                      value={formData.readTime}
                      onChange={(e) => handleChange("readTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your insights, experiences, and knowledge with the community... You can include #hashtags and links (https://example.com)"
                    value={formData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    rows={15}
                    maxLength={5000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.content.length}/5000 characters. Links and #hashtags will be highlighted.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Cover Media (Optional)</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload up to 5 images or a video (max 1 minute) to showcase your insight. Videos can be trimmed before upload.
                    </p>
                  </div>

                  {/* Video with Trimmer Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <VideoIcon className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Video (with preview & trim)</Label>
                    </div>
                    
                    {!coverVideos.length && !showVideoTrimmer ? (
                      <Card>
                        <CardContent className="p-4">
                          <div 
                            className={cn(
                              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200",
                              isDragging 
                                ? "border-primary bg-primary/5 scale-[1.02]" 
                                : "border-muted-foreground/25 hover:border-primary/50",
                              isValidating && "pointer-events-none opacity-70"
                            )}
                            onClick={() => !isValidating && videoInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && videoInputRef.current?.click()}
                            aria-label="Upload video"
                          >
                            {isValidating ? (
                              <>
                                <Loader2 className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground">
                                  Validating video...
                                </p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-1">
                                  {isDragging ? "Drop your video here" : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  MP4, WebM, MOV (max 100MB, up to {MAX_VIDEO_DURATION_SECONDS}s)
                                </p>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : showVideoTrimmer && pendingVideoFile && pendingVideoPreview ? (
                      <Card>
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Scissors className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Trim Your Video</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelTrim}
                              aria-label="Cancel trimming"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <VideoTrimmer
                            videoFile={pendingVideoFile}
                            videoUrl={pendingVideoPreview}
                            onTrimComplete={handleTrimComplete}
                            onCancel={handleCancelTrim}
                            maxDuration={MAX_VIDEO_DURATION_SECONDS}
                          />
                          {isUploadingVideo && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Uploading...
                                </span>
                                <span className="font-medium">{uploadProgress}%</span>
                              </div>
                              <Progress value={uploadProgress} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : coverVideos.length > 0 ? (
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-md mx-auto shadow-lg">
                              <video
                                src={coverVideos[0]}
                                className="w-full h-full object-contain"
                                controls
                                playsInline
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 shadow-md"
                                onClick={removeUploadedVideo}
                                aria-label="Remove video"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              {isVideoTrimmed && (
                                <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                                  <Scissors className="w-3 h-3" />
                                  Trimmed
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 justify-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  removeUploadedVideo();
                                  videoInputRef.current?.click();
                                }}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Replace Video
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}
                    
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                      className="hidden"
                      onChange={handleVideoInputChange}
                      aria-label="Select video file"
                    />
                  </div>

                  {/* Image Upload - Using existing MediaUploader */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Or upload images (up to 5):
                    </p>
                    <MediaUploader
                      images={coverImages}
                      videos={[]}
                      onImagesChange={setCoverImages}
                      onVideosChange={() => {}}
                      maxImages={5}
                      maxVideos={0}
                      maxFileSize={20}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button type="submit" className="w-full sm:w-auto bg-gradient-ai text-white" disabled={isSubmitting}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Publishing..." : "Publish Insight"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsPreviewMode(true)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => navigate("/community")}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ShareInsightPage;
