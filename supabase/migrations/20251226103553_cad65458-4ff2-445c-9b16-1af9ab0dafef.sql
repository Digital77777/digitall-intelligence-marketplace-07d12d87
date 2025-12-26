-- Add new columns to community_events for enhanced event form
ALTER TABLE public.community_events 
ADD COLUMN IF NOT EXISTS venue_name text,
ADD COLUMN IF NOT EXISTS full_address text,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS requirements text,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'English',
ADD COLUMN IF NOT EXISTS contact_email text;