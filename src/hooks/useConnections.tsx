import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type ConnectionStatus = "pending" | "accepted" | "ignored";

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  requester?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  recipient?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ConnectionWithProfile extends Connection {
  requester?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get connection status with a specific user
  const useConnectionStatus = (userId: string) => {
    return useQuery({
      queryKey: ["connection-status", user?.id, userId],
      queryFn: async () => {
        if (!user || !userId || user.id === userId) return null;

        const { data, error } = await supabase
          .from("user_connections")
          .select("*")
          .or(
            `and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`
          )
          .maybeSingle();

        if (error) {
          console.error("Connection status error:", error);
          throw error;
        }
        return data;
      },
      enabled: !!user && !!userId && user.id !== userId,
    });
  };

  // Get pending connection requests (received)
  const usePendingRequests = () => {
    return useQuery<ConnectionWithProfile[]>({
      queryKey: ["pending-connection-requests"],
      queryFn: async () => {
        if (!user) return [];

        const { data, error } = await supabase
          .from("user_connections")
          .select("*")
          .eq("recipient_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch requester profiles
        if (data && data.length > 0) {
          const requesterIds = data.map((conn) => conn.requester_id);
          const { data: profiles } = await supabase
            .from("public_profiles")
            .select("user_id, full_name, avatar_url")
            .in("user_id", requesterIds);

          return data.map((conn) => ({
            ...conn,
            requester: profiles?.find((p) => p.user_id === conn.requester_id) || null,
          })) as ConnectionWithProfile[];
        }

        return data as ConnectionWithProfile[] || [];
      },
      enabled: !!user,
    });
  };

  // Get all accepted connections
  const useAcceptedConnections = () => {
    return useQuery({
      queryKey: ["accepted-connections"],
      queryFn: async () => {
        if (!user) return [];

        const { data, error } = await supabase
          .from("user_connections")
          .select("*")
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) return [];

        // Get the other user's ID for each connection
        const otherUserIds = data.map((conn) =>
          conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
        );

        const { data: profiles } = await supabase
          .from("public_profiles")
          .select("user_id, full_name, avatar_url, headline")
          .in("user_id", otherUserIds);

        return data.map((conn) => {
          const otherUserId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
          const profile = profiles?.find((p) => p.user_id === otherUserId);
          return {
            ...conn,
            connected_user: profile || null,
          };
        });
      },
      enabled: !!user,
    });
  };

  // Send connection request
  const sendConnectionRequest = useMutation({
    mutationFn: async (recipientId: string) => {
      if (!user) throw new Error("Must be logged in");
      if (user.id === recipientId) throw new Error("Cannot connect with yourself");

      // Check if connection already exists in either direction
      const { data: existing } = await supabase
        .from("user_connections")
        .select("id, status")
        .or(
          `and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`
        )
        .maybeSingle();

      if (existing) {
        throw new Error(
          existing.status === "pending" 
            ? "Connection request already pending" 
            : existing.status === "accepted" 
              ? "Already connected" 
              : "Connection was previously declined"
        );
      }

      const { data, error } = await supabase
        .from("user_connections")
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Connection request error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (_, recipientId) => {
      // Invalidate all connection-related queries with specific user
      queryClient.invalidateQueries({ queryKey: ["connection-status"] });
      queryClient.invalidateQueries({ queryKey: ["connection-status", user?.id, recipientId] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["accepted-connections"] });
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      });
    },
  });

  // Accept connection request
  const acceptConnectionRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from("user_connections")
        .update({ status: "accepted" })
        .eq("id", connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["connection-status"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: "Connection Accepted",
        description: "You are now connected!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept connection request",
        variant: "destructive",
      });
    },
  });

  // Ignore connection request
  const ignoreConnectionRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from("user_connections")
        .update({ status: "ignored" })
        .eq("id", connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["connection-status"] });
      toast({
        title: "Request Ignored",
        description: "Connection request has been ignored.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to ignore connection request",
        variant: "destructive",
      });
    },
  });

  return {
    useConnectionStatus,
    usePendingRequests,
    useAcceptedConnections,
    sendConnectionRequest,
    acceptConnectionRequest,
    ignoreConnectionRequest,
  };
};
