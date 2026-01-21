import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CommunityInsight } from "@/types/community";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedImage } from "@/components/media/EnhancedImage";
import { EnhancedVideoPlayer } from "@/components/media/EnhancedVideoPlayer";
import { RichTextRenderer } from "@/components/community/RichTextRenderer";
import { cn } from "@/lib/utils";

interface InsightDetailModalProps {
  insight: CommunityInsight;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InsightDetailModal = ({ insight, open, onOpenChange }: InsightDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Combine cover_image with images array for gallery
  const allImages = [
    ...(insight.cover_image ? [insight.cover_image] : []),
    ...(insight.images || []).filter(img => img !== insight.cover_image)
  ];
  
  // Fetch profiles of users who liked this insight
  const { data: likedByUsers } = useQuery({
    queryKey: ["insight-likes-profiles", insight.id],
    queryFn: async () => {
      const { data: likes } = await supabase
        .from("insight_likes")
        .select("user_id")
        .eq("insight_id", insight.id);

      if (!likes || likes.length === 0) return [];

      const userIds = likes.map(l => l.user_id);
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      return profiles || [];
    },
    enabled: open && !!insight.insight_likes && insight.insight_likes.length > 0,
  });

  const getInitials = (name?: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{insight.category}</Badge>
            {insight.read_time && (
              <Badge variant="secondary">{insight.read_time}</Badge>
            )}
          </div>
          <DialogTitle className="text-2xl">{insight.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{insight.likes_count} likes</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{insight.views_count} views</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Image Gallery/Carousel */}
          {allImages.length > 0 && (
            <div className="relative rounded-lg overflow-hidden bg-muted/30">
              <EnhancedImage
                src={allImages[currentImageIndex]}
                alt={`${insight.title} - Image ${currentImageIndex + 1}`}
                category="ai"
                className="w-full h-auto max-h-[400px] object-contain"
              />
              
              {/* Navigation arrows for multiple images */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Image counter */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-xs font-medium">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
              
              {/* Thumbnail dots for multiple images */}
              {allImages.length > 1 && allImages.length <= 10 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentImageIndex
                          ? "bg-primary w-4"
                          : "bg-background/60 hover:bg-background/80"
                      )}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Cover Video (only if no images) */}
          {allImages.length === 0 && insight.videos && insight.videos.length > 0 && (
            <div className="rounded-lg overflow-hidden bg-black">
              <EnhancedVideoPlayer
                src={insight.videos[0]}
                poster={insight.video_thumbnails?.[0]}
                className="w-full aspect-video"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">
              <RichTextRenderer content={insight.content} />
            </p>
          </div>

          {/* Liked By Users */}
          {likedByUsers && likedByUsers.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Liked by {likedByUsers.length} {likedByUsers.length === 1 ? 'person' : 'people'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {likedByUsers.map((profile) => (
                  <div key={profile.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {profile.full_name || "Community Member"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
