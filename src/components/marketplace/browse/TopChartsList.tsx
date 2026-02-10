import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, TrendingUp, Heart, Eye, ShoppingBag, Wrench, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { cn } from '@/lib/utils';

interface TopChartsListProps {
  listings: MarketplaceListing[];
  onFavorite?: (id: string) => void;
  isFavorited?: (id: string) => boolean;
  isPending?: (id: string) => boolean;
}

const rankColors = {
  1: 'from-yellow-400 to-amber-500',
  2: 'from-gray-300 to-gray-400',
  3: 'from-orange-400 to-orange-600',
};

const rankBgColors = {
  1: 'bg-yellow-50 dark:bg-yellow-900/20',
  2: 'bg-gray-50 dark:bg-gray-900/20',
  3: 'bg-orange-50 dark:bg-orange-900/20',
};

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
];

interface TopChartItemProps {
  listing: MarketplaceListing;
  rank: number;
  onFavorite?: () => void;
  isFavorited?: boolean;
  isPending?: boolean;
}

const TopChartItem = memo(({ 
  listing, 
  rank, 
  onFavorite, 
  isFavorited = false,
  isPending = false 
}: TopChartItemProps) => {
  const navigate = useNavigate();
  const isTopThree = rank <= 3;
  const TypeIcon = typeIcons[listing.listing_type] || ShoppingBag;
  const gradient = gradients[(rank - 1) % gradients.length];
  const hasImage = listing.images?.[0];
  
  // Simulate popularity (would come from real data)
  const popularity = Math.max(100 - (rank * 8), 20);

  return (
    <div
      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:bg-muted/50",
        isTopThree && rankBgColors[rank as 1 | 2 | 3],
        rank % 2 === 0 && !isTopThree && "bg-muted/30"
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-10 text-center">
        {isTopThree ? (
          <div className={cn(
            "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
            rankColors[rank as 1 | 2 | 3]
          )}>
            {rank === 1 ? (
              <Trophy className="h-5 w-5 text-white" />
            ) : (
              <span className="text-white font-bold">{rank}</span>
            )}
          </div>
        ) : (
          <span className="text-2xl font-bold text-muted-foreground">{rank}</span>
        )}
      </div>

      {/* Icon/Image */}
      <div className={cn(
        "relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0",
        !hasImage && `bg-gradient-to-br ${gradient}`
      )}>
        {hasImage ? (
          <img
            src={listing.images![0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="h-7 w-7 text-white/90" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold truncate group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          {rank === 1 && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 text-xs">
              #1
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {listing.description}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">4.{9 - Math.min(rank, 5)}</span>
          </div>
          <div className="flex-1 max-w-24">
            <Progress value={popularity} className="h-1.5" />
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs">{Math.floor(1000 / rank)}+</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.();
            }}
            disabled={isPending}
            className="h-9 w-9 rounded-full"
          >
            <Heart className={cn(
              "h-5 w-5 transition-all",
              isFavorited 
                ? "fill-red-500 text-red-500" 
                : "text-muted-foreground group-hover:text-foreground"
            )} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/marketplace/listing/${listing.id}`);
            }}
            className="hidden sm:flex"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
});

TopChartItem.displayName = 'TopChartItem';

export const TopChartsList = memo(({ 
  listings, 
  onFavorite, 
  isFavorited = () => false,
  isPending = () => false 
}: TopChartsListProps) => {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No listings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {listings.map((listing, idx) => (
        <TopChartItem
          key={listing.id}
          listing={listing}
          rank={idx + 1}
          onFavorite={() => onFavorite?.(listing.id)}
          isFavorited={isFavorited(listing.id)}
          isPending={isPending(listing.id)}
        />
      ))}
    </div>
  );
});

TopChartsList.displayName = 'TopChartsList';
