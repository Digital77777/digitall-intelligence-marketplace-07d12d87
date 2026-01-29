import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface HeroScore {
  id: string;
  user_id: string;
  questions_answered: number;
  helpful_replies: number;
  topics_created: number;
  insights_shared: number;
  total_score: number;
  current_tier: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  icon: string;
  difficulty: string;
  is_active: boolean;
  status?: 'not_started' | 'in_progress' | 'completed';
  progress?: number;
}

interface AmbassadorApplication {
  id: string;
  user_id: string;
  status: string;
  application_text: string;
  social_links: unknown;
  motivation?: string | null;
  experience?: string;
  created_at: string;
}

interface AmbassadorStats {
  id: string;
  user_id: string;
  month: string;
  referrals_count: number;
  content_created: number;
  events_hosted: number;
  community_engagement: number;
  total_earnings: number;
  tier: string;
}

export const useCommunityPrograms = () => {
  const { user } = useAuth();
  const [heroScore, setHeroScore] = useState<HeroScore | null>(null);
  const [heroLeaderboard, setHeroLeaderboard] = useState<HeroScore[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [ambassadorApplication, setAmbassadorApplication] = useState<AmbassadorApplication | null>(null);
  const [ambassadorStats, setAmbassadorStats] = useState<AmbassadorStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch hero score
  const fetchHeroScore = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('community_hero_scores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setHeroScore(data);
    } catch (error) {
      console.error('Error fetching hero score:', error);
    }
  };

  // Fetch hero leaderboard
  const fetchHeroLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('community_hero_scores')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHeroLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  // Fetch quests with user progress
  const fetchQuests = async () => {
    try {
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true);

      if (questsError) throw questsError;

      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_quest_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError && progressError.code !== 'PGRST116') throw progressError;

        const questsWithProgress = (questsData || []).map(quest => {
          const progress = progressData?.find(p => p.quest_id === quest.id);
          return {
            ...quest,
            status: progress?.status || 'not_started',
            progress: progress?.progress_value || 0
          };
        });

        setQuests(questsWithProgress as Quest[]);
      } else {
        setQuests((questsData || []) as Quest[]);
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
    }
  };

  // Fetch ambassador application
  const fetchAmbassadorApplication = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ambassador_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setAmbassadorApplication(data);
    } catch (error) {
      console.error('Error fetching ambassador application:', error);
    }
  };

  // Fetch ambassador stats
  const fetchAmbassadorStats = async () => {
    if (!user) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data, error } = await supabase
        .from('ambassador_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setAmbassadorStats(data);
    } catch (error) {
      console.error('Error fetching ambassador stats:', error);
    }
  };

  // Submit ambassador application
  const submitAmbassadorApplication = async (
    applicationText: string, 
    motivation: string, 
    experience: string,
    socialLinks: Record<string, string>
  ) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('ambassador_applications')
        .insert({
          user_id: user.id,
          application_text: applicationText,
          motivation,
          experience,
          social_links: socialLinks,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      setAmbassadorApplication(data);
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
      return { error: errorMessage };
    }
  };

  // Start a quest
  const startQuest = async (questId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('user_quest_progress')
        .insert({
          user_id: user.id,
          quest_id: questId,
          status: 'in_progress',
          progress_value: 0
        })
        .select()
        .single();

      if (error) throw error;
      await fetchQuests();
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start quest';
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchHeroScore(),
        fetchHeroLeaderboard(),
        fetchQuests(),
        fetchAmbassadorApplication(),
        fetchAmbassadorStats()
      ]);
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  return {
    heroScore,
    heroLeaderboard,
    quests,
    ambassadorApplication,
    ambassadorStats,
    loading,
    fetchHeroScore,
    fetchQuests,
    submitAmbassadorApplication,
    startQuest
  };
};
