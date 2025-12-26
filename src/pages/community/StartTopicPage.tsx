import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Tags, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";

const StartTopicPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTopic } = useCommunity();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createTopic.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        tags,
      });
      navigate("/community");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/community")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Start a Discussion Topic</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Share your thoughts, ask questions, or start a conversation with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Topic Title</Label>
                <Input
                  id="title"
                  placeholder="What would you like to discuss?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Description</Label>
                <Textarea
                  id="content"
                  placeholder="Provide more details about your topic... You can include #hashtags and links (https://example.com)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                  {content.length}/2000 characters. Links and #hashtags will be highlighted.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag (max 5)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    disabled={tags.length >= 5}
                  />
                  <Button type="button" onClick={handleAddTag} disabled={tags.length >= 5}>
                    <Tags className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button type="submit" className="w-full sm:w-auto bg-gradient-ai text-white" disabled={isSubmitting}>
                  <FileText className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Posting..." : "Post Topic"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/community")}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StartTopicPage;
