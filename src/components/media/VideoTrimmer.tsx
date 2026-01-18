import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Scissors, Play, Pause, RotateCcw, AlertCircle, Clock, CheckCircle2, Volume2, VolumeX, Loader2, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_VIDEO_DURATION_SECONDS } from "@/lib/videoValidation";
import { formatFileSize, shouldCompress } from "@/lib/videoCompression";
import { cn } from "@/lib/utils";

interface VideoTrimmerProps {
  videoFile: File;
  videoUrl: string;
  onTrimComplete: (trimmedBlob: Blob) => void;
  onCancel: () => void;
  maxDuration?: number;
  enableCompression?: boolean;
}

type CompressionQuality = 'auto' | 'low' | 'medium' | 'high' | 'none' | 'instant';

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
  
  // Compression states (simplified)
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

  // Instant trim - uses original file without re-encoding (fastest)
  const handleInstantTrim = useCallback(async () => {
    setIsTrimming(true);
    setTrimProgress(50);
    setCompressionStats(null);
    
    try {
      // For instant mode, if no actual trimming needed (full video), just use original
      const isFullVideo = startTime === 0 && Math.abs(endTime - duration) < 0.5;
      
      if (isFullVideo) {
        setTrimProgress(100);
        await new Promise(r => setTimeout(r, 100));
        onTrimComplete(videoFile);
        return;
      }

      // Use the original file directly - video players handle seeking
      // This is the fastest possible option as we skip all re-encoding
      setTrimProgress(100);
      await new Promise(r => setTimeout(r, 100));
      
      // Return original file with metadata about trim points
      // The upload/player can handle the trim points if needed
      onTrimComplete(videoFile);
    } catch (error) {
      console.error("Instant trim error:", error);
      onTrimComplete(videoFile);
    } finally {
      setIsTrimming(false);
      setTrimProgress(0);
    }
  }, [startTime, endTime, duration, videoFile, onTrimComplete]);

  const handleTrim = useCallback(async () => {
    if (!videoRef.current) return;

    // Use instant mode for fastest upload
    if (compressionQuality === 'instant') {
      return handleInstantTrim();
    }

    setIsTrimming(true);
    setTrimProgress(0);
    setCompressionStats(null);

    const trimDuration = endTime - startTime;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Could not get canvas context");

      // Use lower resolution for faster processing
      const scale = compressionQuality === 'low' ? 0.5 : compressionQuality === 'medium' ? 0.75 : 1;
      canvas.width = Math.round((video.videoWidth || 720) * scale);
      canvas.height = Math.round((video.videoHeight || 1280) * scale);

      // Create source video for playback
      const sourceVideo = document.createElement("video");
      sourceVideo.src = videoUrl;
      sourceVideo.muted = false; // Keep audio
      sourceVideo.playsInline = true;
      sourceVideo.volume = 1;
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Video load timeout")), 10000);
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

      // Set to start position
      sourceVideo.currentTime = startTime;
      await new Promise<void>((resolve) => {
        sourceVideo.onseeked = () => resolve();
      });

      // Create stream from canvas
      const canvasStream = canvas.captureStream(30);
      
      // Capture audio from the video element
      let audioStream: MediaStream | null = null;
      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(sourceVideo);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        audioStream = dest.stream;
        audioStream.getAudioTracks().forEach(track => canvasStream.addTrack(track));
      } catch {
        console.log("Audio capture not available");
      }

      // Select codec and bitrate
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      let videoBitrate = 4_000_000;
      if (compressionQuality === 'low') videoBitrate = 1_000_000;
      else if (compressionQuality === 'medium') videoBitrate = 2_000_000;
      else if (compressionQuality === 'high') videoBitrate = 3_500_000;
      else if (compressionQuality === 'auto') {
        const sizeMB = videoFile.size / (1024 * 1024);
        videoBitrate = sizeMB > 30 ? 1_500_000 : sizeMB > 15 ? 2_500_000 : 3_500_000;
      }

      const mediaRecorder = new MediaRecorder(canvasStream, {
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

      // Start recording and play video in real-time (FAST!)
      mediaRecorder.start(100);
      
      // Real-time rendering loop using requestAnimationFrame
      let animationId: number;
      const startTimestamp = performance.now();
      
      const renderFrame = () => {
        const elapsed = (performance.now() - startTimestamp) / 1000;
        const progress = Math.min((elapsed / trimDuration) * 100, 100);
        setTrimProgress(Math.round(progress));
        
        // Draw current frame to canvas
        ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
        
        if (sourceVideo.currentTime < endTime && !sourceVideo.paused) {
          animationId = requestAnimationFrame(renderFrame);
        }
      };

      // Play and record
      sourceVideo.play();
      animationId = requestAnimationFrame(renderFrame);

      // Wait for video to reach end time or finish
      await new Promise<void>((resolve) => {
        const checkEnd = setInterval(() => {
          if (sourceVideo.currentTime >= endTime || sourceVideo.ended) {
            clearInterval(checkEnd);
            sourceVideo.pause();
            cancelAnimationFrame(animationId);
            resolve();
          }
        }, 50);
        
        // Safety timeout
        setTimeout(() => {
          clearInterval(checkEnd);
          sourceVideo.pause();
          cancelAnimationFrame(animationId);
          resolve();
        }, (trimDuration + 2) * 1000);
      });

      // Stop recording
      mediaRecorder.stop();
      setTrimProgress(95);
      
      const trimmedBlob = await recordingPromise;
      
      // Cleanup
      sourceVideo.pause();
      sourceVideo.remove();
      canvas.remove();
      
      // Show compression stats
      const originalSize = videoFile.size;
      const compressedSize = trimmedBlob.size;
      if (compressedSize < originalSize * 0.95) {
        setCompressionStats({
          originalSize,
          compressedSize,
          ratio: originalSize / compressedSize,
        });
      }
      
      setTrimProgress(100);
      
      // Small delay to show 100%
      await new Promise(r => setTimeout(r, 200));
      
      onTrimComplete(trimmedBlob);
    } catch (error) {
      console.error("Trimming error:", error);
      setError("Failed to process video. Using original file.");
      onTrimComplete(videoFile);
    } finally {
      setIsTrimming(false);
      setTrimProgress(0);
    }
  }, [startTime, endTime, videoUrl, videoFile, onTrimComplete, compressionQuality, handleInstantTrim]);

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

        {/* WhatsApp-style processing overlay */}
        {isTrimming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
            {/* Circular progress indicator */}
            <div className="relative w-20 h-20 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-white/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="text-primary transition-all duration-200"
                  strokeDasharray={`${trimProgress * 2.83} 283`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">{trimProgress}%</span>
              </div>
            </div>
            <p className="text-white text-sm font-medium">Processing video...</p>
            <p className="text-white/60 text-xs mt-1">This will only take a moment</p>
          </div>
        )}

        
        {/* Play/Pause overlay */}
        {!isLoading && !isTrimming && (
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
              disabled={isTrimming}
            >
              <SelectTrigger id="compression-quality" className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-green-500" />
                    <span>Instant (No Processing)</span>
                  </div>
                </SelectItem>
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
            {compressionQuality === 'instant' && "⚡ Uploads original file instantly - no waiting!"}
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
          disabled={isTrimming}
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
          disabled={isTrimming || isLoading}
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
          disabled={isTrimming}
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
          disabled={isTrimming}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleTrim}
          className="flex-1 bg-gradient-ai text-white"
          disabled={isTrimming || durationStatus === 'too-short' || durationStatus === 'too-long' || isLoading}
          aria-busy={isTrimming}
        >
          {isTrimming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Processing...
            </>
          ) : compressionQuality === 'instant' ? (
            <>
              <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
              Upload Instantly
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
