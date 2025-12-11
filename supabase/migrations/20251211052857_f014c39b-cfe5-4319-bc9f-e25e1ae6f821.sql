-- Create storage bucket for marketplace listings
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-listings', 'marketplace-listings', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for marketplace listings storage
CREATE POLICY "Anyone can view marketplace listing files"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-listings');

CREATE POLICY "Authenticated users can upload marketplace listing files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'marketplace-listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own marketplace listing files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'marketplace-listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own marketplace listing files"
ON storage.objects FOR DELETE
USING (bucket_id = 'marketplace-listings' AND auth.uid()::text = (storage.foldername(name))[1]);