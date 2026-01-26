-- Remove duplicate notification triggers (keep only one per event)

-- Messages: keep trigger_notify_new_message, drop on_new_message
DROP TRIGGER IF EXISTS on_new_message ON public.messages;

-- Topic replies: keep trigger_notify_topic_reply, drop on_topic_reply
DROP TRIGGER IF EXISTS on_topic_reply ON public.topic_replies;

-- Insight likes: keep trigger_notify_insight_like, drop on_insight_like
DROP TRIGGER IF EXISTS on_insight_like ON public.insight_likes;

-- Event registrations: keep trigger_notify_event_registration, drop on_event_registration
DROP TRIGGER IF EXISTS on_event_registration ON public.event_attendees;