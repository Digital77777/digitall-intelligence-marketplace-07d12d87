import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CommunityFeedOptions {
  limit?: number;
  type?: 'topics' | 'insights' | 'events' | 'all';
}

export const useCommunityFeed = (options: CommunityFeedOptions = {}) => {
  const { limit = 20, type = 'all' } = options;
  const queryClient = useQueryClient();

  // Fetch topics
  const topicsQuery = useQuery({
    queryKey: ['community-topics', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          user_id,
          views,
          replies_count,
          tags,
          last_activity_at
        `)
        .order('last_activity_at', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    enabled: type === 'all' || type === 'topics',
  });

  // Fetch insights
  const insightsQuery = useQuery({
    queryKey: ['community-insights', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_insights')
        .select(`
          id,
          title,
          content,
          category,
          created_at,
          user_id,
          likes_count,
          views_count,
          cover_image
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: type === 'all' || type === 'insights',
  });

  // Fetch events
  const eventsQuery = useQuery({
    queryKey: ['community-events', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          id,
          title,
          description,
          event_date,
          event_time,
          event_type,
          location,
          attendees_count,
          cover_image,
          user_id
        `)
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: type === 'all' || type === 'events',
  });

  // Refresh function for scroll-to-top
  const refreshFeed = useCallback(async () => {
    const invalidations = [];
    
    if (type === 'all' || type === 'topics') {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: ['community-topics'] })
      );
    }
    if (type === 'all' || type === 'insights') {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: ['community-insights'] })
      );
    }
    if (type === 'all' || type === 'events') {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: ['community-events'] })
      );
    }

    await Promise.all(invalidations);
  }, [queryClient, type]);

  // Combined loading state
  const isLoading = topicsQuery.isLoading || insightsQuery.isLoading || eventsQuery.isLoading;
  const isFetching = topicsQuery.isFetching || insightsQuery.isFetching || eventsQuery.isFetching;
  const isError = topicsQuery.isError || insightsQuery.isError || eventsQuery.isError;

  return {
    topics: topicsQuery.data || [],
    insights: insightsQuery.data || [],
    events: eventsQuery.data || [],
    isLoading,
    isFetching,
    isError,
    refreshFeed,
  };
};
