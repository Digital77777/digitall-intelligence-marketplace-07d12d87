CREATE TABLE public.certification_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cert_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started','in_progress','completed')),
  progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  prep_notes TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cert_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.certification_progress TO authenticated;
GRANT ALL ON public.certification_progress TO service_role;

ALTER TABLE public.certification_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own certification progress"
  ON public.certification_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_certification_progress_updated_at
  BEFORE UPDATE ON public.certification_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_certification_progress_user ON public.certification_progress(user_id);
CREATE INDEX idx_certification_progress_slug ON public.certification_progress(cert_slug);