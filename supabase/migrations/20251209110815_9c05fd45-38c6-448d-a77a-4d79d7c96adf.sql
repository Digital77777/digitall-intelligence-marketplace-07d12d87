-- Drop the existing notification type check constraint if it exists
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated constraint with subscription_upgrade type
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('insight_like', 'topic_reply', 'new_message', 'event_registration', 'subscription_upgrade', 'general'));