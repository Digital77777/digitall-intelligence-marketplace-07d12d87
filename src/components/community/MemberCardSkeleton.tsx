import { Card, CardContent } from "@/components/ui/card";

const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-muted rounded ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/60 to-transparent" />
  </div>
);

export const MemberCardSkeleton = () => {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <ShimmerBlock className="h-12 w-12 sm:h-16 sm:w-16 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              {/* Name and badge */}
              <div className="flex items-start gap-2">
                <ShimmerBlock className="h-5 w-32" />
                <ShimmerBlock className="h-5 w-12 rounded-full" />
              </div>
              {/* Stats */}
              <div className="flex items-center gap-3">
                <ShimmerBlock className="h-4 w-28" />
                <ShimmerBlock className="h-4 w-20" />
              </div>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <ShimmerBlock className="h-9 flex-1 sm:w-24 rounded-md" />
            <ShimmerBlock className="h-9 flex-1 sm:w-24 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MemberSkeletonGrid = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <MemberCardSkeleton key={i} />
      ))}
    </div>
  );
};
