CREATE TABLE public.creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  creator_type text,
  project_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  business_stage text,
  revenue_stage text,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  creator_category text,
  creator_score int,
  recommended_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_marketplace jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_communities jsonb NOT NULL DEFAULT '[]'::jsonb,
  growth_opportunities jsonb NOT NULL DEFAULT '[]'::jsonb,
  dashboard_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_summary text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_profiles TO authenticated;
GRANT ALL ON public.creator_profiles TO service_role;

ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own creator profile"
  ON public.creator_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own creator profile"
  ON public.creator_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own creator profile"
  ON public.creator_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_creator_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_creator_profiles_updated_at
  BEFORE UPDATE ON public.creator_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_creator_profiles_updated_at();