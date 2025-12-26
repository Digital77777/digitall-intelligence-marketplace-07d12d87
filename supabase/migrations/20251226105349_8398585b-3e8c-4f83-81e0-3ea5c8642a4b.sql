-- Create function to notify user when someone follows them
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_follower_name TEXT;
BEGIN
  -- Get follower's name
  SELECT COALESCE(full_name, email, 'Someone') INTO v_follower_name
  FROM profiles
  WHERE user_id = NEW.follower_id;
  
  -- Create notification for the user being followed
  INSERT INTO public.notifications (user_id, type, message, metadata)
  VALUES (
    NEW.following_id,
    'new_follower',
    v_follower_name || ' started following you',
    jsonb_build_object(
      'follower_id', NEW.follower_id,
      'follower_name', v_follower_name
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new follows
CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_follower();