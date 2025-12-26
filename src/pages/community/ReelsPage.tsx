import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Share2, Volume2, VolumeX, Loader2, Plus, Music2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReels } from "@/hooks/useReels";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { ReelSkeleton } from "@/components/community/ReelSkeleton";
import { CommentsOverlay } from "@/components/community/CommentsOverlay";

interface ReelItemProps {
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
  isMuted: boolean;
  onMuteToggle: () => void;
  onOpenComments: () => void;
  commentsCount: number;
}

const ReelItem = ({ reel, isActive, isMuted, onMuteToggle, onOpenComments, commentsCount }: ReelItemProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const lastTapRef = useRef<number>(0);

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

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap - like
      if (!isLiked) {
        handleLike();
      }
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 800);
    } else {
      // Single tap - pause/play
      setIsPaused(prev => !prev);
    }
    lastTapRef.current = now;
  }, [isLiked]);

  const handleLike = async () => {
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
  };

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

  const handleViewInsight = () => {
    navigate(`/community?insight=${reel.insight_id}`);
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

  return (
    <div className="relative w-full h-screen snap-start snap-always bg-black overflow-hidden">
      {/* Full-screen video */}
      <video
        ref={videoRef}
        src={reel.video_url}
        poster={reel.thumbnail_url || undefined}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        autoPlay={isActive}
        onClick={handleTap}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
      />

      {/* Loading spinner */}
      {isBuffering && isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Pause indicator */}
      {isPaused && isActive && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[24px] border-l-white border-y-[14px] border-y-transparent ml-2" />
          </div>
        </div>
      )}

      {/* Double-tap like animation */}
      {showLikeAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Heart 
            className="w-32 h-32 text-white fill-white animate-in zoom-in-50 fade-in duration-200" 
            style={{ 
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
              animation: 'heartPop 0.8s ease-out forwards'
            }} 
          />
        </div>
      )}

      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10 pointer-events-none" />

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

      {/* Right side actions - Instagram style */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
        {/* Author avatar with follow button */}
        <div className="relative mb-2">
          <button 
            onClick={() => navigate(`/profile/${reel.user_id}`)} 
            className="block"
          >
            <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
              <AvatarImage src={authorProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-semibold">
                {getInitials(authorProfile?.full_name)}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center border-2 border-black">
            <Plus className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Like button */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
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
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <div className="text-white p-0.5">
            <MessageCircle 
              className="w-8 h-8" 
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
          <span className="text-white text-xs font-semibold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {commentsCount > 0 ? formatCount(commentsCount) : "Comment"}
          </span>
        </button>

        {/* Share button */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <div className="text-white p-0.5">
            <Share2 
              className="w-7 h-7" 
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
        </button>

        {/* Save button */}
        <button 
          onClick={() => setIsSaved(!isSaved)} 
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className="text-white p-0.5">
            <Bookmark 
              className={`w-7 h-7 ${isSaved ? "fill-white" : ""}`}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
        </button>

        {/* Rotating music disc */}
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

      {/* Bottom info - Instagram style */}
      <div className="absolute bottom-6 left-4 right-20 z-20">
        {/* Username */}
        <button 
          onClick={() => navigate(`/profile/${reel.user_id}`)} 
          className="flex items-center gap-2 mb-2"
        >
          <span className="text-white font-bold text-base" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            @{authorProfile?.full_name?.toLowerCase().replace(/\s+/g, "_") || "user"}
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

      {/* Mute button - bottom right corner */}
      <button 
        onClick={onMuteToggle} 
        className="absolute bottom-8 right-4 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm active:scale-90 transition-transform"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>
    </div>
  );
};

const ReelsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialReelId = searchParams.get("reel") || undefined;
  const { reels, isLoading } = useReels(initialReelId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Comments overlay state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [commentsCounts, setCommentsCounts] = useState<Record<string, number>>({});
  
  // Touch gesture state
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);

  // Fetch comments counts for all reels
  useEffect(() => {
    if (reels.length === 0) return;
    
    const fetchCommentsCounts = async () => {
      const insightIds = reels.map(r => r.insight_id);
      const { data } = await supabase
        .from("insight_comments")
        .select("insight_id")
        .in("insight_id", insightIds);
      
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((c) => {
          counts[c.insight_id] = (counts[c.insight_id] || 0) + 1;
        });
        setCommentsCounts(counts);
      }
    };
    
    fetchCommentsCounts();
  }, [reels]);

  const handleOpenComments = (insightId: string) => {
    setSelectedInsightId(insightId);
    setCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setCommentsOpen(false);
    setSelectedInsightId(null);
  };

  // Set initial index if reelId provided
  useEffect(() => {
    if (initialReelId && reels.length > 0) {
      const idx = reels.findIndex((r) => r.id === initialReelId);
      if (idx !== -1) setActiveIndex(idx);
    }
  }, [initialReelId, reels]);

  // Handle scroll snap to detect active reel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const newIndex = Math.round(scrollTop / height);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reels.length) {
        setActiveIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeIndex, reels.length]);

  // Scroll to reel on activeIndex change (for keyboard/swipe navigation)
  const scrollToReel = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container || index < 0 || index >= reels.length) return;
    container.scrollTo({ top: index * container.clientHeight, behavior: "smooth" });
  }, [reels.length]);

  // Touch gesture handlers for swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    isScrolling.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isScrolling.current) return;
    
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    
    // Determine if this is a vertical scroll (for reels) vs horizontal gesture
    if (deltaY > deltaX && deltaY > 10) {
      isScrolling.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const deltaY = touchStartY.current - touchEndY;
    const deltaTime = touchEndTime - touchStartTime.current;
    
    // Calculate velocity for swipe detection
    const velocity = Math.abs(deltaY) / deltaTime;
    const minSwipeDistance = 50;
    const minVelocity = 0.3;
    
    // Fast swipe or sufficient distance triggers navigation
    if ((Math.abs(deltaY) > minSwipeDistance || velocity > minVelocity) && isScrolling.current) {
      if (deltaY > 0 && activeIndex < reels.length - 1) {
        // Swipe up - go to next reel
        scrollToReel(activeIndex + 1);
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      } else if (deltaY < 0 && activeIndex > 0) {
        // Swipe down - go to previous reel
        scrollToReel(activeIndex - 1);
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    }
  }, [activeIndex, reels.length, scrollToReel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const newIndex = Math.min(activeIndex + 1, reels.length - 1);
        scrollToReel(newIndex);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const newIndex = Math.max(activeIndex - 1, 0);
        scrollToReel(newIndex);
      } else if (e.key === "m") {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, reels.length, scrollToReel]);

  if (isLoading) {
    return <ReelSkeleton />;
  }

  if (reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <SEOHead
          title="Reels - Community Videos"
          description="Watch engaging short-form video content from our AI community."
        />
        <p className="text-white text-lg mb-4">No reels available</p>
        <Button variant="outline" onClick={() => navigate("/community")}>
          Back to Community
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <SEOHead
        title="Reels - Community Videos"
        description="Watch engaging short-form video content from our AI community."
      />
      
      {/* Header - Instagram style */}
      <div className="absolute top-0 left-0 right-0 z-30 safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
          </Button>
          <span 
            className="text-white font-bold text-lg"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            Reels
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 -mr-2"
            onClick={() => navigate("/community/create-reel")}
          >
            <Plus className="w-6 h-6" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
          </Button>
        </div>
      </div>

      {/* Reels container with snap scroll and touch gestures */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide touch-pan-y"
        style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="w-full h-screen">
            <ReelItem
              reel={reel}
              isActive={index === activeIndex}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted((prev) => !prev)}
              onOpenComments={() => handleOpenComments(reel.insight_id)}
              commentsCount={commentsCounts[reel.insight_id] || 0}
            />
          </div>
        ))}
      </div>

      {/* Comments overlay */}
      {selectedInsightId && (
        <CommentsOverlay
          insightId={selectedInsightId}
          isOpen={commentsOpen}
          onClose={handleCloseComments}
        />
      )}

      {/* Custom styles for animations */}
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(0); opacity: 0; }
          15% { transform: scale(1.2); opacity: 1; }
          30% { transform: scale(0.95); }
          45% { transform: scale(1.05); }
          60% { transform: scale(1); }
          100% { transform: scale(1); opacity: 0; }
        }
        .safe-area-inset-top {
          padding-top: env(safe-area-inset-top, 0px);
        }
      `}</style>
    </div>
  );
};

export default ReelsPage;
