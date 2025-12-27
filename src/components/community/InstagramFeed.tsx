import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { InsightCard } from "./InsightCard";
import { InsightCardSkeleton } from "./InsightCardSkeleton";
import { TopicCard } from "./TopicCard";
import { TopicCardSkeleton } from "./TopicCardSkeleton";
import type { CommunityInsight, CommunityTopic } from "@/types/community";
import { cn } from "@/lib/utils";

interface InstagramFeedProps<T> {
  items: T[];
  isLoading: boolean;
  type: 'insight' | 'topic';
  onLikeClick?: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  onViewClick?: (insight: CommunityInsight) => void;
  onTopicClick?: (topicId: string, tags?: string[]) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
  emptyState?: React.ReactNode;
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
  type,
  onLikeClick,
  onViewClick,
  onTopicClick,
  getInitials,
  emptyState,
  className
}: InstagramFeedProps<T>) {
  // Progressive loading: show first item immediately, then batch load rest
  const [visibleCount, setVisibleCount] = useState(1);
  const [isFirstBatchLoaded, setIsFirstBatchLoaded] = useState(false);

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

  const loadMoreItems = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 6, items.length));
  }, [items.length]);

  // Initial loading state - show skeleton for first item prominently
  if (isLoading) {
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
  const hasMore = visibleCount < items.length;

  if (type === 'insight') {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleItems.map((item, index) => (
            <FeedItem key={(item as CommunityInsight).id} index={index} isVisible={true}>
              <InsightCard
                insight={item as CommunityInsight}
                onLikeClick={onLikeClick!}
                onViewClick={onViewClick!}
                getInitials={getInitials}
              />
            </FeedItem>
          ))}
          
          {/* Show skeletons for items being loaded */}
          {hasMore && visibleCount < items.length && (
            <LazyFeedSection onVisible={loadMoreItems}>
              <InsightCardSkeleton />
            </LazyFeedSection>
          )}
        </div>
      </div>
    );
  }

  // Topic type
  return (
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
      {hasMore && (
        <LazyFeedSection onVisible={loadMoreItems}>
          <TopicCardSkeleton />
        </LazyFeedSection>
      )}
    </div>
  );
}

export const InstagramFeed = memo(InstagramFeedComponent) as typeof InstagramFeedComponent;
