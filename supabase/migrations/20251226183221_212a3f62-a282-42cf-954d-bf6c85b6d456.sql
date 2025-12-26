-- Add organization/host field to community_events
ALTER TABLE public.community_events 
ADD COLUMN IF NOT EXISTS hosted_by TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_personal_host BOOLEAN DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN public.community_events.hosted_by IS 'Organization name if hosted by organization, null if personal';
COMMENT ON COLUMN public.community_events.is_personal_host IS 'True if user is hosting personally, false if organization';