import React, { useState, useCallback, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, ChevronLeft, ChevronRight, Volume2, VolumeX, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";
import { CommentsOverlay } from "@/components/community/CommentsOverlay";
import { cn } from "@/lib/utils";
import type { CommunityInsight } from "@/types/community";
import { formatDistanceToNow } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";

interface FullScreenContentViewerProps {
  insight: CommunityInsight;
  isOpen: boolean;
  onClose: () => void;
  onLikeClick?: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  /** All feed insights for swipe-between-posts navigation */
  feedInsights?: CommunityInsight[];
  onNavigateToInsight?: (insight: CommunityInsight) => void;
}

const MediaSlide = ({
  media,
  isActive,
  isMuted,
  videoRef,
}: {
  media: { type: "image" | "video"; src: string; poster?: string };
  isActive: boolean;
  isMuted: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) => {
  if (media.type === "image") {
    return (
      <img
        src={media.src}
        alt=""
        className="w-full h-full object-contain"
        draggable={false}
      />
    );
  }
  return (
    <video
      ref={isActive ? videoRef : null}
      src={media.src}
      poster={media.poster}
      className="w-full h-full object-contain"
      loop
      muted={isMuted}
      playsInline
      autoPlay={isActive}
    />
  );
};

export const FullScreenContentViewer: React.FC<FullScreenContentViewerProps> = ({
  insight,
  isOpen,
  onClose,
  onLikeClick,
  feedInsights,
  onNavigateToInsight,
}) => {
  const [isLiked, setIsLiked] = useState(insight.is_liked || false);
  const [likesCount, setLikesCount] = useState(insight.likes_count);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef<number>(0);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartRef = useRef<{ y: number; time: number } | null>(null);

  const { isOfficial, badgeLabel } = useIsOfficialAccount(insight.profiles?.user_id);

  // Sync state when insight changes
  useEffect(() => {
    setIsLiked(insight.is_liked || false);
    setLikesCount(insight.likes_count);
    setSelectedMediaIndex(0);
    setIsExpanded(false);
  }, [insight.id]);

  // Build media items
  const mediaItems: { type: "image" | "video"; src: string; poster?: string }[] = [];
  if (insight.cover_image) mediaItems.push({ type: "image", src: insight.cover_image });
  if (insight.images) {
    insight.images.filter(img => img !== insight.cover_image).forEach(img => {
      mediaItems.push({ type: "image", src: img });
    });
  }
  if (insight.videos) {
    insight.videos.forEach((video, i) => {
      mediaItems.push({ type: "video", src: video, poster: insight.video_thumbnails?.[i] });
    });
  }

  const hasMultipleMedia = mediaItems.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedMediaIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Auto-play video
  useEffect(() => {
    if (isOpen && mediaItems[selectedMediaIndex]?.type === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen, selectedMediaIndex]);

  // Swipe-to-dismiss
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartRef.current = { y: e.touches[0].clientY, time: Date.now() };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current) return;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    if (dy > 0) {
      setIsDragging(true);
      setDragY(dy);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragY > 150) {
      onClose();
    }
    setIsDragging(false);
    setDragY(0);
    dragStartRef.current = null;
  }, [dragY, onClose]);

  const handleDoubleTap = useCallback(async () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 1000);
        await onLikeClick?.(insight.id, false, insight.category);
      } else {
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 1000);
      }
    } else {
      setShowOverlay(prev => !prev);
    }
    lastTapRef.current = now;
  }, [isLiked, insight.id, insight.category, onLikeClick]);

  const handleLikeClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isLiked;
    setIsLiked(newState);
    setLikesCount(prev => newState ? prev + 1 : prev - 1);
    await onLikeClick?.(insight.id, isLiked, insight.category);
  }, [insight.id, isLiked, insight.category, onLikeClick]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Feed navigation (prev/next post)
  const currentFeedIndex = feedInsights?.findIndex(i => i.id === insight.id) ?? -1;
  const hasPrevPost = currentFeedIndex > 0;
  const hasNextPost = feedInsights ? currentFeedIndex < feedInsights.length - 1 : false;

  const goToPrevPost = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPrevPost && feedInsights && onNavigateToInsight) {
      onNavigateToInsight(feedInsights[currentFeedIndex - 1]);
    }
  }, [hasPrevPost, feedInsights, currentFeedIndex, onNavigateToInsight]);

  const goToNextPost = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNextPost && feedInsights && onNavigateToInsight) {
      onNavigateToInsight(feedInsights[currentFeedIndex + 1]);
    }
  }, [hasNextPost, feedInsights, currentFeedIndex, onNavigateToInsight]);

  const timeAgo = formatDistanceToNow(new Date(insight.created_at), { addSuffix: false });

  const contentPreview = insight.content.length > 120
    ? insight.content.slice(0, 120) + "..."
    : insight.content;

  if (!isOpen) return null;

  const isTextOnly = mediaItems.length === 0;
  const opacity = isDragging ? Math.max(0.3, 1 - dragY / 400) : 1;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      style={{ opacity }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Content area */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        style={{ transform: isDragging ? `translateY(${dragY}px)` : undefined }}
        onClick={handleDoubleTap}
      >
        {isTextOnly ? (
          /* Text-only fullscreen post */
          <div className="w-full h-full flex flex-col justify-center px-6 md:px-16">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {insight.title}
            </h2>
            <p className="text-base md:text-lg text-white/80 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {isExpanded ? insight.content : contentPreview}
              {!isExpanded && insight.content.length > 120 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                  className="text-white/50 ml-1 hover:text-white/70"
                >
                  more
                </button>
              )}
            </p>
          </div>
        ) : (
          /* Media fullscreen */
          <div className="w-full h-full flex items-center justify-center">
            <div className="overflow-hidden w-full h-full" ref={emblaRef}>
              <div className="flex w-full h-full">
                {mediaItems.map((media, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 flex items-center justify-center h-full">
                    <MediaSlide
                      media={media}
                      isActive={index === selectedMediaIndex}
                      isMuted={isMuted}
                      videoRef={videoRef}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Double-tap heart */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Heart
              className="w-28 h-28 text-white fill-white drop-shadow-2xl"
              style={{ animation: "heartPulse 1s ease-out forwards" }}
            />
          </div>
        )}

        {/* Media dots */}
        {hasMultipleMedia && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {mediaItems.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === selectedMediaIndex ? "bg-white w-4" : "bg-white/40"
                )}
              />
            ))}
          </div>
        )}

        {/* Video mute button */}
        {mediaItems[selectedMediaIndex]?.type === "video" && (
          <button
            onClick={toggleMute}
            className="absolute bottom-28 right-4 p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white z-10"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Top bar - always visible */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-white/30">
            <AvatarImage src={insight.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-white/20 text-white">
              {insight.profiles?.full_name?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">
                {insight.profiles?.full_name || "Member"}
              </span>
              {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
            </div>
            <span className="text-xs text-white/60">{timeAgo}</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {/* Caption */}
        {mediaItems.length > 0 && (
          <div className="px-4 pb-2">
            <p className="text-sm text-white/90">
              <span className="font-semibold mr-1.5">
                {insight.profiles?.full_name || "Member"}
              </span>
              {isExpanded ? insight.content : contentPreview}
              {!isExpanded && insight.content.length > 120 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                  className="text-white/50 ml-1"
                >
                  more
                </button>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between px-4 pb-4 pt-2">
          <div className="flex items-center gap-5">
            <button onClick={handleLikeClick} className="flex items-center gap-1.5">
              <Heart
                className={cn(
                  "h-7 w-7 transition-all",
                  isLiked ? "fill-red-500 text-red-500" : "text-white"
                )}
              />
              <span className="text-sm font-medium text-white">{likesCount.toLocaleString()}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); }}
              className="flex items-center gap-1.5"
            >
              <MessageCircle className="h-7 w-7 text-white" />
            </button>
            <div className="flex items-center gap-1.5">
              <Eye className="h-6 w-6 text-white/60" />
              <span className="text-xs text-white/60">{insight.views_count}</span>
            </div>
          </div>

          {/* Feed navigation arrows (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {hasPrevPost && (
              <button onClick={goToPrevPost} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {hasNextPost && (
              <button onClick={goToNextPost} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Swipe-down hint */}
      {showOverlay && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="w-10 h-1 rounded-full bg-white/30 mx-auto" />
        </div>
      )}

      {/* Comments overlay */}
      <CommentsOverlay
        insightId={insight.id}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      />

      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
