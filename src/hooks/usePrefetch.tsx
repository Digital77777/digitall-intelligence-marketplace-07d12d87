import { useCallback, useEffect, useRef } from 'react';
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
  // Community routes
  '/community': () => import('@/pages/CommunityPage'),
  '/community/my-activity': () => import('@/pages/MyActivityPage'),
  '/community/inbox': () => import('@/pages/community/InboxPage'),
  '/community/browse-events': () => import('@/pages/community/BrowseEventsPage'),
  '/community/find-members': () => import('@/pages/community/FindMembersPage'),
  '/community/reels': () => import('@/pages/community/ReelsPage'),
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

// Data queries to prefetch for specific routes
const routeDataQueries: Record<string, () => Promise<void>> = {
  '/community': async () => {
    await Promise.all([
      supabase.from('community_insights').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('community_topics').select('*').order('last_activity_at', { ascending: false }).limit(10),
      supabase.from('community_events').select('*').eq('status', 'active').limit(5),
    ]);
  },
  '/marketplace': async () => {
    await supabase.from('marketplace_listings').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(12);
  },
  '/marketplace/browse': async () => {
    await Promise.all([
      supabase.from('marketplace_listings').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(20),
      supabase.from('marketplace_categories').select('*').eq('is_active', true),
    ]);
  },
  '/marketplace/browse-freelancers': async () => {
    await supabase.from('freelancer_profiles').select('*').eq('is_active', true).limit(20);
  },
  '/community/browse-events': async () => {
    await supabase.from('community_events').select('*').eq('status', 'active').order('event_date', { ascending: true }).limit(20);
  },
};

// Priority routes to prefetch during idle time
const priorityRoutes = [
  '/dashboard',
  '/community',
  '/marketplace',
  '/ai-tools',
  '/learning-paths',
];

// Cache to track prefetched items
const prefetchedRoutes = new Set<string>();
const prefetchedData = new Set<string>();

// Request idle callback polyfill
const requestIdleCallback = 
  typeof window !== 'undefined' && 'requestIdleCallback' in window 
    ? window.requestIdleCallback 
    : (cb: () => void) => setTimeout(cb, 1);

const cancelIdleCallback = 
  typeof window !== 'undefined' && 'cancelIdleCallback' in window 
    ? window.cancelIdleCallback 
    : clearTimeout;

export const usePrefetch = () => {
  const queryClient = useQueryClient();
  const idleCallbackRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);
  const prefetchQueueRef = useRef<string[]>([]);

  // Prefetch a single route component
  const prefetchRoute = useCallback((path: string) => {
    if (prefetchedRoutes.has(path)) return;
    
    const importFn = routeImports[path];
    if (!importFn) return;

    prefetchedRoutes.add(path);

    // Use low-priority fetch
    importFn().catch(() => {
      prefetchedRoutes.delete(path);
    });
  }, []);

  // Prefetch data for a route
  const prefetchData = useCallback(async (path: string) => {
    if (prefetchedData.has(path)) return;
    
    const dataFn = routeDataQueries[path];
    if (!dataFn) return;

    prefetchedData.add(path);

    try {
      await dataFn();
    } catch {
      prefetchedData.delete(path);
    }
  }, []);

  // Combined prefetch (component + data)
  const prefetch = useCallback((path: string) => {
    prefetchRoute(path);
    prefetchData(path);
  }, [prefetchRoute, prefetchData]);

  // Handle hover prefetch (desktop)
  const handleMouseEnter = useCallback((path: string) => {
    prefetch(path);
  }, [prefetch]);

  // Handle touch prefetch (mobile)
  const handleTouchStart = useCallback((path: string) => {
    prefetch(path);
  }, [prefetch]);

  // Idle-time prefetching for priority routes
  const prefetchOnIdle = useCallback(() => {
    if (idleCallbackRef.current) {
      cancelIdleCallback(idleCallbackRef.current as number);
    }

    const processPrefetchQueue = (deadline?: IdleDeadline) => {
      // Process routes while we have idle time
      while (
        prefetchQueueRef.current.length > 0 && 
        (!deadline || deadline.timeRemaining() > 0)
      ) {
        const route = prefetchQueueRef.current.shift();
        if (route) {
          prefetch(route);
        }
      }

      // Schedule next batch if queue not empty
      if (prefetchQueueRef.current.length > 0) {
        idleCallbackRef.current = requestIdleCallback(processPrefetchQueue);
      }
    };

    // Queue priority routes that haven't been prefetched
    prefetchQueueRef.current = priorityRoutes.filter(
      route => !prefetchedRoutes.has(route)
    );

    if (prefetchQueueRef.current.length > 0) {
      idleCallbackRef.current = requestIdleCallback(processPrefetchQueue);
    }
  }, [prefetch]);

  // Initialize idle prefetching after initial load
  useEffect(() => {
    // Wait for initial page load to complete
    const timer = setTimeout(prefetchOnIdle, 2000);
    
    return () => {
      clearTimeout(timer);
      if (idleCallbackRef.current) {
        cancelIdleCallback(idleCallbackRef.current as number);
      }
    };
  }, [prefetchOnIdle]);

  // Prefetch related routes based on current page
  const prefetchRelatedRoutes = useCallback((currentPath: string) => {
    const relatedRoutes: Record<string, string[]> = {
      '/': ['/dashboard', '/auth', '/learning-paths', '/ai-tools'],
      '/dashboard': ['/community', '/marketplace', '/analytics'],
      '/community': ['/community/browse-events', '/community/find-members', '/community/inbox'],
      '/marketplace': ['/marketplace/browse', '/marketplace/browse-freelancers', '/marketplace/jobs'],
      '/learning-paths': ['/ai-tools', '/career-certification'],
    };

    const routes = relatedRoutes[currentPath] || [];
    routes.forEach(route => {
      if (!prefetchedRoutes.has(route)) {
        prefetchQueueRef.current.push(route);
      }
    });

    if (prefetchQueueRef.current.length > 0) {
      prefetchOnIdle();
    }
  }, [prefetchOnIdle]);

  return {
    prefetchRoute,
    prefetchData,
    prefetch,
    handleMouseEnter,
    handleTouchStart,
    prefetchOnIdle,
    prefetchRelatedRoutes,
  };
};

// Viewport-based prefetching hook for link visibility
export const useViewportPrefetch = (path: string, enabled = true) => {
  const { prefetch } = usePrefetch();
  const elementRef = useRef<HTMLElement>(null);
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || prefetchedRef.current || !elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !prefetchedRef.current) {
            prefetchedRef.current = true;
            prefetch(path);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' } // Prefetch when within 100px of viewport
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [path, enabled, prefetch]);

  return elementRef;
};
