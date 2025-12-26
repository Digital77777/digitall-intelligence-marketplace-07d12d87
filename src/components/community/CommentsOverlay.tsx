import React, { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, Heart, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentsOverlayProps {
  insightId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentsOverlay = ({ insightId, isOpen, onClose }: CommentsOverlayProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch comments
  useEffect(() => {
    if (!isOpen || !insightId) return;

    const fetchComments = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("insight_comments")
        .select("*")
        .eq("insight_id", insightId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        setIsLoading(false);
        return;
      }

      // Fetch profiles for all comments
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from("public_profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
        const commentsWithProfiles = data.map((comment) => ({
          ...comment,
          profile: profileMap.get(comment.user_id) || null,
        }));
        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
      setIsLoading(false);
    };

    fetchComments();
  }, [isOpen, insightId]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("insight_comments")
        .insert({
          insight_id: insightId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch the user's profile
      const { data: profile } = await supabase
        .from("public_profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      setComments((prev) => [...prev, { ...data, profile }]);
      setNewComment("");
      toast({ title: "Comment posted!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("insight_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast({ title: "Comment deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent swipe gestures from propagating when overlay is open
  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={handleBackdropClick}
      />
      
      {/* Comments panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ 
          maxHeight: "70vh",
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
        onTouchMove={handleTouchMove}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-lg font-semibold">Comments</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Comments list */}
        <ScrollArea className="h-[45vh]">
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No comments yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={comment.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(comment.profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <span className="font-semibold text-sm">
                          {comment.profile?.full_name || "Anonymous"}
                        </span>
                        <span className="text-sm ml-2">{comment.content}</span>
                      </div>
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(comment.created_at)}
                      </span>
                      <button className="text-xs text-muted-foreground hover:text-foreground">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t border-border p-4">
          {user ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              <Input
                ref={inputRef}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-muted/50 border-0 focus-visible:ring-1"
              />
              <Button 
                type="submit" 
                size="icon"
                variant="ghost"
                disabled={!newComment.trim() || isSubmitting}
                className="text-primary"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Sign in to comment
            </p>
          )}
        </div>
      </div>
    </>
  );
};
