import { Card, CardContent } from "@/components/ui/card";

const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-muted rounded ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/60 to-transparent" />
  </div>
);

export const EventCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              <ShimmerBlock className="h-5 w-16 rounded-full" />
              <ShimmerBlock className="h-5 w-14 rounded-full" />
              <ShimmerBlock className="h-5 w-18 rounded-full" />
            </div>
            {/* Title */}
            <ShimmerBlock className="h-6 w-3/4 mb-2 sm:mb-3" />
            {/* Description */}
            <ShimmerBlock className="h-4 w-full mb-1" />
            <ShimmerBlock className="h-4 w-2/3 mb-2 sm:mb-3" />
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ShimmerBlock className="h-4 w-24" />
              <ShimmerBlock className="h-4 w-16" />
              <ShimmerBlock className="h-4 w-20" />
            </div>
          </div>
          {/* Button */}
          <ShimmerBlock className="h-9 w-full sm:w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export const EventSkeletonGrid = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
};
