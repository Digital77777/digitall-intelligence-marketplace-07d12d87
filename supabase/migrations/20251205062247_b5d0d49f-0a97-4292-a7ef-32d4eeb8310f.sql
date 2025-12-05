-- Create storage bucket for community insights media
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-insights', 'community-insights', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload media
CREATE POLICY "Authenticated users can upload community insight media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-insights');

-- Allow public read access
CREATE POLICY "Public can view community insight media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-insights');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own community insight media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community-insights' AND auth.uid()::text = (storage.foldername(name))[1]);