-- Add parent_id column to topic_replies for nested replies
ALTER TABLE public.topic_replies 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.topic_replies(id) ON DELETE CASCADE;

-- Create index for efficient nested reply queries
CREATE INDEX IF NOT EXISTS idx_topic_replies_parent_id ON public.topic_replies(parent_id);

-- Create table for topic reply likes
CREATE TABLE IF NOT EXISTS public.topic_reply_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id uuid NOT NULL REFERENCES public.topic_replies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(reply_id, user_id)
);

-- Create index for efficient like queries
CREATE INDEX IF NOT EXISTS idx_topic_reply_likes_reply_id ON public.topic_reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_topic_reply_likes_user_id ON public.topic_reply_likes(user_id);

-- Add likes_count column to topic_replies for denormalized count
ALTER TABLE public.topic_replies
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Enable RLS on topic_reply_likes
ALTER TABLE public.topic_reply_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for topic_reply_likes
CREATE POLICY "Anyone can view reply likes"
ON public.topic_reply_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like replies"
ON public.topic_reply_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike replies"
ON public.topic_reply_likes FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update reply likes count
CREATE OR REPLACE FUNCTION public.update_reply_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topic_replies
    SET likes_count = likes_count + 1
    WHERE id = NEW.reply_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topic_replies
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.reply_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for reply likes count
DROP TRIGGER IF EXISTS update_reply_likes_count_trigger ON public.topic_reply_likes;
CREATE TRIGGER update_reply_likes_count_trigger
AFTER INSERT OR DELETE ON public.topic_reply_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_reply_likes_count();