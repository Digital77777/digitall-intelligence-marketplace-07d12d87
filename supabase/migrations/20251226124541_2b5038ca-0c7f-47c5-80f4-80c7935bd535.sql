-- Add parent_id column to insight_comments for threaded replies
ALTER TABLE public.insight_comments 
ADD COLUMN parent_id uuid REFERENCES public.insight_comments(id) ON DELETE CASCADE;

-- Create index for faster reply lookups
CREATE INDEX idx_insight_comments_parent_id ON public.insight_comments(parent_id);