import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { CommunityTopic, CommunityEvent, CommunityInsight } from "@/types/community";
import { scoreTopics, scoreInsights, trackContentView } from "@/lib/recommendationAlgorithm";

export const useCommunity = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Topics queries
  const useTopics = (searchQuery?: string) => {
    return useQuery({
      queryKey: ["community-topics", searchQuery],
      queryFn: async () => {
        let query = supabase
          .from("community_topics")
          .select("*")
          .order("last_activity_at", { ascending: false });

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Fetch profiles separately
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(t => t.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name, email, avatar_url")
            .in("user_id", userIds);

          const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
          
          const topicsWithProfiles = data.map(topic => ({
            ...topic,
            profiles: profilesMap.get(topic.user_id),
          })) as CommunityTopic[];
          
          // Apply recommendation algorithm
          return scoreTopics(topicsWithProfiles);
        }

        return scoreTopics(data as CommunityTopic[]);
      },
    });
  };

  const createTopic = useMutation({
    mutationFn: async (topic: {
      title: string;
      content: string;
      tags: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("community_topics")
        .insert({
          user_id: user.id,
          ...topic,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-topics"] });
      toast({
        title: "Topic Created!",
        description: "Your discussion topic has been posted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Events queries
  const useEvents = (searchQuery?: string) => {
    return useQuery({
      queryKey: ["community-events", searchQuery],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase
          .from("community_events")
          .select("*")
          .gte("event_date", new Date().toISOString().split("T")[0])
          .order("event_date", { ascending: true });

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          // Fetch profiles separately
          const userIds = [...new Set(data.map(e => e.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name, email, avatar_url")
            .in("user_id", userIds);

          const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

          // Check registration status for each event if user is logged in
          let registeredIds = new Set<string>();
          if (user) {
            const eventIds = data.map(e => e.id);
            const { data: registrations } = await supabase
              .from("event_attendees")
              .select("event_id")
              .eq("user_id", user.id)
              .in("event_id", eventIds);

            registeredIds = new Set(registrations?.map(r => r.event_id) || []);
          }
          
          return data.map(event => ({
            ...event,
            profiles: profilesMap.get(event.user_id),
            is_registered: registeredIds.has(event.id),
          })) as CommunityEvent[];
        }

        return data as CommunityEvent[];
      },
    });
  };

  const createEvent = useMutation({
    mutationFn: async (event: {
      title: string;
      description: string;
      event_type: string;
      event_date: string;
      event_time: string;
      duration_minutes: number;
      max_attendees?: number;
      meeting_link?: string;
      location?: string;
      is_online: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("community_events")
        .insert({
          user_id: user.id,
          ...event,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-events"] });
      toast({
        title: "Event Created!",
        description: "Your event has been scheduled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerForEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("event_attendees")
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-events"] });
      toast({
        title: "Registered!",
        description: "You've successfully registered for this event.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Insights queries
  const useInsights = (searchQuery?: string) => {
    return useQuery({
      queryKey: ["community-insights", searchQuery],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase
          .from("community_insights")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          // Fetch profiles separately
          const userIds = [...new Set(data.map(i => i.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name, email, avatar_url")
            .in("user_id", userIds);

          const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

          // Check like status for each insight if user is logged in
          let likedIds = new Set<string>();
          if (user) {
            const insightIds = data.map(i => i.id);
            const { data: likes } = await supabase
              .from("insight_likes")
              .select("insight_id")
              .eq("user_id", user.id)
              .in("insight_id", insightIds);

            likedIds = new Set(likes?.map(l => l.insight_id) || []);
          }
          
          const insightsWithProfiles = data.map(insight => ({
            ...insight,
            profiles: profilesMap.get(insight.user_id),
            is_liked: likedIds.has(insight.id),
          })) as CommunityInsight[];
          
          // Apply recommendation algorithm
          return scoreInsights(insightsWithProfiles);
        }

        return scoreInsights(data as CommunityInsight[]);
      },
    });
  };

  const createInsight = useMutation({
    mutationFn: async (insight: {
      title: string;
      content: string;
      category: string;
      read_time?: string;
      cover_image?: string;
      videos?: string[];
      video_thumbnails?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("community_insights")
        .insert({
          user_id: user.id,
          ...insight,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-insights"] });
      toast({
        title: "Insight Published!",
        description: "Your insight has been shared with the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateInsight = useMutation({
    mutationFn: async ({ insightId, data }: { 
      insightId: string; 
      data: { title: string; content: string; category: string; read_time?: string } 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("community_insights")
        .update(data)
        .eq("id", insightId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-insights"] });
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      toast({
        title: "Insight Updated!",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("community_insights")
        .delete()
        .eq("id", insightId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-insights"] });
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      toast({
        title: "Insight Deleted",
        description: "Your insight has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleInsightLike = useMutation({
    mutationFn: async ({ insightId, isLiked }: { insightId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        const { error } = await supabase
          .from("insight_likes")
          .delete()
          .eq("insight_id", insightId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("insight_likes")
          .insert({
            insight_id: insightId,
            user_id: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-insights"] });
    },
  });

  // Stats query
  const useStats = () => {
    return useQuery({
      queryKey: ["community-stats"],
      queryFn: async () => {
        const [topicsResult, eventsResult, profilesResult] = await Promise.all([
          supabase.from("community_topics").select("id", { count: "exact", head: true }),
          supabase.from("community_events").select("id", { count: "exact", head: true }),
          supabase.from("public_profiles").select("user_id", { count: "exact", head: true }).not("user_id", "is", null),
        ]);

        return {
          activeMembers: profilesResult.count || 0,
          topicsToday: topicsResult.count || 0,
          eventsThisWeek: eventsResult.count || 0,
        };
      },
    });
  };

  // Fetch user's own content with engagement data
  const useMyActivity = () => {
    const { user } = useAuth();
    
    return useQuery({
      queryKey: ['my-activity', user?.id],
      queryFn: async () => {
        if (!user) return { topics: [], events: [], insights: [] };

        const [topicsRes, eventsRes, insightsRes] = await Promise.all([
          supabase
            .from('community_topics')
            .select('*, topic_replies(id, user_id, content, created_at)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('community_events')
            .select(`
              *, 
              event_attendees(
                id, 
                user_id, 
                joined_at,
                profiles!event_attendees_user_id_fkey (user_id, full_name, email, avatar_url)
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('community_insights')
            .select('*, insight_likes(id, user_id, created_at)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ]);

        if (topicsRes.error) throw topicsRes.error;
        if (eventsRes.error) throw eventsRes.error;
        if (insightsRes.error) throw insightsRes.error;

        return {
          topics: topicsRes.data || [],
          events: eventsRes.data || [],
          insights: insightsRes.data || [],
        };
      },
      enabled: !!user,
    });
  };

  // Fetch single topic with all replies
  const useTopicDetail = (topicId: string) => {
    return useQuery({
      queryKey: ['topic-detail', topicId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('community_topics')
          .select(`
            *,
            profiles!community_topics_user_id_fkey (user_id, full_name, email, avatar_url),
            topic_replies (
              *,
              profiles!topic_replies_user_id_fkey (user_id, full_name, email, avatar_url)
            )
          `)
          .eq('id', topicId)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
      enabled: !!topicId,
    });
  };

  // Create a reply to a topic
  const createReply = useMutation({
    mutationFn: async ({ topicId, content }: { topicId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('topic_replies')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-detail'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['my-activity'] });
    },
  });

  // Delete a reply
  const deleteReply = useMutation({
    mutationFn: async (replyId: string) => {
      const { error } = await supabase
        .from('topic_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-detail'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['my-activity'] });
    },
  });

  return {
    useTopics,
    createTopic,
    useTopicDetail,
    createReply,
    deleteReply,
    useEvents,
    createEvent,
    registerForEvent,
    useInsights,
    createInsight,
    updateInsight,
    deleteInsight,
    toggleInsightLike,
    useStats,
    useMyActivity,
    trackContentView,
  };
};

export default useCommunity;
