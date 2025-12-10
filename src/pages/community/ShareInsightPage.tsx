import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { MediaUploader } from "@/components/media/MediaUploader";
import { generateVideoThumbnail } from "@/lib/videoThumbnail";
import { useToast } from "@/hooks/use-toast";
import { InsightPreview } from "@/components/community/InsightPreview";

const ShareInsightPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createInsight } = useCommunity();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    readTime: ""
  });
  const [coverImages, setCoverImages] = useState<string[]>([]);
  const [coverVideos, setCoverVideos] = useState<string[]>([]);
  const [videoThumbnails, setVideoThumbnails] = useState<string[]>([]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVideosChange = async (videos: string[]) => {
    setCoverVideos(videos);
    
    // Generate thumbnails for new videos
    if (videos.length > 0) {
      try {
        const thumbnails: string[] = [];
        for (const videoUrl of videos) {
          const thumbnail = await generateVideoThumbnail(videoUrl, 1);
          thumbnails.push(thumbnail);
        }
        setVideoThumbnails(thumbnails);
      } catch (error) {
        console.error('Error generating video thumbnails:', error);
        toast({
          title: "Thumbnail Generation Failed",
          description: "Could not generate video preview, but video will still be uploaded.",
          variant: "destructive",
        });
      }
    } else {
      setVideoThumbnails([]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to publish your insight.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your insight.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Content Required", 
        description: "Please add some content to your insight.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a category for your insight.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createInsight.mutateAsync({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        read_time: formData.readTime || undefined,
        cover_image: coverImages[0] || undefined,
        videos: coverVideos.length > 0 ? coverVideos : undefined,
        video_thumbnails: videoThumbnails.length > 0 ? videoThumbnails : undefined,
      });
      toast({
        title: "Success!",
        description: "Your insight has been published.",
      });
      navigate("/community");
    } catch (error: any) {
      console.error('Error creating insight:', error);
      toast({
        title: "Failed to Publish",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/community")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>

        {isPreviewMode ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Preview Mode</h2>
              <p className="text-sm text-muted-foreground">This is how your insight will appear to others</p>
            </div>
            <InsightPreview
              title={formData.title}
              content={formData.content}
              category={formData.category}
              readTime={formData.readTime}
              coverImage={coverImages[0]}
              coverVideo={coverVideos[0]}
              videoThumbnail={videoThumbnails[0]}
            />
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(false)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <Button
                className="bg-gradient-ai text-white"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title || !formData.content || !formData.category}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {isSubmitting ? "Publishing..." : "Publish Insight"}
              </Button>
            </div>
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Share Your Insight</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Share your knowledge, experiences, and learnings with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Insight Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., The Future of AI in Education"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">
                    Make it compelling and descriptive
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai-tools">AI Tools</SelectItem>
                        <SelectItem value="machine-learning">Machine Learning</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readTime">Estimated Read Time</Label>
                    <Input
                      id="readTime"
                      placeholder="e.g., 5 min"
                      value={formData.readTime}
                      onChange={(e) => handleChange("readTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your insights, experiences, and knowledge with the community..."
                    value={formData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    rows={15}
                    maxLength={5000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.content.length}/5000 characters. Use markdown for formatting.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cover Media (Optional)</Label>
                  <p className="text-xs text-muted-foreground">
                    Upload one image or video to showcase your insight
                  </p>
                  <MediaUploader
                    images={coverImages}
                    videos={coverVideos}
                    onImagesChange={setCoverImages}
                    onVideosChange={handleVideosChange}
                    maxImages={1}
                    maxVideos={1}
                    maxFileSize={20}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button type="submit" className="w-full sm:w-auto bg-gradient-ai text-white" disabled={isSubmitting}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Publishing..." : "Publish Insight"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsPreviewMode(true)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
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
        )}
      </div>
    </div>
  );
};

export default ShareInsightPage;
