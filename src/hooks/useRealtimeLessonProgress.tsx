import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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

interface ModuleProgress {
  moduleId: number;
  completedLessons: string[];
  totalLessons: number;
  percentComplete: number;
  isComplete: boolean;
}

/**
 * Hook for real-time lesson progress tracking with Supabase subscriptions.
 * Automatically syncs progress across tabs and devices.
 */
export const useRealtimeLessonProgress = (courseId: string, lessonIds: string[]) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch initial progress data
  const { data: progressData, isLoading, refetch } = useQuery({
    queryKey: ['realtime-lesson-progress', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id || lessonIds.length === 0) return [];

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (error) throw error;
      return (data || []) as LessonProgress[];
    },
    enabled: !!user?.id && lessonIds.length > 0,
    staleTime: 1000, // Consider data fresh for 1 second
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`lesson-progress-${user.id}`)
      .on<LessonProgress>(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'lesson_progress',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<LessonProgress>) => {
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ 
            queryKey: ['realtime-lesson-progress', courseId, user.id] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['lesson-progress'] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['course-lesson-progress'] 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, courseId, queryClient]);

  // Compute completed lessons
  const completedLessons = progressData
    ?.filter(p => p.completed)
    .map(p => p.lesson_id) || [];

  // Check if syncing (has recent updates)
  const isSyncing = isLoading;

  // Force refresh function
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    progressData,
    completedLessons,
    isLoading,
    isSyncing,
    refresh,
  };
};

/**
 * Hook to get real-time module-level progress
 */
export const useRealtimeModuleProgress = (
  courseId: string, 
  modules: { id: number; lessons: { id: string }[] }[]
) => {
  const { user } = useAuth();
  const allLessonIds = modules.flatMap(m => m.lessons.map(l => l.id));

  const { completedLessons, isLoading, isSyncing, refresh } = useRealtimeLessonProgress(
    courseId,
    allLessonIds
  );

  // Calculate progress per module
  const moduleProgress: ModuleProgress[] = modules.map(module => {
    const moduleLessonIds = module.lessons.map(l => l.id);
    const moduleCompleted = moduleLessonIds.filter(id => completedLessons.includes(id));
    const total = moduleLessonIds.length;
    const completed = moduleCompleted.length;
    
    return {
      moduleId: module.id,
      completedLessons: moduleCompleted,
      totalLessons: total,
      percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      isComplete: completed === total && total > 0,
    };
  });

  // Overall course progress
  const overallProgress = {
    completedLessons: completedLessons.length,
    totalLessons: allLessonIds.length,
    percentComplete: allLessonIds.length > 0 
      ? Math.round((completedLessons.length / allLessonIds.length) * 100) 
      : 0,
    isComplete: completedLessons.length === allLessonIds.length && allLessonIds.length > 0,
  };

  return {
    moduleProgress,
    overallProgress,
    completedLessons,
    isLoading,
    isSyncing,
    refresh,
  };
};
