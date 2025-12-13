import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const InsightCardSkeleton = () => {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden max-w-full animate-pulse">
      <CardContent className="p-0 rounded-xl overflow-hidden">
        {/* Media skeleton - matches image/video area */}
        <Skeleton className="w-full h-48 md:h-40 rounded-none" />
        
        {/* Content section */}
        <div className="p-4 md:p-3.5">
          {/* Author info skeleton */}
          <div className="flex items-center gap-3 md:gap-2 mb-3 md:mb-2">
            <Skeleton className="w-10 h-10 md:w-8 md:h-8 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>

          {/* Title skeleton */}
          <Skeleton className="h-5 w-full mb-2 md:mb-1.5" />
          <Skeleton className="h-5 w-3/4 mb-2 md:mb-1.5" />
          
          {/* Preview text skeleton */}
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-3 md:mb-2" />

          {/* Footer skeleton */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 md:gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center gap-2 md:gap-1">
              <Skeleton className="h-9 md:h-7 w-16 rounded-md" />
              <Skeleton className="h-9 md:h-7 w-14 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Grid of skeletons for initial load
export const InsightSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
  );
};
