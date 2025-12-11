import React, { memo, useCallback } from "react";
import { Heart, Eye, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { CommunityInsight } from "@/types/community";
import { EnhancedImage } from "@/components/media/EnhancedImage";

interface InsightCardProps {
  insight: CommunityInsight;
  onLikeClick: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  onViewClick: (insight: CommunityInsight) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
}

export const InsightCard = memo(({ insight, onLikeClick, onViewClick, getInitials }: InsightCardProps) => {
  const handleLikeClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onLikeClick(insight.id, insight.is_liked || false, insight.category);
  }, [insight.id, insight.is_liked, insight.category, onLikeClick]);

  const handleCardClick = useCallback(() => {
    onViewClick(insight);
  }, [insight, onViewClick]);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden max-w-full group"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Media section - constrained height on desktop */}
        {insight.cover_image && (
          <div className="w-full relative overflow-hidden h-32 md:h-40">
            <EnhancedImage 
              src={insight.cover_image} 
              alt={insight.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {!insight.cover_image && insight.videos && insight.videos.length > 0 && (
          <div className="w-full relative overflow-hidden h-32 md:h-40 cursor-pointer">
            {insight.video_thumbnails && insight.video_thumbnails[0] ? (
              <div className="relative h-full">
                <img 
                  src={insight.video_thumbnails[0]} 
                  alt={`${insight.title} video preview`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 md:w-6 md:h-6 text-primary ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
            ) : (
              <video 
                src={insight.videos[0]} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
        
        {/* Content section - compact padding */}
        <div className="p-3 md:p-3.5">
          {/* Author info - smaller on desktop */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-7 h-7 md:w-8 md:h-8 shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(insight.profiles?.full_name, insight.profiles?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs md:text-sm truncate">
                {insight.profiles?.full_name || insight.profiles?.email || "Anonymous"}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 py-0">
                  {insight.category}
                </Badge>
                {insight.read_time && (
                  <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0">
                    {insight.read_time}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Title - smaller */}
          <h3 className="text-sm md:text-base font-semibold mb-1.5 leading-tight line-clamp-2">
            {insight.title}
          </h3>
          
          {/* Preview text - shorter */}
          <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
            {insight.content.substring(0, 80)}...
          </p>

          {/* Footer - compact */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-0.5">
                <Eye className="w-3 h-3" />
                <span>{insight.views_count}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Heart className="w-3 h-3" />
                <span>{insight.likes_count}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={insight.is_liked ? "default" : "outline"}
                className="h-6 md:h-7 text-xs px-2"
                onClick={handleLikeClick}
              >
                <Heart className={`w-3 h-3 mr-1 ${insight.is_liked ? 'fill-current' : ''}`} />
                {insight.is_liked ? 'Liked' : 'Like'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 md:h-7 text-xs px-2"
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