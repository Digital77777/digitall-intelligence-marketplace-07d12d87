import { useCallback } from 'react';
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
  // Community routes - full prefetch support
  '/community': () => import('@/pages/CommunityPage'),
  '/community/my-activity': () => import('@/pages/MyActivityPage'),
  '/community/inbox': () => import('@/pages/community/InboxPage'),
  '/community/browse-events': () => import('@/pages/community/BrowseEventsPage'),
  '/community/find-members': () => import('@/pages/community/FindMembersPage'),
  '/community/reels': () => import('@/pages/community/ReelsPage').then(m => m.default),
  '/community/share-insight': () => import('@/pages/community/ShareInsightPage'),
  '/community/start-topic': () => import('@/pages/community/StartTopicPage'),
  '/community/host-event': () => import('@/pages/community/HostEventPage'),
  // Other routes
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
};

// Cache to track which routes have been prefetched
const prefetchedRoutes = new Set<string>();
const prefetchedData = new Set<string>();

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  // Prefetch reels data
  const prefetchReelsData = useCallback(() => {
    if (prefetchedData.has('reels')) return;
    prefetchedData.add('reels');

    // Prefetch community reels
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
      staleTime: 1000 * 60 * 5,
    });

    // Prefetch insight videos for reels
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
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  const prefetchRoute = useCallback((path: string) => {
    // Skip if already prefetched
    if (prefetchedRoutes.has(path)) return;
    
    // Get the import function for this route
    const importFn = routeImports[path];
    if (!importFn) return;

    // Mark as prefetched immediately to avoid duplicate requests
    prefetchedRoutes.add(path);

    // Prefetch the route component
    importFn().catch((error) => {
      // Remove from cache if prefetch fails
      prefetchedRoutes.delete(path);
      console.warn(`Failed to prefetch route: ${path}`, error);
    });

    // Also prefetch data for specific routes
    if (path === '/community/reels') {
      prefetchReelsData();
    }
  }, [prefetchReelsData]);

  const handleMouseEnter = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  const handleTouchStart = useCallback((path: string) => {
    // For mobile, prefetch on touch start for instant navigation
    prefetchRoute(path);
  }, [prefetchRoute]);

  return {
    prefetchRoute,
    prefetchReelsData,
    handleMouseEnter,
    handleTouchStart,
  };
};
