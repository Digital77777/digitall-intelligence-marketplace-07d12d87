-- Create course_enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  current_module INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'paused')),
  CONSTRAINT valid_progress CHECK (progress_percent >= 0 AND progress_percent <= 100),
  UNIQUE (user_id, course_id)
);

-- Create course_module_progress table
CREATE TABLE public.course_module_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, module_id)
);

-- Enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_module_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view their own enrollments"
ON public.course_enrollments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments"
ON public.course_enrollments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
ON public.course_enrollments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enrollments"
ON public.course_enrollments
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for course_module_progress
CREATE POLICY "Users can view their own module progress"
ON public.course_module_progress
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.course_enrollments
  WHERE course_enrollments.id = course_module_progress.enrollment_id
  AND course_enrollments.user_id = auth.uid()
));

CREATE POLICY "Users can create their own module progress"
ON public.course_module_progress
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.course_enrollments
  WHERE course_enrollments.id = course_module_progress.enrollment_id
  AND course_enrollments.user_id = auth.uid()
));

CREATE POLICY "Users can update their own module progress"
ON public.course_module_progress
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.course_enrollments
  WHERE course_enrollments.id = course_module_progress.enrollment_id
  AND course_enrollments.user_id = auth.uid()
));

-- Triggers for updated_at
CREATE TRIGGER update_course_enrollments_updated_at
BEFORE UPDATE ON public.course_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_module_progress_updated_at
BEFORE UPDATE ON public.course_module_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_course_module_progress_enrollment_id ON public.course_module_progress(enrollment_id);