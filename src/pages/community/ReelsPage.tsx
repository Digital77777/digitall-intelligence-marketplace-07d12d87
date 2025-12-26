import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Share2, Volume2, VolumeX, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReels } from "@/hooks/useReels";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { ReelSkeleton } from "@/components/community/ReelSkeleton";

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
}

const ReelItem = ({ reel, isActive, isMuted, onMuteToggle }: ReelItemProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
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

    if (isActive) {
      video.muted = isMuted;
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive, isMuted]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap - toggle like
      handleLike();
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 800);
    }
    lastTapRef.current = now;
  }, []);

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

  return (
    <div className="relative w-full h-screen snap-start snap-always bg-black flex items-center justify-center">
      {/* Loading spinner */}
      {isBuffering && isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video_url}
        poster={reel.thumbnail_url || undefined}
        className="max-w-full max-h-full object-contain"
        loop
        playsInline
        muted={isMuted}
        autoPlay={isActive}
        onClick={handleDoubleTap}
        onDoubleClick={handleLike}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
      />

      {/* Double-tap like animation */}
      {showLikeAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart className="w-24 h-24 text-red-500 fill-red-500 animate-in zoom-in-50 fade-in duration-200" />
        </div>
      )}

      {/* Right side actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 z-10">
        {/* Author avatar */}
        <button onClick={() => navigate(`/profile/${reel.user_id}`)} className="relative">
          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarImage src={authorProfile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(authorProfile?.full_name)}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Like button */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`p-2 rounded-full ${isLiked ? "text-red-500" : "text-white"}`}>
            <Heart className={`w-7 h-7 ${isLiked ? "fill-red-500" : ""}`} />
          </div>
          <span className="text-white text-xs font-medium">{likesCount}</span>
        </button>

        {/* Comment button */}
        <button onClick={handleViewInsight} className="flex flex-col items-center gap-1">
          <div className="p-2 rounded-full text-white">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-white text-xs font-medium">View</span>
        </button>

        {/* Share button */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="p-2 rounded-full text-white">
            <Share2 className="w-7 h-7" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>

        {/* Mute button */}
        <button onClick={onMuteToggle} className="flex flex-col items-center gap-1">
          <div className="p-2 rounded-full text-white">
            {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
          </div>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-4 right-20 z-10">
        <button onClick={() => navigate(`/profile/${reel.user_id}`)} className="flex items-center gap-2 mb-2">
          <span className="text-white font-semibold text-sm">
            @{authorProfile?.full_name?.toLowerCase().replace(/\s+/g, "_") || "user"}
          </span>
        </button>
        {reel.title && (
          <p className="text-white text-sm line-clamp-2">{reel.title}</p>
        )}
      </div>
    </div>
  );
};

const ReelsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialReelId = searchParams.get("reel") || undefined;
  const { reels, isLoading, currentIndex, goToReel, totalReels } = useReels(initialReelId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Scroll to reel on activeIndex change (for keyboard navigation)
  const scrollToReel = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container || index < 0 || index >= reels.length) return;
    container.scrollTo({ top: index * container.clientHeight, behavior: "smooth" });
  }, [reels.length]);

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
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-white font-semibold">Reels</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Navigation hints */}
      <div className="absolute left-1/2 -translate-x-1/2 top-20 z-20 flex flex-col items-center gap-1 opacity-50 pointer-events-none">
        {activeIndex > 0 && <ChevronUp className="w-6 h-6 text-white animate-bounce" />}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-20 z-20 flex flex-col items-center gap-1 opacity-50 pointer-events-none">
        {activeIndex < reels.length - 1 && <ChevronDown className="w-6 h-6 text-white animate-bounce" />}
      </div>

      {/* Reels container with snap scroll */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto snap-y snap-mandatory"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="w-full" style={{ height: "100vh" }}>
            <ReelItem
              reel={reel}
              isActive={index === activeIndex}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted((prev) => !prev)}
            />
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="absolute top-16 left-0 right-0 z-20 flex gap-1 px-4">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`h-0.5 flex-1 rounded-full transition-colors ${
              index === activeIndex ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReelsPage;
