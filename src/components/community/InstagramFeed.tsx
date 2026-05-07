import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Loader2, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { InsightCardSkeleton } from "./InsightCardSkeleton";
import { TopicCard } from "./TopicCard";
import { TopicCardSkeleton } from "./TopicCardSkeleton";
import { InstagramPostMobile } from "./InstagramPostMobile";
import { InstagramPostDesktop } from "./InstagramPostDesktop";
import { InstagramFeedSkeleton } from "./InstagramPostSkeleton";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { PullToRefresh } from "./PullToRefresh";
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
  onRefresh?: () => Promise<void>;
  hasNewContent?: boolean;
  newContentCount?: number;
  className?: string;
  hideScrollToTop?: boolean;
  /** Error state for fetching more pages */
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  /** Threshold above which desktop virtualization kicks in */
  virtualizeThreshold?: number;
}

// End-of-feed message component
const EndOfFeed = memo(({ onRefresh }: { onRefresh?: () => Promise<void> }) => {
  const [refreshing, setRefreshing] = useState(false);
  const handle = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
      <div className="p-3 rounded-full bg-primary/10">
        <CheckCircle2 className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">You're all caught up</p>
        <p className="text-xs text-muted-foreground mt-1">You've reached the end of the feed.</p>
      </div>
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={handle} disabled={refreshing} className="gap-2 mt-1">
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh feed
        </Button>
      )}
    </div>
  );
});
EndOfFeed.displayName = "EndOfFeed";

// Error state with retry
const FeedErrorState = memo(({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-8 px-4 gap-3 text-center border border-destructive/30 bg-destructive/5 rounded-lg my-4">
    <AlertCircle className="h-6 w-6 text-destructive" />
    <div>
      <p className="text-sm font-semibold text-foreground">Couldn't load more posts</p>
      <p className="text-xs text-muted-foreground mt-1">{message || "Check your connection and try again."}</p>
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </Button>
    )}
  </div>
));
FeedErrorState.displayName = "FeedErrorState";

const LoadingIndicator = () => (
  <div className="flex items-center justify-center py-6 gap-2">
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
    <span className="text-sm text-muted-foreground">Loading more...</span>
  </div>
);

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
  onRefresh,
  hasNewContent = false,
  newContentCount = 0,
  className,
  hideScrollToTop = false,
  isError = false,
  errorMessage,
  onRetry,
  virtualizeThreshold = 20,
}: InstagramFeedProps<T>) {
  const isMobile = useIsMobile();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!onLoadMore || !hasMore || isFetchingMore || isError) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { threshold: 0.1, rootMargin: '400px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isFetchingMore, isError]);

  // ===== Initial loading =====
  if (isLoading) {
    if (isMobile && type === 'insight') return <InstagramFeedSkeleton count={3} />;
    return (
      <div className={cn("space-y-5 max-w-2xl mx-auto", className)}>
        {type === 'insight' ? (
          <>
            <InsightCardSkeleton />
            <InsightCardSkeleton />
            <InsightCardSkeleton />
          </>
        ) : (
          <>
            <TopicCardSkeleton />
            <TopicCardSkeleton />
            <TopicCardSkeleton />
          </>
        )}
      </div>
    );
  }

  if (items.length === 0) return <>{emptyState}</>;

  // ===== Insight feeds =====
  if (type === 'insight') {
    const renderTail = (
      <>
        {isError && <FeedErrorState message={errorMessage} onRetry={onRetry} />}
        {!isError && hasMore && (
          <>
            <div ref={loadMoreRef} className="h-1" aria-hidden="true" />
            {isFetchingMore && (
              isMobile
                ? <InstagramFeedSkeleton count={1} />
                : <div className="space-y-5"><InsightCardSkeleton /><InsightCardSkeleton /></div>
            )}
          </>
        )}
        {!isError && !hasMore && !isFetchingMore && items.length > 3 && (
          <EndOfFeed onRefresh={onRefresh} />
        )}
      </>
    );

    // Mobile feed
    if (isMobile) {
      const feedContent = (
        <div className={cn("-mx-4 sm:-mx-6", className)}>
          <div className="divide-y divide-border">
            {items.map((item, index) => (
              <div key={`m-${(item as CommunityInsight).id}-${index}`} className="animate-fade-in">
                <InstagramPostMobile
                  insight={item as CommunityInsight}
                  onLikeClick={onLikeClick!}
                  onViewClick={onViewClick!}
                  onVideoTap={onVideoTap}
                  getInitials={getInitials}
                />
              </div>
            ))}
            {renderTail}
          </div>
        </div>
      );
      return (
        <>
          {onRefresh ? (
            <PullToRefresh onRefresh={onRefresh} disabled={isLoading || isFetchingMore}>
              {feedContent}
            </PullToRefresh>
          ) : feedContent}
          {!hideScrollToTop && (
            <ScrollToTopButton
              onRefresh={onRefresh}
              hasNewContent={hasNewContent}
              newContentCount={newContentCount}
            />
          )}
        </>
      );
    }

    // Desktop feed - virtualized when long
    const shouldVirtualize = items.length >= virtualizeThreshold;
    const desktopContent = shouldVirtualize ? (
      <DesktopVirtualFeed
        items={items as CommunityInsight[]}
        onLikeClick={onLikeClick!}
        onViewClick={onViewClick!}
        onVideoTap={onVideoTap}
        getInitials={getInitials}
        className={className}
        tail={renderTail}
      />
    ) : (
      <div className={cn("space-y-5 max-w-2xl mx-auto", className)}>
        {items.map((item, index) => (
          <div key={`d-${(item as CommunityInsight).id}-${index}`} className="animate-fade-in">
            <InstagramPostDesktop
              insight={item as CommunityInsight}
              onLikeClick={onLikeClick!}
              onViewClick={onViewClick!}
              onVideoTap={onVideoTap}
              getInitials={getInitials}
            />
          </div>
        ))}
        {renderTail}
      </div>
    );

    return (
      <>
        {onRefresh ? (
          <PullToRefresh onRefresh={onRefresh} disabled={isLoading || isFetchingMore}>
            {desktopContent}
          </PullToRefresh>
        ) : desktopContent}
        {!hideScrollToTop && (
          <ScrollToTopButton
            onRefresh={onRefresh}
            hasNewContent={hasNewContent}
            newContentCount={newContentCount}
          />
        )}
      </>
    );
  }

  // ===== Topic feed =====
  return (
    <>
      <div className={cn("space-y-3", className)}>
        {items.map((item, index) => (
          <div key={(item as CommunityTopic).id} className="animate-fade-in">
            <TopicCard
              topic={item as CommunityTopic}
              onTopicClick={onTopicClick!}
              getInitials={getInitials}
            />
          </div>
        ))}
        {isError && <FeedErrorState message={errorMessage} onRetry={onRetry} />}
        {!isError && hasMore && (
          <>
            <div ref={loadMoreRef} className="h-1" aria-hidden="true" />
            {isFetchingMore && <LoadingIndicator />}
          </>
        )}
        {!isError && !hasMore && !isFetchingMore && items.length > 3 && (
          <EndOfFeed onRefresh={onRefresh} />
        )}
      </div>
      {!hideScrollToTop && (
        <ScrollToTopButton
          onRefresh={onRefresh}
          hasNewContent={hasNewContent}
          newContentCount={newContentCount}
        />
      )}
    </>
  );
}

// ===== Desktop virtualized list =====
interface DesktopVirtualFeedProps {
  items: CommunityInsight[];
  onLikeClick: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  onViewClick: (insight: CommunityInsight) => void;
  onVideoTap?: (videoUrl: string, insightId: string, videoIndex: number) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
  className?: string;
  tail: React.ReactNode;
}

const DesktopVirtualFeed = memo(({
  items, onLikeClick, onViewClick, onVideoTap, getInitials, className, tail,
}: DesktopVirtualFeedProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Use window scroll instead of internal scroller for natural page scroll
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => null,
    estimateSize: () => 720,
    overscan: 4,
    observeElementOffset: (instance, cb) => {
      const update = () => {
        const el = parentRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        cb(-rect.top, false);
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      return () => {
        window.removeEventListener('scroll', update);
        window.removeEventListener('resize', update);
      };
    },
    observeElementRect: (instance, cb) => {
      const update = () => {
        cb({ width: window.innerWidth, height: window.innerHeight });
      };
      update();
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    },
    scrollToFn: (offset) => {
      const el = parentRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    },
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div ref={parentRef} style={{ position: 'relative', height: totalSize }}>
        {virtualItems.map((vi) => {
          const item = items[vi.index];
          return (
            <div
              key={`v-${item.id}-${vi.index}`}
              ref={virtualizer.measureElement}
              data-index={vi.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${vi.start}px)`,
                paddingBottom: '1.25rem',
              }}
            >
              <InstagramPostDesktop
                insight={item}
                onLikeClick={onLikeClick}
                onViewClick={onViewClick}
                onVideoTap={onVideoTap}
                getInitials={getInitials}
              />
            </div>
          );
        })}
      </div>
      {tail}
    </div>
  );
});
DesktopVirtualFeed.displayName = "DesktopVirtualFeed";

export const InstagramFeed = memo(InstagramFeedComponent) as typeof InstagramFeedComponent;
