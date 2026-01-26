import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { z } from 'zod';

// Message validation schema
const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
});

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  voice_note_url?: string | null;
  reply_to_id?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  reply_to?: {
    id: string;
    content: string;
    sender_id: string;
  } | null;
  sender_profile?: {
    user_id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  receiver_profile?: {
    user_id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export const useMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all conversations for the current user
  const useConversations = () => {
    return useQuery({
      queryKey: ['conversations'],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get all messages where user is sender or receiver
        const { data: messages, error } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            receiver_id,
            content,
            is_read,
            created_at,
            media_url,
            media_type
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group messages by conversation partner, excluding self-messages
        const conversationsMap = new Map<string, Conversation>();

        for (const msg of messages || []) {
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          
          // Skip self-messages (where sender and receiver are the same)
          if (partnerId === user.id) continue;
          
          if (!conversationsMap.has(partnerId)) {
            // Fetch partner profile - use public_profiles for display data
            const { data: profile } = await supabase
              .from('public_profiles')
              .select('user_id, full_name, avatar_url')
              .eq('user_id', partnerId)
              .single();

            // Check if this is an official/sponsored account (for fallback display name)
            let displayName = profile?.full_name;
            let avatarUrl = profile?.avatar_url;
            
            if (!displayName) {
              // Check sponsored_accounts for official account info
              const { data: sponsored } = await supabase
                .from('sponsored_accounts')
                .select('badge_label')
                .eq('user_id', partnerId)
                .eq('is_active', true)
                .single();
              
              if (sponsored) {
                displayName = sponsored.badge_label || 'DIM Community';
              }
            }

            // Show media indicator in preview
            let lastMessagePreview = msg.content;
            if (msg.media_url && msg.media_type) {
              if (msg.content && msg.content !== '📷 Photo' && msg.content !== '🎬 Video') {
                lastMessagePreview = `${msg.media_type === 'image' ? '📷' : '🎬'} ${msg.content}`;
              } else {
                lastMessagePreview = msg.media_type === 'image' ? '📷 Photo' : '🎬 Video';
              }
            }

            conversationsMap.set(partnerId, {
              user_id: partnerId,
              full_name: displayName,
              avatar_url: avatarUrl,
              last_message: lastMessagePreview,
              last_message_time: msg.created_at,
              unread_count: 0,
            });
          }

          // Count unread messages from this partner
          if (msg.receiver_id === user.id && !msg.is_read) {
            const conv = conversationsMap.get(partnerId)!;
            conv.unread_count += 1;
          }
        }

        // Get accepted connections
        const { data: connections } = await supabase
          .from('user_connections')
          .select('requester_id, recipient_id')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted');

        // Add accepted connections that don't have messages yet
        if (connections) {
          for (const conn of connections) {
            const partnerId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
            
            if (!conversationsMap.has(partnerId)) {
              // Fetch partner profile - use public_profiles for display data
              const { data: profile } = await supabase
                .from('public_profiles')
                .select('user_id, full_name, avatar_url')
                .eq('user_id', partnerId)
                .single();

              conversationsMap.set(partnerId, {
                user_id: partnerId,
                full_name: profile?.full_name,
                avatar_url: profile?.avatar_url,
                last_message: undefined,
                last_message_time: undefined,
                unread_count: 0,
              });
            }
          }
        }

        return Array.from(conversationsMap.values());
      },
    });
  };

  // Get messages for a specific conversation
  const useConversationMessages = (partnerId?: string) => {
    return useQuery({
      queryKey: ['messages', partnerId],
      queryFn: async () => {
        if (!partnerId) return [];

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            receiver_id,
            content,
            is_read,
            created_at,
            voice_note_url,
            reply_to_id,
            media_url,
            media_type
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Fetch reply_to messages for messages that have replies
        const messagesWithReplies = await Promise.all(
          (data || []).map(async (msg) => {
            if (msg.reply_to_id) {
              const { data: replyTo } = await supabase
                .from('messages')
                .select('id, content, sender_id')
                .eq('id', msg.reply_to_id)
                .single();
              return { ...msg, reply_to: replyTo };
            }
            return { ...msg, reply_to: null };
          })
        );

        if (error) throw error;

        // Mark messages as read
        const unreadIds = messagesWithReplies?.filter(m => m.receiver_id === user.id && !m.is_read).map(m => m.id) || [];
        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadIds);
        }

        return messagesWithReplies || [];
      },
      enabled: !!partnerId,
    });
  };

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content, voiceNoteUrl, replyToId, mediaUrl, mediaType }: { 
      receiverId: string; 
      content: string; 
      voiceNoteUrl?: string; 
      replyToId?: string;
      mediaUrl?: string;
      mediaType?: 'image' | 'video';
    }) => {
      // Validate input - allow empty content if voice note or media is present
      if (!voiceNoteUrl && !mediaUrl) {
        const validation = messageSchema.safeParse({ content });
        if (!validation.success) {
          throw new Error(validation.error.errors[0].message);
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Determine message content
      let messageContent = content;
      if (voiceNoteUrl) {
        messageContent = '🎤 Voice note';
      } else if (mediaUrl && !content.trim()) {
        messageContent = mediaType === 'video' ? '🎬 Video' : '📷 Photo';
      }

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: messageContent,
        voice_note_url: voiceNoteUrl || null,
        reply_to_id: replyToId || null,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  // Edit a message (within 15 minutes)
  const editMessage = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const validation = messageSchema.safeParse({ content });
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the message to check ownership and time
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;
      if (!message) throw new Error('Message not found');
      if (message.sender_id !== user.id) throw new Error('You can only edit your own messages');

      // Check if within 15 minutes
      const createdAt = new Date(message.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      if (diffMinutes > 15) {
        throw new Error('Messages can only be edited within 15 minutes');
      }

      const { error } = await supabase
        .from('messages')
        .update({ content })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Message updated',
        description: 'Your message has been edited',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to edit message',
        variant: 'destructive',
      });
    },
  });

  // Delete a message (within 15 minutes)
  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the message to check ownership and time
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;
      if (!message) throw new Error('Message not found');
      if (message.sender_id !== user.id) throw new Error('You can only delete your own messages');

      // Check if within 15 minutes
      const createdAt = new Date(message.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      if (diffMinutes > 15) {
        throw new Error('Messages can only be deleted within 15 minutes');
      }

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Message deleted',
        description: 'Your message has been removed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete message',
        variant: 'destructive',
      });
    },
  });

  // Check if a message can be edited/deleted (within 15 minutes)
  const canModifyMessage = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffMinutes <= 15;
  };

  return {
    useConversations,
    useConversationMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    canModifyMessage,
  };
};
