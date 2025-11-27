import { useCallback } from 'react';

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

export const usePrefetch = () => {
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
  }, []);

  const handleMouseEnter = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  const handleTouchStart = useCallback((path: string) => {
    // For mobile, prefetch on touch start for instant navigation
    prefetchRoute(path);
  }, [prefetchRoute]);

  return {
    prefetchRoute,
    handleMouseEnter,
    handleTouchStart,
  };
};
