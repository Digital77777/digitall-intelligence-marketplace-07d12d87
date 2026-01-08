import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveMember {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  contributions: number;
  is_top_contributor: boolean;
  joined_at: string;
  is_official?: boolean;
  badge_label?: string;
}

export const useActiveMembers = (searchQuery?: string) => {
  return useQuery({
    queryKey: ["active-members", searchQuery],
    queryFn: async () => {
      // Fetch all profiles from public_profiles view (RLS-compliant for discovery)
      let query = supabase
        .from("public_profiles")
        .select("user_id, full_name, avatar_url, headline, created_at")
        .not("user_id", "is", null);

      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("full_name", `%${searchQuery}%`);
      }

      const { data: profiles, error } = await query;

      if (error) throw error;

      // Fetch sponsored accounts for official status
      const { data: sponsoredAccounts } = await supabase
        .from("sponsored_accounts")
        .select("user_id, badge_label, priority_in_search")
        .eq("is_active", true);

      const sponsoredMap = new Map(
        sponsoredAccounts?.map((sa) => [sa.user_id, sa]) || []
      );

      // For each profile, get their contributions using RPC
      const membersWithContributions = await Promise.all(
        profiles.map(async (profile) => {
          const { data: contributions, error: rpcError } = await supabase.rpc(
            "get_user_contributions",
            { p_user_id: profile.user_id }
          );

          const sponsored = sponsoredMap.get(profile.user_id);

          if (rpcError) {
            console.error("Error fetching contributions:", rpcError);
            return {
              user_id: profile.user_id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              headline: profile.headline,
              contributions: 0,
              is_top_contributor: false,
              joined_at: profile.created_at,
              is_official: !!sponsored,
              badge_label: sponsored?.badge_label,
              priority_in_search: sponsored?.priority_in_search || 0,
            };
          }

          return {
            user_id: profile.user_id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            headline: profile.headline,
            contributions: contributions || 0,
            is_top_contributor: (contributions || 0) >= 10,
            joined_at: profile.created_at,
            is_official: !!sponsored,
            badge_label: sponsored?.badge_label,
            priority_in_search: sponsored?.priority_in_search || 0,
          };
        })
      );

      // Sort by priority (official accounts first), then by contributions
      return membersWithContributions.sort((a, b) => {
        // Official accounts first
        if (a.priority_in_search !== b.priority_in_search) {
          return (b.priority_in_search || 0) - (a.priority_in_search || 0);
        }
        // Then by contributions
        return b.contributions - a.contributions;
      });
    },
  });
};
