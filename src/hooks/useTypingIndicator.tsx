import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TypingUser {
  id: string;
  name: string;
  isTyping: boolean;
}

export const useTypingIndicator = (conversationUserId: string | undefined) => {
  const { user } = useAuth();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a unique channel name for the conversation
  const getChannelName = useCallback(() => {
    if (!user?.id || !conversationUserId) return null;
    const ids = [user.id, conversationUserId].sort();
    return `typing:${ids[0]}:${ids[1]}`;
  }, [user?.id, conversationUserId]);

  useEffect(() => {
    const channelName = getChannelName();
    if (!channelName || !user?.id) return;

    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherUserTyping = Object.values(state).some((presences) =>
          (presences as unknown as TypingUser[]).some(
            (p) => p.id !== user.id && p.isTyping
          )
        );
        setIsOtherUserTyping(otherUserTyping);
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [getChannelName, user?.id]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !user?.id) return;

      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      await channelRef.current.track({
        id: user.id,
        name: user.email || 'User',
        isTyping,
      });

      // Auto-stop typing after 3 seconds of inactivity
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          channelRef.current?.track({
            id: user.id,
            name: user.email || 'User',
            isTyping: false,
          });
        }, 3000);
      }
    },
    [user?.id, user?.email]
  );

  const startTyping = useCallback(() => {
    setTyping(true);
  }, [setTyping]);

  const stopTyping = useCallback(() => {
    setTyping(false);
  }, [setTyping]);

  return {
    isOtherUserTyping,
    startTyping,
    stopTyping,
  };
};
