import { createContext, useContext, ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface TierContextType {
  tierName: string | null;
  maxToolsAccess: number;
  maxListings: number;
  canAccessFeature: (feature: string) => boolean;
  loading: boolean;
  isAdminEmail: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

export const TierProvider = ({ children }: { children: ReactNode }) => {
  const { subscription, loading, isAdminEmail } = useSubscription();

  // Default to 'starter' tier features when no subscription exists yet
  // This prevents blocking new users during the brief period before DB trigger assigns tier
  const tierName = subscription?.tier?.name || null;
  const effectiveTierName = tierName || 'starter';
  
  // Use DB values if available, otherwise fall back to starter defaults
  const maxToolsAccess = isAdminEmail ? 999999 : (subscription?.tier?.max_tools_access || 3);
  const maxListings = isAdminEmail ? 999999 : (subscription?.tier?.max_listings || 1);

  const tierFeatures: Record<string, string[]> = {
    starter: [
      'basic_tools', 
      'basic_learning_paths', 
      'community', 
      'marketplace_buy',
      'hire_freelancers',
      'browse_freelancers'
    ],
    creator: [
      'basic_tools', 
      'advanced_tools', 
      'all_learning_paths', 
      'community', 
      'marketplace_buy', 
      'marketplace_sell',
      'hire_freelancers',
      'browse_freelancers',
      'post_jobs',
      'referrals',
      'creator_badge',
      'priority_support'
    ],
    career: [
      'basic_tools', 
      'advanced_tools', 
      'unlimited_tools',
      'all_learning_paths', 
      'career_certification',
      'community', 
      'marketplace_buy', 
      'marketplace_sell',
      'hire_freelancers',
      'browse_freelancers',
      'post_jobs',
      'unlimited_listings',
      'referrals', 
      'premium_support', 
      'personal_ai_tutor',
      'job_placement',
      'analytics', 
      'priority_access'
    ]
  };

  const canAccessFeature = (feature: string): boolean => {
    // Admins have access to all features
    if (isAdminEmail) return true;
    
    // Use effective tier (defaults to starter) to prevent blocking unassigned users
    return tierFeatures[effectiveTierName]?.includes(feature) || false;
  };

  return (
    <TierContext.Provider value={{ tierName, maxToolsAccess, maxListings, canAccessFeature, loading, isAdminEmail }}>
      {children}
    </TierContext.Provider>
  );
};

export const useTier = () => {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
};
