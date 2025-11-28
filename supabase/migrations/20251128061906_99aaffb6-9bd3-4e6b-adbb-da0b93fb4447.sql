-- Fix profiles table public data exposure
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Add policy for users to view their own complete profile including email
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create a public view that excludes sensitive data like email
CREATE OR REPLACE VIEW public.public_profiles AS
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
FROM public.profiles;

-- Grant SELECT on the view to everyone (including anonymous users)
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Note: Applications should use public_profiles view for public profile displays
-- and profiles table only when user is authenticated and viewing their own profile