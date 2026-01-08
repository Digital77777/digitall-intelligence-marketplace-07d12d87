import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SponsoredAccount {
  user_id: string;
  badge_label: string;
  account_type: string;
  priority_in_search: number;
}

export const useOfficialAccounts = () => {
  return useQuery({
    queryKey: ["sponsored-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsored_accounts")
        .select("user_id, badge_label, account_type, priority_in_search")
        .eq("is_active", true);

      if (error) throw error;
      return data as SponsoredAccount[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useIsOfficialAccount = (userId: string | undefined) => {
  const { data: accounts } = useOfficialAccounts();
  
  if (!userId || !accounts) return { isOfficial: false, badgeLabel: undefined };
  
  const account = accounts.find(a => a.user_id === userId);
  return {
    isOfficial: !!account,
    badgeLabel: account?.badge_label,
    accountType: account?.account_type,
  };
};

// Helper function to check if a user is official (for use in components)
export const checkIsOfficial = (
  userId: string | undefined,
  accounts: SponsoredAccount[] | undefined
): { isOfficial: boolean; badgeLabel?: string } => {
  if (!userId || !accounts) return { isOfficial: false };
  
  const account = accounts.find(a => a.user_id === userId);
  return {
    isOfficial: !!account,
    badgeLabel: account?.badge_label,
  };
};
