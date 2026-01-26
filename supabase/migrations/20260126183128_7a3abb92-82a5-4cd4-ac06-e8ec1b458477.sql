-- Drop the existing restrictive policy and create a permissive one for public access
DROP POLICY IF EXISTS "Users can view active listings" ON public.marketplace_listings;

-- Create a PERMISSIVE policy so anyone can view active listings (authenticated or not)
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active'::text);