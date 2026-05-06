
-- Mission progress for Learning Paths (Starter Tier mission system)
CREATE TABLE public.mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  path_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress','completed')),
  output TEXT,
  xp_awarded INTEGER NOT NULL DEFAULT 10,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);

CREATE INDEX idx_mission_progress_user ON public.mission_progress(user_id);
CREATE INDEX idx_mission_progress_path ON public.mission_progress(user_id, path_id);

ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mission progress"
  ON public.mission_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own mission progress"
  ON public.mission_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own mission progress"
  ON public.mission_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own mission progress"
  ON public.mission_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER mission_progress_updated_at
  BEFORE UPDATE ON public.mission_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
