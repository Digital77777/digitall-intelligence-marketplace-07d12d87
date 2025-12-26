import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface RealtimeMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const useRealtimeMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const processedMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as RealtimeMessage;
          
          // Prevent duplicate notifications
          if (processedMessageIds.current.has(newMessage.id)) {
            return;
          }
          processedMessageIds.current.add(newMessage.id);

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['messages', newMessage.sender_id] });

          // Get sender profile for notification - use public_profiles
          const { data: senderProfile } = await supabase
            .from('public_profiles')
            .select('full_name')
            .eq('user_id', newMessage.sender_id)
            .single();

          const senderName = senderProfile?.full_name || 'Someone';

          // Show toast notification
          toast({
            title: 'New Message',
            description: `${senderName}: ${newMessage.content.slice(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, toast]);
};
