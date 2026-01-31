import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LessonBookmark {
  id: string;
  user_id: string;
  lesson_id: string;
  timestamp_seconds: number;
  title: string;
  created_at: string;
}

interface CreateBookmarkParams {
  lessonId: string;
  timestampSeconds: number;
  title: string;
}

export const useLessonBookmarks = (lessonId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch bookmarks for lesson
  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['lesson-bookmarks', lessonId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('lesson_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .order('timestamp_seconds', { ascending: true });

      if (error) throw error;
      return data as LessonBookmark[];
    },
    enabled: !!user?.id && !!lessonId,
  });

  // Create bookmark mutation
  const createBookmarkMutation = useMutation({
    mutationFn: async (params: CreateBookmarkParams) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lesson_bookmarks')
        .insert({
          user_id: user.id,
          lesson_id: params.lessonId,
          timestamp_seconds: params.timestampSeconds,
          title: params.title,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-bookmarks', lessonId] });
      toast.success('Bookmark added');
    },
    onError: () => {
      toast.error('Failed to add bookmark');
    },
  });

  // Delete bookmark mutation
  const deleteBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('lesson_bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-bookmarks', lessonId] });
      toast.success('Bookmark removed');
    },
    onError: () => {
      toast.error('Failed to remove bookmark');
    },
  });

  return {
    bookmarks: bookmarks || [],
    isLoading,
    createBookmark: createBookmarkMutation.mutate,
    deleteBookmark: deleteBookmarkMutation.mutate,
    isCreating: createBookmarkMutation.isPending,
    isDeleting: deleteBookmarkMutation.isPending,
  };
};

// Format timestamp as MM:SS or HH:MM:SS
export const formatTimestamp = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
