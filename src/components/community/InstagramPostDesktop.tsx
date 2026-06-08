import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import { Heart, MessageCircle, MoreHorizontal, Volume2, VolumeX, ChevronLeft, ChevronRight, Eye, Share2, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CommunityInsight } from "@/types/community";
import { formatDistanceToNow } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";
import { usePostTypography } from "./usePostTypography";
import { MemberActionsWrapper } from "./MemberActionsWrapper";

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
  
  if (insight.images && insight.images.length > 0) {
    insight.images.forEach((img) => {
      if (img !== insight.cover_image) {
        mediaItems.push({ type: 'image', src: img });
      }
    });
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

  const timeAgo = formatDistanceToNow(new Date(insight.created_at), { addSuffix: true });

  const truncateByWords = useCallback((text: string, wordLimit: number): { truncated: string; isTruncated: boolean } => {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) {
      return { truncated: text, isTruncated: false };
    }
    return { 
      truncated: words.slice(0, wordLimit).join(' ') + '…', 
      isTruncated: true 
    };
  }, []);

  const hasMedia = mediaItems.length > 0;
  const wordLimit = hasMedia ? 30 : 80;
  const { truncated: contentPreview, isTruncated } = truncateByWords(insight.content, wordLimit);

  // Shared Facebook-style dynamic font sizing (consistent across mobile/desktop)
  const typography = usePostTypography(insight, { hasMedia });

  const categoryLabel = insight.category?.replace(/[-_]/g, ' ');

  return (
    <article 
      className="group relative border border-border/60 rounded-2xl bg-card overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_-16px_hsl(var(--primary)/0.18)] hover:border-border" 
      ref={containerRef}
    >
      {/* Author Header — placed first for a professional editorial layout */}
      <header className="flex items-start justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-11 w-11 ring-1 ring-border shrink-0">
            <AvatarImage src={insight.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-sm font-semibold bg-muted">
              {getInitials(insight.profiles?.full_name, insight.profiles?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[15px] font-semibold leading-tight hover:underline cursor-pointer truncate">
                {insight.profiles?.full_name || "Community Member"}
              </span>
              {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
            </div>
            {insight.profiles?.headline && (
              <span className="text-xs text-muted-foreground truncate max-w-[320px] leading-tight mt-0.5">
                {insight.profiles.headline}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 mt-0.5">
              <span>{timeAgo}</span>
              {categoryLabel && (
                <>
                  <span aria-hidden>·</span>
                  <span className="capitalize hover:text-primary cursor-pointer transition-colors">
                    {categoryLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MemberActionsWrapper
            userId={insight.profiles?.user_id || ""}
            size="sm"
          />
          <Button variant="ghost" size="icon" className="h-9 w-9 -mr-2 text-muted-foreground hover:text-foreground rounded-full shrink-0">
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </header>

      {/* Text content above media — more natural reading order */}
      <div className="px-6 pb-4">
        {typography.isShortTextPost ? (
          <div className="cursor-pointer py-2" onClick={handleDoubleClick}>
            <h3
              className={cn(typography.titleClass, "cursor-pointer hover:text-primary transition-colors")}
              onClick={handleViewPost}
            >
              {insight.title}
            </h3>
            <p className={cn(typography.contentClass, "mt-2")}>
              {insight.content}
            </p>
          </div>
        ) : (
          <>
            <h3
              className="text-[17px] font-semibold leading-snug mb-1.5 cursor-pointer hover:text-primary transition-colors line-clamp-2 tracking-tight"
              onClick={handleViewPost}
            >
              {insight.title}
            </h3>
            <div>
              <p className="text-[14.5px] text-foreground/80 leading-relaxed [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline">
                {isExpanded ? insight.content : contentPreview}
              </p>
              {isTruncated && !isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm font-medium text-primary hover:text-primary/80 mt-1 transition-colors"
                >
                  Show more
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Media Content — full bleed, 16:10 aspect for a professional look */}
      {hasMedia && (
        <div className="relative cursor-pointer overflow-hidden bg-muted/40" onClick={handleDoubleClick}>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {mediaItems.map((media, index) => (
                <div 
                  key={index} 
                  className="flex-[0_0_100%] min-w-0 relative aspect-[16/10] bg-muted"
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.src}
                      alt={insight.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div 
                      className="relative w-full h-full group/video"
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
                        <div className="bg-black/20 rounded-full p-4 backdrop-blur-sm opacity-0 group-hover/video:opacity-100 transition-opacity duration-200">
                          <svg className="w-10 h-10 text-white fill-white" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(e);
                        }}
                        className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm z-10 hover:bg-black/70 transition-colors text-white"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image counter badge */}
          {hasMultipleMedia && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {selectedMediaIndex + 1} / {mediaItems.length}
            </div>
          )}

          {/* Carousel Navigation */}
          {hasMultipleMedia && (
            <>
              {selectedMediaIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors text-black"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {selectedMediaIndex < mediaItems.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors text-black"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}

          {/* Double-click heart animation */}
          {showDoubleTapHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart 
                className="w-24 h-24 text-white fill-white drop-shadow-lg" 
                style={{ animation: 'heartPulse 1s ease-out forwards' }}
              />
            </div>
          )}

          {/* Carousel dots */}
          {hasMultipleMedia && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {mediaItems.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-200",
                    index === selectedMediaIndex 
                      ? "bg-white w-4" 
                      : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer: stats + action bar */}
      <div className={cn("px-6 pt-4 pb-3", hasMedia && "border-t border-border/50")}>
        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            {likesCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-red-500/10">
                  <Heart className="h-2.5 w-2.5 fill-red-500 text-red-500" />
                </span>
                <span className="font-medium">{likesCount.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span>{(insight.views_count || 0).toLocaleString()} views</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/70 -mx-6 mb-1" />

        {/* Action Bar */}
        <div className="flex items-center justify-around pt-1">
          <Button
            variant="ghost"
            onClick={handleLikeClick}
            className={cn(
              "flex-1 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 h-10 rounded-lg font-medium",
              isLiked && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart
              className={cn(
                "h-[18px] w-[18px] transition-all",
                isLiked && "fill-red-500 text-red-500"
              )}
            />
            <span className="text-[13px]">Like</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleViewPost}
            className="flex-1 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 h-10 rounded-lg font-medium"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="text-[13px]">Comment</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleViewPost}
            className="flex-1 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 h-10 rounded-lg font-medium"
          >
            <Share2 className="h-[18px] w-[18px]" />
            <span className="text-[13px]">Share</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleViewPost}
            className="flex-1 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 h-10 rounded-lg font-medium"
          >
            <Eye className="h-[18px] w-[18px]" />
            <span className="text-[13px]">View</span>
          </Button>
        </div>
      </div>

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
