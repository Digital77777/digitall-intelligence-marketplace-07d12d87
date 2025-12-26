import { Card, CardContent } from "@/components/ui/card";

const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-muted rounded ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/60 to-transparent" />
  </div>
);

export const TopicCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-border/40">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 pb-2">
          <ShimmerBlock className="w-9 h-9 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <ShimmerBlock className="h-4 w-28" />
            <ShimmerBlock className="h-3 w-20" />
          </div>
        </div>

        {/* Content */}
        <div className="px-3 pb-2">
          <ShimmerBlock className="h-5 w-full mb-1.5" />
          <ShimmerBlock className="h-5 w-3/4 mb-1.5" />
          <ShimmerBlock className="h-4 w-full mb-1" />
          <ShimmerBlock className="h-4 w-2/3" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
          <ShimmerBlock className="h-5 w-16 rounded-full" />
          <ShimmerBlock className="h-5 w-20 rounded-full" />
          <ShimmerBlock className="h-5 w-14 rounded-full" />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 border-t border-border/40">
          <ShimmerBlock className="h-4 w-20" />
          <ShimmerBlock className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
};

export const TopicSkeletonGrid = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TopicCardSkeleton key={i} />
      ))}
    </div>
  );
};
