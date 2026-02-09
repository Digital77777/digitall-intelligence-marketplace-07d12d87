import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Prefetch route components via dynamic import is removed since core pages
// are already statically imported by App.tsx — dynamic re-imports would not
// create separate chunks and only generate Vite warnings.

// Cache to track which data has been prefetched
const prefetchedData = new Set<string>();

// Data prefetch keys for core routes

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  // Prefetch community data
  const prefetchCommunityData = useCallback(() => {
    if (prefetchedData.has('community')) return;
    prefetchedData.add('community');

    // Prefetch insights
    queryClient.prefetchQuery({
      queryKey: ["community-insights"],
      queryFn: async () => {
        const { data } = await supabase
          .from("community_insights")
          .select("id, title, category, cover_image, likes_count, views_count, created_at, user_id")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(20);
        return data || [];
      },
      staleTime: 1000 * 60 * 10,
    });

    // Prefetch events
    queryClient.prefetchQuery({
      queryKey: ["community-events"],
      queryFn: async () => {
        const { data } = await supabase
          .from("community_events")
          .select("id, title, event_type, event_date, location, attendees_count")
          .gte("event_date", new Date().toISOString().split('T')[0])
          .order("event_date", { ascending: true })
          .limit(10);
        return data || [];
      },
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);

  // Prefetch reels data - uses infinite query keys to match useInfiniteReels hook
  const prefetchReelsData = useCallback(() => {
    if (prefetchedData.has('reels')) return;
    prefetchedData.add('reels');

    const REELS_PAGE_SIZE = 10;

    // Prefetch first page of community_reels using infinite query key
    queryClient.prefetchInfiniteQuery({
      queryKey: ["community-reels-infinite"],
      queryFn: async ({ pageParam = 0 }) => {
        const { data, error } = await supabase
          .from("community_reels")
          .select("*")
          .order("created_at", { ascending: false, nullsFirst: false })
          .range(pageParam * REELS_PAGE_SIZE, (pageParam + 1) * REELS_PAGE_SIZE - 1);

        if (error) throw error;
        
        const reels = (data || []).map(reel => ({
          ...reel,
          created_at: reel.created_at || new Date().toISOString(),
          likes_count: reel.likes_count || 0,
          views_count: reel.views_count || 0,
        }));

        return {
          reels,
          nextPage: data && data.length === REELS_PAGE_SIZE ? pageParam + 1 : undefined
        };
      },
      initialPageParam: 0,
      staleTime: 1000 * 60 * 10,
    });

    // Prefetch first page of insight videos using infinite query key
    queryClient.prefetchInfiniteQuery({
      queryKey: ["insight-videos-for-reels-infinite"],
      queryFn: async ({ pageParam = 0 }) => {
        const { data, error } = await supabase
          .from("community_insights")
          .select("id, user_id, title, videos, video_thumbnails, likes_count, views_count, created_at")
          .not("videos", "is", null)
          .order("created_at", { ascending: false })
          .range(pageParam * REELS_PAGE_SIZE, (pageParam + 1) * REELS_PAGE_SIZE - 1);

        if (error) throw error;
        
        const reels = (data || []).flatMap((insight) => 
          (insight.videos || []).map((url: string, i: number) => ({
            id: `insight-video-${insight.id}-${i}`,
            insight_id: insight.id,
            user_id: insight.user_id,
            video_url: url,
            thumbnail_url: insight.video_thumbnails?.[i] || null,
            title: insight.title,
            created_at: insight.created_at,
            likes_count: insight.likes_count || 0,
            views_count: insight.views_count || 0,
          }))
        );

        return {
          reels,
          nextPage: data && data.length === REELS_PAGE_SIZE ? pageParam + 1 : undefined
        };
      },
      initialPageParam: 0,
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);

  // Basic marketplace data prefetch
  const prefetchMarketplaceData = useCallback(() => {
    if (prefetchedData.has('marketplace')) return;
    prefetchedData.add('marketplace');

    queryClient.prefetchQuery({
      queryKey: ["marketplace-listings-preview"],
      queryFn: async () => {
        const { data } = await supabase
          .from("marketplace_listings")
          .select("id, title, price, images, listing_type, created_at")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(12);
        return data || [];
      },
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);

  // Enhanced marketplace browse data prefetch - fetches all data needed by BrowseMarketplacePage
  const prefetchMarketplaceBrowseData = useCallback(() => {
    if (prefetchedData.has('marketplace-browse')) return;
    prefetchedData.add('marketplace-browse');

    // Prefetch categories
    queryClient.prefetchQuery({
      queryKey: ['marketplace-categories'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('marketplace_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');
        if (error) throw error;
        return data || [];
      },
      staleTime: 1000 * 60 * 10,
    });

    // Prefetch featured/suggested listings
    queryClient.prefetchQuery({
      queryKey: ['marketplace-suggested'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            category:marketplace_categories(id, name, icon)
          `)
          .eq('status', 'active')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) throw error;
        return data || [];
      },
      staleTime: 1000 * 60 * 10,
    });

    // Prefetch top chart listings (sorted by view count as proxy for popularity)
    queryClient.prefetchQuery({
      queryKey: ['marketplace-top-charts'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            category:marketplace_categories(id, name, icon)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(20);
        if (error) throw error;
        return data || [];
      },
      staleTime: 1000 * 60 * 10,
    });

    // Prefetch initial listings for browse page
    queryClient.prefetchQuery({
      queryKey: ['marketplace-listings', { page: 1, search: '' }],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            category:marketplace_categories(id, name, icon)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .range(0, 19);
        if (error) throw error;
        return data || [];
      },
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);

  const prefetchRoute = useCallback((path: string) => {
    // Prefetch associated data based on route
    if (path === '/community/reels') {
      prefetchReelsData();
    } else if (path === '/community' || path.startsWith('/community/')) {
      prefetchCommunityData();
    } else if (path === '/marketplace/browse') {
      prefetchMarketplaceBrowseData();
    } else if (path === '/marketplace' || path.startsWith('/marketplace/')) {
      prefetchMarketplaceData();
    }
  }, [prefetchReelsData, prefetchCommunityData, prefetchMarketplaceData, prefetchMarketplaceBrowseData]);

  // Prefetch core data on mount
  const prefetchCoreRoutes = useCallback(() => {
    // Delay to not block initial render
    setTimeout(() => {
      prefetchCommunityData();
      prefetchMarketplaceData();
      prefetchMarketplaceBrowseData();
      prefetchReelsData();
    }, 1000);
  }, [prefetchCommunityData, prefetchMarketplaceData, prefetchMarketplaceBrowseData, prefetchReelsData]);

  const handleMouseEnter = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  const handleTouchStart = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  return {
    prefetchRoute,
    prefetchReelsData,
    prefetchCommunityData,
    prefetchMarketplaceData,
    prefetchMarketplaceBrowseData,
    prefetchCoreRoutes,
    handleMouseEnter,
    handleTouchStart,
  };
};

// Hook to auto-prefetch on app load
export const useAutoPrefetch = () => {
  const { prefetchCoreRoutes } = usePrefetch();

  useEffect(() => {
    prefetchCoreRoutes();
  }, [prefetchCoreRoutes]);
};
