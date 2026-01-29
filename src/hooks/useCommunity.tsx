import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { CommunityTopic, CommunityEvent, CommunityInsight } from "@/types/community";
import { scoreTopics, scoreInsights, trackContentView } from "@/lib/recommendationAlgorithm";

const INSIGHTS_PAGE_SIZE = 12;
const TOPICS_PAGE_SIZE = 15;

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
          .order("created_at", { ascending: false }); // Order by newest first

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(t => t.user_id))];
          const topicIds = data.map(t => t.id);
          
          // Fetch profiles and replies count in parallel
          const [profilesResult, repliesResult] = await Promise.all([
            supabase
              .from("public_profiles")
              .select("user_id, full_name, avatar_url")
              .in("user_id", userIds),
            supabase
              .from("topic_replies")
              .select("topic_id")
              .in("topic_id", topicIds),
          ]);

          const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
          
          // Count replies per topic
          const repliesCountMap = new Map<string, number>();
          repliesResult.data?.forEach(r => {
            repliesCountMap.set(r.topic_id, (repliesCountMap.get(r.topic_id) || 0) + 1);
          });
          
          const topicsWithProfiles = data.map(topic => ({
            ...topic,
            profiles: profilesMap.get(topic.user_id),
            replies_count: repliesCountMap.get(topic.id) || 0,
          })) as CommunityTopic[];
          
          // Return topics sorted by created_at (already sorted by DB)
          return topicsWithProfiles;
        }

        return data as CommunityTopic[];
      },
      // Performance optimizations
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      placeholderData: (previousData) => previousData,
    });
  };

  // Infinite scroll version of topics query
  const useInfiniteTopics = (searchQuery?: string) => {
    return useInfiniteQuery({
      queryKey: ["community-topics-infinite", searchQuery],
      queryFn: async ({ pageParam = 0 }) => {
        let query = supabase
          .from("community_topics")
          .select("*")
          .order("created_at", { ascending: false })
          .range(pageParam * TOPICS_PAGE_SIZE, (pageParam + 1) * TOPICS_PAGE_SIZE - 1);

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return { topics: [] as CommunityTopic[], nextPage: undefined };
        }

        const userIds = [...new Set(data.map(t => t.user_id))];
        const topicIds = data.map(t => t.id);
        
        // Fetch profiles and replies count in parallel
        const [profilesResult, repliesResult] = await Promise.all([
          supabase
            .from("public_profiles")
            .select("user_id, full_name, avatar_url")
            .in("user_id", userIds),
          supabase
            .from("topic_replies")
            .select("topic_id")
            .in("topic_id", topicIds),
        ]);

        const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
        
        // Count replies per topic
        const repliesCountMap = new Map<string, number>();
        repliesResult.data?.forEach(r => {
          repliesCountMap.set(r.topic_id, (repliesCountMap.get(r.topic_id) || 0) + 1);
        });
        
        const topicsWithProfiles = data.map(topic => ({
          ...topic,
          profiles: profilesMap.get(topic.user_id),
          replies_count: repliesCountMap.get(topic.id) || 0,
        })) as CommunityTopic[];
        
        return {
          topics: topicsWithProfiles,
          nextPage: data.length === TOPICS_PAGE_SIZE ? pageParam + 1 : undefined
        };
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
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
            .from("public_profiles")
            .select("user_id, full_name, avatar_url")
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
      city?: string;
      country?: string;
      timezone?: string;
      tags?: string[];
      requirements?: string;
      language?: string;
      contact_email?: string;
      hosted_by?: string;
      is_personal_host?: boolean;
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
        city?: string | null;
        country?: string | null;
        timezone?: string;
        tags?: string[];
        requirements?: string | null;
        language?: string;
        contact_email?: string | null;
        hosted_by?: string | null;
        is_personal_host?: boolean;
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

  // Query for events the user has registered for
  const useMyRegisteredEvents = () => {
    return useQuery({
      queryKey: ["my-registered-events"],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // First get all event IDs the user has registered for
        const { data: registrations, error: regError } = await supabase
          .from("event_attendees")
          .select("event_id, joined_at, status")
          .eq("user_id", user.id)
          .order("joined_at", { ascending: false });

        if (regError) throw regError;
        if (!registrations || registrations.length === 0) return [];

        const eventIds = registrations.map(r => r.event_id);
        const registrationMap = new Map(registrations.map(r => [r.event_id, r]));

        // Fetch the events
        const { data: events, error: eventsError } = await supabase
          .from("community_events")
          .select("*")
          .in("id", eventIds);

        if (eventsError) throw eventsError;
        if (!events || events.length === 0) return [];

        // Fetch profiles for event hosts
        const userIds = [...new Set(events.map(e => e.user_id))];
        const { data: profiles } = await supabase
          .from("public_profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        // Combine events with registration info and profiles
        return events.map(event => ({
          ...event,
          profiles: profilesMap.get(event.user_id),
          is_registered: true,
          registration: registrationMap.get(event.id),
        })) as (CommunityEvent & { registration: { joined_at: string; status: string } })[];
      },
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });
  };

  // Insights queries - optimized for fast loading (original query for compatibility)
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

        // Prepare parallel queries for profiles and all likes
        const userIds = [...new Set(data.map(i => i.user_id))];
        const insightIds = data.map(i => i.id);

        // Execute profiles and likes queries in parallel
        const [profilesResult, allLikesResult, userLikesResult] = await Promise.all([
          supabase
            .from("public_profiles")
            .select("user_id, full_name, avatar_url")
            .in("user_id", userIds),
          // Fetch all likes for these insights to get accurate counts
          supabase
            .from("insight_likes")
            .select("insight_id")
            .in("insight_id", insightIds),
          // Fetch user's likes separately
          user 
            ? supabase
                .from("insight_likes")
                .select("insight_id")
                .eq("user_id", user.id)
                .in("insight_id", insightIds)
            : Promise.resolve({ data: null }),
        ]);

        const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
        const userLikedIds = new Set(userLikesResult.data?.map(l => l.insight_id) || []);
        
        // Count likes per insight
        const likesCountMap = new Map<string, number>();
        allLikesResult.data?.forEach(l => {
          likesCountMap.set(l.insight_id, (likesCountMap.get(l.insight_id) || 0) + 1);
        });
        
        const insightsWithProfiles = data.map(insight => ({
          ...insight,
          profiles: profilesMap.get(insight.user_id),
          is_liked: userLikedIds.has(insight.id),
          likes_count: likesCountMap.get(insight.id) || 0,
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

  // Infinite scroll version of insights query
  const useInfiniteInsights = (searchQuery?: string) => {
    return useInfiniteQuery({
      queryKey: ["community-insights-infinite", searchQuery],
      queryFn: async ({ pageParam = 0 }) => {
        const userPromise = supabase.auth.getUser();
        
        let query = supabase
          .from("community_insights")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .range(pageParam * INSIGHTS_PAGE_SIZE, (pageParam + 1) * INSIGHTS_PAGE_SIZE - 1);

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) {
          return { insights: [] as CommunityInsight[], nextPage: undefined };
        }

        const { data: { user } } = await userPromise;
        const userIds = [...new Set(data.map(i => i.user_id))];
        const insightIds = data.map(i => i.id);

        const [profilesResult, allLikesResult, userLikesResult] = await Promise.all([
          supabase
            .from("public_profiles")
            .select("user_id, full_name, avatar_url")
            .in("user_id", userIds),
          supabase
            .from("insight_likes")
            .select("insight_id")
            .in("insight_id", insightIds),
          user 
            ? supabase
                .from("insight_likes")
                .select("insight_id")
                .eq("user_id", user.id)
                .in("insight_id", insightIds)
            : Promise.resolve({ data: null }),
        ]);

        const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
        const userLikedIds = new Set(userLikesResult.data?.map(l => l.insight_id) || []);
        
        const likesCountMap = new Map<string, number>();
        allLikesResult.data?.forEach(l => {
          likesCountMap.set(l.insight_id, (likesCountMap.get(l.insight_id) || 0) + 1);
        });
        
        const insightsWithProfiles = data.map(insight => ({
          ...insight,
          profiles: profilesMap.get(insight.user_id),
          is_liked: userLikedIds.has(insight.id),
          likes_count: likesCountMap.get(insight.id) || 0,
        })) as CommunityInsight[];
        
        const scoredInsights = scoreInsights(insightsWithProfiles);
        
        return {
          insights: scoredInsights,
          nextPage: data.length === INSIGHTS_PAGE_SIZE ? pageParam + 1 : undefined
        };
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });
  };

  const createInsight = useMutation({
    mutationFn: async (insight: {
      title: string;
      content: string;
      category: string;
      read_time?: string;
      cover_image?: string;
      images?: string[];
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

  // Fetch single topic with all replies including nested replies and likes
  const useTopicDetail = (topicId: string) => {
    const { user } = useAuth();
    
    return useQuery({
      queryKey: ['topic-detail', topicId, user?.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('community_topics')
          .select(`
            *,
            profiles!community_topics_user_id_fkey (user_id, full_name, email, avatar_url),
            topic_replies (
              *,
              profiles!topic_replies_user_id_fkey (user_id, full_name, email, avatar_url),
              topic_reply_likes (id, user_id)
            )
          `)
          .eq('id', topicId)
          .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        // Check which replies the current user has liked
        const repliesWithLikeStatus = data.topic_replies?.map((reply: any) => ({
          ...reply,
          is_liked: user ? reply.topic_reply_likes?.some((like: any) => like.user_id === user.id) : false,
          likes_count: reply.likes_count || reply.topic_reply_likes?.length || 0,
        })) || [];

        return {
          ...data,
          topic_replies: repliesWithLikeStatus,
        };
      },
      enabled: !!topicId,
    });
  };

  // Create a reply to a topic or another reply (nested)
  const createReply = useMutation({
    mutationFn: async ({ topicId, content, parentId }: { topicId: string; content: string; parentId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('topic_replies')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-detail'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-topics-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['my-activity'] });
    },
  });

  // Toggle like on a reply
  const toggleReplyLike = useMutation({
    mutationFn: async ({ replyId, isLiked }: { replyId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('topic_reply_likes')
          .delete()
          .eq('reply_id', replyId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('topic_reply_likes')
          .insert({
            reply_id: replyId,
            user_id: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-detail'] });
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
    useInfiniteTopics,
    createTopic,
    useTopicDetail,
    createReply,
    deleteReply,
    toggleReplyLike,
    useEvents,
    useMyRegisteredEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    useInsights,
    useInfiniteInsights,
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
