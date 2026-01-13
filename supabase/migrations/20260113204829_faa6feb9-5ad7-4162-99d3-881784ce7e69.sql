-- Create message-media bucket for sponsored account uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-media',
  'message-media',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- RLS policy: Only sponsored accounts can upload message media
CREATE POLICY "Sponsored accounts can upload message media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-media' 
  AND public.is_sponsored_account(auth.uid())
);

-- Anyone authenticated can view message media
CREATE POLICY "Anyone can view message media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'message-media');

-- Add media columns to messages table
ALTER TABLE public.messages
ADD COLUMN media_url TEXT,
ADD COLUMN media_type TEXT CHECK (media_type IN ('image', 'video'));