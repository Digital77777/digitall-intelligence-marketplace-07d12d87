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
      // Performance optimizations
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      placeholderData: (previousData) => previousData,
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
      // Performance optimizations
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      placeholderData: (previousData) => previousData,
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
      cover_image?: string;
      venue_name?: string;
      full_address?: string;
      timezone?: string;
      tags?: string[];
      requirements?: string;
      language?: string;
      contact_email?: string;
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

  const updateEvent = useMutation({
    mutationFn: async ({ eventId, data }: {
      eventId: string;
      data: {
        title?: string;
        description?: string;
        event_type?: string;
        event_date?: string;
        event_time?: string;
        duration_minutes?: number;
        max_attendees?: number | null;
        meeting_link?: string | null;
        location?: string | null;
        is_online?: boolean;
        cover_image?: string | null;
        venue_name?: string | null;
        full_address?: string | null;
        timezone?: string;
        tags?: string[];
        requirements?: string | null;
        language?: string;
        contact_email?: string | null;
      };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, update the event
      const { error: updateError } = await supabase
        .from("community_events")
        .update(data)
        .eq("id", eventId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Get attendees to notify them
      const { data: attendees } = await supabase
        .from("event_attendees")
        .select("user_id")
        .eq("event_id", eventId);

      // Create notifications for all attendees (except the host)
      if (attendees && attendees.length > 0) {
        const notifications = attendees
          .filter(a => a.user_id !== user.id)
          .map(a => ({
            user_id: a.user_id,
            type: "event_updated",
            message: `Event "${data.title}" has been updated`,
            metadata: { event_id: eventId }
          }));

        if (notifications.length > 0) {
          await supabase.from("notifications").insert(notifications);
        }
      }

      return { eventId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-events"] });
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      toast({
        title: "Event Updated!",
        description: "Your event has been updated and attendees have been notified.",
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

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("community_events")
        .delete()
        .eq("id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-events"] });
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      toast({
        title: "Event Deleted",
        description: "Your event has been removed.",
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

  // Insights queries - optimized for fast loading
  const useInsights = (searchQuery?: string) => {
    return useQuery({
      queryKey: ["community-insights", searchQuery],
      queryFn: async () => {
        // Start user auth check in parallel with main query
        const userPromise = supabase.auth.getUser();
        
        let query = supabase
          .from("community_insights")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(50); // Limit initial load for speed

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        // Execute main query
        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) return [] as CommunityInsight[];

        // Get user result (should be ready by now)
        const { data: { user } } = await userPromise;

        // Prepare parallel queries for profiles and likes
        const userIds = [...new Set(data.map(i => i.user_id))];
        const insightIds = data.map(i => i.id);

        // Execute profiles and likes queries in parallel
        const [profilesResult, likesResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, full_name, email, avatar_url")
            .in("user_id", userIds),
          user 
            ? supabase
                .from("insight_likes")
                .select("insight_id")
                .eq("user_id", user.id)
                .in("insight_id", insightIds)
            : Promise.resolve({ data: null }),
        ]);

        const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
        const likedIds = new Set(likesResult.data?.map(l => l.insight_id) || []);
        
        const insightsWithProfiles = data.map(insight => ({
          ...insight,
          profiles: profilesMap.get(insight.user_id),
          is_liked: likedIds.has(insight.id),
        })) as CommunityInsight[];
        
        // Apply recommendation algorithm
        return scoreInsights(insightsWithProfiles);
      },
      // Performance optimizations
      staleTime: 30 * 1000, // Data stays fresh for 30 seconds
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      placeholderData: (previousData) => previousData, // Show stale data while fetching
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
    updateEvent,
    deleteEvent,
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
