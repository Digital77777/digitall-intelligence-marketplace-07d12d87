import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { MarketplaceListing } from '@/hooks/useMarketplace';

interface ToolCardProps {
  listing: MarketplaceListing;
  colorIndex: number;
}

const colorClasses = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

export const ToolCard = memo(({ listing, colorIndex }: ToolCardProps) => {
  const navigate = useNavigate();
  const colorClass = colorClasses[colorIndex % colorClasses.length];

  return (
    <Card 
      className="inline-block w-[320px] cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className={`w-14 h-14 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
            <span className="text-2xl font-bold text-white">{listing.title.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate">{listing.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{listing.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs ml-1">4.5</span>
              </div>
              <Badge variant="secondary" className="text-xs">{listing.listing_type}</Badge>
              {listing.price && <span className="text-xs font-semibold">${listing.price}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ToolCard.displayName = 'ToolCard';
