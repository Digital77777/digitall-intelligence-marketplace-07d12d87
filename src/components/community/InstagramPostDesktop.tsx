import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import { Heart, MessageCircle, MoreHorizontal, Volume2, VolumeX, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CommunityInsight } from "@/types/community";
import { formatDistanceToNow } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";

interface InstagramPostDesktopProps {
  insight: CommunityInsight;
  onLikeClick: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  onViewClick: (insight: CommunityInsight) => void;
  onVideoTap?: (videoUrl: string, insightId: string, videoIndex: number) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
}

export const InstagramPostDesktop = memo(({ 
  insight, 
  onLikeClick, 
  onViewClick, 
  onVideoTap,
  getInitials 
}: InstagramPostDesktopProps) => {
  const [isLiked, setIsLiked] = useState(insight.is_liked || false);
  const [likesCount, setLikesCount] = useState(insight.likes_count);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isOfficial, badgeLabel } = useIsOfficialAccount(insight.profiles?.user_id);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastClickRef = useRef<number>(0);

  // Combine images and videos for carousel
  const mediaItems: { type: 'image' | 'video'; src: string; poster?: string }[] = [];
  
  if (insight.cover_image) {
    mediaItems.push({ type: 'image', src: insight.cover_image });
  }
  
  if (insight.videos && insight.videos.length > 0) {
    insight.videos.forEach((video, index) => {
      mediaItems.push({ 
        type: 'video', 
        src: video, 
        poster: insight.video_thumbnails?.[index] 
      });
    });
  }

  const hasMultipleMedia = mediaItems.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedMediaIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Auto-play video when in view
  useEffect(() => {
    if (mediaItems[selectedMediaIndex]?.type !== 'video') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              videoRef.current.play().catch(() => {});
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: [0.5] }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [selectedMediaIndex, mediaItems]);

  const handleDoubleClick = useCallback(async () => {
    const now = Date.now();
    const DOUBLE_CLICK_DELAY = 300;

    if (now - lastClickRef.current < DOUBLE_CLICK_DELAY) {
      if (!isLiked) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 1000);
        await onLikeClick(insight.id, false, insight.category);
      } else {
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 1000);
      }
    }
    lastClickRef.current = now;
  }, [isLiked, insight.id, insight.category, onLikeClick]);

  const handleLikeClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    await onLikeClick(insight.id, isLiked, insight.category);
  }, [insight.id, isLiked, insight.category, onLikeClick]);

  const handleViewPost = useCallback(() => {
    onViewClick(insight);
  }, [insight, onViewClick]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const timeAgo = formatDistanceToNow(new Date(insight.created_at), { addSuffix: false });

  const truncateByWords = useCallback((text: string, wordLimit: number): { truncated: string; isTruncated: boolean } => {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) {
      return { truncated: text, isTruncated: false };
    }
    return { 
      truncated: words.slice(0, wordLimit).join(' ') + '...', 
      isTruncated: true 
    };
  }, []);

  const hasMedia = mediaItems.length > 0;
  const wordLimit = hasMedia ? 40 : 100;
  const { truncated: contentPreview, isTruncated } = truncateByWords(insight.content, wordLimit);

  return (
    <article 
      className="border border-border rounded-lg bg-card overflow-hidden hover:shadow-lg transition-shadow duration-200" 
      ref={containerRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500 p-[2px]">
              <Avatar className="w-full h-full border-2 border-card">
                <AvatarImage src={insight.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-sm bg-muted">
                  {getInitials(insight.profiles?.full_name, insight.profiles?.email)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold leading-tight hover:underline cursor-pointer">
                {insight.profiles?.full_name || "Community Member"}
              </span>
              {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-primary font-medium">#{insight.category.toLowerCase().replace(/\s+/g, '')}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Media Content */}
      {mediaItems.length > 0 && (
        <div className="relative bg-black cursor-pointer" onClick={handleDoubleClick}>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {mediaItems.map((media, index) => (
                <div 
                  key={index} 
                  className="flex-[0_0_100%] min-w-0 relative flex items-center justify-center aspect-square"
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.src}
                      alt={insight.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div 
                      className="relative w-full h-full flex items-center justify-center group"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onVideoTap) {
                          onVideoTap(media.src, insight.id, index);
                        }
                      }}
                    >
                      <video
                        ref={index === selectedMediaIndex ? videoRef : null}
                        src={media.src}
                        poster={media.poster}
                        className="w-full h-full object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/30 rounded-full p-4 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-12 h-12 text-white fill-white" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(e);
                        }}
                        className="absolute bottom-4 right-4 p-2.5 rounded-full bg-card/80 backdrop-blur-sm z-10 hover:bg-card transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Navigation */}
          {hasMultipleMedia && (
            <>
              {selectedMediaIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/90 backdrop-blur-sm shadow-lg hover:bg-card transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {selectedMediaIndex < mediaItems.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/90 backdrop-blur-sm shadow-lg hover:bg-card transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </>
          )}

          {/* Double-click heart animation */}
          {showDoubleTapHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart 
                className="w-28 h-28 text-white fill-white drop-shadow-lg" 
                style={{ animation: 'heartPulse 1s ease-out forwards' }}
              />
            </div>
          )}

          {/* Carousel dots */}
          {hasMultipleMedia && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {mediaItems.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === selectedMediaIndex 
                      ? "bg-primary" 
                      : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Text-only post */}
      {mediaItems.length === 0 && (
        <div 
          className="px-6 py-8 bg-gradient-to-br from-muted/30 to-muted/10 min-h-[280px] flex flex-col justify-center cursor-pointer"
          onClick={handleDoubleClick}
        >
          <h3 className="text-xl font-semibold mb-3 leading-tight">{insight.title}</h3>
          <p className="text-base leading-relaxed text-muted-foreground">
            {isExpanded ? insight.content : contentPreview}
          </p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="flex items-center gap-5">
          <button 
            onClick={handleLikeClick} 
            className="p-1 hover:scale-110 transition-transform"
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <Heart 
              className={cn(
                "h-7 w-7 transition-all",
                isLiked 
                  ? "fill-red-500 text-red-500" 
                  : "hover:text-muted-foreground/80"
              )}
            />
          </button>
          <button 
            onClick={handleViewPost} 
            className="p-1 hover:scale-110 transition-transform" 
            aria-label="View comments"
          >
            <MessageCircle className="h-7 w-7 hover:text-muted-foreground/80" />
          </button>
          <button 
            onClick={handleViewPost} 
            className="p-1 hover:scale-110 transition-transform"
            aria-label="View full post"
          >
            <Eye className="h-7 w-7 hover:text-muted-foreground/80" />
          </button>
        </div>
      </div>

      {/* Likes count */}
      <div className="px-4 pb-2">
        <span className="text-sm font-semibold">{likesCount.toLocaleString()} likes</span>
      </div>

      {/* Caption for media posts */}
      {mediaItems.length > 0 && (
        <div className="px-4 pb-3">
          <h3 className="font-semibold text-base mb-1">{insight.title}</h3>
          <p className="text-sm">
            <span className="font-semibold mr-1.5">
              {insight.profiles?.full_name || "Community Member"}
            </span>
            {isExpanded ? insight.content : contentPreview}
          </p>
        </div>
      )}

      {/* View comments link */}
      <button 
        onClick={handleViewPost}
        className="px-4 pb-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        View more
      </button>

      {/* CSS for heart animation */}
      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </article>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.insight.id === nextProps.insight.id &&
    prevProps.insight.likes_count === nextProps.insight.likes_count &&
    prevProps.insight.is_liked === nextProps.insight.is_liked
  );
});

InstagramPostDesktop.displayName = "InstagramPostDesktop";
