import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useAITutorSessions = (userId: string | undefined) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Fetch all sessions for the user
  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    
    setIsLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('ai_tutor_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [userId]);

  // Load messages for a specific session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_tutor_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data?.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })) || []);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load conversation');
    }
  }, []);

  // Create a new session
  const createSession = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      // Generate title from first message (first 50 chars)
      const title = firstMessage.length > 50 
        ? firstMessage.substring(0, 47) + '...' 
        : firstMessage;

      const { data, error } = await supabase
        .from('ai_tutor_sessions')
        .insert({ user_id: userId, title })
        .select()
        .single();
      
      if (error) throw error;
      
      setCurrentSessionId(data.id);
      setSessions(prev => [data, ...prev]);
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }, [userId]);

  // Save a message to the current session
  const saveMessage = useCallback(async (sessionId: string, message: Message) => {
    try {
      const { error } = await supabase
        .from('ai_tutor_messages')
        .insert({
          session_id: sessionId,
          role: message.role,
          content: message.content
        });
      
      if (error) throw error;

      // Update session timestamp
      await supabase
        .from('ai_tutor_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, []);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_tutor_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete conversation');
    }
  }, [currentSessionId]);

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    currentSessionId,
    messages,
    setMessages,
    isLoadingSessions,
    loadSession,
    createSession,
    saveMessage,
    deleteSession,
    startNewConversation,
    fetchSessions
  };
};
