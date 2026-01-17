import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Scissors, Play, Pause, RotateCcw, AlertCircle, Clock, CheckCircle2, Volume2, VolumeX, Loader2, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_VIDEO_DURATION_SECONDS } from "@/lib/videoValidation";
import { compressVideo, formatFileSize, shouldCompress } from "@/lib/videoCompression";
import { cn } from "@/lib/utils";

interface VideoTrimmerProps {
  videoFile: File;
  videoUrl: string;
  onTrimComplete: (trimmedBlob: Blob) => void;
  onCancel: () => void;
  maxDuration?: number;
  enableCompression?: boolean;
}

type CompressionQuality = 'auto' | 'low' | 'medium' | 'high' | 'none';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
};

export const VideoTrimmer = ({
  videoFile,
  videoUrl,
  onTrimComplete,
  onCancel,
  maxDuration = MAX_VIDEO_DURATION_SECONDS,
  enableCompression = true,
}: VideoTrimmerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimProgress, setTrimProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Compression states
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionQuality, setCompressionQuality] = useState<CompressionQuality>('auto');
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    ratio: number;
  } | null>(null);
  
  // Determine if compression is recommended
  const isCompressionRecommended = useMemo(() => {
    if (!enableCompression) return false;
    const trimDuration = endTime - startTime;
    return shouldCompress(videoFile.size, trimDuration);
  }, [videoFile.size, startTime, endTime, enableCompression]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const dur = video.duration;
      setDuration(dur);
      // Auto-set end time to max duration if video is longer
      setEndTime(Math.min(dur, maxDuration));
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      
      if (time >= endTime) {
        video.pause();
        video.currentTime = startTime;
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      setError("Failed to load video. Please try a different file.");
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("error", handleError);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("error", handleError);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [endTime, startTime, maxDuration]);

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      if (video.currentTime < startTime || video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
      video.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, startTime, endTime]);

  const handleRangeChange = useCallback((values: number[]) => {
    const [start, end] = values;
    // Ensure we don't exceed max duration
    const newEnd = Math.min(end, start + maxDuration);
    setStartTime(start);
    setEndTime(newEnd);
    
    const video = videoRef.current;
    if (video && !isPlaying) {
      video.currentTime = start;
      setCurrentTime(start);
    }
  }, [isPlaying, maxDuration]);

  const handleReset = useCallback(() => {
    setStartTime(0);
    setEndTime(Math.min(duration, maxDuration));
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, [duration, maxDuration]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleTrim = useCallback(async () => {
    if (!videoRef.current) return;

    setIsTrimming(true);
    setTrimProgress(0);
    setCompressionStats(null);

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Could not get canvas context");

      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;

      // Create source video
      const sourceVideo = document.createElement("video");
      sourceVideo.src = videoUrl;
      sourceVideo.muted = true;
      sourceVideo.playsInline = true;
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Video load timeout")), 15000);
        sourceVideo.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve();
        };
        sourceVideo.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Failed to load video"));
        };
        sourceVideo.load();
      });

      sourceVideo.currentTime = startTime;
      
      await new Promise<void>((resolve) => {
        sourceVideo.onseeked = () => resolve();
      });

      // MediaRecorder setup
      const stream = canvas.captureStream(30);
      
      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(sourceVideo);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      } catch {
        console.log("Audio capture not available");
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      // Adjust bitrate based on compression quality
      let videoBitrate = 5_000_000; // default 5 Mbps
      if (compressionQuality !== 'none') {
        switch (compressionQuality) {
          case 'low':
            videoBitrate = 1_000_000; // 1 Mbps
            break;
          case 'medium':
            videoBitrate = 2_500_000; // 2.5 Mbps
            break;
          case 'high':
            videoBitrate = 4_000_000; // 4 Mbps
            break;
          case 'auto':
            // Auto-select based on file size
            const sizeMB = videoFile.size / (1024 * 1024);
            if (sizeMB > 50) videoBitrate = 1_500_000;
            else if (sizeMB > 20) videoBitrate = 2_500_000;
            else videoBitrate = 4_000_000;
            break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: videoBitrate,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordingPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
      });

      mediaRecorder.start(100);

      // Render frames with progress
      const trimDuration = endTime - startTime;
      const frameRate = 30;
      const totalFrames = Math.ceil(trimDuration * frameRate);
      
      for (let frame = 0; frame <= totalFrames; frame++) {
        const frameTime = startTime + (frame / frameRate);
        if (frameTime > endTime) break;
        
        sourceVideo.currentTime = frameTime;
        
        await new Promise<void>((resolve) => {
          sourceVideo.onseeked = () => {
            ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
            resolve();
          };
        });
        
        // Update progress (trimming is first 80%)
        setTrimProgress(Math.round((frame / totalFrames) * 80));
        await new Promise((r) => setTimeout(r, 1000 / frameRate));
      }

      mediaRecorder.stop();
      
      let trimmedBlob = await recordingPromise;
      setTrimProgress(85);
      
      // Apply additional compression if quality is not 'none' and file is still large
      if (compressionQuality !== 'none' && trimmedBlob.size > 10 * 1024 * 1024) {
        setIsTrimming(false);
        setIsCompressing(true);
        setCompressionProgress(0);
        
        try {
          const compressionResult = await compressVideo(trimmedBlob, {
            quality: compressionQuality === 'auto' ? 'auto' : compressionQuality,
            onProgress: setCompressionProgress,
          });
          
          setCompressionStats({
            originalSize: trimmedBlob.size,
            compressedSize: compressionResult.compressedSize,
            ratio: compressionResult.compressionRatio,
          });
          
          trimmedBlob = compressionResult.blob;
        } catch (compError) {
          console.warn('Compression failed, using trimmed video:', compError);
        } finally {
          setIsCompressing(false);
        }
      }
      
      // Cleanup
      sourceVideo.remove();
      canvas.remove();
      
      // Set final compression stats if not already set
      if (!compressionStats) {
        const originalSize = videoFile.size;
        const compressedSize = trimmedBlob.size;
        if (compressedSize < originalSize * 0.9) {
          setCompressionStats({
            originalSize,
            compressedSize,
            ratio: originalSize / compressedSize,
          });
        }
      }
      
      onTrimComplete(trimmedBlob);
    } catch (error) {
      console.error("Trimming error:", error);
      setError("Failed to process video. Using original file.");
      onTrimComplete(videoFile);
    } finally {
      setIsTrimming(false);
      setTrimProgress(0);
    }
  }, [startTime, endTime, videoUrl, videoFile, onTrimComplete, compressionQuality, compressionStats]);

  const trimmedDuration = endTime - startTime;
  
  const durationProgress = useMemo(() => {
    if (maxDuration <= 0) return 0;
    return Math.min((trimmedDuration / maxDuration) * 100, 100);
  }, [trimmedDuration, maxDuration]);

  const durationStatus = useMemo(() => {
    if (trimmedDuration < 1) return 'too-short';
    if (trimmedDuration > maxDuration) return 'too-long';
    if (trimmedDuration >= maxDuration * 0.9) return 'near-limit';
    return 'valid';
  }, [trimmedDuration, maxDuration]);

  const getProgressColor = () => {
    switch (durationStatus) {
      case 'too-short': return 'bg-yellow-500';
      case 'too-long': return 'bg-destructive';
      case 'near-limit': return 'bg-orange-500';
      default: return 'bg-primary';
    }
  };

  // Error state
  if (error && !isTrimming) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
            }}
            className="flex-1"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="region" aria-label="Video trimmer">
      {/* Video Preview */}
      <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] max-w-xs mx-auto">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
          muted={isMuted}
          aria-label="Video preview"
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}

        {/* Trimming overlay with progress */}
        {isTrimming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
            <Scissors className="w-10 h-10 text-primary animate-pulse" />
            <div className="w-3/4 space-y-2">
              <Progress value={trimProgress} className="h-2" />
              <p className="text-center text-sm text-white">
                Trimming video... {trimProgress}%
              </p>
            </div>
          </div>
        )}

        {/* Compression overlay with progress */}
        {isCompressing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
            <Zap className="w-10 h-10 text-yellow-400 animate-pulse" />
            <div className="w-3/4 space-y-2">
              <Progress value={compressionProgress} className="h-2 [&>div]:bg-yellow-400" />
              <p className="text-center text-sm text-white">
                Compressing video... {compressionProgress}%
              </p>
              <p className="text-center text-xs text-white/70">
                Optimizing for faster uploads
              </p>
            </div>
          </div>
        )}
        
        {/* Play/Pause overlay */}
        {!isLoading && !isTrimming && !isCompressing && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={isPlaying ? "Pause preview" : "Play preview"}
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              {isPlaying ? (
                <Pause className="w-8 h-8 text-foreground" />
              ) : (
                <Play className="w-8 h-8 text-foreground ml-1" />
              )}
            </div>
          </button>
        )}

        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Real-time Duration Indicator */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium">Duration</span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 text-sm font-semibold",
            durationStatus === 'valid' && "text-primary",
            durationStatus === 'near-limit' && "text-orange-500",
            durationStatus === 'too-long' && "text-destructive",
            durationStatus === 'too-short' && "text-yellow-600"
          )}>
            {durationStatus === 'valid' && <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
            {durationStatus === 'too-long' && <AlertCircle className="w-4 h-4" aria-hidden="true" />}
            <span aria-live="polite">{Math.floor(trimmedDuration)}s</span>
            <span className="text-muted-foreground font-normal">/ {maxDuration}s</span>
          </div>
        </div>
        
        <div className="relative" role="progressbar" aria-valuenow={Math.floor(trimmedDuration)} aria-valuemin={0} aria-valuemax={maxDuration}>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-200 ease-out rounded-full",
                getProgressColor()
              )}
              style={{ width: `${Math.min(durationProgress, 100)}%` }}
            />
          </div>
          <div 
            className="absolute top-0 w-0.5 h-3 bg-foreground/30"
            style={{ left: '100%', transform: 'translateX(-100%)' }}
            aria-hidden="true"
          />
        </div>
        
        <p className={cn(
          "text-xs text-center",
          durationStatus === 'valid' && "text-muted-foreground",
          durationStatus === 'near-limit' && "text-orange-500",
          durationStatus === 'too-long' && "text-destructive",
          durationStatus === 'too-short' && "text-yellow-600"
        )} role="status">
          {durationStatus === 'too-short' && "Video must be at least 1 second"}
          {durationStatus === 'too-long' && `Trim ${Math.ceil(trimmedDuration - maxDuration)}s more to fit the limit`}
          {durationStatus === 'near-limit' && "Almost at the limit!"}
          {durationStatus === 'valid' && "Duration is within limit ✓"}
        </p>
      </div>

      {/* Compression Settings */}
      {enableCompression && (
        <div className="bg-muted/30 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" aria-hidden="true" />
              <span className="text-sm font-medium">Compression</span>
              {isCompressionRecommended && (
                <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Label htmlFor="compression-quality" className="text-xs text-muted-foreground whitespace-nowrap">
              Quality:
            </Label>
            <Select
              value={compressionQuality}
              onValueChange={(value) => setCompressionQuality(value as CompressionQuality)}
              disabled={isTrimming || isCompressing}
            >
              <SelectTrigger id="compression-quality" className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <div className="flex items-center gap-2">
                    <Settings className="w-3 h-3" />
                    <span>Auto (Recommended)</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">High Quality (4 Mbps)</SelectItem>
                <SelectItem value="medium">Medium (2.5 Mbps)</SelectItem>
                <SelectItem value="low">Low (1 Mbps) - Fastest</SelectItem>
                <SelectItem value="none">No Compression</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {compressionQuality === 'auto' && "Automatically selects best quality based on file size"}
            {compressionQuality === 'high' && "Best quality, larger file size"}
            {compressionQuality === 'medium' && "Balanced quality and file size"}
            {compressionQuality === 'low' && "Smallest file size, faster uploads"}
            {compressionQuality === 'none' && "No compression applied, original quality"}
          </p>
          
          {/* Original file size indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Original size:</span>
            <span className="font-medium">{formatFileSize(videoFile.size)}</span>
          </div>
        </div>
      )}

      {/* Compression Results */}
      {compressionStats && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Compression Complete</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">Before</p>
              <p className="font-medium">{formatFileSize(compressionStats.originalSize)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">After</p>
              <p className="font-medium text-green-600 dark:text-green-400">
                {formatFileSize(compressionStats.compressedSize)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Saved</p>
              <p className="font-medium text-green-600 dark:text-green-400">
                {Math.round((1 - compressionStats.compressedSize / compressionStats.originalSize) * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-2 px-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Start: {formatTime(startTime)}</span>
          <span className="text-primary font-medium">Now: {formatTime(currentTime)}</span>
          <span>End: {formatTime(endTime)}</span>
        </div>
        
        <Slider
          value={[startTime, endTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={handleRangeChange}
          className="w-full touch-pan-y"
          disabled={isTrimming || isCompressing}
          aria-label="Trim range selector"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>0:00</span>
          <span className="font-medium text-primary">
            Selected: {formatTime(trimmedDuration)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePlayPause}
          className="flex-1"
          disabled={isTrimming || isCompressing || isLoading}
          aria-label={isPlaying ? "Pause" : "Preview selection"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" aria-hidden="true" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" aria-hidden="true" />
              Preview
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isTrimming || isCompressing}
          aria-label="Reset trim selection"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isTrimming || isCompressing}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleTrim}
          className="flex-1 bg-gradient-ai text-white"
          disabled={isTrimming || isCompressing || durationStatus === 'too-short' || durationStatus === 'too-long' || isLoading}
          aria-busy={isTrimming || isCompressing}
        >
          {isTrimming ? (
            <>
              <Scissors className="w-4 h-4 mr-2 animate-pulse" aria-hidden="true" />
              Trimming...
            </>
          ) : isCompressing ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" aria-hidden="true" />
              Compressing...
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4 mr-2" aria-hidden="true" />
              {compressionQuality !== 'none' ? 'Trim & Optimize' : 'Apply Trim'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
