-- Fix: Recreate public_profiles view with explicit SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user, not the view creator
-- which properly enforces RLS policies on the underlying profiles table

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
    user_id,
    id,
    full_name,
    avatar_url,
    headline,
    bio,
    location,
    skills,
    website,
    linkedin_url,
    github_url,
    twitter_url,
    created_at,
    updated_at
FROM profiles;

-- Grant SELECT permissions to authenticated and anon roles for public profile viewing
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;