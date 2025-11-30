import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOptimisticFavorites } from '@/hooks/useOptimisticFavorites';
import { MediaPreview } from '@/components/media/MediaPreview';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Heart, MapPin, Calendar, Clock, ExternalLink, Share2 } from 'lucide-react';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { SimpleListingCard } from '@/components/marketplace/SimpleListingCard';
import { toast } from 'sonner';

interface ListingWithSeller extends MarketplaceListing {
  seller?: {
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
    headline: string | null;
  };
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingWithSeller | null>(null);
  const [relatedListings, setRelatedListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorited, toggleFavorite, isPending } = useOptimisticFavorites();

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        setLoading(true);
        const { data: listingData, error: listingError } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')
          .single();

        if (listingError) throw listingError;

        // Fetch seller profile separately
        const { data: sellerData } = await supabase
          .from('public_profiles')
          .select('full_name, avatar_url, location, headline')
          .eq('user_id', listingData.user_id)
          .single();

        const data: ListingWithSeller = {
          ...listingData,
          listing_type: listingData.listing_type as 'product' | 'service' | 'job',
          status: listingData.status as 'active' | 'draft' | 'expired' | 'paused' | 'sold',
          seller: sellerData || undefined
        };

        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast.error('Failed to load listing');
        navigate('/marketplace/browse');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  useEffect(() => {
    if (!listing) return;

    const fetchRelatedListings = async () => {
      try {
        let query = supabase
          .from('marketplace_listings')
          .select('*')
          .eq('status', 'active')
          .neq('id', listing.id)
          .limit(4);

        // Prioritize same category
        if (listing.category_id) {
          query = query.eq('category_id', listing.category_id);
        } else if (listing.tags && listing.tags.length > 0) {
          // Fall back to matching tags
          query = query.overlaps('tags', listing.tags);
        }

        const { data } = await query;
        
        if (data) {
          setRelatedListings(
            data.map((item) => ({
              ...item,
              listing_type: item.listing_type as 'product' | 'service' | 'job',
              status: item.status as 'active' | 'draft' | 'expired' | 'paused' | 'sold',
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching related listings:', error);
      }
    };

    fetchRelatedListings();
  }, [listing]);

  const handleFavorite = async () => {
    if (!id) return;
    await toggleFavorite(id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: listing?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (!listing) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
          <Button onClick={() => navigate('/marketplace/browse')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const favorited = isFavorited(listing.id);
  const formattedPrice = listing.price ? `${listing.currency} ${listing.price.toFixed(2)}` : 'Free';
  const createdDate = new Date(listing.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/marketplace/browse')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Gallery */}
            {(listing.images?.length || listing.videos?.length) ? (
              <Card className="overflow-hidden">
                <MediaPreview
                  images={listing.images || []}
                  videos={listing.videos || []}
                  title={listing.title}
                  showCount={true}
                />
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No media available</p>
                </div>
              </Card>
            )}

            {/* Title and Actions */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{listing.listing_type}</Badge>
                    {listing.is_featured && (
                      <Badge className="bg-gradient-to-r from-primary to-primary/70">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">{listing.title}</h1>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="shrink-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={favorited ? 'default' : 'outline'}
                    size="icon"
                    onClick={handleFavorite}
                    disabled={isPending(listing.id)}
                    className="shrink-0"
                  >
                    <Heart
                      className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`}
                    />
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Requirements */}
              {listing.requirements && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Requirements</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {listing.requirements}
                    </p>
                  </div>
                </>
              )}

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="text-3xl font-bold">{formattedPrice}</p>
                  {listing.delivery_time && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {listing.delivery_time} day delivery
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  {listing.creation_link && (
                    <Button asChild className="w-full" size="lg">
                      <a
                        href={listing.creation_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        Use Creation
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => navigate(`/community/inbox?userId=${listing.user_id}`)}
                  >
                    Contact Seller
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            {listing.seller && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Seller Information</h3>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.seller.avatar_url || ''} />
                      <AvatarFallback>
                        {listing.seller.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${listing.user_id}`}
                        className="font-medium hover:underline truncate block"
                      >
                        {listing.seller.full_name || 'Anonymous'}
                      </Link>
                      {listing.seller.headline && (
                        <p className="text-sm text-muted-foreground truncate">
                          {listing.seller.headline}
                        </p>
                      )}
                    </div>
                  </div>
                  {listing.seller.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {listing.seller.location}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Listing Info */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold">Listing Details</h3>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Listed {createdDate}</span>
                  </div>
                  {listing.delivery_time && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{listing.delivery_time} day delivery</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Similar Products</h2>
              <p className="text-muted-foreground">Discover more items you might like</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedListings.map((relatedListing) => (
                <SimpleListingCard
                  key={relatedListing.id}
                  listing={relatedListing}
                  onFavorite={toggleFavorite}
                  isFavorited={isFavorited(relatedListing.id)}
                  isPending={isPending(relatedListing.id)}
                  onViewDetails={(l) => navigate(`/marketplace/listing/${l.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card border-t p-4 flex items-center gap-3 z-50">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="text-xl font-bold">{formattedPrice}</p>
        </div>
        {listing.creation_link ? (
          <Button asChild size="lg">
            <a
              href={listing.creation_link}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              Use Creation
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => navigate(`/community/inbox?userId=${listing.user_id}`)}
          >
            Contact Seller
          </Button>
        )}
      </div>
    </div>
  );
}

function ListingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
