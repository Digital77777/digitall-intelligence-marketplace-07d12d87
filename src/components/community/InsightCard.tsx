import React, { memo, useCallback, useState, useEffect } from "react";
import { Heart, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommunityInsight } from "@/types/community";
import { EnhancedImage } from "@/components/media/EnhancedImage";
import { EnhancedVideoPlayer } from "@/components/media/EnhancedVideoPlayer";
import { RichTextRenderer } from "@/components/community/RichTextRenderer";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  insight: CommunityInsight;
  onLikeClick: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  onViewClick: (insight: CommunityInsight) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
  priority?: boolean;
}

export const InsightCard = memo(({ insight, onLikeClick, onViewClick, getInitials, priority = false }: InsightCardProps) => {
  const { isOfficial, badgeLabel } = useIsOfficialAccount(insight.profiles?.user_id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Combine cover_image with images array for gallery
  const allImages = [
    ...(insight.cover_image ? [insight.cover_image] : []),
    ...(insight.images || []).filter(img => img !== insight.cover_image)
  ];
  
  // Embla carousel for swipe gestures on multi-image insights
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    skipSnaps: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentImageIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleCarouselClick = useCallback((e: React.MouseEvent) => {
    // Only prevent card click if we're swiping
    if (allImages.length > 1) {
      e.stopPropagation();
      onViewClick(insight);
    }
  }, [allImages.length, insight, onViewClick]);
  
  const handleLikeClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onLikeClick(insight.id, insight.is_liked || false, insight.category);
  }, [insight.id, insight.is_liked, insight.category, onLikeClick]);

  const handleCardClick = useCallback(() => {
    onViewClick(insight);
  }, [insight, onViewClick]);

  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Check if this is a text-only insight (no media)
  const hasMedia = insight.cover_image || (insight.videos && insight.videos.length > 0) || (insight.images && insight.images.length > 0);

  return (
    <Card 
      className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden max-w-full group"
      onClick={handleCardClick}
    >
      <CardContent className="p-0 rounded-xl overflow-hidden">
        {/* Media section - Instagram-style with swipe support for multiple images */}
        {allImages.length === 1 && (
          <div className="w-full relative overflow-hidden rounded-t-xl h-auto md:h-40">
            <EnhancedImage 
              src={allImages[0]} 
              alt={insight.title}
              className="w-full h-full object-contain md:object-cover rounded-t-xl"
              enableBlurUp={true}
              priority={priority}
            />
          </div>
        )}
        {allImages.length > 1 && (
          <div className="w-full relative overflow-hidden rounded-t-xl" onClick={handleCarouselClick}>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {allImages.map((image, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0">
                    <div className="h-auto md:h-40">
                      <EnhancedImage 
                        src={image} 
                        alt={`${insight.title} - ${index + 1}`}
                        className="w-full h-full object-contain md:object-cover rounded-t-xl"
                        enableBlurUp={true}
                        priority={priority && index === 0}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Pagination dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    index === currentImageIndex
                      ? "bg-primary w-3"
                      : "bg-white/60"
                  )}
                />
              ))}
            </div>
          </div>
        )}
        {allImages.length === 0 && insight.videos && insight.videos.length > 0 && (
          <div 
            className="w-full relative overflow-hidden rounded-t-xl"
            onClick={handleVideoClick}
          >
            <div className="aspect-video md:h-40 md:aspect-auto rounded-t-xl overflow-hidden">
              <EnhancedVideoPlayer
                src={insight.videos[0]}
                poster={insight.video_thumbnails?.[0]}
                className="w-full h-full rounded-t-xl"
                autoPlayOnScroll={true}
              />
            </div>
          </div>
        )}
        
        {/* Content section - generous padding on mobile, compact on desktop */}
        <div className={`p-4 md:p-3.5 ${!hasMedia ? 'md:min-h-[180px] flex flex-col' : ''}`}>
          {/* Author info - larger on mobile, smaller on desktop */}
          <div className="flex items-center gap-3 md:gap-2 mb-3 md:mb-2">
            <Avatar className="w-10 h-10 md:w-8 md:h-8 shrink-0">
              <AvatarImage src={insight.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-sm md:text-xs bg-primary/10 text-primary">
                {getInitials(insight.profiles?.full_name, insight.profiles?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-sm md:text-sm truncate">
                  {insight.profiles?.full_name || "Community Member"}
                </p>
                {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-1.5">
                <Badge variant="outline" className="text-xs md:text-xs px-2 md:px-1.5 py-0.5 md:py-0">
                  {insight.category}
                </Badge>
                {insight.read_time && (
                  <Badge variant="secondary" className="text-xs md:text-xs px-2 md:px-1.5 py-0.5 md:py-0">
                    {insight.read_time}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Title - normal on mobile, smaller on desktop */}
          <h3 className="text-base md:text-base font-semibold mb-2 md:mb-1.5 leading-tight line-clamp-2">
            {insight.title}
          </h3>
          
          {/* Preview text - show more text when there's no media */}
          <p className={`text-sm md:text-sm text-muted-foreground mb-3 md:mb-2 ${!hasMedia ? 'line-clamp-5 md:line-clamp-4 flex-1' : 'line-clamp-2'}`}>
            <RichTextRenderer content={insight.content} truncate={hasMedia ? 100 : 250} />
          </p>

          {/* Footer - spacious on mobile, compact on desktop */}
          <div className="flex items-center justify-between gap-2 md:gap-1.5 mt-auto">
            <div className="flex items-center gap-3 md:gap-2 text-sm md:text-xs text-muted-foreground">
              <div className="flex items-center gap-1 md:gap-0.5">
                <Eye className="w-4 h-4 md:w-3 md:h-3" />
                <span>{insight.views_count}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-0.5">
                <Heart className="w-4 h-4 md:w-3 md:h-3" />
                <span>{insight.likes_count}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-1">
              <Button
                size="sm"
                variant={insight.is_liked ? "default" : "outline"}
                className="h-9 md:h-7 text-sm md:text-xs px-3 md:px-2"
                onClick={handleLikeClick}
              >
                <Heart className={`w-4 h-4 md:w-3 md:h-3 mr-1 ${insight.is_liked ? 'fill-current' : ''}`} />
                {insight.is_liked ? 'Liked' : 'Like'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 md:h-7 text-sm md:text-xs px-3 md:px-2"
              >
                Read
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.insight.id === nextProps.insight.id &&
    prevProps.insight.likes_count === nextProps.insight.likes_count &&
    prevProps.insight.views_count === nextProps.insight.views_count &&
    prevProps.insight.is_liked === nextProps.insight.is_liked
  );
});

InsightCard.displayName = "InsightCard";