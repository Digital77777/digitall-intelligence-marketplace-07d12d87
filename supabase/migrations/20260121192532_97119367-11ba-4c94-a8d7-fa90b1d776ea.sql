-- Add images array column to community_insights for multiple image support
ALTER TABLE public.community_insights 
ADD COLUMN images TEXT[] DEFAULT NULL;