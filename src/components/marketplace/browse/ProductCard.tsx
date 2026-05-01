import React, { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Briefcase, Wrench, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  listing: MarketplaceListing;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  isPending?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const typeIcons = {
  product: ShoppingBag,
  service: Wrench,
  job: Briefcase,
};

const gradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
];

export const ProductCard = memo(({
  listing,
  onFavorite,
  isFavorited = false,
  isPending = false,
  variant = 'default',
  className,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const TypeIcon = typeIcons[listing.listing_type] || ShoppingBag;
  const gradient = gradients[listing.title.charCodeAt(0) % gradients.length];
  const hasImage = listing.images?.[0] && !imageError;

  // Simulated stats
  const orderCount = Math.floor((listing.title.charCodeAt(0) * 7 + listing.title.length * 13) % 900 + 100);
  const rating = (4 + (listing.title.charCodeAt(0) % 10) / 10).toFixed(1);

  const handleClick = () => navigate(`/marketplace/preview/${listing.id}`);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPending) onFavorite?.(listing.id);
  };

  // Compact variant for list views
  if (variant === 'compact') {
    return (
      <Card
        onClick={handleClick}
        className={cn(
          "group overflow-hidden cursor-pointer transition-all duration-200",
          "hover:shadow-md",
          className
        )}
      >
        <div className="flex gap-3 p-3">
          <div className={cn(
            "relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0",
            !hasImage && `bg-gradient-to-br ${gradient}`
          )}>
            {hasImage ? (
              <img src={listing.images![0]} alt={listing.title} onError={() => setImageError(true)} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TypeIcon className="h-7 w-7 text-white/90" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{listing.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{listing.description}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "group overflow-hidden cursor-pointer transition-all duration-200",
        "hover:shadow-lg border-border/40",
        variant === 'featured' && "md:col-span-2",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {hasImage ? (
          <img
            src={listing.images![0]}
            alt={listing.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", gradient)}>
            <TypeIcon className="h-10 w-10 text-white/80" />
          </div>
        )}

        {/* Favorite */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavorite}
          disabled={isPending}
          className={cn(
            "absolute top-2 right-2 h-7 w-7 rounded-full bg-white/80 hover:bg-white shadow-sm",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isFavorited && "opacity-100"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </Button>

        {/* Type badge */}
        <Badge className={cn(
          "absolute top-2 left-2 text-[10px] capitalize border-0 text-white",
          listing.listing_type === 'product' && 'bg-blue-500',
          listing.listing_type === 'service' && 'bg-emerald-500',
          listing.listing_type === 'job' && 'bg-purple-500',
        )}>
          {listing.listing_type}
        </Badge>

        {listing.is_featured && (
          <Badge className="absolute bottom-2 left-2 bg-yellow-500/90 text-white border-0 text-[10px]">
            <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
            Featured
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[2.25rem]">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{rating}</span>
          <span className="text-[10px] text-muted-foreground">({orderCount})</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{orderCount}+ orders</span>
        </div>

        {listing.tags && listing.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {listing.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';
