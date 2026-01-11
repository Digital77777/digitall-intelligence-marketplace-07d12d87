const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-muted rounded ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/60 to-transparent" />
  </div>
);

export const TikTokReelsSkeleton = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Top navigation skeleton */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-12 pb-4 px-4">
        <div className="flex items-center justify-center gap-6">
          <ShimmerBlock className="h-5 w-16 bg-white/10 rounded-full" />
          <ShimmerBlock className="h-5 w-20 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        {/* Center loading indicator */}
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      </div>

      {/* Right side actions skeleton */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Avatar */}
        <div className="relative mb-2">
          <ShimmerBlock className="w-12 h-12 rounded-full bg-white/10" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white/10" />
        </div>
        
        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <ShimmerBlock className="w-10 h-10 rounded-full bg-white/10" />
          <ShimmerBlock className="h-3 w-8 bg-white/10" />
        </div>
        
        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <ShimmerBlock className="w-10 h-10 rounded-full bg-white/10" />
          <ShimmerBlock className="h-3 w-8 bg-white/10" />
        </div>
        
        {/* Bookmark */}
        <div className="flex flex-col items-center gap-1">
          <ShimmerBlock className="w-10 h-10 rounded-full bg-white/10" />
          <ShimmerBlock className="h-3 w-8 bg-white/10" />
        </div>
        
        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <ShimmerBlock className="w-10 h-10 rounded-full bg-white/10" />
          <ShimmerBlock className="h-3 w-8 bg-white/10" />
        </div>

        {/* Audio disc */}
        <ShimmerBlock className="w-10 h-10 rounded-lg bg-white/10 mt-2" />
      </div>

      {/* Bottom info skeleton */}
      <div className="absolute bottom-6 left-4 right-20 z-10 space-y-3">
        <ShimmerBlock className="h-4 w-28 bg-white/10" />
        <ShimmerBlock className="h-4 w-48 bg-white/10" />
        <div className="flex items-center gap-2 mt-3">
          <ShimmerBlock className="h-7 w-40 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
};
