import React from "react";
import { Heart, TrendingUp, Eye, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface InsightPreviewProps {
  title: string;
  content: string;
  category: string;
  readTime?: string;
  coverImage?: string;
  coverVideo?: string;
  videoThumbnail?: string;
}

export const InsightPreview: React.FC<InsightPreviewProps> = ({
  title,
  content,
  category,
  readTime,
  coverImage,
  coverVideo,
  videoThumbnail,
}) => {
  const { user } = useAuth();
  
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AN';
  };

  const displayName = user?.user_metadata?.full_name || user?.email || "You";

  return (
    <Card className="overflow-hidden max-w-full">
      <CardContent className="p-0">
        {coverImage && (
          <div className="w-full relative overflow-hidden">
            <img 
              src={coverImage} 
              alt={title || "Preview"}
              className="w-full h-auto object-contain"
            />
          </div>
        )}
        {!coverImage && coverVideo && (
          <div className="w-full relative overflow-hidden group">
            {videoThumbnail ? (
              <div className="relative">
                <img 
                  src={videoThumbnail} 
                  alt={`${title || "Preview"} video`}
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            ) : (
              <video 
                src={coverVideo} 
                className="w-full h-auto object-contain"
              />
            )}
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                {getInitials(user?.user_metadata?.full_name, user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {displayName}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {category ? (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {category}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
                    No category
                  </Badge>
                )}
                {readTime && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {readTime}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2 leading-tight line-clamp-2">
            {title || "Your insight title will appear here"}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {content ? `${content.substring(0, 120)}...` : "Your content preview will appear here..."}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>0</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>0</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-sm px-3"
                disabled
              >
                <Heart className="w-4 h-4 mr-1.5" />
                Like
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-sm px-3"
                disabled
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Read
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
