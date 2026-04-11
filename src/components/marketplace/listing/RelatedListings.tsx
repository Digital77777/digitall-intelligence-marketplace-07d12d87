import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { ProductCard } from '@/components/marketplace/browse/ProductCard';
import { ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RelatedListingsProps {
  listings: MarketplaceListing[];
  isFavorited: (id: string) => boolean;
  isPending: (id: string) => boolean;
  onFavorite: (id: string) => Promise<void>;
  className?: string;
}

export const RelatedListings: React.FC<RelatedListingsProps> = ({
  listings, isFavorited, isPending, onFavorite, className
}) => {
  const navigate = useNavigate();
  if (listings.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-orange-500 rounded-full" />
          <h2 className="text-base font-bold">Recommended For You</h2>
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 hidden md:flex"
          onClick={() => navigate('/marketplace/browse')}>
          View All <ChevronRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {listings.map((listing) => (
          <ProductCard
            key={listing.id}
            listing={listing}
            isFavorited={isFavorited(listing.id)}
            isPending={isPending(listing.id)}
            onFavorite={onFavorite}
          />
        ))}
      </div>

      <div className="md:hidden">
        <Button variant="outline" size="sm" className="w-full gap-1 text-xs"
          onClick={() => navigate('/marketplace/browse')}>
          Explore More <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </section>
  );
};
