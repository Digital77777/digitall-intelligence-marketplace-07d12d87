import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { ProductCard } from '@/components/marketplace/browse/ProductCard';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RelatedListingsProps {
  listings: MarketplaceListing[];
  isFavorited: (id: string) => boolean;
  isPending: (id: string) => boolean;
  onFavorite: (id: string) => Promise<void>;
  className?: string;
}

export const RelatedListings: React.FC<RelatedListingsProps> = ({
  listings,
  isFavorited,
  isPending,
  onFavorite,
  className
}) => {
  const navigate = useNavigate();

  if (listings.length === 0) return null;

  return (
    <section className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">You Might Also Like</h2>
            <p className="text-sm text-muted-foreground">Discover similar products</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="gap-2 hidden md:flex"
          onClick={() => navigate('/marketplace/browse')}
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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

      {/* Mobile View All */}
      <div className="md:hidden">
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => navigate('/marketplace/browse')}
        >
          Explore More Products
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </section>
  );
};
