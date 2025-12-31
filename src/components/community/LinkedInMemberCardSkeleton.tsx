import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LinkedInMemberCardSkeleton: React.FC = () => {
  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden">
      {/* Background gradient skeleton */}
      <Skeleton className="h-14 w-full" />

      {/* Avatar skeleton - positioned to overlap background */}
      <div className="flex justify-center -mt-8">
        <Skeleton className="h-16 w-16 rounded-full border-2 border-background" />
      </div>

      {/* Content skeleton */}
      <div className="px-3 pt-2 pb-4 flex flex-col items-center">
        {/* Name skeleton */}
        <Skeleton className="h-4 w-24 mb-1" />

        {/* Headline skeleton */}
        <Skeleton className="h-3 w-32 mt-1" />
        <Skeleton className="h-3 w-20 mt-1" />

        {/* Mutual connections skeleton */}
        <div className="flex items-center justify-center gap-1 mt-2 mb-3">
          <div className="flex -space-x-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
          <Skeleton className="h-2 w-12" />
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-8 w-full rounded-full" />
      </div>
    </div>
  );
};

export const LinkedInMemberCardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <LinkedInMemberCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default LinkedInMemberCardSkeleton;
