import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Route-to-component mapping for prefetching
const routeImports: Record<string, () => Promise<any>> = {
  '/': () => import('@/pages/Index'),
  '/dashboard': () => import('@/pages/DashboardPage'),
  '/learning-paths': () => import('@/pages/LearningPaths'),
  '/ai-tools': () => import('@/pages/AIToolsPage'),
  '/marketplace': () => import('@/pages/MarketplacePage'),
  '/marketplace/schedule-consultation': () => import('@/pages/ScheduleConsultationPage'),
  '/marketplace/browse': () => import('@/pages/BrowseMarketplacePage'),
  '/marketplace/browse-freelancers': () => import('@/pages/BrowseFreelancersPage'),
  '/marketplace/create': () => import('@/pages/CreateListingPage'),
  '/marketplace/my-listings': () => import('@/pages/MyListingsPage'),
  '/marketplace/jobs': () => import('@/pages/JobListingsPage'),
  '/marketplace/sell-products': () => import('@/pages/SellProductsPage'),
  '/marketplace/freelance-services': () => import('@/pages/FreelanceServicesPage'),
  '/marketplace/post-jobs': () => import('@/pages/PostJobsPage'),
  '/marketplace/ai-development': () => import('@/pages/AIDevelopmentPage'),
  '/community': () => import('@/pages/CommunityPage'),
  '/community/my-activity': () => import('@/pages/MyActivityPage'),
  '/community/inbox': () => import('@/pages/community/InboxPage'),
  '/community/browse-events': () => import('@/pages/community/BrowseEventsPage'),
  '/community/find-members': () => import('@/pages/community/FindMembersPage'),
  '/community/reels': () => import('@/pages/community/ReelsPage'),
  '/community/share-insight': () => import('@/pages/community/ShareInsightPage'),
  '/community/start-topic': () => import('@/pages/community/StartTopicPage'),
  '/community/host-event': () => import('@/pages/community/HostEventPage'),
  '/referrals': () => import('@/pages/ReferralPage'),
  '/subscription': () => import('@/pages/SubscriptionPage'),
  '/analytics': () => import('@/pages/AnalyticsPage'),
  '/support': () => import('@/pages/SupportPage'),
  '/career-certification': () => import('@/pages/CareerCertificationPage'),
  '/job-placement': () => import('@/pages/JobPlacementPage'),
  '/strategy-sessions': () => import('@/pages/StrategySessionsPage'),
  '/personal-ai-tutor': () => import('@/pages/PersonalAITutorPage'),
  '/notification-settings': () => import('@/pages/NotificationSettingsPage'),
  '/seller-dashboard': () => import('@/pages/SellerDashboardPage'),
  '/client-dashboard': () => import('@/pages/ClientDashboardPage'),
  '/freelancer-profile': () => import('@/pages/FreelancerProfilePage'),
  '/browse-freelancers': () => import('@/pages/BrowseFreelancersPage'),
  '/job-listings': () => import('@/pages/JobListingsPage'),
  '/create-freelancer-profile': () => import('@/pages/CreateFreelancerProfilePage'),
  '/create-job-posting': () => import('@/pages/CreateJobPostingPage'),
  '/feedback': () => import('@/pages/FeedbackPage'),
};

// Cache to track which routes have been prefetched
const prefetchedRoutes = new Set<string>();
const prefetchedData = new Set<string>();

// Core routes to prefetch on app load
const coreRoutes = [
  '/dashboard',
  '/learning-paths',
  '/ai-tools',
  '/marketplace',
  '/community',
  '/referrals',
  '/subscription',
];

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

  // Prefetch reels data
  const prefetchReelsData = useCallback(() => {
    if (prefetchedData.has('reels')) return;
    prefetchedData.add('reels');

    queryClient.prefetchQuery({
      queryKey: ["community-reels"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("community_reels")
          .select("*")
          .order("created_at", { ascending: false, nullsFirst: false });
        if (error) throw error;
        return (data || []).map(reel => ({
          ...reel,
          created_at: reel.created_at || new Date().toISOString(),
          likes_count: reel.likes_count || 0,
          views_count: reel.views_count || 0,
        }));
      },
      staleTime: 1000 * 60 * 10,
    });

    queryClient.prefetchQuery({
      queryKey: ["insight-videos-for-reels"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("community_insights")
          .select("id, user_id, title, videos, video_thumbnails, likes_count, views_count, created_at")
          .not("videos", "is", null)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []).flatMap((insight) => 
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
      },
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);

  // Prefetch marketplace data
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

  const prefetchRoute = useCallback((path: string) => {
    if (prefetchedRoutes.has(path)) return;
    
    const importFn = routeImports[path];
    if (!importFn) return;

    prefetchedRoutes.add(path);

    // Use requestIdleCallback for non-blocking prefetch
    const prefetch = () => {
      importFn().catch((error) => {
        prefetchedRoutes.delete(path);
        console.warn(`Failed to prefetch route: ${path}`, error);
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
    } else {
      setTimeout(prefetch, 100);
    }

    // Prefetch associated data
    if (path === '/community/reels') {
      prefetchReelsData();
    } else if (path === '/community' || path.startsWith('/community/')) {
      prefetchCommunityData();
    } else if (path === '/marketplace' || path.startsWith('/marketplace/')) {
      prefetchMarketplaceData();
    }
  }, [prefetchReelsData, prefetchCommunityData, prefetchMarketplaceData]);

  // Prefetch core routes on mount
  const prefetchCoreRoutes = useCallback(() => {
    // Delay to not block initial render
    setTimeout(() => {
      coreRoutes.forEach(route => {
        prefetchRoute(route);
      });
      // Also prefetch core data
      prefetchCommunityData();
      prefetchMarketplaceData();
    }, 1000);
  }, [prefetchRoute, prefetchCommunityData, prefetchMarketplaceData]);

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
