import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefetch } from './usePrefetch';

/**
 * Hook that manages background loading of routes and data
 * - Prefetches related routes when user lands on a page
 * - Uses network information API to adjust prefetching strategy
 * - Respects data saver mode and slow connections
 */
export const useBackgroundLoader = () => {
  const location = useLocation();
  const { prefetchRelatedRoutes, prefetchOnIdle } = usePrefetch();
  const lastPathRef = useRef<string>('');

  // Check if we should prefetch based on network conditions
  const shouldPrefetch = useCallback(() => {
    if (typeof navigator === 'undefined') return true;
    
    // Check for data saver mode
    const connection = (navigator as any).connection;
    if (connection) {
      // Don't prefetch on slow connections or if data saver is enabled
      if (connection.saveData) return false;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return false;
      }
    }
    
    return true;
  }, []);

  // Prefetch related routes when path changes
  useEffect(() => {
    if (lastPathRef.current === location.pathname) return;
    lastPathRef.current = location.pathname;

    if (shouldPrefetch()) {
      // Small delay to let current page render first
      const timer = setTimeout(() => {
        prefetchRelatedRoutes(location.pathname);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, prefetchRelatedRoutes, shouldPrefetch]);

  // Listen for network changes
  useEffect(() => {
    const connection = (navigator as any).connection;
    if (!connection) return;

    const handleConnectionChange = () => {
      if (shouldPrefetch()) {
        prefetchOnIdle();
      }
    };

    connection.addEventListener('change', handleConnectionChange);
    return () => connection.removeEventListener('change', handleConnectionChange);
  }, [shouldPrefetch, prefetchOnIdle]);

  return { shouldPrefetch };
};

/**
 * Hook for prefetching specific Supabase queries
 * Can be used in components to prefetch data for upcoming interactions
 */
export const usePrefetchQuery = () => {
  const prefetchedQueriesRef = useRef(new Set<string>());

  const prefetchQuery = useCallback(async (
    queryKey: string,
    queryFn: () => Promise<any>
  ) => {
    if (prefetchedQueriesRef.current.has(queryKey)) return;
    
    prefetchedQueriesRef.current.add(queryKey);

    try {
      await queryFn();
    } catch {
      prefetchedQueriesRef.current.delete(queryKey);
    }
  }, []);

  return { prefetchQuery };
};
