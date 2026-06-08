import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Registry of lazy-loaded page imports to enable programmatic prefetching
// We use a manual registry to match the dynamic imports used in App.tsx exactly
export const pageImports: Record<string, () => Promise<any>> = {
  '/course/foundation-path': () => import('../pages/course/FoundationPath'),
  '/learning-paths/:pathId': () => import('../pages/learning/PathDetailPage'),
  '/learning-paths/:pathId/:courseId': () => import('../pages/learning/CourseMissionsPage'),
  '/learning-paths/:pathId/:courseId/:missionId': () => import('../pages/learning/MissionPage'),
  '/course/practical-skills': () => import('../pages/course/PracticalSkills'),
  '/course/technical-developer': () => import('../pages/course/TechnicalDeveloper'),
  '/course/business-careers': () => import('../pages/course/BusinessCareers'),
  '/course/:courseId/lesson/:lessonId': () => import('../pages/course/LessonPage'),
  '/tools/ai-code-assistant': () => import('../pages/tools/AICodeAssistant'),
  '/tools/neural-image-generator': () => import('../pages/tools/NeuralImageGenerator'),
  '/tools/smart-analytics': () => import('../pages/tools/SmartAnalytics'),
  '/tools/conversational-ai': () => import('../pages/tools/ConversationalAI'),
  '/challenge/:id': () => import('../pages/ChallengePage'),
  '/marketplace/sell-products': () => import('../pages/SellProductsPage'),
  '/marketplace/freelance-services': () => import('../pages/FreelanceServicesPage'),
  '/marketplace/create-freelancer-profile': () => import('../pages/CreateFreelancerProfilePage'),
  '/marketplace/browse-freelancers': () => import('../pages/BrowseFreelancersPage'),
  '/marketplace/freelancer/:id': () => import('../pages/FreelancerProfilePage'),
  '/marketplace/my-listings': () => import('../pages/MyListingsPage'),
  '/marketplace/create': () => import('../pages/CreateListingPage'),
  '/marketplace/create-listing': () => import('../pages/CreateListingPage'),
  '/marketplace/schedule-consultation': () => import('../pages/ScheduleConsultationPage'),
  '/seller-dashboard': () => import('../pages/SellerDashboardPage'),
  '/client-dashboard': () => import('../pages/ClientDashboardPage'),
  '/marketplace/post-jobs': () => import('../pages/PostJobsPage'),
  '/create-job-posting': () => import('../pages/CreateJobPostingPage'),
  '/marketplace/jobs': () => import('../pages/JobListingsPage'),
  '/marketplace/ai-development': () => import('../pages/AIDevelopmentPage'),
  '/marketplace/start-project': () => import('../pages/StartProjectPage'),
  '/start-selling': () => import('../pages/StartSellingPage'),
  '/creator-suite': () => import('../pages/CreatorSuitePage'),
  '/marketplace/wishlist': () => import('../pages/WishlistPage'),
  '/community/topic/:topicId': () => import('../pages/community/TopicDetailPage'),
  '/community/browse-events': () => import('../pages/community/BrowseEventsPage'),
  '/community/find-members': () => import('../pages/community/FindMembersPage'),
  '/community/host-event': () => import('../pages/community/HostEventPage'),
  '/community/edit-event/:eventId': () => import('../pages/community/EditEventPage'),
  '/community/inbox': () => import('../pages/community/InboxPage'),
  '/community/share-insight': () => import('../pages/community/ShareInsightPage'),
  '/community/start-topic': () => import('../pages/community/StartTopicPage'),
  '/community/join-whatsapp': () => import('../pages/community/WhatsAppCommunityPage'),
  '/community/create-reel': () => import('../pages/community/CreateReelPage'),
  '/community/followers': () => import('../pages/community/FollowersPage'),
  '/community/my-network': () => import('../pages/community/MyNetworkPage'),
  '/career-certification': () => import('../pages/CareerCertificationPage'),
  '/career-certification/:slug': () => import('../pages/career/CertificationDetailPage'),
  '/career/job-matches': () => import('../pages/career/JobMatchesPage'),
  '/career/recruiter': () => import('../pages/career/RecruiterDashboardPage'),
  '/job-placement': () => import('../pages/JobPlacementPage'),
  '/strategy-sessions': () => import('../pages/StrategySessionsPage'),
  '/personal-ai-tutor': () => import('../pages/PersonalAITutorPage'),
  '/analytics': () => import('../pages/AnalyticsPage'),
  '/support': () => import('../pages/SupportPage'),
  '/notification-settings': () => import('../pages/NotificationSettingsPage'),
  '/install-pwa': () => import('../pages/InstallPWAPage'),
  '/profile/:userId': () => import('../pages/PublicProfilePage'),
  '/edit-listing/:id': () => import('../pages/EditListingPage'),
  '/listing/:id': () => import('../pages/ListingDetailPage'),
  '/marketplace/listing/:id': () => import('../pages/ListingDetailPage'),
  '/marketplace/preview/:id': () => import('../pages/ListingPreviewFeedPage'),
  '/feedback': () => import('../pages/FeedbackPage'),
  '/update-app': () => import('../pages/UpdateAppPage'),
  '/creator/onboarding': () => import('../pages/creator/CreatorOnboardingPage'),
  '/programs/coming-soon': () => import('../pages/programs/ComingSoonPage'),
  '/programs/referral-rewards': () => import('../pages/programs/ReferralRewardsPage'),
  '/programs/community-hero': () => import('../pages/programs/CommunityHeroPage'),
  '/programs/quests': () => import('../pages/programs/QuestsPage'),
  '/programs/ambassador': () => import('../pages/programs/AmbassadorPage'),
  '/growth': () => import('../pages/growth/GrowthHubPage'),
  '/growth/quests': () => import('../pages/growth/QuestsBoardPage'),
  '/growth/partner': () => import('../pages/growth/PartnerDashboardPage'),
  '/growth/success': () => import('../pages/growth/SuccessWallPage'),
};

const prefetched = new Set<string>();

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const findMatchingPath = (path: string) => {
    if (pageImports[path]) return path;
    return Object.keys(pageImports).find(route => {
      const routeParts = route.split('/');
      const pathParts = path.split('/');
      if (routeParts.length !== pathParts.length) return false;
      return routeParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
    });
  };

  const prefetchComponent = useCallback((path: string) => {
    const matchingPath = findMatchingPath(path);
    if (matchingPath && !prefetched.has(`comp:${matchingPath}`)) {
      prefetched.add(`comp:${matchingPath}`);
      pageImports[matchingPath]();
    }
  }, []);

  const prefetchCommunityData = useCallback(() => {
    if (prefetched.has('data:community')) return;
    prefetched.add('data:community');

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

  const prefetchReelsData = useCallback(() => {
    if (prefetched.has('data:reels')) return;
    prefetched.add('data:reels');

    const REELS_PAGE_SIZE = 10;

    queryClient.prefetchInfiniteQuery({
      queryKey: ["community-reels-infinite"],
      queryFn: async ({ pageParam = 0 }) => {
        const { data, error } = await supabase
          .from("community_reels")
          .select("*")
          .order("created_at", { ascending: false, nullsFirst: false })
          .range(pageParam * REELS_PAGE_SIZE, (pageParam + 1) * REELS_PAGE_SIZE - 1);

        if (error) throw error;
        return {
          reels: (data || []).map(reel => ({
            ...reel,
            created_at: reel.created_at || new Date().toISOString(),
            likes_count: reel.likes_count || 0,
            views_count: reel.views_count || 0,
          })),
          nextPage: data && data.length === REELS_PAGE_SIZE ? pageParam + 1 : undefined
        };
      },
      initialPageParam: 0,
      staleTime: 1000 * 60 * 10,
    });

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

  const prefetchMarketplaceData = useCallback(() => {
    if (prefetched.has('data:marketplace')) return;
    prefetched.add('data:marketplace');

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

  const prefetchMarketplaceBrowseData = useCallback(() => {
    if (prefetched.has('data:marketplace-browse')) return;
    prefetched.add('data:marketplace-browse');

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
  }, [queryClient]);

  const prefetchRoute = useCallback((path: string) => {
    prefetchComponent(path);
    if (path === '/community/reels') {
      prefetchReelsData();
    } else if (path === '/community' || path.startsWith('/community/')) {
      prefetchCommunityData();
    } else if (path === '/marketplace/browse') {
      prefetchMarketplaceBrowseData();
    } else if (path === '/marketplace' || path.startsWith('/marketplace/')) {
      prefetchMarketplaceData();
    }
  }, [prefetchComponent, prefetchReelsData, prefetchCommunityData, prefetchMarketplaceData, prefetchMarketplaceBrowseData]);

  const handleMouseEnter = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  const handleTouchStart = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  const prefetchCoreRoutes = useCallback(() => {
    const prefetch = () => {
      prefetchCommunityData();
      prefetchMarketplaceData();
      prefetchMarketplaceBrowseData();
      prefetchReelsData();
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 1000);
    }
  }, [prefetchCommunityData, prefetchMarketplaceData, prefetchMarketplaceBrowseData, prefetchReelsData]);

  return {
    prefetchRoute,
    prefetchCoreRoutes,
    handleMouseEnter,
    handleTouchStart,
  };
};

export const useAutoPrefetch = () => {
  const { prefetchCoreRoutes } = usePrefetch();
  useEffect(() => {
    prefetchCoreRoutes();
  }, [prefetchCoreRoutes]);
};
