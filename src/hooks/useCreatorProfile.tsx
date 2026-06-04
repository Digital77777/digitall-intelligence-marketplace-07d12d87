import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CreatorProfileData {
  user_id: string;
  creator_type?: string | null;
  project_details?: any;
  goals?: any;
  business_stage?: string | null;
  revenue_stage?: string | null;
  skills?: any;
  creator_category?: string | null;
  creator_score?: number | null;
  ai_summary?: string | null;
  recommended_paths?: any;
  recommended_marketplace?: any;
  recommended_communities?: any;
  growth_opportunities?: any;
  dashboard_config?: any;
  onboarding_completed?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const FIELD_WEIGHTS: Array<[keyof CreatorProfileData | string, (p: any) => boolean]> = [
  ['creator_type', (p) => !!p?.creator_type],
  ['project_name', (p) => !!p?.project_details?.name],
  ['project_description', (p) => !!p?.project_details?.description],
  ['goals', (p) => Array.isArray(p?.goals) && p.goals.length > 0],
  ['business_stage', (p) => !!p?.business_stage],
  ['revenue_stage', (p) => !!p?.revenue_stage],
  ['skills', (p) => Array.isArray(p?.skills) && p.skills.length > 0],
  ['ai_recommendations', (p) => !!p?.ai_summary && Array.isArray(p?.recommended_paths) && p.recommended_paths.length > 0],
];

export function getOnboardingCompletion(profile: CreatorProfileData | null) {
  if (!profile) return { percent: 0, filled: 0, total: FIELD_WEIGHTS.length, missing: FIELD_WEIGHTS.map(f => f[0] as string) };
  const filled = FIELD_WEIGHTS.filter(([, fn]) => fn(profile)).length;
  const missing = FIELD_WEIGHTS.filter(([, fn]) => !fn(profile)).map(([k]) => k as string);
  return { percent: Math.round((filled / FIELD_WEIGHTS.length) * 100), filled, total: FIELD_WEIGHTS.length, missing };
}

export function useCreatorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CreatorProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any)
      .from('creator_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data || null);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { profile, loading, refresh, completion: getOnboardingCompletion(profile) };
}
