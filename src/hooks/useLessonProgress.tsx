import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCallback, useRef } from 'react';

interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  enrollment_id: string | null;
  watch_time_seconds: number;
  completed: boolean;
  completed_at: string | null;
  last_position_seconds: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface UpdateProgressParams {
  lessonId: string;
  watchTimeSeconds?: number;
  lastPositionSeconds?: number;
  completed?: boolean;
  enrollmentId?: string;
}

export const useLessonProgress = (lessonId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch lesson progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ['lesson-progress', lessonId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) throw error;
      return data as LessonProgress | null;
    },
    enabled: !!user?.id && !!lessonId,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (params: UpdateProgressParams) => {
      if (!user?.id) throw new Error('Not authenticated');

      const existingProgress = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', params.lessonId)
        .maybeSingle();

      const updateData: Partial<LessonProgress> = {};
      
      if (params.watchTimeSeconds !== undefined) {
        updateData.watch_time_seconds = params.watchTimeSeconds;
      }
      if (params.lastPositionSeconds !== undefined) {
        updateData.last_position_seconds = params.lastPositionSeconds;
      }
      if (params.completed !== undefined) {
        updateData.completed = params.completed;
        if (params.completed) {
          updateData.completed_at = new Date().toISOString();
        }
      }

      if (existingProgress.data?.id) {
        // Update existing
        const { error } = await supabase
          .from('lesson_progress')
          .update(updateData)
          .eq('id', existingProgress.data.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: params.lessonId,
            enrollment_id: params.enrollmentId || null,
            watch_time_seconds: params.watchTimeSeconds || 0,
            last_position_seconds: params.lastPositionSeconds || 0,
            completed: params.completed || false,
            completed_at: params.completed ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
    },
  });

  // Mark lesson complete
  const markComplete = useCallback(() => {
    updateProgressMutation.mutate({
      lessonId,
      completed: true,
    });
  }, [lessonId, updateProgressMutation]);

  // Save position with debounce (every 10 seconds)
  const savePosition = useCallback((positionSeconds: number, watchTimeSeconds: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      updateProgressMutation.mutate({
        lessonId,
        lastPositionSeconds: positionSeconds,
        watchTimeSeconds,
      });
    }, 10000); // 10 second debounce
  }, [lessonId, updateProgressMutation]);

  // Immediate save (for navigation/unmount)
  const savePositionImmediately = useCallback((positionSeconds: number, watchTimeSeconds: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    updateProgressMutation.mutate({
      lessonId,
      lastPositionSeconds: positionSeconds,
      watchTimeSeconds,
    });
  }, [lessonId, updateProgressMutation]);

  return {
    progress,
    isLoading,
    isCompleted: progress?.completed ?? false,
    lastPosition: progress?.last_position_seconds ?? 0,
    watchTime: progress?.watch_time_seconds ?? 0,
    markComplete,
    savePosition,
    savePositionImmediately,
    isSaving: updateProgressMutation.isPending,
  };
};

// Hook to get all progress for a course
export const useCourseProgress = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course-lesson-progress', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get all lessons for this course
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', courseId);

      if (lessonsError) throw lessonsError;
      if (!lessons?.length) return [];

      const lessonIds = lessons.map(l => l.id);

      // Then get progress for those lessons
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!user?.id && !!courseId,
  });
};
