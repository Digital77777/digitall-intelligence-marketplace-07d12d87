import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Loader2 } from "lucide-react";
import { InstagramPostMobile } from "./InstagramPostMobile";
import { InstagramPostDesktop } from "./InstagramPostDesktop";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CommunityInsight } from "@/types/community";
import { cn } from "@/lib/utils";

interface ContinuationFeedProps {
  items: CommunityInsight[];
  triggerRef: React.RefObject<HTMLDivElement>;
  delayMs?: number;
  onLikeClick: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  onViewClick: (insight: CommunityInsight) => void;
  onVideoTap?: (videoUrl: string, insightId: string, videoIndex: number) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const ContinuationFeed = memo(({
  items,
  triggerRef,
  delayMs = 2000,
  onLikeClick,
  onViewClick,
  onVideoTap,
  getInitials,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}: ContinuationFeedProps) => {
  const isMobile = useIsMobile();
  const [activated, setActivated] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Observe the trigger element (Community Stats card) - activate after delay
  useEffect(() => {
    const el = triggerRef.current;
    if (!el || activated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          timerRef.current = setTimeout(() => {
            setActivated(true);
            setVisibleCount(3); // Show first 3 items
          }, delayMs);
        } else {
          if (timerRef.current) clearTimeout(timerRef.current);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerRef, activated, delayMs]);

  // Load more as user scrolls down within continuation feed
  useEffect(() => {
    if (!activated || !bottomRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => {
            const next = prev + 3;
            // If we've shown all original items, try fetching more from server
            if (next > items.length && hasNextPage && fetchNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
            return Math.min(next, items.length);
          });
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [activated, items, hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (!activated) return null;

  // Items to show from original list
  const continuationItems = items.slice(0, visibleCount);

  if (continuationItems.length === 0) return null;

  const PostComponent = isMobile ? InstagramPostMobile : InstagramPostDesktop;

  return (
    <div className="mt-6">
      {/* Subtle separator */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground font-medium">More from the community</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {isMobile ? (
        <div className="-mx-4 sm:-mx-6">
          <div className="divide-y divide-border">
            {continuationItems.map((item, index) => (
              <div
                key={`cont-${item.id}-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${(index % 3) * 100}ms`, animationFillMode: 'forwards' }}
              >
                <InstagramPostMobile
                  insight={item}
                  onLikeClick={onLikeClick}
                  onViewClick={onViewClick}
                  onVideoTap={onVideoTap}
                  getInitials={getInitials}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-5">
          {continuationItems.map((item, index) => (
            <div
              key={`cont-${item.id}-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${(index % 3) * 100}ms`, animationFillMode: 'forwards' }}
            >
              <InstagramPostDesktop
                insight={item}
                onLikeClick={onLikeClick}
                onViewClick={onViewClick}
                onVideoTap={onVideoTap}
                getInitials={getInitials}
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-6 gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading more...</span>
        </div>
      )}

      {/* Bottom trigger for loading more */}
      <div ref={bottomRef} className="h-1" aria-hidden="true" />
    </div>
  );
});

ContinuationFeed.displayName = "ContinuationFeed";

export { ContinuationFeed };
