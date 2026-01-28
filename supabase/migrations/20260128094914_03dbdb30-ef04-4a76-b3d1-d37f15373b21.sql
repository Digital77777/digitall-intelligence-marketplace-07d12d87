-- Phase 1: Critical Database Fixes for Starter Tier Freemium Workflow

-- 1. Create function to auto-assign starter tier on user signup
CREATE OR REPLACE FUNCTION public.auto_assign_starter_tier()
RETURNS TRIGGER AS $$
DECLARE
  starter_tier_id UUID;
BEGIN
  -- Get the starter tier ID
  SELECT id INTO starter_tier_id 
  FROM public.subscription_tiers 
  WHERE name = 'starter' 
  LIMIT 1;
  
  -- Only proceed if starter tier exists
  IF starter_tier_id IS NOT NULL THEN
    -- Insert subscription with ON CONFLICT to handle race conditions
    INSERT INTO public.user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (NEW.id, starter_tier_id, 'active', now())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create trigger that fires after a new user is created in profiles table
-- (profiles are created when users sign up, this is more reliable than auth.users)
DROP TRIGGER IF EXISTS assign_starter_on_profile_creation ON public.profiles;
CREATE TRIGGER assign_starter_on_profile_creation
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_starter_tier();

-- 3. Fix orphaned users - assign starter tier to users without active subscriptions
INSERT INTO public.user_subscriptions (user_id, tier_id, status, started_at)
SELECT 
  p.user_id,
  (SELECT id FROM public.subscription_tiers WHERE name = 'starter' LIMIT 1),
  'active',
  now()
FROM public.profiles p
LEFT JOIN public.user_subscriptions us ON p.user_id = us.user_id AND us.status = 'active'
WHERE us.id IS NULL
  AND (SELECT id FROM public.subscription_tiers WHERE name = 'starter' LIMIT 1) IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 4. Synchronize Starter tier tool limits (DB says 2, UI shows 3 - updating to 3)
UPDATE public.subscription_tiers 
SET 
  max_tools_access = 3,
  features = '["Access to 3 basic AI tools", "1 marketplace listing", "Community access", "Foundation learning paths", "Email support within 48 hours"]'::jsonb,
  updated_at = now()
WHERE name = 'starter';

-- 5. Create function to check and handle expired subscriptions (for future use)
CREATE OR REPLACE FUNCTION public.downgrade_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  starter_tier_id UUID;
BEGIN
  -- Get the starter tier ID
  SELECT id INTO starter_tier_id FROM subscription_tiers WHERE name = 'starter';
  
  IF starter_tier_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Downgrade expired paid subscriptions to starter
  UPDATE user_subscriptions
  SET 
    tier_id = starter_tier_id,
    status = 'active',
    updated_at = now()
  WHERE expires_at < now() 
    AND status = 'active'
    AND tier_id != starter_tier_id;
END;
$$;