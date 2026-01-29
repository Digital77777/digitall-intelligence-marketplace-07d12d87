-- Community Hero Scores table
CREATE TABLE public.community_hero_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  helpful_replies INTEGER NOT NULL DEFAULT 0,
  topics_created INTEGER NOT NULL DEFAULT 0,
  insights_shared INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  current_tier TEXT NOT NULL DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_hero_user UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.community_hero_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_hero_scores
CREATE POLICY "Users can view their own hero scores"
ON public.community_hero_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all hero scores for leaderboard"
ON public.community_hero_scores FOR SELECT
USING (true);

CREATE POLICY "System can insert hero scores"
ON public.community_hero_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update hero scores"
ON public.community_hero_scores FOR UPDATE
USING (auth.uid() = user_id);

-- Quests table
CREATE TABLE public.quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 10,
  icon TEXT,
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  difficulty TEXT DEFAULT 'easy',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quests
CREATE POLICY "Anyone can view active quests"
ON public.quests FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage quests"
ON public.quests FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- User Quest Progress table
CREATE TABLE public.user_quest_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',
  progress_value INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_quest UNIQUE (user_id, quest_id)
);

-- Enable RLS
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_quest_progress
CREATE POLICY "Users can view their own quest progress"
ON public.user_quest_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quest progress"
ON public.user_quest_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest progress"
ON public.user_quest_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Ambassador Applications table
CREATE TABLE public.ambassador_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  application_text TEXT NOT NULL,
  social_links JSONB DEFAULT '{}',
  motivation TEXT,
  experience TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_ambassador_user UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ambassador_applications
CREATE POLICY "Users can view their own application"
ON public.ambassador_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own application"
ON public.ambassador_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending application"
ON public.ambassador_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all applications"
ON public.ambassador_applications FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
ON public.ambassador_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Ambassador Stats table
CREATE TABLE public.ambassador_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL,
  referrals_count INTEGER DEFAULT 0,
  content_created INTEGER DEFAULT 0,
  events_hosted INTEGER DEFAULT 0,
  community_engagement INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_ambassador_month UNIQUE (user_id, month)
);

-- Enable RLS
ALTER TABLE public.ambassador_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ambassador_stats
CREATE POLICY "Users can view their own stats"
ON public.ambassador_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all stats"
ON public.ambassador_stats FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert sample quests
INSERT INTO public.quests (title, description, category, points_reward, icon, difficulty, requirements) VALUES
('Complete Your Profile', 'Add a profile picture, bio, and skills to your profile', 'onboarding', 50, 'User', 'easy', '{"type": "profile_completion", "target": 100}'),
('Share Your First Insight', 'Post your first insight to the community', 'community', 30, 'Lightbulb', 'easy', '{"type": "insights_count", "target": 1}'),
('Invite 3 Friends', 'Invite 3 friends to join DIM using your referral link', 'community', 100, 'Users', 'medium', '{"type": "referrals_count", "target": 3}'),
('Start a Discussion', 'Create your first topic in the community forums', 'community', 25, 'MessageSquare', 'easy', '{"type": "topics_count", "target": 1}'),
('Complete 3 Lessons', 'Finish 3 lessons from any learning path', 'learning', 75, 'BookOpen', 'medium', '{"type": "lessons_completed", "target": 3}'),
('Upload First Project', 'Share your first project on the marketplace', 'creator', 100, 'Upload', 'medium', '{"type": "listings_count", "target": 1}'),
('Attend a Community Event', 'Register and attend any community event', 'community', 40, 'Calendar', 'easy', '{"type": "events_attended", "target": 1}'),
('Help 5 Members', 'Reply to 5 different community topics', 'community', 60, 'Heart', 'medium', '{"type": "replies_count", "target": 5}'),
('Weekly Streak', 'Log in 7 days in a row', 'engagement', 50, 'Flame', 'medium', '{"type": "login_streak", "target": 7}'),
('First Sale', 'Make your first sale on the marketplace', 'creator', 150, 'DollarSign', 'hard', '{"type": "sales_count", "target": 1}');

-- Trigger for updating hero scores updated_at
CREATE TRIGGER update_hero_scores_updated_at
BEFORE UPDATE ON public.community_hero_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updating ambassador applications updated_at
CREATE TRIGGER update_ambassador_applications_updated_at
BEFORE UPDATE ON public.ambassador_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();