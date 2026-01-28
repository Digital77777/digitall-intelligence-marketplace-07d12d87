import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Video, Loader2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { getVideoDuration, MAX_VIDEO_DURATION_SECONDS, formatDuration } from "@/lib/videoValidation";
import { InlineTrimTimeline } from "./InlineTrimTimeline";

interface QuickVideoUploaderProps {
  onVideoReady: (file: File, trimStart: number, trimEnd: number) => void;
  onVideoRemove: () => void;
  disabled?: boolean;
}

export const QuickVideoUploader = ({
  onVideoReady,
  onVideoRemove,
  disabled = false,
}: QuickVideoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, []);

  // Update parent when trim changes
  useEffect(() => {
    if (videoFile && trimEnd > trimStart) {
      onVideoReady(videoFile, trimStart, trimEnd);
    }
  }, [videoFile, trimStart, trimEnd, onVideoReady]);

  // Keep playback within trim bounds
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= trimEnd) {
        video.currentTime = trimStart;
        if (!video.loop) {
          video.pause();
          setIsPlaying(false);
        }
      } else if (video.currentTime < trimStart) {
        video.currentTime = trimStart;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [trimStart, trimEnd]);

  const handleFileSelect = useCallback(async (file: File) => {
    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload MP4, WebM, or MOV files.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("Video must be less than 100MB.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Cleanup previous video URL first
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    try {
      // Create the URL immediately for faster preview
      const url = URL.createObjectURL(file);
      
      // Try to get duration with timeout fallback
      let videoDuration: number;
      try {
        videoDuration = await getVideoDuration(file);
      } catch (err) {
        // Fallback: Create a video element and try to get duration directly
        videoDuration = await new Promise<number>((resolve) => {
          const tempVideo = document.createElement('video');
          tempVideo.muted = true;
          tempVideo.playsInline = true;
          
          const fallbackTimeout = setTimeout(() => {
            // Ultimate fallback - assume max duration and let user trim
            resolve(MAX_VIDEO_DURATION_SECONDS);
          }, 5000);
          
          tempVideo.onloadeddata = () => {
            clearTimeout(fallbackTimeout);
            if (tempVideo.duration && isFinite(tempVideo.duration)) {
              resolve(tempVideo.duration);
            } else {
              resolve(MAX_VIDEO_DURATION_SECONDS);
            }
          };
          
          tempVideo.src = url;
          tempVideo.load();
        });
      }
      
      setVideoFile(file);
      setVideoUrl(url);
      setDuration(videoDuration);
      setTrimStart(0);
      setTrimEnd(Math.min(videoDuration, MAX_VIDEO_DURATION_SECONDS));
      setCurrentTime(0);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError("Could not load video. Try a different file.");
    }
  }, [videoUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('video/')) {
      handleFileSelect(file);
    } else {
      setError("Please drop a video file.");
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    setIsPlaying(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onVideoRemove();
  }, [videoUrl, onVideoRemove]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      if (video.currentTime >= trimEnd || video.currentTime < trimStart) {
        video.currentTime = trimStart;
      }
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, trimStart, trimEnd]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // No video selected - show upload zone
  if (!videoUrl) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer",
            "bg-gradient-to-br from-primary/5 via-background to-primary/10",
            isDragging 
              ? "border-primary bg-primary/10 scale-[1.01]" 
              : "border-primary/30 hover:border-primary/50 hover:bg-primary/5",
            isLoading && "pointer-events-none opacity-70",
            disabled && "opacity-50 pointer-events-none"
          )}
          onClick={() => !isLoading && !disabled && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 animate-pulse" />
          
          <AspectRatio ratio={9/16} className="max-h-[50vh]">
            <div className="flex flex-col items-center justify-center h-full p-8">
              {isLoading ? (
                <>
                  <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">Processing video...</p>
                </>
              ) : (
                <>
                  <div className={cn(
                    "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 transition-transform",
                    isDragging && "scale-110"
                  )}>
                    <Upload className={cn(
                      "w-10 h-10 text-primary transition-all",
                      isDragging && "scale-110"
                    )} />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {isDragging ? "Drop your video here" : "Upload your video"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Tap to select or drag and drop
                  </p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {["MP4", "WebM", "MOV"].map((format) => (
                      <span 
                        key={format}
                        className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Max 100MB • Up to {MAX_VIDEO_DURATION_SECONDS}s
                  </p>
                </>
              )}
            </div>
          </AspectRatio>
        </div>
        
        {error && (
          <p className="text-sm text-destructive text-center animate-fade-in">{error}</p>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          disabled={disabled}
        />
      </div>
    );
  }

  // Video selected - show preview with trim controls
  const trimDuration = trimEnd - trimStart;
  const isWithinLimit = trimDuration <= MAX_VIDEO_DURATION_SECONDS;

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl">
        <AspectRatio ratio={9/16} className="max-h-[50vh]">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            playsInline
            muted={isMuted}
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />
          
          {/* Play/Pause overlay */}
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity cursor-pointer",
              isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
            )}
            onClick={togglePlay}
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              {isPlaying ? (
                <Pause className="w-8 h-8 text-black" />
              ) : (
                <Play className="w-8 h-8 text-black ml-1" />
              )}
            </div>
          </div>
          
          {/* Controls overlay */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full bg-black/50 hover:bg-destructive backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
            >
              <X className="w-4 h-4 text-white" />
            </Button>
          </div>
          
          {/* Duration badge */}
          <div className={cn(
            "absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm",
            isWithinLimit 
              ? "bg-success/90 text-success-foreground" 
              : "bg-destructive/90 text-destructive-foreground"
          )}>
            {formatDuration(trimDuration)}
          </div>
        </AspectRatio>
      </div>

      {/* Inline Trim Timeline */}
      {duration > 0 && (
        <InlineTrimTimeline
          duration={duration}
          maxDuration={MAX_VIDEO_DURATION_SECONDS}
          startTime={trimStart}
          endTime={trimEnd}
          currentTime={currentTime}
          onStartChange={setTrimStart}
          onEndChange={setTrimEnd}
          onSeek={handleSeek}
        />
      )}
    </div>
  );
};
