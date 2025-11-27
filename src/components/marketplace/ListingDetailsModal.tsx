import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { MediaPreview } from '@/components/media/MediaPreview';
import { cn } from '@/lib/utils';

interface ListingDetailsModalProps {
  listing: MarketplaceListing | null;
  isOpen: boolean;
  onClose: () => void;
  onFavorite?: (listingId: string) => void;
  isFavorited?: boolean;
  isPending?: boolean;
}

export const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  listing,
  isOpen,
  onClose,
  onFavorite,
  isFavorited = false,
  isPending = false
}) => {
  if (!listing) return null;

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleUseCreation = () => {
    if (listing.creation_link) {
      window.open(listing.creation_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="listing-description">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold">{listing.title}</DialogTitle>
            {onFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFavorite(listing.id)}
                disabled={isPending}
                className={cn(
                  "h-8 w-8 p-0 transition-all duration-200",
                  isFavorited && "text-red-500",
                  isPending && "opacity-50"
                )}
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Heart 
                    className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isFavorited && "fill-red-500 text-red-500 scale-110"
                    )} 
                    aria-hidden="true" 
                  />
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Preview */}
            {((listing.images && listing.images.length > 0) || (listing.videos && listing.videos.length > 0)) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Media Preview
                </h3>
                <MediaPreview
                  images={listing.images || []}
                  videos={listing.videos || []}
                  title={listing.title}
                  category="tech"
                  showCount={true}
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Description</h3>
              <p id="listing-description" className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>

            {/* Requirements */}
            {listing.requirements && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <p className="text-muted-foreground leading-relaxed">{listing.requirements}</p>
              </div>
            )}

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{listing.listing_type}</Badge>
                  {listing.is_featured && (
                    <Badge variant="default">Featured</Badge>
                  )}
                </div>

                {listing.price && (
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(listing.price, listing.currency)}
                  </div>
                )}

                {listing.delivery_time && (
                  <div className="text-sm text-muted-foreground">
                    Delivery time: {listing.delivery_time} days
                  </div>
                )}

                <div className="space-y-3">
                  {listing.creation_link && (
                    <Button 
                      onClick={handleUseCreation}
                      className="w-full"
                      size="lg"
                      aria-label="Open creation link in new window"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                      Use This Creation
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full" size="lg" aria-label="Contact seller">
                    Contact Seller
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h4 className="font-semibold">Additional Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listed:</span>
                    <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{new Date(listing.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {listing.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};