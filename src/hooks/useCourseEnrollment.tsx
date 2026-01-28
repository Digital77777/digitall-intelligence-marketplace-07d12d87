import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'paused';
  progress_percent: number;
  current_module: number;
  completed_at: string | null;
}

interface ModuleProgress {
  id: string;
  enrollment_id: string;
  module_id: number;
  started_at: string;
  completed_at: string | null;
  time_spent_minutes: number;
}

export const useCourseEnrollment = (courseId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch enrollment status
  const { data: enrollment, isLoading } = useQuery({
    queryKey: ['course-enrollment', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) throw error;
      return data as CourseEnrollment | null;
    },
    enabled: !!user?.id,
  });

  // Fetch module progress
  const { data: moduleProgress } = useQuery({
    queryKey: ['module-progress', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return [];
      
      const { data, error } = await supabase
        .from('course_module_progress')
        .select('*')
        .eq('enrollment_id', enrollment.id)
        .order('module_id', { ascending: true });

      if (error) throw error;
      return data as ModuleProgress[];
    },
    enabled: !!enrollment?.id,
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Must be logged in to enroll');

      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: 'active',
          progress_percent: 0,
          current_module: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollment', courseId] });
      toast.success('Successfully enrolled! Welcome to the course.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enroll. Please try again.');
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      progressPercent, 
      currentModule 
    }: { 
      progressPercent: number; 
      currentModule: number;
    }) => {
      if (!enrollment?.id) throw new Error('Not enrolled');

      const updateData: Partial<CourseEnrollment> = {
        progress_percent: progressPercent,
        current_module: currentModule,
      };

      if (progressPercent >= 100) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('course_enrollments')
        .update(updateData)
        .eq('id', enrollment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollment', courseId] });
    },
  });

  // Update module progress mutation
  const updateModuleProgressMutation = useMutation({
    mutationFn: async ({ 
      moduleId, 
      completed,
      timeSpent 
    }: { 
      moduleId: number; 
      completed?: boolean;
      timeSpent?: number;
    }) => {
      if (!enrollment?.id) throw new Error('Not enrolled');

      const existingProgress = moduleProgress?.find(p => p.module_id === moduleId);

      if (existingProgress) {
        const updateData: Partial<ModuleProgress> = {};
        if (completed) updateData.completed_at = new Date().toISOString();
        if (timeSpent) updateData.time_spent_minutes = existingProgress.time_spent_minutes + timeSpent;

        const { error } = await supabase
          .from('course_module_progress')
          .update(updateData)
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('course_module_progress')
          .insert({
            enrollment_id: enrollment.id,
            module_id: moduleId,
            completed_at: completed ? new Date().toISOString() : null,
            time_spent_minutes: timeSpent || 0,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-progress', enrollment?.id] });
    },
  });

  return {
    enrollment,
    moduleProgress: moduleProgress || [],
    isEnrolled: !!enrollment,
    isLoading,
    isEnrolling: enrollMutation.isPending,
    enroll: enrollMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    updateModuleProgress: updateModuleProgressMutation.mutate,
  };
};

// Hook to get enrollment count for a course (public stats)
export const useCourseEnrollmentCount = (courseId: string) => {
  return useQuery({
    queryKey: ['course-enrollment-count', courseId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);

      if (error) return 0;
      return count || 0;
    },
  });
};
