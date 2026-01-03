import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Loader2 } from "lucide-react";
import { InsightCard } from "./InsightCard";
import { InsightCardSkeleton } from "./InsightCardSkeleton";
import { TopicCard } from "./TopicCard";
import { TopicCardSkeleton } from "./TopicCardSkeleton";
import { InstagramPostMobile } from "./InstagramPostMobile";
import { InstagramFeedSkeleton } from "./InstagramPostSkeleton";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CommunityInsight, CommunityTopic } from "@/types/community";
import { cn } from "@/lib/utils";

interface InstagramFeedProps<T> {
  items: T[];
  isLoading: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  type: 'insight' | 'topic';
  onLikeClick?: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  onViewClick?: (insight: CommunityInsight) => void;
  onVideoTap?: (videoUrl: string, insightId: string, videoIndex: number) => void;
  onTopicClick?: (topicId: string, tags?: string[]) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
  emptyState?: React.ReactNode;
  onLoadMore?: () => void;
  className?: string;
}

// Individual feed item that loads progressively
const FeedItem = memo(({ 
  index, 
  isVisible, 
  children 
}: { 
  index: number; 
  isVisible: boolean; 
  children: React.ReactNode;
}) => {
  const [shouldRender, setShouldRender] = useState(index === 0); // First item renders immediately
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && !shouldRender) {
      // Small delay for staggered animation effect
      const timer = setTimeout(() => {
        setShouldRender(true);
        setIsAnimating(true);
        // Remove animation class after animation completes
        const animTimer = setTimeout(() => setIsAnimating(false), 400);
        return () => clearTimeout(animTimer);
      }, index * 50); // Stagger by 50ms per item
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender, index]);

  // First item loads immediately with no animation delay
  if (index === 0) {
    return (
      <div className="animate-fade-in">
        {children}
      </div>
    );
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-out",
        isAnimating ? "animate-fade-in opacity-0" : "opacity-100"
      )}
      style={{ 
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {children}
    </div>
  );
});

FeedItem.displayName = "FeedItem";

// Lazy loading wrapper using Intersection Observer
const LazyFeedSection = memo(({ 
  children, 
  onVisible,
  threshold = 0.1
}: { 
  children: React.ReactNode; 
  onVisible: () => void;
  threshold?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          onVisible();
        }
      },
      { threshold, rootMargin: '100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [onVisible, hasTriggered, threshold]);

  return <div ref={ref}>{children}</div>;
});

LazyFeedSection.displayName = "LazyFeedSection";

function InstagramFeedComponent<T extends CommunityInsight | CommunityTopic>({
  items,
  isLoading,
  isFetchingMore = false,
  hasMore = false,
  type,
  onLikeClick,
  onViewClick,
  onVideoTap,
  onTopicClick,
  getInitials,
  emptyState,
  onLoadMore,
  className
}: InstagramFeedProps<T>) {
  const isMobile = useIsMobile();
  // Progressive loading: show first item immediately, then batch load rest
  const [visibleCount, setVisibleCount] = useState(1);
  const [isFirstBatchLoaded, setIsFirstBatchLoaded] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load first item immediately, then progressively load more
  useEffect(() => {
    if (items.length > 0 && !isFirstBatchLoaded) {
      // After first item is shown, load the rest in batches
      const timer = setTimeout(() => {
        setVisibleCount(Math.min(6, items.length)); // Load first 6 items
        setIsFirstBatchLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [items.length, isFirstBatchLoaded]);

  // Reset when items change significantly
  useEffect(() => {
    if (items.length === 0) {
      setVisibleCount(1);
      setIsFirstBatchLoaded(false);
    }
  }, [items.length]);

  // Infinite scroll - load more from server when reaching end
  useEffect(() => {
    if (!onLoadMore || !hasMore || isFetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isFetchingMore]);

  const loadMoreItems = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 6, items.length));
  }, [items.length]);

  // Initial loading state
  if (isLoading) {
    // Mobile Instagram-style skeleton for insights
    if (isMobile && type === 'insight') {
      return <InstagramFeedSkeleton count={3} />;
    }
    
    return (
      <div className={cn("space-y-4", className)}>
        {type === 'insight' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* First skeleton is highlighted/larger */}
            <div className="md:col-span-2 lg:col-span-1">
              <InsightCardSkeleton />
            </div>
            <InsightCardSkeleton />
            <InsightCardSkeleton />
            <InsightCardSkeleton />
            <InsightCardSkeleton />
            <InsightCardSkeleton />
          </div>
        ) : (
          <div className="space-y-3">
            <TopicCardSkeleton />
            <TopicCardSkeleton />
            <TopicCardSkeleton />
          </div>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  const visibleItems = items.slice(0, visibleCount);
  const hasMoreLocal = visibleCount < items.length;

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex items-center justify-center py-6 gap-2">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Loading more...</span>
    </div>
  );

  // Infinite scroll trigger ref
  const InfiniteScrollTrigger = () => (
    <div ref={loadMoreRef} className="h-1" aria-hidden="true" />
  );

  if (type === 'insight') {
    // Mobile Instagram-style feed with improved scrolling
    if (isMobile) {
      return (
        <>
          <div className={cn("-mx-4 sm:-mx-6", className)}>
            <div className="divide-y divide-border">
              {visibleItems.map((item, index) => (
                <FeedItem key={(item as CommunityInsight).id} index={index} isVisible={true}>
                  <InstagramPostMobile
                    insight={item as CommunityInsight}
                    onLikeClick={onLikeClick!}
                    onViewClick={onViewClick!}
                    onVideoTap={onVideoTap}
                    getInitials={getInitials}
                  />
                </FeedItem>
              ))}
              
              {/* Progressive load within current batch */}
              {hasMoreLocal && (
                <LazyFeedSection onVisible={loadMoreItems}>
                  <InstagramFeedSkeleton count={1} />
                </LazyFeedSection>
              )}
              
              {/* Infinite scroll trigger for fetching more from server */}
              {!hasMoreLocal && hasMore && (
                <>
                  <InfiniteScrollTrigger />
                  {isFetchingMore && <LoadingIndicator />}
                </>
              )}
              
              {/* End of feed indicator */}
              {!hasMoreLocal && !hasMore && items.length > 6 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">You're all caught up! 🎉</p>
                </div>
              )}
            </div>
          </div>
          <ScrollToTopButton />
        </>
      );
    }

    // Desktop card grid layout
    return (
      <>
        <div className={cn("space-y-4", className)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleItems.map((item, index) => (
              <FeedItem key={(item as CommunityInsight).id} index={index} isVisible={true}>
                <InsightCard
                  insight={item as CommunityInsight}
                  onLikeClick={onLikeClick!}
                  onViewClick={onViewClick!}
                  getInitials={getInitials}
                  priority={index === 0}
                />
              </FeedItem>
            ))}
            
            {/* Show skeletons for items being loaded */}
            {hasMoreLocal && (
              <LazyFeedSection onVisible={loadMoreItems}>
                <InsightCardSkeleton />
              </LazyFeedSection>
            )}
          </div>
          
          {/* Infinite scroll trigger */}
          {!hasMoreLocal && hasMore && (
            <>
              <InfiniteScrollTrigger />
              {isFetchingMore && <LoadingIndicator />}
            </>
          )}
          
          {!hasMoreLocal && !hasMore && items.length > 6 && (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">You've seen all insights! 🎉</p>
            </div>
          )}
        </div>
        <ScrollToTopButton />
      </>
    );
  }

  // Topic type
  return (
    <>
      <div className={cn("space-y-3", className)}>
        {visibleItems.map((item, index) => (
          <FeedItem key={(item as CommunityTopic).id} index={index} isVisible={true}>
            <TopicCard
              topic={item as CommunityTopic}
              onTopicClick={onTopicClick!}
              getInitials={getInitials}
            />
          </FeedItem>
        ))}
        
        {/* Show skeleton for lazy loading trigger */}
        {hasMoreLocal && (
          <LazyFeedSection onVisible={loadMoreItems}>
            <TopicCardSkeleton />
          </LazyFeedSection>
        )}
        
        {/* Infinite scroll trigger */}
        {!hasMoreLocal && hasMore && (
          <>
            <div ref={loadMoreRef} className="h-1" aria-hidden="true" />
            {isFetchingMore && (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading more...</span>
              </div>
            )}
          </>
        )}
      </div>
      <ScrollToTopButton />
    </>
  );
}

export const InstagramFeed = memo(InstagramFeedComponent) as typeof InstagramFeedComponent;
