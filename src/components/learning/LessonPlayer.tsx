import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, PictureInPicture,
  Bookmark, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useLessonBookmarks, formatTimestamp } from '@/hooks/useLessonBookmarks';
import { useCloudinaryVideo } from '@/hooks/useCloudinaryVideo';
import { toast } from 'sonner';

interface LessonPlayerProps {
  lessonId: string;
  videoUrl?: string;
  duration: number;
  title: string;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const LessonPlayer = ({
  lessonId,
  videoUrl,
  duration,
  title,
  onComplete,
  onNext,
  onPrevious,
  hasPrevious = false,
  hasNext = false,
}: LessonPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [watchTime, setWatchTime] = useState(0);
  
  const { 
    lastPosition, 
    isCompleted, 
    savePosition, 
    savePositionImmediately,
    markComplete 
  } = useLessonProgress(lessonId);
  
  const { createBookmark } = useLessonBookmarks(lessonId);
  
  // Cloudinary video optimization - automatic CDN + compression
  const { 
    optimizedUrl, 
    hlsUrl, 
    posterUrl, 
    isCloudinary 
  } = useCloudinaryVideo(videoUrl, {
    quality: 'auto',
    width: 1920,
  });
  
  // Use optimized URL if available
  const effectiveVideoUrl = isCloudinary ? optimizedUrl : videoUrl;

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Resume from last position
  useEffect(() => {
    if (videoRef.current && lastPosition > 0 && currentTime === 0) {
      videoRef.current.currentTime = lastPosition;
      setCurrentTime(lastPosition);
    }
  }, [lastPosition]);

  // Save progress periodically
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWatchTime(prev => prev + 1);
        savePosition(currentTime, watchTime + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTime, watchTime, savePosition]);

  // Save on unmount
  useEffect(() => {
    return () => {
      savePositionImmediately(currentTime, watchTime);
    };
  }, []);

  // Auto-complete at 90%
  useEffect(() => {
    if (!isCompleted && videoDuration > 0 && currentTime >= videoDuration * 0.9) {
      markComplete();
      onComplete?.();
      toast.success('Lesson completed! 🎉');
    }
  }, [currentTime, videoDuration, isCompleted, markComplete, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (isFullscreen) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoDuration, currentTime + seconds));
    }
  }, [currentTime, videoDuration]);

  const adjustVolume = useCallback((delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      const newTime = percentage * videoDuration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handlePiP = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        toast.error('Picture-in-Picture not supported');
      }
    }
  };

  const handleBookmark = () => {
    createBookmark({
      lessonId,
      timestampSeconds: Math.floor(currentTime),
      title: `Bookmark at ${formatTimestamp(Math.floor(currentTime))}`,
    });
  };

  const progress = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        isFullscreen && "rounded-none"
      )}
    >
      {/* Video Element */}
      {effectiveVideoUrl ? (
        <video
          ref={videoRef}
          src={effectiveVideoUrl}
          poster={isCloudinary ? posterUrl : undefined}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          preload="metadata"
        />
      ) : (
        // Placeholder when no video URL
        <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Play className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground">
              Video content coming soon • Duration: {formatTimestamp(duration)}
            </p>
          </div>
        </div>
      )}

      {/* Completed Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <Check className="h-4 w-4" />
          Completed
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-4 group/progress"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute h-3 w-3 bg-primary rounded-full -top-1 transition-all opacity-0 group-hover/progress:opacity-100"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Previous */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            {/* Play/Pause */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-12 w-12"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            {/* Next */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={onNext}
              disabled={!hasNext}
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={([val]) => {
                  setVolume(val / 100);
                  setIsMuted(false);
                  if (videoRef.current) videoRef.current.volume = val / 100;
                }}
                max={100}
                step={1}
                className="w-20"
              />
            </div>

            {/* Time Display */}
            <span className="text-white text-sm ml-4">
              {formatTimestamp(Math.floor(currentTime))} / {formatTimestamp(Math.floor(videoDuration))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={handleBookmark}
            >
              <Bookmark className="h-5 w-5" />
            </Button>

            {/* Speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  {playbackSpeed}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {PLAYBACK_SPEEDS.map(speed => (
                  <DropdownMenuItem 
                    key={speed} 
                    onClick={() => handleSpeedChange(speed)}
                    className={playbackSpeed === speed ? 'bg-primary/20' : ''}
                  >
                    {speed}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* PiP */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={handlePiP}
            >
              <PictureInPicture className="h-5 w-5" />
            </Button>

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info('Quality settings coming soon')}>
                  Quality: Auto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Captions coming soon')}>
                  Captions: Off
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
