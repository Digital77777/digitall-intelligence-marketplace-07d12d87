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

// Standalone hook for connection status - can be called at component top level
export const useConnectionStatus = (userId: string) => {
  const { user } = useAuth();

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
      return data as Connection | null;
    },
    enabled: !!user && !!userId && user.id !== userId,
    staleTime: 30000,
  });
};

// Standalone hook for pending requests
export const usePendingRequests = () => {
  const { user } = useAuth();

  return useQuery<ConnectionWithProfile[]>({
    queryKey: ["pending-connection-requests", user?.id],
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

      return (data as ConnectionWithProfile[]) || [];
    },
    enabled: !!user,
    staleTime: 30000,
  });
};

// Standalone hook for accepted connections
export const useAcceptedConnections = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["accepted-connections", user?.id],
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
        const otherUserId =
          conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
        const profile = profiles?.find((p) => p.user_id === otherUserId);
        return {
          ...conn,
          connected_user: profile || null,
        };
      });
    },
    enabled: !!user,
    staleTime: 30000,
  });
};

// Standalone mutation hook for sending connection requests
export const useSendConnectionRequest = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
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
        if (existing.status === "ignored") {
          // Allow re-requesting after being ignored - delete old and create new
          await supabase.from("user_connections").delete().eq("id", existing.id);
        } else {
          throw new Error(
            existing.status === "pending"
              ? "Connection request already pending"
              : "Already connected"
          );
        }
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-status"] });
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
};

// Standalone mutation hook for accepting connection requests
export const useAcceptConnectionRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["accepted-connections"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: "Connection Accepted",
        description: "You are now connected!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept connection request",
        variant: "destructive",
      });
    },
  });
};

// Standalone mutation hook for ignoring connection requests
export const useIgnoreConnectionRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to ignore connection request",
        variant: "destructive",
      });
    },
  });
};

// Legacy hook for backward compatibility - deprecated, use standalone hooks instead
export const useConnections = () => {
  const sendConnectionRequest = useSendConnectionRequest();
  const acceptConnectionRequest = useAcceptConnectionRequest();
  const ignoreConnectionRequest = useIgnoreConnectionRequest();

  return {
    useConnectionStatus,
    usePendingRequests,
    useAcceptedConnections,
    sendConnectionRequest,
    acceptConnectionRequest,
    ignoreConnectionRequest,
  };
};
