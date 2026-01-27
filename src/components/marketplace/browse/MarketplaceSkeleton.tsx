import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MarketplaceSkeletonProps {
  variant: 'hero' | 'search' | 'tabs' | 'carousel' | 'grid' | 'topCharts' | 'categories';
  className?: string;
}

export const MarketplaceSkeleton = ({ variant, className }: MarketplaceSkeletonProps) => {
  switch (variant) {
    case 'hero':
      return (
        <div className={cn("relative w-full h-[280px] md:h-[400px] rounded-2xl overflow-hidden", className)}>
          <Skeleton className="absolute inset-0" />
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      );

    case 'search':
      return (
        <div className={cn("w-full", className)}>
          <Skeleton className="h-12 md:h-14 w-full rounded-2xl" />
        </div>
      );

    case 'tabs':
      return (
        <div className={cn("flex gap-2", className)}>
          <Skeleton className="h-11 w-full max-w-xs rounded-2xl" />
        </div>
      );

    case 'carousel':
      return (
        <div className={cn("space-y-4", className)}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px] space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'grid':
      return (
        <div className={cn("space-y-4", className)}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'topCharts':
      return (
        <div className={cn("space-y-2", className)}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl",
                i <= 3 && "bg-muted/50"
              )}
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-md hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'categories':
      return (
        <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6", className)}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="p-6 rounded-xl bg-muted/30 space-y-4">
              <Skeleton className="h-16 w-16 mx-auto rounded-2xl" />
              <Skeleton className="h-5 w-24 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
};
