import { useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseViewTrackingOptions {
  contentId: string;
  contentType: 'insight' | 'topic';
  threshold?: number;
  viewDuration?: number;
}

// Track which content has been viewed this session to avoid duplicate counts
const viewedContent = new Set<string>();

export const useViewTracking = ({
  contentId,
  contentType,
  threshold = 0.5,
  viewDuration = 1000,
}: UseViewTrackingOptions) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedRef = useRef(false);

  const trackView = useCallback(async () => {
    const viewKey = `${contentType}:${contentId}`;
    
    if (viewedContent.has(viewKey) || hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;
    viewedContent.add(viewKey);

    try {
      if (contentType === 'insight') {
        // First get current views_count
        const { data } = await supabase
          .from('community_insights')
          .select('views_count')
          .eq('id', contentId)
          .maybeSingle();
        
        const currentViews = data?.views_count ?? 0;
        
        await supabase
          .from('community_insights')
          .update({ views_count: currentViews + 1 })
          .eq('id', contentId);
      } else if (contentType === 'topic') {
        // First get current views
        const { data } = await supabase
          .from('community_topics')
          .select('views')
          .eq('id', contentId)
          .maybeSingle();
        
        const currentViews = data?.views ?? 0;
        
        await supabase
          .from('community_topics')
          .update({ views: currentViews + 1 })
          .eq('id', contentId);
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
          viewTimerRef.current = setTimeout(() => {
            trackView();
          }, viewDuration);
        } else {
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

export const resetViewedContent = () => {
  viewedContent.clear();
};
