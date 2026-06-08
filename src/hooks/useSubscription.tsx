import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SubscriptionTier {
  id: string;
  name: string;
  display_name: string;
  price: number;
  currency: string;
  features: string[];
  max_tools_access: number;
  max_listings: number;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  tier?: SubscriptionTier;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminEmail, setIsAdminEmail] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
      checkAdminStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin_email');
      if (!error) {
        setIsAdminEmail(data || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // Fetch available tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (tiersError) throw tiersError;
      
      // Parse features from JSON
      const parsedTiers = (tiersData || []).map(tier => ({
        ...tier,
        features: Array.isArray(tier.features) ? tier.features : []
      })) as SubscriptionTier[];
      
      setTiers(parsedTiers);

      // Fetch user's subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') throw subError;
      
      if (subData) {
        setSubscription({
          ...subData,
          tier: subData.tier as SubscriptionTier
        });
      } else if (user?.id) {
        // Auto-assign starter tier if no subscription
        await assignStarterTier(user.id);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching subscription:', error);
      }
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const assignStarterTier = async (userId: string) => {
    try {
      // Fetch starter tier
      const { data: tierData, error: tierError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('name', 'starter')
        .single();
      
      if (tierError || !tierData) {
        console.error('Starter tier not found in database', tierError);
        return;
      }
      const starterTier = tierData as SubscriptionTier;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          tier_id: starterTier.id,
          status: 'active'
        })
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .single();

      if (error) {
        // Handle duplicate key error gracefully (user already has subscription)
        if (error.code === '23505') {
          await fetchSubscriptionData();
          return;
        }
        throw error;
      }
      
      setSubscription({
        ...data,
        tier: data.tier as SubscriptionTier
      });
    } catch (error) {
      console.error('Error assigning starter tier:', error);
    }
  };

  const changeTier = async (tierId: string) => {
    if (!user) {
      toast.error('Please sign in to change tiers');
      return false;
    }

    try {
      const newTier = tiers.find(t => t.id === tierId);
      if (!newTier) {
        toast.error('Invalid tier selected');
        return false;
      }

      // Admin email can change tiers freely
      if (!isAdminEmail && newTier.price > 0) {
        toast.info('Payment processing would happen here');
        // In production, integrate with payment gateway
        return false;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          tier_id: tierId,
          status: 'active',
          started_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success(`Successfully switched to ${newTier.display_name} tier!`);
      await fetchSubscriptionData();
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error changing tier:', error);
      }
      toast.error('Failed to change tier');
      return false;
    }
  };

  return {
    subscription,
    tiers,
    loading,
    isAdminEmail,
    changeTier,
    refreshSubscription: fetchSubscriptionData
  };
};
