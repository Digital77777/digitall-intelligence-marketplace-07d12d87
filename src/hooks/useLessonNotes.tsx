import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LessonNote {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  timestamp_seconds: number | null;
  created_at: string;
  updated_at: string;
}

interface CreateNoteParams {
  lessonId: string;
  content: string;
  timestampSeconds?: number;
}

interface UpdateNoteParams {
  noteId: string;
  content: string;
}

export const useLessonNotes = (lessonId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notes for lesson
  const { data: notes, isLoading } = useQuery({
    queryKey: ['lesson-notes', lessonId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LessonNote[];
    },
    enabled: !!user?.id && !!lessonId,
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (params: CreateNoteParams) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lesson_notes')
        .insert({
          user_id: user.id,
          lesson_id: params.lessonId,
          content: params.content,
          timestamp_seconds: params.timestampSeconds || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
      toast.success('Note saved');
    },
    onError: () => {
      toast.error('Failed to save note');
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async (params: UpdateNoteParams) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('lesson_notes')
        .update({ content: params.content })
        .eq('id', params.noteId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
      toast.success('Note updated');
    },
    onError: () => {
      toast.error('Failed to update note');
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('lesson_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
      toast.success('Note deleted');
    },
    onError: () => {
      toast.error('Failed to delete note');
    },
  });

  return {
    notes: notes || [],
    isLoading,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
};
