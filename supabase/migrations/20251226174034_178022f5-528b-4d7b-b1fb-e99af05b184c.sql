-- Create trigger for new follower notifications
CREATE TRIGGER on_new_follower
  AFTER INSERT ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_follower();

-- Create trigger for new message notifications
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- Create trigger for topic reply notifications
CREATE TRIGGER on_topic_reply
  AFTER INSERT ON public.topic_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_topic_reply();

-- Create trigger for insight like notifications
CREATE TRIGGER on_insight_like
  AFTER INSERT ON public.insight_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_insight_like();

-- Create trigger for event registration notifications
CREATE TRIGGER on_event_registration
  AFTER INSERT ON public.event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event_registration();

-- Create function for connection request notifications
CREATE OR REPLACE FUNCTION public.notify_connection_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_requester_name TEXT;
BEGIN
  -- Get requester's name
  SELECT COALESCE(full_name, email, 'Someone') INTO v_requester_name
  FROM profiles
  WHERE user_id = NEW.requester_id;
  
  -- Create notification for connection request
  INSERT INTO public.notifications (user_id, type, message, metadata)
  VALUES (
    NEW.recipient_id,
    'connection_request',
    v_requester_name || ' sent you a connection request',
    jsonb_build_object(
      'connection_id', NEW.id,
      'requester_id', NEW.requester_id,
      'requester_name', v_requester_name
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for connection request notifications
CREATE TRIGGER on_connection_request
  AFTER INSERT ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_request();

-- Create function for connection accepted notifications
CREATE OR REPLACE FUNCTION public.notify_connection_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_accepter_name TEXT;
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Get accepter's name
    SELECT COALESCE(full_name, email, 'Someone') INTO v_accepter_name
    FROM profiles
    WHERE user_id = NEW.recipient_id;
    
    -- Notify the requester that their connection was accepted
    INSERT INTO public.notifications (user_id, type, message, metadata)
    VALUES (
      NEW.requester_id,
      'connection_accepted',
      v_accepter_name || ' accepted your connection request',
      jsonb_build_object(
        'connection_id', NEW.id,
        'accepter_id', NEW.recipient_id,
        'accepter_name', v_accepter_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for connection accepted notifications
CREATE TRIGGER on_connection_accepted
  AFTER UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_accepted();

-- Create function for insight comment notifications
CREATE OR REPLACE FUNCTION public.notify_insight_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_insight_author_id UUID;
  v_commenter_name TEXT;
  v_insight_title TEXT;
  v_parent_comment_author_id UUID;
BEGIN
  -- Get the insight author's ID and title
  SELECT user_id, title INTO v_insight_author_id, v_insight_title
  FROM community_insights
  WHERE id = NEW.insight_id;
  
  -- Get commenter's name
  SELECT COALESCE(full_name, email, 'Someone') INTO v_commenter_name
  FROM profiles
  WHERE user_id = NEW.user_id;
  
  -- If this is a reply, notify the parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_comment_author_id
    FROM insight_comments
    WHERE id = NEW.parent_id;
    
    -- Don't notify if replying to own comment
    IF v_parent_comment_author_id IS NOT NULL AND v_parent_comment_author_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, message, metadata)
      VALUES (
        v_parent_comment_author_id,
        'comment_reply',
        v_commenter_name || ' replied to your comment',
        jsonb_build_object(
          'insight_id', NEW.insight_id,
          'comment_id', NEW.id,
          'parent_comment_id', NEW.parent_id,
          'commenter_id', NEW.user_id,
          'commenter_name', v_commenter_name
        )
      );
    END IF;
  END IF;
  
  -- Notify insight author (if not commenting on own insight)
  IF v_insight_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, message, metadata)
    VALUES (
      v_insight_author_id,
      'insight_comment',
      v_commenter_name || ' commented on your insight: ' || COALESCE(v_insight_title, 'Untitled'),
      jsonb_build_object(
        'insight_id', NEW.insight_id,
        'comment_id', NEW.id,
        'commenter_id', NEW.user_id,
        'commenter_name', v_commenter_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for insight comment notifications
CREATE TRIGGER on_insight_comment
  AFTER INSERT ON public.insight_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_insight_comment();