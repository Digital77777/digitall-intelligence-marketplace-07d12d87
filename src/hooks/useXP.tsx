import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface XPEvent {
  id: string;
  amount: number;
  source: string;
  source_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface XPSummary {
  total: number;
  week: number;
  level: string;
  recent: XPEvent[];
}

export const useXP = () => {
  const { user } = useAuth();

  return useQuery<XPSummary>({
    queryKey: ["xp-summary", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const [{ data: profile }, { data: events }] = await Promise.all([
        supabase
          .from("profiles")
          .select("xp_total,xp_week,level_slug")
          .eq("user_id", user!.id)
          .maybeSingle(),
        supabase
          .from("xp_events" as any)
          .select("id,amount,source,source_id,metadata,created_at")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(25),
      ]);

      return {
        total: (profile as any)?.xp_total ?? 0,
        week: (profile as any)?.xp_week ?? 0,
        level: (profile as any)?.level_slug ?? "explorer",
        recent: (events as any) ?? [],
      };
    },
  });
};
