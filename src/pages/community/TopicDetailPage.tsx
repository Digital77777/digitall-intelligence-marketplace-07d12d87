import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { toast } from "sonner";

const replySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Reply cannot be empty" })
    .max(2000, { message: "Reply must be less than 2000 characters" }),
});

const TopicDetailPage = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const { useTopicDetail, createReply, deleteReply } = useCommunity();
  
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: topic, isLoading } = useTopicDetail(topicId || "");

  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

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

  const handleDeleteReply = async (replyId: string) => {
    if (!user) return;
    
    try {
      await deleteReply.mutateAsync(replyId);
      toast.success("Reply deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete reply");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 py-12">
          <div className="container mx-auto px-6">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </section>
        <div className="container mx-auto px-6 py-12">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <section className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 py-12">
          <div className="container mx-auto px-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/community")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Button>
          </div>
        </section>
        <div className="container mx-auto px-6 py-12">
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

  const isTopicOwner = user?.id === topic.user_id;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 py-12">
        <div className="container mx-auto px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/community")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Button>
          
          {/* Topic Header */}
          <div className="flex items-center gap-2 mb-3">
            {topic.is_pinned && (
              <Badge variant="secondary">Pinned</Badge>
            )}
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex gap-1">
                {topic.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{topic.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(topic.profiles?.full_name, topic.profiles?.email)}
                </AvatarFallback>
              </Avatar>
            <span className="font-medium">
              {topic.profiles?.full_name || "Community Member"}
              </span>
            </div>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{topic.replies_count} replies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        {/* Topic Content */}
        <Card className="mb-6 sm:mb-8 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">{topic.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            Replies ({topic.topic_replies?.length || 0})
          </h2>

          {topic.topic_replies && topic.topic_replies.length > 0 ? (
            <div className="space-y-4">
              {topic.topic_replies.map((reply) => (
                <Card key={reply.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={reply.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(reply.profiles?.full_name, reply.profiles?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className="cursor-pointer hover:text-primary transition-colors"
                          onClick={() => {
                            if (reply.profiles?.user_id) {
                              navigate(`/profile/${reply.profiles.user_id}`);
                            }
                          }}
                        >
                          <p className="font-medium text-sm">
                            {reply.profiles?.full_name || "Community Member"}
                            {reply.user_id === topic.user_id && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Author
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      {user?.id === reply.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReply(reply.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No replies yet</h3>
                <p className="text-muted-foreground">Be the first to reply!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reply Form */}
        {user ? (
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Add a Reply</h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {replyContent.length}/2000 characters
                  </span>
                  <Button
                    onClick={handleSubmitReply}
                    disabled={isSubmitting || !replyContent.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Posting..." : "Post Reply"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Please sign in to reply to this topic
              </p>
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TopicDetailPage;
