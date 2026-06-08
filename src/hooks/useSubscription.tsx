import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

  const { data: isAdminEmail = false } = useQuery({
    queryKey: ['admin-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_admin_email');
      if (error) throw error;
      return data || false;
    },
    enabled: !!user,
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return (data || []).map(tier => ({
        ...tier,
        features: Array.isArray(tier.features) ? tier.features : []
      })) as SubscriptionTier[];
    },
  });

  const { data: subscription = null, isLoading: loadingSubscription } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        return {
          ...data,
          tier: data.tier as SubscriptionTier
        } as UserSubscription;
      }

      // If no subscription, assign starter tier
      return await assignStarterTier();
    },
    enabled: !!user && tiers.length > 0,
  });

  const assignStarterTier = async (): Promise<UserSubscription | null> => {
    try {
      let starterTier = tiers.find(t => t.name === 'starter');
      
      if (!starterTier) {
        const { data: tierData } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('name', 'starter')
          .single();
        
        if (!tierData) return null;
        starterTier = tierData as SubscriptionTier;
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user!.id,
          tier_id: starterTier.id,
          status: 'active'
        })
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          const { data: existing } = await supabase
            .from('user_subscriptions')
            .select('*, tier:subscription_tiers(*)')
            .eq('user_id', user!.id)
            .single();
          return existing as UserSubscription;
        }
        throw error;
      }
      
      return data as UserSubscription;
    } catch (error) {
      console.error('Error assigning starter tier:', error);
      return null;
    }
  };

  const changeTierMutation = useMutation({
    mutationFn: async (tierId: string) => {
      if (!user) throw new Error('Please sign in to change tiers');

      const newTier = tiers.find(t => t.id === tierId);
      if (!newTier) throw new Error('Invalid tier selected');

      if (!isAdminEmail && newTier.price > 0) {
        throw new Error('PAYMENT_REQUIRED');
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
      return newTier;
    },
    onSuccess: (newTier) => {
      toast.success(`Successfully switched to ${newTier.display_name} tier!`);
      queryClient.invalidateQueries({ queryKey: ['user-subscription', user?.id] });
    },
    onError: (error: any) => {
      if (error.message === 'PAYMENT_REQUIRED') {
        toast.info('Payment processing would happen here');
      } else {
        toast.error(error.message || 'Failed to change tier');
      }
    }
  });

  return {
    subscription,
    tiers,
    loading: loadingSubscription,
    isAdminEmail,
    changeTier: async (tierId: string) => {
      try {
        await changeTierMutation.mutateAsync(tierId);
        return true;
      } catch {
        return false;
      }
    },
    refreshSubscription: () => queryClient.invalidateQueries({ queryKey: ['user-subscription', user?.id] })
  };
};
