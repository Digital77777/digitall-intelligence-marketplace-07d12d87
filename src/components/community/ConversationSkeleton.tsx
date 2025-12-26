const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-muted rounded ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-background/60 to-transparent" />
  </div>
);

export const ConversationItemSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border/50">
      {/* Avatar */}
      <ShimmerBlock className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Name */}
        <ShimmerBlock className="h-4 w-24" />
        {/* Last message */}
        <ShimmerBlock className="h-3 w-full max-w-[180px]" />
      </div>
      {/* Time */}
      <ShimmerBlock className="h-3 w-10" />
    </div>
  );
};

export const ConversationListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="divide-y divide-border/50">
      {Array.from({ length: count }).map((_, i) => (
        <ConversationItemSkeleton key={i} />
      ))}
    </div>
  );
};

export const MessageSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <ShimmerBlock className={`h-12 w-48 rounded-2xl ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`} />
        <ShimmerBlock className="h-3 w-12 mt-1" />
      </div>
    </div>
  );
};

export const ChatMessagesSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="flex-1 p-4 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} isOwn={i % 3 === 0} />
      ))}
    </div>
  );
};
