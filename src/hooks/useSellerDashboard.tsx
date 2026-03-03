import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SellerListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface SellerFreelancerProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  hourly_rate: number;
  experience: string;
  location: string;
  skills: string[];
  languages: string[];
  availability: string;
  profile_picture: string;
  is_active: boolean;
}

export interface SellerStats {
  totalListings: number;
  activeListings: number;
  totalEarnings: number;
  unreadMessages: number;
  totalViews: number;
  pendingProposals: number;
  pendingJobApplications: number;
  averageResponseTime: number;
  proposalAcceptanceRate: number;
}

export const useSellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [profile, setProfile] = useState<SellerFreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SellerStats>({
    totalListings: 0,
    activeListings: 0,
    totalEarnings: 0,
    unreadMessages: 0,
    totalViews: 0,
    pendingProposals: 0,
    pendingJobApplications: 0,
    averageResponseTime: 0,
    proposalAcceptanceRate: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      } else {
        setProfile(profileData);
      }

      const { data: listingsData, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;
      setListings(listingsData || []);

      const activeListings = listingsData?.filter(l => l.status === 'active').length || 0;

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id)
        .eq('is_read', false);

      const { count: proposalsCount } = await supabase
        .from('freelancer_proposals')
        .select('*', { count: 'exact', head: true })
        .eq('freelancer_user_id', user?.id)
        .eq('status', 'pending');

      const { data: userJobs } = await supabase
        .from('marketplace_listings')
        .select('id')
        .eq('user_id', user?.id)
        .eq('listing_type', 'job');

      let jobApplicationsCount = 0;
      if (userJobs && userJobs.length > 0) {
        const jobIds = userJobs.map(j => j.id);
        const { count } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .in('job_listing_id', jobIds)
          .eq('status', 'pending');
        jobApplicationsCount = count || 0;
      }

      setStats({
        totalListings: listingsData?.length || 0,
        activeListings,
        totalEarnings: 0,
        unreadMessages: unreadCount || 0,
        totalViews: 0,
        pendingProposals: proposalsCount || 0,
        pendingJobApplications: jobApplicationsCount,
        averageResponseTime: 0,
        proposalAcceptanceRate: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateJobApplicationCount = (count: number) => {
    setStats(prev => ({ ...prev, pendingJobApplications: count }));
  };

  return { user, listings, profile, loading, stats, updateJobApplicationCount };
};
