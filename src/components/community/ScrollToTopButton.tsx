import React, { useState, useEffect, memo } from "react";
import { ArrowUp, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
  onRefresh?: () => Promise<void>;
  hasNewContent?: boolean;
  newContentCount?: number;
}

export const ScrollToTopButton = memo(({ 
  threshold = 400,
  className,
  onRefresh,
  hasNewContent = false,
  newContentCount = 0
}: ScrollToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const handleClick = async () => {
    // If we have refresh capability and new content, refresh first
    if (onRefresh && hasNewContent) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Always scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing}
      aria-label={hasNewContent ? `${newContentCount} new posts - tap to refresh` : "Scroll to top"}
      className={cn(
        // Base styles
        "fixed z-50 rounded-full shadow-lg",
        "transition-all duration-300 ease-out",
        // Conditional sizing based on new content
        hasNewContent ? "px-4 py-3" : "p-3",
        // Gradient background with special styling for new content
        hasNewContent 
          ? "bg-gradient-to-r from-primary via-primary/90 to-accent" 
          : "bg-gradient-to-br from-primary to-primary/80",
        "hover:from-primary/90 hover:to-primary/70",
        "active:scale-95",
        // Shadow and glow effect - enhanced for new content
        hasNewContent
          ? "shadow-[0_6px_20px_hsl(var(--primary)/0.5)] animate-pulse"
          : "shadow-[0_4px_14px_0_hsl(var(--primary)/0.39)]",
        "hover:shadow-[0_6px_20px_hsl(var(--primary)/0.5)]",
        // Text color
        "text-primary-foreground",
        // Animation
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        isRefreshing && "cursor-wait",
        // Position - bottom right, above mobile nav if present
        "bottom-20 right-4 md:bottom-8 md:right-8",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isRefreshing ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : hasNewContent ? (
          <>
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm font-medium whitespace-nowrap">
              {newContentCount > 0 ? `${newContentCount} new` : "New posts"}
            </span>
          </>
        ) : (
          <ArrowUp className="h-5 w-5" />
        )}
      </div>
      
      {/* Notification badge for new content */}
      {hasNewContent && !isRefreshing && newContentCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-accent items-center justify-center text-[10px] font-bold text-accent-foreground">
            {newContentCount > 9 ? "9+" : newContentCount}
          </span>
        </span>
      )}
    </button>
  );
});

ScrollToTopButton.displayName = "ScrollToTopButton";
