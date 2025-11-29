import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Download } from 'lucide-react';
import { MarketplaceListing } from '@/hooks/useMarketplace';

interface TopChartCardProps {
  listing: MarketplaceListing;
  rank: number;
  colorIndex: number;
}

const colorClasses = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

export const TopChartCard = memo(({ listing, rank, colorIndex }: TopChartCardProps) => {
  const navigate = useNavigate();
  const colorClass = colorClasses[colorIndex % colorClasses.length];

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-muted-foreground w-8">{rank}</span>
          <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
            <span className="text-xl font-bold text-white">{listing.title.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate">{listing.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{listing.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">4.5</span>
              {listing.price && <span className="text-xs">• ${listing.price}</span>}
            </div>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-1" />
            Install
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

TopChartCard.displayName = 'TopChartCard';
