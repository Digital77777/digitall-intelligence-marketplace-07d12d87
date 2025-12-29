import { useEffect } from 'react';
import { useBackgroundLoader } from '@/hooks/useBackgroundLoader';

/**
 * Component that initializes background loading behavior
 * Place this inside the Router but outside of Routes
 */
export const BackgroundLoader = () => {
  useBackgroundLoader();
  
  // Preload critical assets on mount
  useEffect(() => {
    // Preload critical images using link preload
    const preloadImage = (src: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    };

    // Preload hero image if not already loaded
    const heroImages = [
      '/hero-ai-education-optimized.jpg',
    ];

    heroImages.forEach(preloadImage);
  }, []);

  return null;
};
