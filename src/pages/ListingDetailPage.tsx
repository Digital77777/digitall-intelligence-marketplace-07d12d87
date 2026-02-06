import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOptimisticFavorites } from '@/hooks/useOptimisticFavorites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Calendar, 
  Clock, 
  Star,
  ShoppingBag,
  Wrench,
  Briefcase,
  Sparkles,
  ExternalLink,
  Zap,
  MessageCircle
} from 'lucide-react';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  PremiumMediaGallery, 
  SellerCard, 
  PriceCard, 
  ListingDetailSkeleton,
  RelatedListings,
  DemoVideoSection,
  FeatureHighlights,
  CommissionBanner,
} from '@/components/marketplace/listing';
import { marketplaceProducts } from '@/data/marketplaceProducts';

interface ListingWithSeller extends MarketplaceListing {
  seller?: {
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
    headline: string | null;
  };
}

const typeIcons = {
  product: ShoppingBag,
  service: Wrench,
  job: Briefcase,
};

const typeColors = {
  product: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  service: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  job: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

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

  const handleContact = () => {
    if (listing) {
      navigate(`/community/inbox?userId=${listing.user_id}`);
    }
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
      <div className="container max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Listing not found</h2>
          <p className="text-muted-foreground mb-6">This listing may have been removed or is no longer available.</p>
          <Button onClick={() => navigate('/marketplace/browse')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const TypeIcon = typeIcons[listing.listing_type] || ShoppingBag;
  const typeColorClass = typeColors[listing.listing_type] || typeColors.product;
  const favorited = isFavorited(listing.id);
  const formattedPrice = listing.price ? `${listing.currency} ${listing.price.toFixed(2)}` : 'Free';
  const createdDate = new Date(listing.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Enrich listing with seed data (features, commission, etc.)
  const enrichedData = marketplaceProducts.find(
    (p) => p.title.toLowerCase() === listing.title.toLowerCase()
  );
  const features = enrichedData?.features || [];
  const commission = enrichedData?.commission;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-8">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/marketplace/browse')}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Marketplace</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-9 w-9"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant={favorited ? 'default' : 'ghost'}
              size="icon"
              onClick={handleFavorite}
              disabled={isPending(listing.id)}
              className={cn(
                "h-9 w-9",
                favorited && "bg-red-500 hover:bg-red-600"
              )}
            >
              <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Media Gallery */}
            <PremiumMediaGallery
              images={listing.images || []}
              videos={listing.videos || []}
              title={listing.title}
            />

            {/* Title Section */}
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn("capitalize gap-1.5", typeColorClass)}>
                  <TypeIcon className="w-3.5 h-3.5" />
                  {listing.listing_type}
                </Badge>
                {listing.is_featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                {listing.title}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">4.9</span>
                  <span>(128 reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Listed {createdDate}</span>
                </div>
                {listing.delivery_time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{listing.delivery_time} day delivery</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Price Card */}
            <div className="lg:hidden">
              <PriceCard
                price={listing.price}
                currency={listing.currency || 'USD'}
                deliveryTime={listing.delivery_time}
                creationLink={listing.creation_link}
                isFavorited={favorited}
                isPending={isPending(listing.id)}
                onFavorite={handleFavorite}
                onContact={handleContact}
              />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                About This {listing.listing_type === 'service' ? 'Service' : listing.listing_type === 'job' ? 'Opportunity' : 'Product'}
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-base">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Demo Video */}
            {listing.videos && listing.videos.length > 0 && (
              <>
                <Separator />
                <DemoVideoSection
                  videos={listing.videos}
                  title={listing.title}
                  creationLink={listing.creation_link}
                />
              </>
            )}

            {/* Feature Highlights */}
            {features.length > 0 && (
              <>
                <Separator />
                <FeatureHighlights
                  features={features}
                  tags={listing.tags || []}
                  title={listing.title}
                />
              </>
            )}

            {/* Commission Banner */}
            {commission && (
              <>
                <Separator />
                <CommissionBanner
                  commission={commission}
                  creationLink={listing.creation_link}
                  title={listing.title}
                />
              </>
            )}

            {/* Requirements */}
            {listing.requirements && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    Requirements
                  </h2>
                  <div className="bg-muted/50 rounded-xl p-5 border border-border/50">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {listing.requirements}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => navigate(`/marketplace/browse?search=${encodeURIComponent(tag)}`)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Mobile Seller Card */}
            {listing.seller && (
              <div className="lg:hidden">
                <SellerCard
                  seller={listing.seller}
                  userId={listing.user_id}
                  onContact={handleContact}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Price Card */}
              <PriceCard
                price={listing.price}
                currency={listing.currency || 'USD'}
                deliveryTime={listing.delivery_time}
                creationLink={listing.creation_link}
                isFavorited={favorited}
                isPending={isPending(listing.id)}
                onFavorite={handleFavorite}
                onContact={handleContact}
              />

              {/* Seller Info */}
              {listing.seller && (
                <SellerCard
                  seller={listing.seller}
                  userId={listing.user_id}
                  onContact={handleContact}
                />
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <RelatedListings
            listings={relatedListings}
            isFavorited={isFavorited}
            isPending={isPending}
            onFavorite={toggleFavorite}
          />
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card/95 backdrop-blur-lg border-t p-4 flex items-center gap-3 z-50 safe-area-inset-bottom">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="text-xl font-bold truncate">{formattedPrice}</p>
        </div>
        {listing.creation_link ? (
          <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20">
            <a
              href={listing.creation_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Zap className="h-5 w-5" />
              Use Creation
            </a>
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleContact}
            className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
          >
            <MessageCircle className="h-5 w-5" />
            Contact
          </Button>
        )}
      </div>
    </div>
  );
}
