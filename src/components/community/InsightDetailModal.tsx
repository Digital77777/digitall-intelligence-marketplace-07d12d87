import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CommunityInsight } from "@/types/community";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedImage } from "@/components/media/EnhancedImage";
import { EnhancedVideoPlayer } from "@/components/media/EnhancedVideoPlayer";

interface InsightDetailModalProps {
  insight: CommunityInsight;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InsightDetailModal = ({ insight, open, onOpenChange }: InsightDetailModalProps) => {
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
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", userIds);

      return profiles || [];
    },
    enabled: open && !!insight.insight_likes && insight.insight_likes.length > 0,
  });

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
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

          {/* Cover Image */}
          {insight.cover_image && (
            <div className="rounded-lg overflow-hidden bg-muted/30">
              <EnhancedImage
                src={insight.cover_image}
                alt={insight.title}
                category="ai"
                className="w-full h-64 sm:h-80 object-contain"
              />
            </div>
          )}
          
          {/* Cover Video */}
          {!insight.cover_image && insight.videos && insight.videos.length > 0 && (
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
            <p className="whitespace-pre-wrap">{insight.content}</p>
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
                      <AvatarFallback className="text-xs bg-primary/10">
                        {getInitials(profile.full_name, profile.email)}
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
