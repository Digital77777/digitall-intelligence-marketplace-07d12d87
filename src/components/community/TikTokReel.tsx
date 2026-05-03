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
  isMuted: boolean;
  onOpenComments: () => void;
  commentsCount: number;
}

export const TikTokReel = ({ 
  reel, 
  isActive, 
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
  const [authorProfile, setAuthorProfile] = useState<{ 
    full_name: string | null; 
    avatar_url: string | null 
  } | null>(null);
  
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

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't trigger on button clicks
    if ((e.target as HTMLElement).closest('button')) return;
    
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

  return (
    <div 
      className="relative w-full h-screen snap-start snap-always bg-black overflow-hidden"
      onClick={handleTap}
    >
      {/* Full-screen video */}
      {!videoError ? (
        <video
          ref={videoRef}
          src={reel.video_url}
          poster={reel.thumbnail_url || undefined}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          autoPlay={isActive}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
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
      )}

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
            }} 
          />
        </div>
      )}

      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10 pointer-events-none" />

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

      {/* Right side actions - TikTok style */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
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

      {/* Bottom info - TikTok style */}
      <div className="absolute bottom-6 left-4 right-20 z-20">
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
    </div>
  );
};
