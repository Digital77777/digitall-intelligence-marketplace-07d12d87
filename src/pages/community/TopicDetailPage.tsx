import { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send, Eye, TrendingUp, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { toast } from "sonner";
import { RichTextRenderer } from "@/components/community/RichTextRenderer";
import { ThreadedReply, Reply } from "@/components/community/ThreadedReply";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";
import { cn } from "@/lib/utils";

const replySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Reply cannot be empty" })
    .max(2000, { message: "Reply must be less than 2000 characters" }),
});

// Build nested reply tree from flat array
const buildReplyTree = (replies: Reply[]): Reply[] => {
  const replyMap = new Map<string, Reply>();
  const rootReplies: Reply[] = [];

  // First pass: create map of all replies with children arrays
  replies.forEach((reply) => {
    replyMap.set(reply.id, { ...reply, children: [] });
  });

  // Second pass: build tree structure
  replies.forEach((reply) => {
    const replyWithChildren = replyMap.get(reply.id)!;
    if (reply.parent_id && replyMap.has(reply.parent_id)) {
      replyMap.get(reply.parent_id)!.children!.push(replyWithChildren);
    } else {
      rootReplies.push(replyWithChildren);
    }
  });

  // Sort each level by created_at (oldest first for conversations)
  const sortReplies = (replies: Reply[]): Reply[] => {
    return replies
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((reply) => ({
        ...reply,
        children: reply.children ? sortReplies(reply.children) : [],
      }));
  };

  return sortReplies(rootReplies);
};

const TopicDetailPage = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const { useTopicDetail, createReply, deleteReply, toggleReplyLike } = useCommunity();
  
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const { data: topic, isLoading } = useTopicDetail(topicId || "");
  const { isOfficial, badgeLabel } = useIsOfficialAccount(topic?.profiles?.user_id);

  const getInitials = useCallback((name: string | undefined, email?: string): string => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  }, []);

  // Build threaded reply tree
  const threadedReplies = useMemo(() => {
    if (!topic?.topic_replies) return [];
    return buildReplyTree(topic.topic_replies as Reply[]);
  }, [topic?.topic_replies]);

  const handleSubmitReply = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const validated = replySchema.parse({ content: replyContent });
      setIsSubmitting(true);

      await createReply.mutateAsync({
        topicId: topicId || "",
        content: validated.content,
      });

      setReplyContent("");
      setShowReplyForm(false);
      toast.success("Reply posted successfully!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to post reply");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNestedReply = async (parentId: string, content: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const validated = replySchema.parse({ content });
      await createReply.mutateAsync({
        topicId: topicId || "",
        content: validated.content,
        parentId,
      });
      toast.success("Reply posted!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to post reply");
      }
    }
  };

  const handleLikeReply = async (replyId: string, isLiked: boolean) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      await toggleReplyLike.mutateAsync({ replyId, isLiked });
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!user) return;
    
    try {
      await deleteReply.mutateAsync(replyId);
      toast.success("Reply deleted!");
    } catch (error) {
      toast.error("Failed to delete reply");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: topic?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/community")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Topic not found</h3>
              <p className="text-muted-foreground mb-4">
                This topic may have been deleted or doesn't exist.
              </p>
              <Button onClick={() => navigate("/community")}>
                Back to Community
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalReplies = topic.topic_replies?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-3xl">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate("/community")}
          className="mb-4 -ml-2 h-9"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>

        {/* Main Topic Card */}
        <Card className="mb-4 overflow-hidden border-border/60 shadow-sm">
          <CardContent className="p-0">
            {/* Author Header */}
            <div className="flex items-start gap-3 p-4 pb-3">
              <Avatar 
                className="w-12 h-12 cursor-pointer ring-2 ring-background shadow-sm"
                onClick={() => topic.profiles?.user_id && navigate(`/profile/${topic.profiles.user_id}`)}
              >
                <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(topic.profiles?.full_name, topic.profiles?.email)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                    onClick={() => topic.profiles?.user_id && navigate(`/profile/${topic.profiles.user_id}`)}
                  >
                    {topic.profiles?.full_name || "Community Member"}
                  </span>
                  {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                </p>
              </div>

              {topic.is_pinned && (
                <Badge variant="secondary" className="shrink-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Pinned
                </Badge>
              )}
            </div>

            {/* Topic Content */}
            <div className="px-4 pb-3">
              <h1 className="text-xl sm:text-2xl font-bold mb-3 leading-tight">
                {topic.title}
              </h1>
              
              <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
                <RichTextRenderer content={topic.content} />
              </div>

              {/* Tags */}
              {topic.tags && topic.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {topic.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs font-normal bg-secondary/60 hover:bg-secondary cursor-pointer"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-4 px-4 py-2 text-sm text-muted-foreground border-t border-border/40">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span>{totalReplies} {totalReplies === 1 ? "comment" : "comments"}</span>
              </div>
              {topic.views !== undefined && topic.views > 0 && (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{topic.views} views</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-2 py-1 border-t border-border/40 bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-10 gap-2 font-medium"
                onClick={() => {
                  if (!user) {
                    navigate("/auth");
                    return;
                  }
                  setShowReplyForm(!showReplyForm);
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-10 gap-2 font-medium"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reply Form (Collapsible) */}
        {showReplyForm && user && (
          <Card className="mb-4 border-primary/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                    You
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="resize-none border-border/60 focus:border-primary"
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {replyContent.length}/2000
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyContent("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmitReply}
                        disabled={isSubmitting || !replyContent.trim()}
                        className="gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isSubmitting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments
              {totalReplies > 0 && (
                <Badge variant="secondary" className="font-normal">
                  {totalReplies}
                </Badge>
              )}
            </h2>
          </div>

          {threadedReplies.length > 0 ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {threadedReplies.map((reply) => (
                    <ThreadedReply
                      key={reply.id}
                      reply={reply}
                      topicAuthorId={topic.user_id || ""}
                      currentUserId={user?.id}
                      onReply={handleNestedReply}
                      onLike={handleLikeReply}
                      onDelete={handleDeleteReply}
                      isSubmitting={isSubmitting}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-medium mb-1">No comments yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to share your thoughts!
                </p>
                {user ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowReplyForm(true)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Add a comment
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/auth")}>
                    Sign in to comment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Reply Bar (Fixed Bottom on Mobile) */}
        {user && !showReplyForm && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/60 sm:hidden">
            <Button
              className="w-full gap-2"
              onClick={() => setShowReplyForm(true)}
            >
              <MessageCircle className="w-4 h-4" />
              Add a comment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetailPage;
