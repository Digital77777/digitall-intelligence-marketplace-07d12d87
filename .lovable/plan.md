
# Automatic Welcome Message from @DIM_Community

## Overview
Implement an automated system that sends a personalized welcome message from the official @DIM_Community account to every new user who signs up on the platform. This creates a warm first impression and helps users feel welcomed to the community.

## Current State
- The @DIM_Community account exists with `user_id: 98e28367-b03f-4af1-a8d7-e2fcf1ec73b6`
- A trigger `on_auth_user_created` already fires when new users sign up, calling `handle_new_user()`
- The messages table has RLS policies requiring `sender_id = auth.uid()` for inserts

## Implementation Approach

### Option: Database Trigger (Recommended)
Create a new database trigger function that automatically inserts a welcome message from the DIM_Community account whenever a new user is created. Using `SECURITY DEFINER` allows the function to bypass RLS policies.

## Implementation Steps

### Step 1: Create Welcome Message Trigger Function
Create a new PostgreSQL function that:
- Runs after a user profile is created
- Inserts a welcome message into the `messages` table
- Uses the hardcoded DIM_Community user_id as the sender
- Personalizes the message with the new user's name

### Step 2: Create Database Trigger
Attach the function to fire after inserts on the `profiles` table (not `auth.users` directly, to avoid modifying reserved schemas and to have access to the user's name).

### Step 3: Welcome Message Content
The welcome message will include:
- A friendly greeting with the user's name
- Brief introduction to the platform features
- Encouragement to explore and connect

---

## Technical Details

### Database Migration

```sql
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
```

### Why This Approach Works
1. **SECURITY DEFINER**: The function runs with the privileges of its owner (postgres), bypassing RLS
2. **Profiles table trigger**: Fires after the profile is created, giving access to the user's name
3. **No external dependencies**: No need for edge functions or external API calls
4. **Instant delivery**: Message appears immediately when user completes signup
5. **Idempotent**: Only triggers on INSERT, preventing duplicate messages

### Safety Checks
- Skips sending to the DIM_Community account itself
- Skips sending to other official/sponsored accounts
- Uses COALESCE to handle missing names gracefully

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/[timestamp]_add_welcome_message_trigger.sql` | Create | Database migration with trigger function |

## Testing Plan
1. Create a new test account via signup
2. Navigate to the Inbox page
3. Verify that a welcome message from @DIM_Community appears
4. Check that the message content is personalized with the user's name

## Expected User Experience
1. User signs up for an account
2. User's profile is automatically created (existing trigger)
3. Welcome message trigger fires
4. User sees a notification for a new message
5. Opening the inbox shows a personalized welcome from @DIM_Community
