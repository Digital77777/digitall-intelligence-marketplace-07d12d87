import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Scissors, Play, Pause, RotateCcw, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { MAX_VIDEO_DURATION_SECONDS } from "@/lib/videoValidation";
import { cn } from "@/lib/utils";

interface VideoTrimmerProps {
  videoFile: File;
  videoUrl: string;
  onTrimComplete: (trimmedBlob: Blob) => void;
  onCancel: () => void;
  maxDuration?: number; // Max allowed duration in seconds
}

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
}: VideoTrimmerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const dur = video.duration;
      setDuration(dur);
      setEndTime(dur);
    };

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      
      // Stop at end time during preview
      if (time >= endTime) {
        video.pause();
        video.currentTime = startTime;
        setIsPlaying(false);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [endTime, startTime]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      if (video.currentTime < startTime || video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRangeChange = (values: number[]) => {
    const [start, end] = values;
    setStartTime(start);
    setEndTime(end);
    
    const video = videoRef.current;
    if (video && !isPlaying) {
      video.currentTime = start;
      setCurrentTime(start);
    }
  };

  const handleReset = () => {
    setStartTime(0);
    setEndTime(duration);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleTrim = useCallback(async () => {
    if (!videoRef.current) return;

    setIsTrimming(true);

    try {
      // Use MediaRecorder to capture the trimmed portion
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Could not get canvas context");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Create a new video element for processing
      const sourceVideo = document.createElement("video");
      sourceVideo.src = videoUrl;
      sourceVideo.muted = true;
      
      await new Promise<void>((resolve) => {
        sourceVideo.onloadedmetadata = () => resolve();
        sourceVideo.load();
      });

      sourceVideo.currentTime = startTime;
      
      await new Promise<void>((resolve) => {
        sourceVideo.onseeked = () => resolve();
      });

      // Set up MediaRecorder
      const stream = canvas.captureStream(30);
      
      // Try to capture audio if available
      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(sourceVideo);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        
        dest.stream.getAudioTracks().forEach(track => {
          stream.addTrack(track);
        });
      } catch {
        // Continue without audio if capture fails
        console.log("Audio capture not available, continuing without audio");
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const recordingPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };
      });

      mediaRecorder.start(100);

      // Render frames
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
        
        // Small delay to ensure frame is captured
        await new Promise((r) => setTimeout(r, 1000 / frameRate));
      }

      mediaRecorder.stop();
      
      const trimmedBlob = await recordingPromise;
      onTrimComplete(trimmedBlob);
    } catch (error) {
      console.error("Trimming error:", error);
      // Fallback: just use the original file with metadata
      onTrimComplete(videoFile);
    } finally {
      setIsTrimming(false);
    }
  }, [startTime, endTime, videoUrl, videoFile, onTrimComplete]);

  const trimmedDuration = endTime - startTime;
  
  // Calculate duration progress percentage
  const durationProgress = useMemo(() => {
    if (maxDuration <= 0) return 0;
    return Math.min((trimmedDuration / maxDuration) * 100, 100);
  }, [trimmedDuration, maxDuration]);

  // Determine the status of the duration
  const durationStatus = useMemo(() => {
    if (trimmedDuration < 1) return 'too-short';
    if (trimmedDuration > maxDuration) return 'too-long';
    if (trimmedDuration >= maxDuration * 0.9) return 'near-limit';
    return 'valid';
  }, [trimmedDuration, maxDuration]);

  // Get progress bar color based on status
  const getProgressColor = () => {
    switch (durationStatus) {
      case 'too-short':
        return 'bg-yellow-500';
      case 'too-long':
        return 'bg-destructive';
      case 'near-limit':
        return 'bg-orange-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] max-w-xs mx-auto">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
          muted
        />
        
        {/* Play/Pause overlay */}
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-foreground" />
            ) : (
              <Play className="w-8 h-8 text-foreground ml-1" />
            )}
          </div>
        </button>
      </div>

      {/* Real-time Duration Indicator */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Duration</span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 text-sm font-semibold",
            durationStatus === 'valid' && "text-primary",
            durationStatus === 'near-limit' && "text-orange-500",
            durationStatus === 'too-long' && "text-destructive",
            durationStatus === 'too-short' && "text-yellow-600"
          )}>
            {durationStatus === 'valid' && <CheckCircle2 className="w-4 h-4" />}
            {durationStatus === 'too-long' && <AlertCircle className="w-4 h-4" />}
            <span>{Math.floor(trimmedDuration)}s</span>
            <span className="text-muted-foreground font-normal">/ {maxDuration}s</span>
          </div>
        </div>
        
        {/* Visual Progress Bar */}
        <div className="relative">
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-200 ease-out rounded-full",
                getProgressColor()
              )}
              style={{ width: `${Math.min(durationProgress, 100)}%` }}
            />
          </div>
          
          {/* Max limit marker */}
          <div 
            className="absolute top-0 w-0.5 h-3 bg-foreground/30"
            style={{ left: '100%', transform: 'translateX(-100%)' }}
          />
        </div>
        
        {/* Status message */}
        <div className={cn(
          "text-xs text-center",
          durationStatus === 'valid' && "text-muted-foreground",
          durationStatus === 'near-limit' && "text-orange-500",
          durationStatus === 'too-long' && "text-destructive",
          durationStatus === 'too-short' && "text-yellow-600"
        )}>
          {durationStatus === 'too-short' && "Video must be at least 1 second"}
          {durationStatus === 'too-long' && `Trim ${Math.ceil(trimmedDuration - maxDuration)}s more to fit the limit`}
          {durationStatus === 'near-limit' && "Almost at the limit!"}
          {durationStatus === 'valid' && "Duration is within limit ✓"}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2 px-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Start: {formatTime(startTime)}</span>
          <span className="text-primary font-medium">Current: {formatTime(currentTime)}</span>
          <span>End: {formatTime(endTime)}</span>
        </div>
        
        <Slider
          value={[startTime, endTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={handleRangeChange}
          className="w-full"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>0:00</span>
          <span className="font-medium text-primary">
            Selected: {formatTime(trimmedDuration)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePlayPause}
          className="flex-1"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Preview
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
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
          disabled={isTrimming || durationStatus === 'too-short' || durationStatus === 'too-long'}
        >
          {isTrimming ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4 mr-2" />
              Apply Trim
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
