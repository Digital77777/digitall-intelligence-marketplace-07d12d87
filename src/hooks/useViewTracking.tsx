import { useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseViewTrackingOptions {
  contentId: string;
  contentType: 'insight' | 'topic';
  threshold?: number;
  viewDuration?: number; // milliseconds before counting as a view
}

// Track which content has been viewed this session to avoid duplicate counts
const viewedContent = new Set<string>();

export const useViewTracking = ({
  contentId,
  contentType,
  threshold = 0.5, // 50% of element must be visible
  viewDuration = 1000, // 1 second minimum view time
}: UseViewTrackingOptions) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedRef = useRef(false);

  const trackView = useCallback(async () => {
    const viewKey = `${contentType}:${contentId}`;
    
    // Skip if already tracked this session
    if (viewedContent.has(viewKey) || hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;
    viewedContent.add(viewKey);

    try {
      if (contentType === 'insight') {
        // Increment views_count for insights
        const { error } = await supabase.rpc('increment_insight_views', {
          insight_id: contentId
        });
        
        if (error) {
          // Fallback to direct update if RPC doesn't exist
          if (error.code === 'PGRST202') {
            await supabase
              .from('community_insights')
              .update({ 
                views_count: supabase.rpc('coalesce_increment', { val: 1 }) 
              })
              .eq('id', contentId);
          }
        }
      } else if (contentType === 'topic') {
        // Increment views for topics
        const { error } = await supabase.rpc('increment_topic_views', {
          topic_id: contentId
        });
        
        if (error) {
          // Fallback to direct update if RPC doesn't exist
          if (error.code === 'PGRST202') {
            await supabase
              .from('community_topics')
              .update({ 
                views: supabase.rpc('coalesce_increment', { val: 1 }) 
              })
              .eq('id', contentId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }, [contentId, contentType]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        if (entry.isIntersecting) {
          // Start timer when element becomes visible
          viewTimerRef.current = setTimeout(() => {
            trackView();
          }, viewDuration);
        } else {
          // Cancel timer if element leaves viewport before duration
          if (viewTimerRef.current) {
            clearTimeout(viewTimerRef.current);
            viewTimerRef.current = null;
          }
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, [trackView, threshold, viewDuration]);

  return elementRef;
};

// Batch view tracking for multiple items
export const useMultiViewTracking = (contentType: 'insight' | 'topic') => {
  const pendingViews = useRef<Set<string>>(new Set());
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flushViews = useCallback(async () => {
    if (pendingViews.current.size === 0) return;

    const ids = Array.from(pendingViews.current);
    pendingViews.current.clear();

    try {
      if (contentType === 'insight') {
        // Batch update for insights
        for (const id of ids) {
          const viewKey = `insight:${id}`;
          if (!viewedContent.has(viewKey)) {
            viewedContent.add(viewKey);
            await supabase
              .from('community_insights')
              .update({ views_count: supabase.sql`COALESCE(views_count, 0) + 1` })
              .eq('id', id);
          }
        }
      } else {
        // Batch update for topics
        for (const id of ids) {
          const viewKey = `topic:${id}`;
          if (!viewedContent.has(viewKey)) {
            viewedContent.add(viewKey);
            await supabase
              .from('community_topics')
              .update({ views: supabase.sql`COALESCE(views, 0) + 1` })
              .eq('id', id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to batch track views:', error);
    }
  }, [contentType]);

  const trackView = useCallback((contentId: string) => {
    const viewKey = `${contentType}:${contentId}`;
    if (viewedContent.has(viewKey)) return;

    pendingViews.current.add(contentId);

    // Debounce flush
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    flushTimeoutRef.current = setTimeout(flushViews, 2000);
  }, [contentType, flushViews]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushViews();
    };
  }, [flushViews]);

  return { trackView };
};

// Reset viewed content (useful for testing or session reset)
export const resetViewedContent = () => {
  viewedContent.clear();
};
