import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PartnerStats {
  clicks: number;
  registrations: number;
  active: number;
  revenue: number;
  conversionRate: number;
  referralCode: string;
  referralLink: string;
  isAmbassador: boolean;
  referrals: any[];
}

const AMBASSADOR_THRESHOLD_ACTIVE = 10;
const AMBASSADOR_THRESHOLD_REVENUE = 1000;

export const usePartnerStats = () => {
  const { user } = useAuth();

  return useQuery<PartnerStats>({
    queryKey: ["partner-stats", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: referrals } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });

      const refs = (referrals as any[]) ?? [];
      const code = refs[0]?.referral_code ?? "";

      let clicks = 0;
      if (code) {
        const { count } = await supabase
          .from("referral_clicks" as any)
          .select("id", { count: "exact", head: true })
          .eq("referral_code", code);
        clicks = count ?? 0;
      }

      const registrations = refs.filter((r) => r.status === "completed").length;
      const active = refs.filter((r) => r.activated_at).length;
      const revenue = refs.reduce(
        (sum, r) => sum + Number(r.revenue_attributed ?? 0),
        0
      );

      return {
        clicks,
        registrations,
        active,
        revenue,
        conversionRate: clicks ? (registrations / clicks) * 100 : 0,
        referralCode: code,
        referralLink: code
          ? `${window.location.origin}/auth?ref=${code}`
          : "",
        isAmbassador:
          active >= AMBASSADOR_THRESHOLD_ACTIVE ||
          revenue >= AMBASSADOR_THRESHOLD_REVENUE,
        referrals: refs,
      };
    },
  });
};
