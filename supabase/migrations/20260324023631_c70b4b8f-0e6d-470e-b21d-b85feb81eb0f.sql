
-- Fix overly permissive policy on tools table - restrict to authenticated users
DROP POLICY IF EXISTS "Allow authenticated access" ON public.tools;
CREATE POLICY "Authenticated users can access tools" ON public.tools
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow public read access for unauthenticated landing page
CREATE POLICY "Public can view tools" ON public.tools
  FOR SELECT
  TO anon
  USING (true);
