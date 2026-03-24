
-- Fix 1: Remove duplicate insight_likes triggers (keeping only the original pair)
-- Currently 3 INSERT triggers and 3 DELETE triggers all calling update_insight_likes_count
-- This causes likes_count to be incremented/decremented 3x per action!

DROP TRIGGER IF EXISTS update_insight_likes_count_insert ON public.insight_likes;
DROP TRIGGER IF EXISTS update_insight_likes_count_delete ON public.insight_likes;
DROP TRIGGER IF EXISTS update_insight_likes_count_trigger ON public.insight_likes;

-- Keep only insight_likes_insert_trigger and insight_likes_delete_trigger

-- Fix 2: Remove duplicate event_attendees triggers
-- Currently 2 INSERT triggers and 2 DELETE triggers
DROP TRIGGER IF EXISTS update_event_attendees_count_trigger ON public.event_attendees;

-- Keep only update_event_attendees_count_insert and update_event_attendees_count_delete

-- Fix 3: Fix incorrect likes_count values caused by duplicate triggers
UPDATE public.community_insights ci
SET likes_count = (
  SELECT COUNT(*) FROM public.insight_likes il WHERE il.insight_id = ci.id
)
WHERE likes_count != (
  SELECT COUNT(*) FROM public.insight_likes il WHERE il.insight_id = ci.id
);

-- Fix 4: Fix incorrect attendees_count values
UPDATE public.community_events ce
SET attendees_count = (
  SELECT COUNT(*) FROM public.event_attendees ea WHERE ea.event_id = ce.id
)
WHERE attendees_count != (
  SELECT COUNT(*) FROM public.event_attendees ea WHERE ea.event_id = ce.id
);
