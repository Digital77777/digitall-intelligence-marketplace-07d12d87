import React from 'react';
import { MarketplaceSkeleton } from './MarketplaceSkeleton';

/**
 * Static shell component for the marketplace browse page.
 * This provides an instant visual structure while data loads,
 * creating a smoother perceived loading experience.
 */
export const MarketplaceBrowseShell = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Hero Section Skeleton */}
      <MarketplaceSkeleton variant="hero" />
      
      {/* Search Bar Skeleton */}
      <MarketplaceSkeleton variant="search" />
      
      {/* Tabs Skeleton */}
      <MarketplaceSkeleton variant="tabs" />
      
      {/* Content Area */}
      <div className="min-h-[50vh] space-y-10">
        {/* Carousel Section */}
        <MarketplaceSkeleton variant="carousel" />
        
        {/* Grid Section */}
        <MarketplaceSkeleton variant="grid" />
      </div>
    </div>
  </div>
);

export default MarketplaceBrowseShell;
