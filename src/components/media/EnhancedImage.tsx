import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  category?: 'tech' | 'office' | 'nature' | 'design' | 'ai' | 'default';
  fallbackSrc?: string;
  showLoader?: boolean;
  onImageClick?: () => void;
  enableBlurUp?: boolean;
  priority?: boolean;
}

const categoryPlaceholders = {
  tech: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop',
  office: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&auto=format&fit=crop',
  nature: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&auto=format&fit=crop',
  design: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&auto=format&fit=crop',
  ai: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop'
};

// Generate a tiny placeholder URL for blur effect
const generateBlurPlaceholder = (src: string): string => {
  // For Unsplash images, use their built-in tiny sizing
  if (src.includes('unsplash.com')) {
    const baseUrl = src.split('?')[0];
    return `${baseUrl}?w=20&q=10&blur=10&auto=format`;
  }
  // For Supabase storage or other URLs, return the original (will use CSS blur)
  return src;
};

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  category = 'default',
  fallbackSrc,
  showLoader = true,
  onImageClick,
  enableBlurUp = true,
  priority = false,
  className,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fallbackLevel, setFallbackLevel] = useState(0);
  const [isInView, setIsInView] = useState(priority);
  const [blurLoaded, setBlurLoaded] = useState(false);

  // Generate blur placeholder URL
  const blurPlaceholder = useMemo(() => generateBlurPlaceholder(src), [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '200px' // Start loading before it enters viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setFallbackLevel(0);
    setBlurLoaded(false);
  }, [src]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackLevel === 0 && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setFallbackLevel(1);
      setHasError(false);
      setIsLoading(true);
    } else if (fallbackLevel <= 1) {
      const placeholder = categoryPlaceholders[category];
      setCurrentSrc(placeholder);
      setFallbackLevel(2);
      setHasError(false);
      setIsLoading(true);
    }
  }, [fallbackSrc, category, fallbackLevel]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleBlurLoad = useCallback(() => {
    setBlurLoaded(true);
  }, []);

  const handleClick = useCallback(() => {
    if (onImageClick && !hasError) {
      onImageClick();
    }
  }, [onImageClick, hasError]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden bg-muted", className)}
    >
      {/* Blur placeholder - always rendered first for blur-up effect */}
      {enableBlurUp && isLoading && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={blurPlaceholder}
            alt=""
            aria-hidden="true"
            onLoad={handleBlurLoad}
            className={cn(
              "w-full h-full object-cover scale-110 transition-opacity duration-300",
              blurLoaded ? "opacity-100" : "opacity-0",
              "blur-xl"
            )}
            style={{ filter: 'blur(20px)' }}
          />
          {/* Gradient overlay for smoother blur effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/20" />
        </div>
      )}

      {/* Loading skeleton (fallback if blur not enabled or not loaded) */}
      {isLoading && showLoader && (!enableBlurUp || !blurLoaded) && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Shimmer effect overlay during loading */}
      {isLoading && blurLoaded && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 -translate-x-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              animation: 'shimmer 1.5s infinite'
            }}
          />
        </div>
      )}

      {/* Main Image - only load when in view */}
      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          onClick={handleClick}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "transition-all duration-500 ease-out w-full h-full",
            isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
            onImageClick && !hasError && "cursor-pointer hover:scale-105 hover:brightness-110"
          )}
          {...props}
        />
      )}

      {/* Click to expand indicator */}
      {onImageClick && !hasError && !isLoading && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20 flex items-center justify-center">
          <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Click to expand
          </div>
        </div>
      )}
    </div>
  );
};