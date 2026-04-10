import React, { memo } from 'react';
import { Flame, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface NewAndNoteworthyProps {
  listings: MarketplaceListing[];
  onSeeAll?: () => void;
  onFavorite?: (id: string) => void;
  isFavorited?: (id: string) => boolean;
  isPending?: (id: string) => boolean;
  className?: string;
}

export const NewAndNoteworthy = memo(({
  listings,
  onSeeAll,
  onFavorite,
  isFavorited = () => false,
  isPending = () => false,
  className,
}: NewAndNoteworthyProps) => {
  const recentListings = listings.filter(listing => {
    const createdAt = new Date(listing.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt >= weekAgo;
  }).slice(0, 12);

  const displayListings = recentListings.length > 0 ? recentListings : listings.slice(0, 12);
  const isShowingRecent = recentListings.length > 0;

  if (displayListings.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      {/* Header - Alibaba-style with accent bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg md:text-xl font-bold">
            {isShowingRecent ? 'Hot Picks' : 'Recommended'}
          </h2>
          {isShowingRecent && (
            <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px]">
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              New
            </Badge>
          )}
        </div>
        {onSeeAll && (
          <Button variant="ghost" size="sm" onClick={onSeeAll} className="text-primary text-xs -mr-2">
            See All <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        )}
      </div>

      {/* Desktop: 5-column dense grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {displayListings.slice(0, 12).map((listing, idx) => (
          <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
            <ProductCard
              listing={listing}
              onFavorite={onFavorite}
              isFavorited={isFavorited(listing.id)}
              isPending={isPending(listing.id)}
            />
          </div>
        ))}
      </div>

      {/* Mobile: 2-column dense grid */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {displayListings.slice(0, 8).map((listing, idx) => (
          <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
            <ProductCard
              listing={listing}
              onFavorite={onFavorite}
              isFavorited={isFavorited(listing.id)}
              isPending={isPending(listing.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
});

NewAndNoteworthy.displayName = 'NewAndNoteworthy';
