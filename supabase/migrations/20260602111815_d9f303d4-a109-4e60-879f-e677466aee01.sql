
-- ============================================================
-- 1. EXTEND QUESTS
-- ============================================================
ALTER TABLE public.quests
  ADD COLUMN IF NOT EXISTS badge_slug text,
  ADD COLUMN IF NOT EXISTS reputation_points int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS career_score_points int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS event_key text;

CREATE INDEX IF NOT EXISTS idx_quests_event_key ON public.quests(event_key) WHERE event_key IS NOT NULL;

-- ============================================================
-- 2. EXTEND PROFILES
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp_total int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_week int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level_slug text NOT NULL DEFAULT 'explorer';

-- ============================================================
-- 3. XP EVENTS LEDGER
-- ============================================================
CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount int NOT NULL,
  source text NOT NULL,
  source_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user_created ON public.xp_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_source ON public.xp_events(source);

GRANT SELECT ON public.xp_events TO authenticated;
GRANT ALL ON public.xp_events TO service_role;

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own XP events"
  ON public.xp_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. REFERRAL ENHANCEMENTS
-- ============================================================
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS click_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_clicked_at timestamptz,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS revenue_attributed numeric NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL,
  referrer_user_id uuid,
  user_agent text,
  ip_hash text,
  landing_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON public.referral_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_user ON public.referral_clicks(referrer_user_id, created_at DESC);

GRANT INSERT ON public.referral_clicks TO anon, authenticated;
GRANT SELECT ON public.referral_clicks TO authenticated;
GRANT ALL ON public.referral_clicks TO service_role;

ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a referral click"
  ON public.referral_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own referral clicks"
  ON public.referral_clicks FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_user_id);

-- ============================================================
-- 5. SUCCESS WALL
-- ============================================================
CREATE TABLE IF NOT EXISTS public.success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  amount numeric,
  currency text DEFAULT 'USD',
  media_url text,
  linked_id uuid,
  status text NOT NULL DEFAULT 'pending',
  likes_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_success_stories_status_created ON public.success_stories(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_success_stories_user ON public.success_stories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_success_stories_type ON public.success_stories(type);

GRANT SELECT ON public.success_stories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.success_stories TO authenticated;
GRANT ALL ON public.success_stories TO service_role;

ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved success stories"
  ON public.success_stories FOR SELECT
  TO anon, authenticated
  USING (status IN ('approved','featured'));

CREATE POLICY "Users can view their own success stories"
  ON public.success_stories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own success stories"
  ON public.success_stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own success stories"
  ON public.success_stories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own success stories"
  ON public.success_stories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_success_stories_updated_at
  BEFORE UPDATE ON public.success_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. AWARD FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user uuid,
  p_amount int,
  p_source text,
  p_source_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  IF p_user IS NULL OR p_amount IS NULL OR p_amount = 0 THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.xp_events (user_id, amount, source, source_id, metadata)
  VALUES (p_user, p_amount, p_source, p_source_id, COALESCE(p_metadata, '{}'::jsonb))
  RETURNING id INTO v_event_id;

  UPDATE public.profiles
  SET xp_total = xp_total + p_amount,
      xp_week  = xp_week  + p_amount,
      updated_at = now()
  WHERE user_id = p_user;

  RETURN v_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_quest_event(
  p_user uuid,
  p_event_key text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quest RECORD;
BEGIN
  IF p_user IS NULL OR p_event_key IS NULL THEN
    RETURN;
  END IF;

  FOR v_quest IN
    SELECT id, points_reward
    FROM public.quests
    WHERE event_key = p_event_key
      AND COALESCE(is_active, true) = true
  LOOP
    -- Idempotent: only complete if not already completed
    IF EXISTS (
      SELECT 1 FROM public.user_quest_progress
      WHERE user_id = p_user AND quest_id = v_quest.id AND status = 'completed'
    ) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.user_quest_progress (user_id, quest_id, status, progress_value, completed_at)
    VALUES (p_user, v_quest.id, 'completed', 100, now())
    ON CONFLICT (user_id, quest_id) DO UPDATE
      SET status = 'completed',
          progress_value = 100,
          completed_at = COALESCE(public.user_quest_progress.completed_at, now());

    PERFORM public.award_xp(
      p_user,
      COALESCE(v_quest.points_reward, 10),
      'quest',
      v_quest.id,
      COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('event_key', p_event_key)
    );
  END LOOP;
END;
$$;

-- Ensure unique constraint exists for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_quest_progress_user_id_quest_id_key'
  ) THEN
    BEGIN
      ALTER TABLE public.user_quest_progress
        ADD CONSTRAINT user_quest_progress_user_id_quest_id_key UNIQUE (user_id, quest_id);
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================
-- 7. EVENT TRIGGERS
-- ============================================================

-- Profile updates -> onboarding quests
CREATE OR REPLACE FUNCTION public.tg_profile_quest_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url <> '' AND (OLD.avatar_url IS NULL OR OLD.avatar_url = '') THEN
    PERFORM public.award_quest_event(NEW.user_id, 'upload_avatar', '{}'::jsonb);
  END IF;
  IF NEW.skills IS NOT NULL AND array_length(NEW.skills, 1) > 0
     AND (OLD.skills IS NULL OR array_length(OLD.skills, 1) IS NULL OR array_length(OLD.skills, 1) = 0) THEN
    PERFORM public.award_quest_event(NEW.user_id, 'add_skills', '{}'::jsonb);
  END IF;
  IF (NEW.full_name IS NOT NULL AND NEW.full_name <> '' AND
      NEW.headline IS NOT NULL AND NEW.headline <> '' AND
      NEW.bio IS NOT NULL AND NEW.bio <> '')
     AND NOT (
      OLD.full_name IS NOT NULL AND OLD.full_name <> '' AND
      OLD.headline IS NOT NULL AND OLD.headline <> '' AND
      OLD.bio IS NOT NULL AND OLD.bio <> ''
     ) THEN
    PERFORM public.award_quest_event(NEW.user_id, 'complete_profile', '{}'::jsonb);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_quest_events ON public.profiles;
CREATE TRIGGER trg_profile_quest_events
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_profile_quest_events();

-- Lesson completion -> learning quests + XP
CREATE OR REPLACE FUNCTION public.tg_lesson_progress_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS DISTINCT FROM true) THEN
    PERFORM public.award_xp(NEW.user_id, 20, 'lesson', NEW.lesson_id, jsonb_build_object('lesson_id', NEW.lesson_id));
    PERFORM public.award_quest_event(NEW.user_id, 'complete_lesson', jsonb_build_object('lesson_id', NEW.lesson_id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lesson_progress_events ON public.lesson_progress;
CREATE TRIGGER trg_lesson_progress_events
  AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.tg_lesson_progress_events();

-- Community insights -> community + share quests + XP
CREATE OR REPLACE FUNCTION public.tg_insight_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_xp(NEW.user_id, 15, 'community', NEW.id, jsonb_build_object('insight_id', NEW.id));
  PERFORM public.award_quest_event(NEW.user_id, 'post_discussion', jsonb_build_object('insight_id', NEW.id));
  IF NEW.videos IS NOT NULL AND array_length(NEW.videos, 1) > 0 THEN
    PERFORM public.award_quest_event(NEW.user_id, 'upload_project', jsonb_build_object('insight_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_insight_events ON public.community_insights;
CREATE TRIGGER trg_insight_events
  AFTER INSERT ON public.community_insights
  FOR EACH ROW EXECUTE FUNCTION public.tg_insight_events();

-- Topic replies -> community quest + XP
CREATE OR REPLACE FUNCTION public.tg_topic_reply_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_xp(NEW.user_id, 10, 'community', NEW.id, jsonb_build_object('reply_id', NEW.id));
  PERFORM public.award_quest_event(NEW.user_id, 'answer_question', jsonb_build_object('reply_id', NEW.id));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_topic_reply_events ON public.topic_replies;
CREATE TRIGGER trg_topic_reply_events
  AFTER INSERT ON public.topic_replies
  FOR EACH ROW EXECUTE FUNCTION public.tg_topic_reply_events();

-- Event attendance -> community quest + XP
CREATE OR REPLACE FUNCTION public.tg_event_attend_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_xp(NEW.user_id, 15, 'community', NEW.event_id, jsonb_build_object('event_id', NEW.event_id));
  PERFORM public.award_quest_event(NEW.user_id, 'attend_event', jsonb_build_object('event_id', NEW.event_id));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_attend_events ON public.event_attendees;
CREATE TRIGGER trg_event_attend_events
  AFTER INSERT ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_attend_events();

-- Marketplace project listing -> upload_project quest + XP
CREATE OR REPLACE FUNCTION public.tg_listing_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_xp(NEW.user_id, 25, 'project', NEW.id, jsonb_build_object('listing_id', NEW.id, 'listing_type', NEW.listing_type));
  PERFORM public.award_quest_event(NEW.user_id, 'upload_project', jsonb_build_object('listing_id', NEW.id));
  IF NEW.listing_type = 'service' OR NEW.listing_type = 'product' THEN
    PERFORM public.award_quest_event(NEW.user_id, 'publish_portfolio', jsonb_build_object('listing_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listing_events ON public.marketplace_listings;
CREATE TRIGGER trg_listing_events
  AFTER INSERT ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.tg_listing_events();

-- Referral completion -> growth quest + XP (extends existing handle_referral_signup chain)
CREATE OR REPLACE FUNCTION public.tg_referral_growth_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.referrals SET activated_at = COALESCE(activated_at, now()) WHERE id = NEW.id;
    PERFORM public.award_xp(NEW.referrer_id, 100, 'referral', NEW.id, jsonb_build_object('referral_id', NEW.id));
    PERFORM public.award_quest_event(NEW.referrer_id, 'invite_friend', jsonb_build_object('referral_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_growth_events ON public.referrals;
CREATE TRIGGER trg_referral_growth_events
  AFTER UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.tg_referral_growth_events();

-- Challenge submission -> building quest + XP
CREATE OR REPLACE FUNCTION public.tg_challenge_submission_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_xp(NEW.user_id, 30, 'project', NEW.id, jsonb_build_object('challenge_id', NEW.challenge_id));
  PERFORM public.award_quest_event(NEW.user_id, 'complete_challenge', jsonb_build_object('challenge_id', NEW.challenge_id));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_challenge_submission_events ON public.challenge_submissions;
CREATE TRIGGER trg_challenge_submission_events
  AFTER INSERT ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION public.tg_challenge_submission_events();

-- ============================================================
-- 8. SEED QUEST CATALOG
-- ============================================================
INSERT INTO public.quests (title, description, category, points_reward, icon, difficulty, badge_slug, event_key, reputation_points, career_score_points, is_active)
VALUES
  -- Onboarding
  ('Complete your profile', 'Add a full name, headline, and bio.', 'onboarding', 50, 'User', 'easy', 'onboarding-complete', 'complete_profile', 5, 10, true),
  ('Upload a profile photo', 'Show the community who you are.', 'onboarding', 25, 'User', 'easy', 'onboarding-complete', 'upload_avatar', 3, 5, true),
  ('Add your skills', 'List at least one skill so we can match you.', 'onboarding', 25, 'Lightbulb', 'easy', 'onboarding-complete', 'add_skills', 3, 5, true),
  ('Join the community', 'Post your first insight, reply, or join an event.', 'onboarding', 30, 'Users', 'easy', 'onboarding-complete', 'join_community', 5, 5, true),

  -- Learning
  ('Complete a lesson', 'Finish your first lesson on DIM.', 'learning', 20, 'BookOpen', 'easy', 'learner', 'complete_lesson', 5, 10, true),
  ('Finish a module', 'Complete every lesson in one module.', 'learning', 100, 'BookOpen', 'medium', 'learner', 'finish_module', 15, 25, true),
  ('Earn a certificate', 'Finish a full learning path and earn your certificate.', 'learning', 250, 'Award', 'hard', 'certified', 'earn_certificate', 40, 75, true),

  -- Building
  ('Upload your first project', 'Share a project, listing, or reel with the community.', 'creator', 75, 'Upload', 'medium', 'builder', 'upload_project', 10, 25, true),
  ('Publish your portfolio', 'List a product or service in the marketplace.', 'creator', 100, 'Upload', 'medium', 'builder', 'publish_portfolio', 15, 30, true),
  ('Complete a challenge', 'Submit an entry to a DIM challenge.', 'creator', 150, 'Star', 'hard', 'builder', 'complete_challenge', 20, 40, true),

  -- Community
  ('Post a discussion', 'Share an insight with the community.', 'community', 25, 'MessageSquare', 'easy', 'connector', 'post_discussion', 5, 5, true),
  ('Answer a question', 'Reply to a community topic.', 'community', 20, 'MessageSquare', 'easy', 'connector', 'answer_question', 5, 5, true),
  ('Attend an event', 'Register for any community event.', 'community', 30, 'Calendar', 'easy', 'connector', 'attend_event', 5, 10, true),

  -- Growth
  ('Invite a friend', 'Refer someone who activates their account.', 'engagement', 100, 'Users', 'medium', 'partner', 'invite_friend', 15, 20, true),
  ('Share your profile', 'Share your public profile link.', 'engagement', 25, 'Heart', 'easy', 'partner', 'share_profile', 5, 5, true),
  ('Share a project', 'Share one of your published projects.', 'engagement', 25, 'Heart', 'easy', 'partner', 'share_project', 5, 5, true)
ON CONFLICT DO NOTHING;
