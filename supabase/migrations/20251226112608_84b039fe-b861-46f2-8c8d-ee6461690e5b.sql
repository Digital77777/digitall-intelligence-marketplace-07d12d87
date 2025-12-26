-- Add RLS policy to allow authenticated users to view all public profiles for discovery
-- This enables the community find members feature to work properly

CREATE POLICY "Authenticated users can view all profiles for discovery"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Also allow anon users to view profiles (for public profile pages)
CREATE POLICY "Anyone can view public profile information"
ON public.profiles
FOR SELECT
TO anon
USING (true);