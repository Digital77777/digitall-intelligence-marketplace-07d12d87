import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ListingDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Breadcrumb */}
      <div className="border-b bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-2">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Media */}
          <div className="lg:col-span-5">
            <div className="flex gap-2">
              <div className="hidden md:flex flex-col gap-1.5 w-[72px]">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-[68px] h-[68px] rounded" />
                ))}
              </div>
              <Skeleton className="flex-1 aspect-square md:aspect-[4/3] rounded-lg" />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="mt-8 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg border p-2 space-y-2">
                <Skeleton className="w-full aspect-square rounded" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
