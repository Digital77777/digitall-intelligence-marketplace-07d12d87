import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type SuccessStoryType =
  | "job_secured"
  | "freelance_gig"
  | "business_launched"
  | "certification_earned"
  | "revenue_milestone";

export interface SuccessStory {
  id: string;
  user_id: string;
  type: SuccessStoryType;
  title: string;
  body: string | null;
  amount: number | null;
  currency: string | null;
  media_url: string | null;
  status: "pending" | "approved" | "featured";
  likes_count: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useSuccessStories = (opts?: {
  type?: SuccessStoryType | "all";
  limit?: number;
}) => {
  return useQuery<SuccessStory[]>({
    queryKey: ["success-stories", opts?.type ?? "all", opts?.limit ?? 50],
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("success_stories" as any)
        .select("*")
        .in("status", ["approved", "featured"])
        .order("created_at", { ascending: false })
        .limit(opts?.limit ?? 50);
      if (opts?.type && opts.type !== "all") q = q.eq("type", opts.type);
      const { data } = await q;
      const stories = ((data as any) ?? []) as SuccessStory[];

      // Hydrate author profiles
      const userIds = Array.from(new Set(stories.map((s) => s.user_id)));
      if (userIds.length === 0) return stories;
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id,full_name,avatar_url")
        .in("user_id", userIds);
      const map = new Map(
        ((profiles as any[]) ?? []).map((p) => [p.user_id, p])
      );
      return stories.map((s) => ({ ...s, profile: map.get(s.user_id) ?? null }));
    },
  });
};

export const useCreateSuccessStory = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      type: SuccessStoryType;
      title: string;
      body?: string;
      amount?: number;
      currency?: string;
      media_url?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("success_stories" as any)
        .insert({
          user_id: user.id,
          status: "approved", // auto-approve self-shared wins; admins can flag/feature
          ...payload,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Your win has been shared on the Success Wall!");
      qc.invalidateQueries({ queryKey: ["success-stories"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to share story"),
  });
};
