import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollState {
  scrollY: number;
  isScrollingUp: boolean;
  isScrollingDown: boolean;
  isAtTop: boolean;
  showScrollButton: boolean;
  scrollDirection: 'up' | 'down' | 'idle';
}

interface UseScrollPositionOptions {
  threshold?: number;
  debounceMs?: number;
}

export const useScrollPosition = (options: UseScrollPositionOptions = {}) => {
  const { threshold = 300, debounceMs = 10 } = options;
  
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    isScrollingUp: false,
    isScrollingDown: false,
    isAtTop: true,
    showScrollButton: false,
    scrollDirection: 'idle',
  });
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateScrollState = useCallback(() => {
    const currentScrollY = window.scrollY;
    const isScrollingUp = currentScrollY < lastScrollY.current;
    const isScrollingDown = currentScrollY > lastScrollY.current;
    const isAtTop = currentScrollY <= 10;
    const showScrollButton = currentScrollY > threshold;
    
    let scrollDirection: 'up' | 'down' | 'idle' = 'idle';
    if (isScrollingUp) scrollDirection = 'up';
    if (isScrollingDown) scrollDirection = 'down';

    setScrollState({
      scrollY: currentScrollY,
      isScrollingUp,
      isScrollingDown,
      isAtTop,
      showScrollButton,
      scrollDirection,
    });

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [threshold]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        updateScrollState();
      });
      ticking.current = true;
    }

    // Reset to idle after scroll stops
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      setScrollState(prev => ({ ...prev, scrollDirection: 'idle' }));
    }, 150);
  }, [updateScrollState]);

  useEffect(() => {
    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial state
    updateScrollState();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleScroll, updateScrollState]);

  const scrollToTop = useCallback((onComplete?: () => void) => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });

    // Detect when scroll completes
    const checkScrollComplete = () => {
      if (window.scrollY <= 10) {
        onComplete?.();
      } else {
        requestAnimationFrame(checkScrollComplete);
      }
    };
    
    requestAnimationFrame(checkScrollComplete);
  }, []);

  return {
    ...scrollState,
    scrollToTop,
  };
};
