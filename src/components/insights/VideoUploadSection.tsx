import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Scissors, Upload, Video as VideoIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { VideoTrimmer } from '@/components/media/VideoTrimmer';
import { generateVideoThumbnail } from '@/lib/videoThumbnail';
import { validateVideoDuration, MAX_VIDEO_DURATION_SECONDS, formatDuration } from '@/lib/videoValidation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VideoUploadSectionProps {
  userId: string;
  coverVideos: string[];
  videoThumbnails: string[];
  onVideosChange: (videos: string[]) => void;
  onThumbnailsChange: (thumbnails: string[]) => void;
}

export const VideoUploadSection: React.FC<VideoUploadSectionProps> = ({
  userId, coverVideos, videoThumbnails, onVideosChange, onThumbnailsChange,
}) => {
  const { toast } = useToast();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingVideoPreview, setPendingVideoPreview] = useState<string | null>(null);
  const [showVideoTrimmer, setShowVideoTrimmer] = useState(false);
  const [isVideoTrimmed, setIsVideoTrimmed] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    return () => {
      if (pendingVideoPreview) URL.revokeObjectURL(pendingVideoPreview);
    };
  }, []);

  const handleVideoFileSelect = useCallback(async (file: File) => {
    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload MP4, WebM, MOV, or AVI video files.", variant: "destructive" });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Video must be less than 100MB.", variant: "destructive" });
      return;
    }

    setIsValidating(true);
    const durationResult = await validateVideoDuration(file, MAX_VIDEO_DURATION_SECONDS);
    setIsValidating(false);

    if (!durationResult.valid) {
      toast({ title: "Video too long", description: `Video must be ${formatDuration(MAX_VIDEO_DURATION_SECONDS)} or less. You can trim it to fit.`, variant: "destructive" });
    }

    if (pendingVideoPreview) URL.revokeObjectURL(pendingVideoPreview);
    setPendingVideoFile(file);
    setPendingVideoPreview(URL.createObjectURL(file));
    setShowVideoTrimmer(true);
    setIsVideoTrimmed(false);
  }, [toast, pendingVideoPreview]);

  const handleVideoInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVideoFileSelect(file);
  }, [handleVideoFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) handleVideoFileSelect(file);
    else toast({ title: "Invalid file", description: "Please drop a video file.", variant: "destructive" });
  }, [handleVideoFileSelect, toast]);

  const handleTrimComplete = useCallback(async (trimmedBlob: Blob) => {
    setIsUploadingVideo(true);
    setUploadProgress(0);
    try {
      setUploadProgress(20);
      const fileExt = pendingVideoFile?.name.split('.').pop() || 'webm';
      const fileName = `${userId}/videos/${Date.now()}.${fileExt}`;
      setUploadProgress(40);
      const { data, error } = await supabase.storage.from('community-insights').upload(fileName, trimmedBlob, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      setUploadProgress(70);
      const { data: { publicUrl } } = supabase.storage.from('community-insights').getPublicUrl(data.path);
      setUploadProgress(85);
      const thumbnail = await generateVideoThumbnail(publicUrl, 1);
      onVideosChange([publicUrl]);
      onThumbnailsChange([thumbnail]);
      setShowVideoTrimmer(false);
      setIsVideoTrimmed(true);
      setUploadProgress(100);
      if (pendingVideoPreview) URL.revokeObjectURL(pendingVideoPreview);
      setPendingVideoFile(null);
      setPendingVideoPreview(null);
      toast({ title: "Video uploaded", description: "Your trimmed video has been uploaded successfully." });
    } catch (error: any) {
      console.error('Video upload error:', error);
      toast({ title: "Upload failed", description: error.message || "Failed to upload video. Please try again.", variant: "destructive" });
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(0);
    }
  }, [userId, pendingVideoFile, pendingVideoPreview, toast, onVideosChange, onThumbnailsChange]);

  const handleCancelTrim = useCallback(() => {
    if (pendingVideoPreview) URL.revokeObjectURL(pendingVideoPreview);
    setPendingVideoFile(null);
    setPendingVideoPreview(null);
    setShowVideoTrimmer(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }, [pendingVideoPreview]);

  const removeUploadedVideo = useCallback(async () => {
    if (coverVideos[0]?.includes('supabase.co/storage')) {
      try {
        const url = new URL(coverVideos[0]);
        const pathParts = url.pathname.split('/storage/v1/object/public/');
        if (pathParts.length > 1) {
          const [bucketName, ...filePath] = pathParts[1].split('/');
          await supabase.storage.from(bucketName).remove([filePath.join('/')]);
        }
      } catch (error) { console.error('Failed to delete from storage:', error); }
    }
    onVideosChange([]);
    onThumbnailsChange([]);
    setIsVideoTrimmed(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }, [coverVideos, onVideosChange, onThumbnailsChange]);

  return (
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
                isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-primary/50",
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
                  <p className="text-sm text-muted-foreground">Validating video...</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">{isDragging ? "Drop your video here" : "Click to upload or drag and drop"}</p>
                  <p className="text-xs text-muted-foreground">MP4, WebM, MOV (max 100MB, up to {MAX_VIDEO_DURATION_SECONDS}s)</p>
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
              <Button type="button" variant="ghost" size="sm" onClick={handleCancelTrim} aria-label="Cancel trimming">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <VideoTrimmer videoFile={pendingVideoFile} videoUrl={pendingVideoPreview} onTrimComplete={handleTrimComplete} onCancel={handleCancelTrim} maxDuration={MAX_VIDEO_DURATION_SECONDS} />
            {isUploadingVideo && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Uploading...</span>
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
                <video src={coverVideos[0]} className="w-full h-full object-contain" controls playsInline />
                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 shadow-md" onClick={removeUploadedVideo} aria-label="Remove video">
                  <X className="w-4 h-4" />
                </Button>
                {isVideoTrimmed && (
                  <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Scissors className="w-3 h-3" />Trimmed
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <Button type="button" variant="outline" size="sm" onClick={() => { removeUploadedVideo(); videoInputRef.current?.click(); }}>
                  <Upload className="w-4 h-4 mr-2" />Replace Video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" className="hidden" onChange={handleVideoInputChange} aria-label="Select video file" />
    </div>
  );
};
