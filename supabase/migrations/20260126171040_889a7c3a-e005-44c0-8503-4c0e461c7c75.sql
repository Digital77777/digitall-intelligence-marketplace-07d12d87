-- Fix the notify_new_message function to handle cases where sender profile might not exist
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  -- Get sender's name (use 'DIM Community' as fallback for official accounts)
  SELECT COALESCE(full_name, email, 'Someone') INTO v_sender_name
  FROM profiles
  WHERE user_id = NEW.sender_id;
  
  -- Ensure we have a valid sender name even if profile doesn't exist
  IF v_sender_name IS NULL THEN
    v_sender_name := 'DIM Community';
  END IF;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, message, metadata)
  VALUES (
    NEW.receiver_id,
    'new_message',
    v_sender_name || ' sent you a message',
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'sender_name', v_sender_name
    )
  );
  
  RETURN NEW;
END;
$$;