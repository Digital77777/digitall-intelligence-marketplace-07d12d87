import React, { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Eye, ShoppingBag, Briefcase, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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

const typeColors = {
  product: 'bg-blue-500',
  service: 'bg-emerald-500',
  job: 'bg-purple-500',
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
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const TypeIcon = typeIcons[listing.listing_type] || ShoppingBag;
  const typeColor = typeColors[listing.listing_type] || 'bg-primary';
  const gradient = gradients[listing.title.charCodeAt(0) % gradients.length];

  const handleClick = () => {
    navigate(`/marketplace/listing/${listing.id}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPending) {
      onFavorite?.(listing.id);
    }
  };

  const hasImage = listing.images?.[0] && !imageError;

  if (variant === 'compact') {
    return (
      <Card
        onClick={handleClick}
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-1",
          className
        )}
      >
        <div className="flex gap-3 p-3">
          <div className={cn(
            "relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0",
            !hasImage && `bg-gradient-to-br ${gradient}`
          )}>
            {hasImage ? (
              <img
                src={listing.images![0]}
                alt={listing.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TypeIcon className="h-7 w-7 text-white/90" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {listing.description}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">4.5</span>
              </div>
              {listing.price && (
                <span className="text-xs font-bold text-primary">
                  ${listing.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-2 border-border/50",
        variant === 'featured' && "md:col-span-2",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <AspectRatio ratio={variant === 'featured' ? 16/9 : 4/3}>
          {hasImage ? (
            <img
              src={listing.images![0]}
              alt={listing.title}
              onError={() => setImageError(true)}
              className={cn(
                "w-full h-full object-cover transition-transform duration-500",
                isHovered && "scale-110"
              )}
            />
          ) : (
            <div className={cn(
              "w-full h-full bg-gradient-to-br flex items-center justify-center",
              gradient
            )}>
              <TypeIcon className="h-16 w-16 text-white/80" />
            </div>
          )}
        </AspectRatio>

        {/* Overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "flex items-end justify-center pb-4"
        )}>
          <Button 
            size="sm" 
            className="bg-white/90 text-black hover:bg-white font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Quick View
          </Button>
        </div>

        {/* Type badge */}
        <Badge className={cn(
          "absolute top-3 left-3 capitalize",
          typeColor,
          "text-white border-0"
        )}>
          <TypeIcon className="h-3 w-3 mr-1" />
          {listing.listing_type}
        </Badge>

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavorite}
          disabled={isPending}
          className={cn(
            "absolute top-3 right-3 h-9 w-9 rounded-full",
            "bg-white/80 hover:bg-white shadow-sm",
            "opacity-0 group-hover:opacity-100 transition-all duration-200",
            isFavorited && "opacity-100"
          )}
        >
          <Heart className={cn(
            "h-5 w-5 transition-all",
            isFavorited 
              ? "fill-red-500 text-red-500 scale-110" 
              : "text-gray-600",
            isPending && "animate-pulse"
          )} />
        </Button>

        {/* Price hidden from browse - only shown on detail page */}

        {/* Featured badge */}
        {listing.is_featured && (
          <Badge className="absolute bottom-3 left-3 bg-yellow-500/90 text-white border-0">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Featured
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {listing.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">4.5</span>
            <span className="text-xs text-muted-foreground">(128)</span>
          </div>
          
          {listing.tags && listing.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {listing.tags[0]}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';
