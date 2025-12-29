import { useState, useCallback } from 'react';
import { ArrowUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { cn } from '@/lib/utils';

interface SmartScrollUpButtonProps {
  onRefresh?: () => Promise<void>;
  className?: string;
}

export const SmartScrollUpButton = ({ 
  onRefresh,
  className 
}: SmartScrollUpButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showScrollButton, scrollDirection, scrollToTop, isAtTop } = useScrollPosition({
    threshold: 300,
  });

  const handleClick = useCallback(async () => {
    if (isAtTop && onRefresh) {
      // Already at top - refresh content
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      // Scroll to top, then refresh
      scrollToTop(async () => {
        if (onRefresh) {
          setIsRefreshing(true);
          try {
            await onRefresh();
          } finally {
            setIsRefreshing(false);
          }
        }
      });
    }
  }, [isAtTop, onRefresh, scrollToTop]);

  // Hide when at top and not refreshing
  if (!showScrollButton && !isRefreshing) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isRefreshing}
      aria-label={isRefreshing ? "Refreshing content" : "Scroll to top and refresh"}
      className={cn(
        // Base styles
        "fixed z-40 h-12 w-12 rounded-full shadow-lg",
        // Position with safe-area support
        "bottom-20 left-6 md:bottom-6",
        "pb-[env(safe-area-inset-bottom)]",
        // Colors
        "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
        // Animations
        "transition-all duration-300 ease-out",
        showScrollButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        // Scroll-based animation
        scrollDirection === 'down' && "scale-90 opacity-80",
        scrollDirection === 'up' && "scale-100 opacity-100",
        scrollDirection === 'idle' && "scale-100",
        className
      )}
    >
      {isRefreshing ? (
        <RefreshCw className="h-5 w-5 animate-spin" />
      ) : (
        <ArrowUp 
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            scrollDirection === 'up' && "transform -translate-y-0.5"
          )} 
        />
      )}
    </Button>
  );
};
