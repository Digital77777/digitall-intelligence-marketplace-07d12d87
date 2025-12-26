-- Create storage bucket for reel videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reels',
  'reels',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
);

-- Allow authenticated users to upload to reels bucket
CREATE POLICY "Authenticated users can upload reels"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to reels
CREATE POLICY "Public can view reels"
ON storage.objects
FOR SELECT
USING (bucket_id = 'reels');

-- Allow users to delete their own reels
CREATE POLICY "Users can delete own reels"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update community_reels RLS to allow direct inserts
CREATE POLICY "Users can create their own reels"
ON public.community_reels
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reels
CREATE POLICY "Users can update their own reels"
ON public.community_reels
FOR UPDATE
USING (auth.uid() = user_id);