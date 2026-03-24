CREATE OR REPLACE FUNCTION public.auto_assign_starter_tier()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  starter_tier_id UUID;
BEGIN
  SELECT id INTO starter_tier_id 
  FROM public.subscription_tiers 
  WHERE name = 'starter' 
  LIMIT 1;
  
  IF starter_tier_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (NEW.user_id, starter_tier_id, 'active', now())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;