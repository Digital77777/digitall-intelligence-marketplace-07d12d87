-- Create community_reels table to store individual videos for reel navigation
CREATE TABLE public.community_reels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_id UUID NOT NULL REFERENCES public.community_insights(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0
);

-- Create index for faster queries
CREATE INDEX idx_community_reels_created_at ON public.community_reels(created_at DESC);
CREATE INDEX idx_community_reels_user_id ON public.community_reels(user_id);

-- Enable RLS
ALTER TABLE public.community_reels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view reels"
ON public.community_reels
FOR SELECT
USING (true);

CREATE POLICY "Users can delete their own reels"
ON public.community_reels
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger function to sync videos from insights to reels
CREATE OR REPLACE FUNCTION public.sync_insight_videos_to_reels()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  video_url TEXT;
  thumbnail_url TEXT;
  i INTEGER;
BEGIN
  -- Delete existing reels for this insight
  DELETE FROM public.community_reels WHERE insight_id = NEW.id;
  
  -- Insert new reels from videos array if videos exist
  IF NEW.videos IS NOT NULL AND array_length(NEW.videos, 1) > 0 THEN
    FOR i IN 1..array_length(NEW.videos, 1) LOOP
      video_url := NEW.videos[i];
      thumbnail_url := NULL;
      
      -- Get corresponding thumbnail if exists
      IF NEW.video_thumbnails IS NOT NULL AND array_length(NEW.video_thumbnails, 1) >= i THEN
        thumbnail_url := NEW.video_thumbnails[i];
      END IF;
      
      INSERT INTO public.community_reels (insight_id, user_id, video_url, thumbnail_url, title)
      VALUES (NEW.id, NEW.user_id, video_url, thumbnail_url, NEW.title);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on community_insights
CREATE TRIGGER on_insight_video_change
AFTER INSERT OR UPDATE ON public.community_insights
FOR EACH ROW
EXECUTE FUNCTION public.sync_insight_videos_to_reels();

-- Populate existing videos into reels table using LATERAL for set-returning functions
INSERT INTO public.community_reels (insight_id, user_id, video_url, thumbnail_url, title, created_at)
SELECT 
  ci.id,
  ci.user_id,
  v.video_url,
  t.thumbnail_url,
  ci.title,
  ci.created_at
FROM public.community_insights ci
CROSS JOIN LATERAL unnest(ci.videos) WITH ORDINALITY AS v(video_url, ord)
LEFT JOIN LATERAL (
  SELECT unnest(ci.video_thumbnails) AS thumbnail_url, generate_series(1, array_length(ci.video_thumbnails, 1)) AS ord
) t ON v.ord = t.ord
WHERE ci.videos IS NOT NULL AND array_length(ci.videos, 1) > 0;