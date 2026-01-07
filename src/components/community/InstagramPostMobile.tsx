import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import { Heart, MessageCircle, MoreHorizontal, Volume2, VolumeX, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CommunityInsight } from "@/types/community";
import { formatDistanceToNow } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface InstagramPostMobileProps {
  insight: CommunityInsight;
  onLikeClick: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  onViewClick: (insight: CommunityInsight) => void;
  onVideoTap?: (videoUrl: string, insightId: string, videoIndex: number) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
}

export const InstagramPostMobile = memo(({ 
  insight, 
  onLikeClick, 
  onViewClick, 
  onVideoTap,
  getInitials 
}: InstagramPostMobileProps) => {
  const [isLiked, setIsLiked] = useState(insight.is_liked || false);
  const [likesCount, setLikesCount] = useState(insight.likes_count);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

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

  const handleDoubleTap = useCallback(async (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected - like the post
      if (!isLiked) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 1000);
        await onLikeClick(insight.id, false, insight.category);
      } else {
        // Show heart animation even if already liked
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 1000);
      }
    }
    lastTapRef.current = now;
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

  // Helper function to truncate by word count
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

  // Determine word limit based on content type: 30 for media posts, 70 for text-only
  const hasMedia = mediaItems.length > 0;
  const wordLimit = hasMedia ? 30 : 70;
  const { truncated: contentPreview, isTruncated } = truncateByWords(insight.content, wordLimit);

  return (
    <article className="border-b border-border bg-background" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500 p-[2px]">
              <Avatar className="w-full h-full border-2 border-background">
                <AvatarImage src={insight.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-muted">
                  {getInitials(insight.profiles?.full_name, insight.profiles?.email)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              {insight.profiles?.full_name || "Community Member"}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Media Content - Full width edge-to-edge like Instagram */}
      {mediaItems.length > 0 && (
        <div className="relative w-full bg-black" onClick={handleDoubleTap}>
          <div className="overflow-hidden w-full" ref={emblaRef}>
            <div className="flex w-full">
              {mediaItems.map((media, index) => (
                <div 
                  key={index} 
                  className="flex-[0_0_100%] min-w-0 relative flex items-center justify-center"
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.src}
                      alt={insight.title}
                      className="w-full h-auto max-h-[70vh] object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div 
                      className="relative w-full flex items-center justify-center group cursor-pointer"
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
                        className="w-full h-auto max-h-[70vh] object-contain"
                        loop
                        muted={isMuted}
                        playsInline
                      />
                      {/* Reels entry indicator - shows on video */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/30 rounded-full p-4 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg 
                            className="w-10 h-10 text-white fill-white" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {/* Mute toggle for video */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(e);
                        }}
                        className="absolute bottom-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10"
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

          {/* Carousel Navigation */}
          {hasMultipleMedia && (
            <>
              {selectedMediaIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {selectedMediaIndex < mediaItems.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}

          {/* Double-tap heart animation */}
          {showDoubleTapHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart 
                className="w-24 h-24 text-white fill-white drop-shadow-lg animate-scale-in" 
                style={{ 
                  animation: 'heartPulse 1s ease-out forwards'
                }}
              />
            </div>
          )}

          {/* Carousel dots */}
          {hasMultipleMedia && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {mediaItems.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
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

      {/* Text-only post (Facebook-style) */}
      {mediaItems.length === 0 && (
        <div 
          className="px-4 py-4"
          onClick={handleDoubleTap}
        >
          {/* Bold title */}
          <h2 className="text-base font-bold text-foreground leading-snug mb-3">
            {insight.title}
          </h2>
          {/* Content with Facebook-like typography */}
          <div className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
            {isExpanded ? insight.content : contentPreview}
            {isTruncated && !isExpanded && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="text-muted-foreground font-medium ml-1 hover:underline"
              >
                more
              </button>
            )}
          </div>
          {/* Double-tap heart animation for text posts */}
          {showDoubleTapHeart && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
              <Heart 
                className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" 
                style={{ 
                  animation: 'heartPulse 1s ease-out forwards'
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-4">
          <button onClick={handleLikeClick} className="p-1">
            <Heart 
              className={cn(
                "h-6 w-6 transition-all",
                isLiked 
                  ? "fill-red-500 text-red-500 scale-110" 
                  : "hover:text-muted-foreground/80"
              )}
            />
          </button>
          <button onClick={handleViewPost} className="p-1" aria-label="View full post">
            <Eye className="h-6 w-6 hover:text-muted-foreground/80" />
          </button>
          <button onClick={handleViewPost} className="p-1">
            <MessageCircle className="h-6 w-6 hover:text-muted-foreground/80" />
          </button>
        </div>
      </div>

      {/* Likes count */}
      <div className="px-4 pb-1">
        <span className="text-sm font-semibold">{likesCount.toLocaleString()} likes</span>
      </div>

      {/* Caption */}
      {mediaItems.length > 0 && (
        <div className="px-4 pb-2">
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
        className="px-4 pb-2 text-sm text-muted-foreground"
      >
        View more
      </button>

      {/* Category tag */}
      <div className="px-4 pb-3">
        <span className="text-xs text-muted-foreground">#{insight.category.toLowerCase().replace(/\s+/g, '')}</span>
      </div>

      {/* Add CSS for heart animation */}
      <style>{`
        @keyframes heartPulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
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

InstagramPostMobile.displayName = "InstagramPostMobile";
