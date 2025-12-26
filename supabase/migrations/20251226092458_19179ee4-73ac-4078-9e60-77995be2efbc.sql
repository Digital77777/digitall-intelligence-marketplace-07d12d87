-- Create storage bucket for voice notes
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-notes', 'voice-notes', true);

-- Create policies for voice notes bucket
CREATE POLICY "Authenticated users can upload voice notes"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'voice-notes' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view voice notes"
ON storage.objects
FOR SELECT
USING (bucket_id = 'voice-notes');

CREATE POLICY "Users can delete their own voice notes"
ON storage.objects
FOR DELETE
USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);