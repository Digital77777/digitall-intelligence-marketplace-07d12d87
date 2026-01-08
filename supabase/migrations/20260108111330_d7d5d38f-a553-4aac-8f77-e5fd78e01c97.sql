-- Create sponsored_accounts table for Official DIM accounts
CREATE TABLE public.sponsored_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  account_type text NOT NULL DEFAULT 'official',
  badge_label text NOT NULL DEFAULT 'Official DIM',
  is_active boolean NOT NULL DEFAULT true,
  priority_in_search integer DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.sponsored_accounts IS 'Stores official DIM platform accounts that display verified badges';

-- Enable RLS
ALTER TABLE public.sponsored_accounts ENABLE ROW LEVEL SECURITY;

-- Public read access - anyone can see who is official
CREATE POLICY "Anyone can view sponsored accounts"
ON public.sponsored_accounts
FOR SELECT
USING (is_active = true);

-- Only admins can manage sponsored accounts
CREATE POLICY "Admins can manage sponsored accounts"
ON public.sponsored_accounts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create helper function to check if a user is an official account
CREATE OR REPLACE FUNCTION public.is_official_account(p_user_id uuid)
RETURNS TABLE (
  is_official boolean,
  badge_label text,
  account_type text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    true as is_official,
    sa.badge_label,
    sa.account_type
  FROM sponsored_accounts sa
  WHERE sa.user_id = p_user_id
    AND sa.is_active = true
  LIMIT 1;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_sponsored_accounts_updated_at
BEFORE UPDATE ON public.sponsored_accounts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_sponsored_accounts_user_id ON public.sponsored_accounts(user_id) WHERE is_active = true;