import React, { useState, useEffect, memo } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

export const ScrollToTopButton = memo(({ 
  threshold = 400,
  className 
}: ScrollToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    setIsScrolling(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    
    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), 500);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      disabled={isScrolling}
      aria-label="Scroll to top"
      className={cn(
        // Base styles
        "fixed z-50 p-3 rounded-full shadow-lg",
        "transition-all duration-300 ease-out",
        // Gradient background matching DIM brand
        "bg-gradient-to-br from-primary to-primary/80",
        "hover:from-primary/90 hover:to-primary/70",
        "active:scale-95",
        // Shadow and glow effect
        "shadow-[0_4px_14px_0_hsl(var(--primary)/0.39)]",
        "hover:shadow-[0_6px_20px_hsl(var(--primary)/0.5)]",
        // Text color
        "text-primary-foreground",
        // Animation
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        isScrolling && "animate-pulse",
        // Position - bottom right, above mobile nav if present
        "bottom-20 right-4 md:bottom-8 md:right-8",
        className
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
});

ScrollToTopButton.displayName = "ScrollToTopButton";
