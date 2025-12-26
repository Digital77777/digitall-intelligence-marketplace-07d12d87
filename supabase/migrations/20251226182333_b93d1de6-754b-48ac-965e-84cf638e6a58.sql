-- Add city and country columns to community_events for location-based filtering
ALTER TABLE public.community_events 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS country text;

-- Create index for faster location searches
CREATE INDEX IF NOT EXISTS idx_community_events_city ON public.community_events(city);
CREATE INDEX IF NOT EXISTS idx_community_events_country ON public.community_events(country);