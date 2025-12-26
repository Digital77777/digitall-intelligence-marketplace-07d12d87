const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-muted rounded ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/60 to-transparent" />
  </div>
);

export const ReelSkeleton = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header skeleton */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
        <ShimmerBlock className="h-10 w-10 rounded-full bg-white/10" />
        <ShimmerBlock className="h-5 w-16 bg-white/10" />
        <div className="w-10" />
      </div>

      {/* Progress bar skeleton */}
      <div className="absolute top-16 left-0 right-0 z-20 flex gap-1 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerBlock key={i} className="h-0.5 flex-1 bg-white/20" />
        ))}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md aspect-[9/16] relative">
          <ShimmerBlock className="absolute inset-0 bg-white/5" />
          
          {/* Center loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        </div>
      </div>

      {/* Right side actions skeleton */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 z-10">
        <ShimmerBlock className="w-12 h-12 rounded-full bg-white/10" />
        <div className="flex flex-col items-center gap-1">
          <ShimmerBlock className="w-10 h-10 rounded-full bg-white/10" />
          <ShimmerBlock className="h-3 w-8 bg-white/10" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <ShimmerBlock className="w-10 h-10 rounded-full bg-white/10" />
          <ShimmerBlock className="h-3 w-8 bg-white/10" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <ShimmerBlock className="w-10 h-10 rounded-full bg-white/10" />
          <ShimmerBlock className="h-3 w-8 bg-white/10" />
        </div>
      </div>

      {/* Bottom info skeleton */}
      <div className="absolute bottom-6 left-4 right-20 z-10 space-y-2">
        <ShimmerBlock className="h-4 w-24 bg-white/10" />
        <ShimmerBlock className="h-4 w-48 bg-white/10" />
      </div>
    </div>
  );
};
