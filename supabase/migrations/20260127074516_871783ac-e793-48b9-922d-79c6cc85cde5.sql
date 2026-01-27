-- Fix remaining function search paths (non-SECURITY DEFINER functions need search_path too for safety)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_topic_replies()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_topics
  SET replies_count = replies_count + 1,
      last_activity_at = now()
  WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_event_attendees_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_events
    SET attendees_count = attendees_count + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_events
    SET attendees_count = attendees_count - 1
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix overly permissive RLS policy on quote_requests
-- Quote requests should still be public but we'll add basic validation
DROP POLICY IF EXISTS "Anyone can submit quote requests" ON public.quote_requests;

CREATE POLICY "Anyone can submit quote requests"
ON public.quote_requests
FOR INSERT
WITH CHECK (
  -- Allow insert but require email to be non-empty
  email IS NOT NULL AND email != ''
);