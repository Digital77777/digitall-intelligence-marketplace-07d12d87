import React, { memo } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  // Filter for recent listings (last 7 days)
  const recentListings = listings.filter(listing => {
    const createdAt = new Date(listing.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt >= weekAgo;
  }).slice(0, 8);

  // If no recent listings, show latest listings with a different message
  const displayListings = recentListings.length > 0 ? recentListings : listings.slice(0, 8);
  const isShowingRecent = recentListings.length > 0;

  if (displayListings.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold">
              {isShowingRecent ? 'New & Noteworthy' : 'Latest Additions'}
            </h2>
          </div>
          {isShowingRecent && (
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
              Fresh
            </Badge>
          )}
        </div>
        {onSeeAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSeeAll}
            className="text-primary hover:text-primary/80 -mr-2"
          >
            See All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Grid for desktop, scroll for mobile */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayListings.slice(0, 4).map((listing, idx) => (
          <div 
            key={listing.id}
            className="animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <ProductCard
              listing={listing}
              onFavorite={onFavorite}
              isFavorited={isFavorited(listing.id)}
              isPending={isPending(listing.id)}
            />
            {isShowingRecent && (
              <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0 z-10">
                NEW
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: 2-column grid */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {displayListings.map((listing, idx) => (
          <div 
            key={listing.id} 
            className="relative animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <ProductCard
              listing={listing}
              onFavorite={onFavorite}
              isFavorited={isFavorited(listing.id)}
              isPending={isPending(listing.id)}
            />
            {isShowingRecent && (
              <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0 z-10">
                NEW
              </Badge>
            )}
          </div>
        ))}
      </div>
    </section>
  );
});

NewAndNoteworthy.displayName = 'NewAndNoteworthy';
