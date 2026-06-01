ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos (user_id);

DROP POLICY IF EXISTS "Anyone can insert videos" ON public.videos;

CREATE POLICY "Authenticated users can insert their own videos"
ON public.videos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
ON public.videos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
