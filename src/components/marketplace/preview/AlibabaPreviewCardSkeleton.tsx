import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const AlibabaPreviewCardSkeleton: React.FC = () => {
  return (
    <article className="bg-card overflow-hidden">
      {/* Media placeholder — square, matches AlibabaPreviewCard */}
      <Skeleton className="w-full aspect-square rounded-none" />

      {/* Body */}
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        {/* Title row */}
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>

        {/* Price */}
        <Skeleton className="h-6 w-40" />

        {/* MOQ + sold */}
        <Skeleton className="h-3 w-32" />

        {/* Certifications row */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-8 rounded" />
          <Skeleton className="h-4 w-8 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Verified line */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 flex-1" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1.5">
          <Skeleton className="flex-1 h-10 rounded-full" />
          <Skeleton className="flex-1 h-10 rounded-full" />
        </div>
      </div>
    </article>
  );
};

export const AlibabaPreviewFeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <AlibabaPreviewCardSkeleton key={i} />
      ))}
    </div>
  );
};
