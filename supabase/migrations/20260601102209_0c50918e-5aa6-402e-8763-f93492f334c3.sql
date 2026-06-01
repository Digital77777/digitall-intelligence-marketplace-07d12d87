
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  title TEXT,
  author TEXT,
  thumbnail TEXT,
  is_short BOOLEAN NOT NULL DEFAULT false,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view videos"
ON public.videos FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert videos"
ON public.videos FOR INSERT
WITH CHECK (true);

CREATE INDEX idx_videos_created_at ON public.videos (created_at DESC);
