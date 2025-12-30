import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const InstagramPostSkeleton = () => {
  return (
    <div className="border-b border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-5" />
      </div>

      {/* Media placeholder - square aspect ratio */}
      <Skeleton className="w-full aspect-square" />

      {/* Action bar */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        <Skeleton className="h-6 w-6 rounded" />
      </div>

      {/* Likes */}
      <div className="px-4 pb-1">
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Caption */}
      <div className="px-4 pb-2 space-y-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>

      {/* Comments link */}
      <div className="px-4 pb-2">
        <Skeleton className="h-3 w-28" />
      </div>

      {/* Category */}
      <div className="px-4 pb-3">
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
  );
};

export const InstagramFeedSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: count }).map((_, index) => (
        <InstagramPostSkeleton key={index} />
      ))}
    </div>
  );
};
