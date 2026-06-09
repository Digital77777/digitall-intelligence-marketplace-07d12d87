import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { CommunityTopic } from "@/types/community";
import { RichTextRenderer } from "@/components/community/RichTextRenderer";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";
import { MemberActionsWrapper } from "./MemberActionsWrapper";

interface TopicCardProps {
  topic: CommunityTopic;
  onTopicClick: (topicId: string, tags?: string[]) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
}

export const TopicCard = memo(({ topic, onTopicClick, getInitials }: TopicCardProps) => {
  const navigate = useNavigate();
  const { isOfficial, badgeLabel } = useIsOfficialAccount(topic.profiles?.user_id);

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer border-border/40 overflow-hidden"
      onClick={() => onTopicClick(topic.id, topic.tags)}
    >
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="flex items-center gap-3 p-3 pb-2">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage src={topic.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-sm bg-primary/10 text-primary font-medium">
              {getInitials(topic.profiles?.full_name, topic.profiles?.email)}
            </AvatarFallback>
          </Avatar>
          <div 
            className="flex-1 min-w-0 cursor-pointer hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (topic.profiles?.user_id) {
                navigate(`/profile/${topic.profiles.user_id}`);
              }
            }}
          >
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm leading-tight truncate">
                {topic.profiles?.full_name || "Community Member"}
              </p>
              {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
            </p>
          </div>
          <MemberActionsWrapper
            userId={topic.profiles?.user_id || ""}
            size="sm"
          />
          {topic.is_pinned && (
            <Badge variant="secondary" className="text-xs shrink-0 px-2 py-0.5">
              <TrendingUp className="w-3 h-3" />
            </Badge>
          )}
        </div>

        {/* Post Content */}
        <div className="px-3 pb-2">
          <h3 className="text-base font-semibold mb-1.5 leading-snug line-clamp-2">
            {topic.title}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
            <RichTextRenderer content={topic.content} truncate={150} />
          </p>
        </div>

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {topic.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs font-normal bg-secondary/50 px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {topic.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal bg-secondary/50 px-2 py-0.5">
                +{topic.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats Footer */}
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground/70 font-medium">
              {topic.replies_count || 0} {topic.replies_count === 1 ? 'reply' : 'replies'}
            </span>
          </div>
          {topic.views !== undefined && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground/70 font-medium">
                {topic.views} {topic.views === 1 ? 'view' : 'views'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.topic.id === nextProps.topic.id &&
    prevProps.topic.replies_count === nextProps.topic.replies_count &&
    prevProps.topic.views === nextProps.topic.views &&
    prevProps.topic.is_pinned === nextProps.topic.is_pinned
  );
});

TopicCard.displayName = "TopicCard";