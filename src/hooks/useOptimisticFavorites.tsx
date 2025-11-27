import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useOptimisticFavorites = () => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [pendingActions, setPendingActions] = useState<Map<string, 'add' | 'remove'>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's favorites on mount
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setIsLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace_favorites')
          .select('listing_id')
          .eq('user_id', user.id);

        if (error) throw error;
        setFavoriteIds(new Set(data?.map(f => f.listing_id) || []));
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const isFavorited = useCallback((listingId: string) => {
    const pending = pendingActions.get(listingId);
    if (pending === 'add') return true;
    if (pending === 'remove') return false;
    return favoriteIds.has(listingId);
  }, [favoriteIds, pendingActions]);

  const toggleFavorite = useCallback(async (listingId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }

    const currentlyFavorited = isFavorited(listingId);
    const action = currentlyFavorited ? 'remove' : 'add';

    // Optimistic update - immediately update UI
    setPendingActions(prev => new Map(prev).set(listingId, action));
    
    if (action === 'add') {
      setFavoriteIds(prev => new Set(prev).add(listingId));
    } else {
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }

    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('marketplace_favorites')
          .insert([{ user_id: user.id, listing_id: listingId }]);
        
        if (error) throw error;
        toast({
          title: "Added to favorites",
          description: "Item saved to your favorites"
        });
      } else {
        const { error } = await supabase
          .from('marketplace_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
        
        if (error) throw error;
        toast({
          title: "Removed from favorites",
          description: "Item removed from your favorites"
        });
      }
    } catch (err) {
      // Rollback on error
      if (action === 'add') {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
      } else {
        setFavoriteIds(prev => new Set(prev).add(listingId));
      }
      
      toast({
        title: "Action failed",
        description: "Could not update favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPendingActions(prev => {
        const newMap = new Map(prev);
        newMap.delete(listingId);
        return newMap;
      });
    }
  }, [user, isFavorited]);

  const isPending = useCallback((listingId: string) => {
    return pendingActions.has(listingId);
  }, [pendingActions]);

  return {
    isFavorited,
    toggleFavorite,
    isPending,
    isLoading,
    favoriteIds
  };
};
