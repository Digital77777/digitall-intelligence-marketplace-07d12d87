/**
 * useReelsGestures - Self-contained TikTok-style gesture overlay for mobile fullscreen videos
 * 
 * SAFETY: This hook is designed to be non-breaking and integration-safe.
 * - Only activates on mobile devices in fullscreen mode
 * - Only activates when video occupies >70% of viewport height
 * - Automatically cleans up on exit/unmount
 * - Does not mutate global state or existing components
 */

import { useEffect, useRef, useCallback } from 'react';

interface ReelsGesturesOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  isFullscreen: boolean;
  onNextReel?: () => void;
  onPrevReel?: () => void;
  onLikeToggle?: () => void;
  enabled?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

// Minimum swipe distance threshold
const SWIPE_THRESHOLD = 50;
// Debounce time for gestures (ms)
const GESTURE_DEBOUNCE = 300;
// Double tap detection window (ms)
const DOUBLE_TAP_WINDOW = 300;

/**
 * Detects if device is mobile (touch-capable)
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Checks if video container occupies >70% of viewport height
 */
const isVideoLargeEnough = (container: HTMLElement | null): boolean => {
  if (!container) return false;
  const rect = container.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  return rect.height / viewportHeight > 0.7;
};

export const useReelsGestures = ({
  videoRef,
  containerRef,
  isFullscreen,
  onNextReel,
  onPrevReel,
  onLikeToggle,
  enabled = true,
}: ReelsGesturesOptions) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const touchState = useRef<TouchState | null>(null);
  const lastTapTime = useRef<number>(0);
  const gestureDebounce = useRef<boolean>(false);

  /**
   * Seeks video by specified seconds (positive = forward, negative = rewind)
   */
  const seekVideo = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    video.currentTime = newTime;
  }, [videoRef]);

  /**
   * Creates and injects the invisible overlay
   */
  const createOverlay = useCallback(() => {
    // Safety: Don't create if already exists
    if (overlayRef.current) return;

    const overlay = document.createElement('div');
    
    // Apply styles inline to avoid CSS conflicts
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '9999',
      background: 'transparent',
      pointerEvents: 'auto',
      touchAction: 'none',
      display: 'block',
    });

    // Use unique data attribute instead of ID to avoid conflicts
    overlay.setAttribute('data-reels-gesture-overlay', 'true');

    document.body.appendChild(overlay);
    overlayRef.current = overlay;
  }, []);

  /**
   * Removes the overlay and cleans up
   */
  const destroyOverlay = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }
  }, []);

  /**
   * Determines tap zone based on X position
   * Left 30% = rewind, Middle 40% = none, Right 30% = forward
   */
  const getTapZone = useCallback((x: number): 'left' | 'middle' | 'right' => {
    const viewportWidth = window.innerWidth;
    const leftThreshold = viewportWidth * 0.3;
    const rightThreshold = viewportWidth * 0.7;

    if (x < leftThreshold) return 'left';
    if (x > rightThreshold) return 'right';
    return 'middle';
  }, []);

  /**
   * Handles touch start event
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  /**
   * Handles touch end event - detects swipes, taps, and double taps
   */
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchState.current || gestureDebounce.current) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const { startX, startY, startTime } = touchState.current;
    const endX = touch.clientX;
    const endY = touch.clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = Date.now() - startTime;

    // Reset touch state
    touchState.current = null;

    // Detect swipe (must be quick and exceed threshold)
    if (deltaTime < 500) {
      // Vertical swipe detection (prioritize over horizontal)
      if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
        gestureDebounce.current = true;
        setTimeout(() => { gestureDebounce.current = false; }, GESTURE_DEBOUNCE);

        if (deltaY < 0 && onNextReel) {
          // Swipe UP - next reel
          onNextReel();
        } else if (deltaY > 0 && onPrevReel) {
          // Swipe DOWN - previous reel
          onPrevReel();
        }
        return;
      }
    }

    // Detect tap (minimal movement)
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
      const now = Date.now();

      // Check for double tap
      if (now - lastTapTime.current < DOUBLE_TAP_WINDOW) {
        // Double tap detected - toggle like
        lastTapTime.current = 0;
        gestureDebounce.current = true;
        setTimeout(() => { gestureDebounce.current = false; }, GESTURE_DEBOUNCE);
        
        if (onLikeToggle) {
          onLikeToggle();
        }
        return;
      }

      lastTapTime.current = now;

      // Single tap - handle after double tap window passes
      setTimeout(() => {
        if (Date.now() - lastTapTime.current >= DOUBLE_TAP_WINDOW - 50) {
          const zone = getTapZone(endX);
          
          if (zone === 'left') {
            // Rewind 10 seconds
            seekVideo(-10);
          } else if (zone === 'right') {
            // Forward 10 seconds
            seekVideo(10);
          }
          // Middle zone - no action
        }
      }, DOUBLE_TAP_WINDOW);
    }
  }, [onNextReel, onPrevReel, onLikeToggle, getTapZone, seekVideo]);

  /**
   * Checks all conditions for activation
   */
  const shouldActivate = useCallback((): boolean => {
    if (!enabled) return false;
    if (!isMobileDevice()) return false;
    if (!isFullscreen) return false;
    if (!isVideoLargeEnough(containerRef.current)) return false;
    return true;
  }, [enabled, isFullscreen, containerRef]);

  /**
   * Main effect: manages overlay lifecycle and event listeners
   */
  useEffect(() => {
    const activate = shouldActivate();

    if (activate) {
      createOverlay();

      const overlay = overlayRef.current;
      if (overlay) {
        overlay.addEventListener('touchstart', handleTouchStart, { passive: true });
        overlay.addEventListener('touchend', handleTouchEnd, { passive: true });
      }
    } else {
      destroyOverlay();
    }

    // Cleanup on dependency change or unmount
    return () => {
      const overlay = overlayRef.current;
      if (overlay) {
        overlay.removeEventListener('touchstart', handleTouchStart);
        overlay.removeEventListener('touchend', handleTouchEnd);
      }
      destroyOverlay();
    };
  }, [shouldActivate, createOverlay, destroyOverlay, handleTouchStart, handleTouchEnd]);

  /**
   * Additional cleanup on route change / orientation change
   */
  useEffect(() => {
    const handleOrientationChange = () => {
      // Re-evaluate on orientation change
      if (!shouldActivate()) {
        destroyOverlay();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        destroyOverlay();
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldActivate, destroyOverlay]);

  // Return control functions for external use if needed
  return {
    isActive: shouldActivate(),
    seekVideo,
  };
};
