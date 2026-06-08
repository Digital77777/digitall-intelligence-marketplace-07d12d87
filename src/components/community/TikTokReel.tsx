import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Share2, Plus, Music2, Loader2, Download } from "lucide-react";
import { downloadVideoWithWatermark } from "@/lib/videoWatermark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TikTokReelProps {
  reel: {
    id: string;
    video_url: string;
    thumbnail_url: string | null;
    title: string | null;
    user_id: string;
    insight_id: string;
    likes_count: number;
    views_count: number;
  };
  isActive: boolean;
  isNearActive?: boolean;
  isMuted: boolean;
  onOpenComments: () => void;
  commentsCount: number;
}

export const TikTokReel = ({ 
  reel, 
  isActive, 
  isNearActive = true,
  isMuted, 
  onOpenComments, 
  commentsCount 
}: TikTokReelProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSeekIndicator, setShowSeekIndicator] = useState<{ direction: 'forward' | 'backward', visible: boolean }>({ direction: 'forward', visible: false });
  const [isSpeedBoosted, setIsSpeedBoosted] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [authorProfile, setAuthorProfile] = useState<{ 
    full_name: string | null; 
    avatar_url: string | null 
  } | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch author profile
  useEffect(() => {
    const fetchAuthor = async () => {
      const { data } = await supabase
        .from("public_profiles")
        .select("full_name, avatar_url")
        .eq("user_id", reel.user_id)
        .single();
      if (data) setAuthorProfile(data);
    };
    fetchAuthor();
  }, [reel.user_id]);

  // Check if user has liked this reel
  useEffect(() => {
    const checkLike = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("insight_likes")
        .select("id")
        .eq("insight_id", reel.insight_id)
        .eq("user_id", user.id)
        .single();
      setIsLiked(!!data);
    };
    checkLike();
  }, [user, reel.insight_id]);

  // Play/pause based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !isPaused) {
      video.muted = isMuted;
      video.play().catch(() => {});
    } else {
      video.pause();
      if (!isActive) video.currentTime = 0;
    }
  }, [isActive, isMuted, isPaused]);

  // UI Visibility Timeout
  useEffect(() => {
    if (!isActive) return;

    const hideUi = () => {
      if (!isPaused) {
        setIsUiVisible(false);
      }
    };

    if (isUiVisible && !isPaused) {
      uiTimeoutRef.current = setTimeout(hideUi, 2000);
    }

    return () => {
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    };
  }, [isUiVisible, isPaused, isActive]);

  const showUiTemporarily = useCallback(() => {
    setIsUiVisible(true);
    if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
  }, []);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't trigger on button clicks
    if ((e.target as HTMLElement).closest('button')) return;
    
    const now = Date.now();
    const isTouchEvent = 'touches' in e;
    const clientX = isTouchEvent ? (e as React.TouchEvent).touches[0]?.clientX : (e as React.MouseEvent).clientX;
    const containerWidth = window.innerWidth;

    // Check for edge taps (15% of width)
    const isLeftEdge = clientX < containerWidth * 0.15;
    const isRightEdge = clientX > containerWidth * 0.85;

    if (now - lastTapRef.current < 300) {
      // Double tap logic
      if (isRightEdge || isLeftEdge) {
        // Double tap on edges is handled like a normal double tap (like) unless we want to seek
        // For TikTok style, double tap anywhere is like.
      }

      if (!isLiked) {
        handleLike();
      }
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 800);
      lastTapRef.current = 0; // Reset to prevent triple-tap issues
      return;
    }

    // Single tap logic
    if (isLeftEdge || isRightEdge) {
      // Edge tap - Seek
      const video = videoRef.current;
      if (video) {
        const seekAmount = isLeftEdge ? -5 : 5;
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seekAmount));

        setShowSeekIndicator({
          direction: isLeftEdge ? 'backward' : 'forward',
          visible: true
        });
        setTimeout(() => setShowSeekIndicator(prev => ({ ...prev, visible: false })), 500);
      }
    } else {
      // Center tap - Pause/Play
      setIsPaused(prev => !prev);
    }

    showUiTemporarily();
    lastTapRef.current = now;
  }, [isLiked, showUiTemporarily, handleLike]);

  const handleLongPressStart = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.playbackRate = 2.0;
        setIsSpeedBoosted(true);
      }
    }, 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      setIsSpeedBoosted(false);
    }
  }, []);

  const handleLike = useCallback(async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("insight_likes")
          .delete()
          .eq("insight_id", reel.insight_id)
          .eq("user_id", user.id);
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await supabase.from("insight_likes").insert({
          insight_id: reel.insight_id,
          user_id: user.id,
        });
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update like", variant: "destructive" });
    }
  }, [user, isLiked, reel.insight_id, navigate, toast]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: reel.title || "Check out this reel",
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!" });
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    const wasPlaying = !videoRef.current?.paused;
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      videoRef.current?.pause();
      toast({ title: "Preparing download…", description: "Adding DIM watermark to your video." });
      await downloadVideoWithWatermark(
        reel.video_url,
        `dim-reel-${reel.id.slice(0, 8)}`,
        (r) => setDownloadProgress(Math.round(r * 100)),
      );
      toast({ title: "Download ready!", description: "Your watermarked video has been saved." });
    } catch (err) {
      console.error("Download failed", err);
      toast({
        title: "Download failed",
        description: "This video can't be re-encoded in your browser. Try again or use a different browser.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      if (wasPlaying) videoRef.current?.play().catch(() => {});
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleVideoError = () => {
    setVideoError(true);
    setIsBuffering(false);
  };

  const username = authorProfile?.full_name?.toLowerCase().replace(/\s+/g, "_") || "user";

  if (!isNearActive) {
    return (
      <div className="relative w-full h-screen snap-start snap-always bg-black overflow-hidden md:flex md:items-center md:justify-center">
        {reel.thumbnail_url && (
          <img src={reel.thumbnail_url} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" alt="" />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen snap-start snap-always bg-black overflow-hidden md:flex md:items-center md:justify-center"
    >
      {/* Desktop: blurred backdrop using thumbnail for cinematic feel */}
      {reel.thumbnail_url && (
        <div
          aria-hidden
          className="hidden md:block absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-40 pointer-events-none"
          style={{ backgroundImage: `url(${reel.thumbnail_url})` }}
        />
      )}
      <div className="hidden md:block absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Player frame: full-screen on mobile, constrained 9:16 card on desktop */}
      <div className="relative w-full h-full md:w-auto md:h-[min(86vh,780px)] md:aspect-[9/16] md:rounded-2xl md:overflow-hidden md:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] md:ring-1 md:ring-white/10">
        {/* Full-screen video (YouTube iframe or native <video>) */}
        {(() => {
          const ytMatch = reel.video_url?.match(
            /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
          );
          if (ytMatch) {
            const ytId = ytMatch[1];
            const params = new URLSearchParams({
              autoplay: isActive ? "1" : "0",
              mute: isMuted ? "1" : "0",
              controls: "1",
              rel: "0",
              modestbranding: "1",
              playsinline: "1",
              loop: "1",
              playlist: ytId,
            });
            return (
              <iframe
                key={`${ytId}-${isActive}`}
                src={`https://www.youtube-nocookie.com/embed/${ytId}?${params.toString()}`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title={reel.title || "YouTube video"}
              />
            );
          }
          return !videoError ? (
            <video
              ref={videoRef}
              src={reel.video_url}
              poster={reel.thumbnail_url || undefined}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              preload="auto"
              playsInline
              muted={isMuted}
              autoPlay={isActive}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onCanPlay={() => setIsBuffering(false)}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onError={handleVideoError}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
              <p className="text-white/70 text-sm mb-2">Video unavailable</p>
              <button
                onClick={(e) => { e.stopPropagation(); setVideoError(false); }}
                className="text-white border border-white/30 px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          );
        })()}

      {/* Loading spinner */}
      {isBuffering && isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Gesture Overlay */}
      <div
        className="absolute inset-0 z-20 cursor-pointer"
        onClick={handleTap}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Speed Boost Indicator */}
      {isSpeedBoosted && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 animate-in fade-in zoom-in-95">
          <Music2 className="w-4 h-4 text-white animate-pulse" />
          <span className="text-white font-bold text-sm tracking-wider">2X SPEED</span>
        </div>
      )}

      {/* Seek Indicator */}
      {showSeekIndicator.visible && (
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center gap-2",
          showSeekIndicator.direction === 'backward' ? "left-12" : "right-12"
        )}>
          <div className="bg-black/40 backdrop-blur-md rounded-full p-4">
            {showSeekIndicator.direction === 'backward' ? (
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-lg">-5s</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-lg">+5s</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pause indicator */}
      {isPaused && isActive && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm transition-all duration-300 scale-110">
            <div className="w-0 h-0 border-l-[24px] border-l-white border-y-[14px] border-y-transparent ml-2" />
          </div>
        </div>
      )}

      {/* Double-tap like animation */}
      {showLikeAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
          <div className="relative animate-in zoom-in-50 duration-300">
            <Heart
              className="w-32 h-32 text-red-500 fill-red-500"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.8))',
              }}
            />
            <div className="absolute inset-0 animate-ping opacity-75">
              <Heart className="w-32 h-32 text-red-400 fill-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10 pointer-events-none" />

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

      {/* Right side actions - TikTok style */}
      <div className={cn(
        "absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20 transition-opacity duration-500",
        isUiVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {/* Author avatar with follow button */}
        <div className="relative mb-2">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${reel.user_id}`); }} 
            className="block"
          >
            <Avatar className="w-12 h-12 border-2 border-cyan-400 shadow-lg">
              <AvatarImage src={authorProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-semibold">
                {getInitials(authorProfile?.full_name)}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border-2 border-black">
            <Plus className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Like button */}
        <button 
          onClick={(e) => { e.stopPropagation(); handleLike(); }} 
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className={`p-0.5 ${isLiked ? "text-red-500" : "text-white"}`}>
            <Heart 
              className={`w-8 h-8 ${isLiked ? "fill-red-500" : ""}`} 
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
          <span className="text-white text-xs font-semibold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {formatCount(likesCount)}
          </span>
        </button>

        {/* Comment button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenComments(); }} 
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className="text-white p-0.5">
            <MessageCircle 
              className="w-8 h-8" 
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
          <span className="text-white text-xs font-semibold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {formatCount(commentsCount)}
          </span>
        </button>

        {/* Bookmark/Save button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }} 
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className="text-white p-0.5">
            <Bookmark 
              className={`w-8 h-8 ${isSaved ? "fill-yellow-400 text-yellow-400" : ""}`}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
          <span className="text-white text-xs font-semibold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            Save
          </span>
        </button>

        {/* Share button */}
        <button 
          onClick={(e) => { e.stopPropagation(); handleShare(); }} 
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className="text-white p-0.5">
            <Share2 
              className="w-7 h-7" 
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
          <span className="text-white text-xs font-semibold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            Share
          </span>
        </button>

        {/* Download button (with DIM watermark) */}
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          disabled={isDownloading}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform disabled:opacity-70"
        >
          <div className="text-white p-0.5">
            {isDownloading ? (
              <Loader2 className="w-7 h-7 animate-spin" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            ) : (
              <Download className="w-7 h-7" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            )}
          </div>
          <span className="text-white text-xs font-semibold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {isDownloading ? `${downloadProgress}%` : "Download"}
          </span>
        </button>


        <div className="mt-2">
          <div 
            className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg"
            style={{ 
              animation: isActive && !isPaused ? 'spin 3s linear infinite' : 'none',
            }}
          >
            <Avatar className="w-full h-full rounded-lg">
              <AvatarImage src={authorProfile?.avatar_url || undefined} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg">
                <Music2 className="w-4 h-4 text-white/60" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Progress Bar - TikTok style */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      {/* Bottom info - TikTok style */}
      <div className={cn(
        "absolute bottom-6 left-4 right-20 z-20 transition-opacity duration-500",
        isUiVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {/* Username */}
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/profile/${reel.user_id}`); }} 
          className="flex items-center gap-2 mb-2"
        >
          <span className="text-white font-bold text-base" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            @{username}
          </span>
        </button>
        
        {/* Caption */}
        {reel.title && (
          <p 
            className="text-white text-sm line-clamp-2 leading-relaxed" 
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            {reel.title}
          </p>
        )}

        {/* Audio indicator */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1.5 backdrop-blur-sm">
            <Music2 className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-medium truncate max-w-[150px]">
              Original audio · {authorProfile?.full_name || "Creator"}
            </span>
          </div>
        </div>
      </div>
      {/* /Player frame */}
      </div>
    </div>
  );
};
