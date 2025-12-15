import React, { useRef, useState, useEffect } from "react";
import { Play, Volume2, VolumeX, PictureInPicture2, Heart, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReelsGestures } from "@/hooks/useReelsGestures";
import { useReels } from "@/hooks/useReels";

interface EnhancedVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlayOnScroll?: boolean;
  onLikeToggle?: () => void;
  enableReelNavigation?: boolean;
}

export const EnhancedVideoPlayer = ({ 
  src, 
  poster, 
  className = "", 
  autoPlayOnScroll = true, 
  onLikeToggle,
  enableReelNavigation = true 
}: EnhancedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPiP, setIsPiP] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showMuteIndicator, setShowMuteIndicator] = useState(false);
  const [showLikeIndicator, setShowLikeIndicator] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const muteIndicatorTimeout = useRef<NodeJS.Timeout>();
  const likeIndicatorTimeout = useRef<NodeJS.Timeout>();

  const { findReelByVideoUrl, nextReel, prevReel, hasNext, hasPrev } = useReels();

  const handleNextReel = () => {
    if (!enableReelNavigation) return;
    const currentReel = findReelByVideoUrl(src);
    if (currentReel && hasNext) {
      nextReel();
    }
  };

  const handlePrevReel = () => {
    if (!enableReelNavigation) return;
    const currentReel = findReelByVideoUrl(src);
    if (currentReel && hasPrev) {
      prevReel();
    }
  };

  const handleLikeToggle = () => {
    setShowLikeIndicator(true);
    if (likeIndicatorTimeout.current) clearTimeout(likeIndicatorTimeout.current);
    likeIndicatorTimeout.current = setTimeout(() => setShowLikeIndicator(false), 800);
    onLikeToggle?.();
  };

  useReelsGestures({
    videoRef,
    containerRef,
    isFullscreen,
    onNextReel: handleNextReel,
    onPrevReel: handlePrevReel,
    onLikeToggle: handleLikeToggle,
    enabled: enableReelNavigation,
  });

  // Autoplay on scroll
  useEffect(() => {
    if (!autoPlayOnScroll) return;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!hasUserInteracted) {
              video.muted = true;
              setIsMuted(true);
            }
            video.play().catch(() => {});
          } else {
            if (!document.pictureInPictureElement || document.pictureInPictureElement !== video) {
              video.pause();
            }
          }
        });
      },
      { threshold: [0.5] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [autoPlayOnScroll, hasUserInteracted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiP(document.pictureInPictureElement === videoRef.current);
    };

    videoRef.current?.addEventListener("enterpictureinpicture", handlePiPChange);
    videoRef.current?.addEventListener("leavepictureinpicture", handlePiPChange);
    
    return () => {
      videoRef.current?.removeEventListener("enterpictureinpicture", handlePiPChange);
      videoRef.current?.removeEventListener("leavepictureinpicture", handlePiPChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasUserInteracted(true);
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasUserInteracted(true);
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    
    setShowMuteIndicator(true);
    if (muteIndicatorTimeout.current) clearTimeout(muteIndicatorTimeout.current);
    muteIndicatorTimeout.current = setTimeout(() => setShowMuteIndicator(false), 800);
  };

  const handleVideoTap = () => {
    if (isPlaying) {
      toggleMute();
    } else {
      togglePlay();
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        if (video.readyState < 2) {
          await video.play();
          video.pause();
        }
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error("PiP error:", error);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${isFullscreen ? 'w-screen h-screen' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={`w-full h-full object-contain cursor-pointer ${isFullscreen ? 'max-h-screen' : ''}`}
        onClick={handleVideoTap}
        playsInline
      />

      {/* Progress bar - minimal bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Center play button - only when paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      {/* Mute indicator */}
      {showMuteIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in zoom-in-50 fade-in duration-150">
            {isMuted ? <VolumeX className="w-7 h-7 text-white" /> : <Volume2 className="w-7 h-7 text-white" />}
          </div>
        </div>
      )}

      {/* Like indicator */}
      {showLikeIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart className="w-20 h-20 text-red-500 fill-red-500 animate-in zoom-in-50 fade-in duration-150" />
        </div>
      )}

      {/* Minimal top controls */}
      <div
        className={`absolute top-0 left-0 right-0 p-3 flex items-center justify-between transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Time */}
        <span className="text-white/90 text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Top right controls */}
        <div className="flex items-center gap-2">
          {/* PiP button */}
          <button
            onClick={togglePiP}
            className={`p-2 rounded-full transition-colors ${
              isPiP 
                ? "bg-primary text-primary-foreground" 
                : "bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60"
            }`}
            title="Picture-in-Picture"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-full transition-colors ${
              isFullscreen 
                ? "bg-primary text-primary-foreground" 
                : "bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60"
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Minimal bottom controls - only mute indicator */}
      <div
        className={`absolute bottom-3 right-3 transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
