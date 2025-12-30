import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useFollows = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current user is following a specific user
  const useFollowStatus = (userId: string) => {
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
        return data;
      },
      enabled: !!user && !!userId && user.id !== userId,
    });
  };

  // Get followers count for a user
  const useFollowersCount = (userId: string) => {
    return useQuery({
      queryKey: ["followers-count", userId],
      queryFn: async () => {
        const { count, error } = await supabase
          .from("user_follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId);

        if (error) throw error;
        return count || 0;
      },
      enabled: !!userId,
    });
  };

  // Get following count for a user
  const useFollowingCount = (userId: string) => {
    return useQuery({
      queryKey: ["following-count", userId],
      queryFn: async () => {
        const { count, error } = await supabase
          .from("user_follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", userId);

        if (error) throw error;
        return count || 0;
      },
      enabled: !!userId,
    });
  };

  // Follow a user
  const followUser = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["following-count", user?.id] });
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

  // Unfollow a user
  const unfollowUser = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["following-count", user?.id] });
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

  return {
    useFollowStatus,
    useFollowersCount,
    useFollowingCount,
    followUser,
    unfollowUser,
  };
};
