-- Create the welcome message trigger function
CREATE OR REPLACE FUNCTION public.send_welcome_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dim_community_id UUID := '98e28367-b03f-4af1-a8d7-e2fcf1ec73b6';
  user_name TEXT;
BEGIN
  -- Get the user's display name
  user_name := COALESCE(NEW.full_name, 'there');
  
  -- Don't send welcome message to official DIM accounts
  IF NEW.user_id = dim_community_id THEN
    RETURN NEW;
  END IF;
  
  -- Check if this is a sponsored/official account (skip welcome for them)
  IF EXISTS (
    SELECT 1 FROM sponsored_accounts 
    WHERE user_id = NEW.user_id AND is_active = true
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Insert welcome message from DIM_Community
  INSERT INTO public.messages (
    sender_id,
    receiver_id,
    content,
    is_read,
    created_at
  ) VALUES (
    dim_community_id,
    NEW.user_id,
    '👋 Welcome to Digitall Intelligence, ' || user_name || '!

We''re thrilled to have you join our community of AI enthusiasts, learners, and creators.

Here''s what you can explore:
🎓 **Learning Paths** - Master AI skills with structured courses
🛠️ **AI Tools** - Access powerful AI tools to boost your productivity  
💼 **Marketplace** - Find freelancers, post jobs, or sell your products
👥 **Community** - Connect with members, share insights, and join events

Feel free to message me anytime if you have questions!

Best,
The DIM Community Team 💙',
    false,
    now()
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table (fires after new profile is created)
DROP TRIGGER IF EXISTS send_welcome_message_trigger ON public.profiles;
CREATE TRIGGER send_welcome_message_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_message();