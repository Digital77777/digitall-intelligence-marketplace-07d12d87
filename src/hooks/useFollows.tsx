import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface FollowRecord {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const useFollowStatus = (userId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["follow-status", user?.id, userId],
    queryFn: async () => {
      if (!user || !userId || user.id === userId) return null;

      const { data, error } = await supabase
        .from("user_follows")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as FollowRecord | null;
    },
    enabled: !!user && !!userId && user.id !== userId,
    staleTime: 30000,
  });
};

// Check if a user follows the current user (for "Follow Back" detection)
export const useIsFollowedBy = (userId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-followed-by", user?.id, userId],
    queryFn: async () => {
      if (!user || !userId || user.id === userId) return false;

      const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", userId)
        .eq("following_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!userId && user.id !== userId,
    staleTime: 30000,
  });
};


  return useQuery({
    queryKey: ["followers-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
};

export const useFollowingCount = (userId: string) => {
  return useQuery({
    queryKey: ["following-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
};

export const useFollowUser = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("Must be logged in to follow");
      if (user.id === userId) throw new Error("Cannot follow yourself");

      // Check if already following
      const { data: existing } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();

      if (existing) {
        throw new Error("Already following this user");
      }

      const { data, error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: user.id,
          following_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Follow insert error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["follow-status"] });
      queryClient.invalidateQueries({ queryKey: ["followers-count", userId] });
      queryClient.invalidateQueries({ queryKey: ["following-count"] });
      toast({
        title: "Following",
        description: "You are now following this user",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      });
      console.error("Follow error:", error);
    },
  });
};

export const useUnfollowUser = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("Must be logged in to unfollow");

      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);

      if (error) {
        console.error("Unfollow error:", error);
        throw error;
      }
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["follow-status"] });
      queryClient.invalidateQueries({ queryKey: ["followers-count", userId] });
      queryClient.invalidateQueries({ queryKey: ["following-count"] });
      toast({
        title: "Unfollowed",
        description: "You have unfollowed this user",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user",
        variant: "destructive",
      });
      console.error("Unfollow error:", error);
    },
  });
};

// Legacy hook for backward compatibility - deprecated
export const useFollows = () => {
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  return {
    useFollowStatus,
    useFollowersCount,
    useFollowingCount,
    followUser,
    unfollowUser,
  };
};
