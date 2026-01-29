import React, { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, MoreHorizontal, Trash2, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { RichTextRenderer } from "@/components/community/RichTextRenderer";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";
import { cn } from "@/lib/utils";

interface ReplyProfile {
  user_id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

interface ReplyLike {
  id: string;
  user_id: string;
}

export interface Reply {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  likes_count: number;
  profiles?: ReplyProfile;
  topic_reply_likes?: ReplyLike[];
  is_liked?: boolean;
  children?: Reply[];
}

interface ThreadedReplyProps {
  reply: Reply;
  topicAuthorId: string;
  currentUserId?: string;
  depth?: number;
  maxDepth?: number;
  onReply: (parentId: string, content: string) => Promise<void>;
  onLike: (replyId: string, isLiked: boolean) => Promise<void>;
  onDelete: (replyId: string) => Promise<void>;
  isSubmitting?: boolean;
}

const getInitials = (name?: string, email?: string): string => {
  if (name) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
};

export const ThreadedReply = memo(({
  reply,
  topicAuthorId,
  currentUserId,
  depth = 0,
  maxDepth = 3,
  onReply,
  onLike,
  onDelete,
  isSubmitting = false,
}: ThreadedReplyProps) => {
  const navigate = useNavigate();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const { isOfficial, badgeLabel } = useIsOfficialAccount(reply.profiles?.user_id);
  const isAuthor = reply.user_id === topicAuthorId;
  const isOwner = currentUserId === reply.user_id;
  const hasReplies = reply.children && reply.children.length > 0;
  const canReply = depth < maxDepth && currentUserId;

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;
    setIsLiking(true);
    try {
      await onLike(reply.id, reply.is_liked || false);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || isReplying) return;
    setIsReplying(true);
    try {
      await onReply(reply.id, replyContent.trim());
      setReplyContent("");
      setShowReplyForm(false);
      setShowReplies(true);
    } finally {
      setIsReplying(false);
    }
  };

  const handleProfileClick = () => {
    if (reply.profiles?.user_id) {
      navigate(`/profile/${reply.profiles.user_id}`);
    }
  };

  return (
    <div className={cn("group", depth > 0 && "ml-6 sm:ml-10 pl-3 border-l-2 border-border/50")}>
      <div className="py-3">
        {/* Reply Header */}
        <div className="flex items-start gap-3">
          <Avatar 
            className="w-8 h-8 cursor-pointer shrink-0" 
            onClick={handleProfileClick}
          >
            <AvatarImage src={reply.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {getInitials(reply.profiles?.full_name, reply.profiles?.email)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Name and badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                onClick={handleProfileClick}
              >
                {reply.profiles?.full_name || "Community Member"}
              </span>
              {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
              {isAuthor && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                  Author
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Content */}
            <div className="mt-1.5 text-sm text-foreground/90 leading-relaxed">
              <RichTextRenderer content={reply.content} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-2">
              {/* Like Button */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 gap-1.5 text-xs font-medium",
                  reply.is_liked && "text-destructive"
                )}
                onClick={handleLike}
                disabled={!currentUserId || isLiking}
              >
                <Heart 
                  className={cn(
                    "w-3.5 h-3.5 transition-all",
                    reply.is_liked && "fill-current"
                  )} 
                />
                {reply.likes_count > 0 && (
                  <span>{reply.likes_count}</span>
                )}
                {reply.likes_count === 0 && "Like"}
              </Button>

              {/* Reply Button */}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1.5 text-xs font-medium"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Reply
                </Button>
              )}

              {/* Show/Hide Replies */}
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1 text-xs font-medium text-muted-foreground"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      {reply.children!.length} {reply.children!.length === 1 ? "reply" : "replies"}
                    </>
                  )}
                </Button>
              )}

              {/* More Options */}
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(reply.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && (
              <div className="mt-3 flex gap-2">
                <Textarea
                  placeholder={`Reply to ${reply.profiles?.full_name || "this comment"}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] text-sm resize-none"
                  maxLength={2000}
                />
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || isReplying}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="space-y-0">
          {reply.children!.map((childReply) => (
            <ThreadedReply
              key={childReply.id}
              reply={childReply}
              topicAuthorId={topicAuthorId}
              currentUserId={currentUserId}
              depth={depth + 1}
              maxDepth={maxDepth}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ThreadedReply.displayName = "ThreadedReply";
