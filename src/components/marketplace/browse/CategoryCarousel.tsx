import React, { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface CategoryCarouselProps {
  title: string;
  listings: MarketplaceListing[];
  onSeeAll?: () => void;
  onFavorite?: (id: string) => void;
  isFavorited?: (id: string) => boolean;
  isPending?: (id: string) => boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
}

export const CategoryCarousel = memo(({
  title,
  listings,
  onSeeAll,
  onFavorite,
  isFavorited = () => false,
  isPending = () => false,
  showBadge,
  badgeText,
  className,
}: CategoryCarouselProps) => {
  if (listings.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {showBadge && badgeText && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {badgeText}
            </span>
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

      {/* Mobile: 2-column grid */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {listings.slice(0, 10).map((listing) => (
          <ProductCard
            key={listing.id}
            listing={listing}
            onFavorite={onFavorite}
            isFavorited={isFavorited(listing.id)}
            isPending={isPending(listing.id)}
          />
        ))}
      </div>

      {/* Desktop: Horizontal carousel */}
      <div className="hidden md:block">
        <ScrollArea className="w-full -mx-4 px-4">
          <div className="flex gap-4 pb-4">
            {listings.slice(0, 10).map((listing) => (
              <div 
                key={listing.id} 
                className="flex-shrink-0 w-[320px]"
              >
                <ProductCard
                  listing={listing}
                  onFavorite={onFavorite}
                  isFavorited={isFavorited(listing.id)}
                  isPending={isPending(listing.id)}
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>
    </section>
  );
});

CategoryCarousel.displayName = 'CategoryCarousel';
