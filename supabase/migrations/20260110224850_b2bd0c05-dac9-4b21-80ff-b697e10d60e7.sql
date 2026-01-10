-- Create a security definer function to check if a user is a sponsored account
CREATE OR REPLACE FUNCTION public.is_sponsored_account(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sponsored_accounts
    WHERE user_id = user_id_param
    AND is_active = true
  )
$$;