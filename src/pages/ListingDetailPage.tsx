import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOptimisticFavorites } from '@/hooks/useOptimisticFavorites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Share2, Heart, Calendar, Clock, Star,
  ShoppingBag, Wrench, Briefcase, Sparkles, ExternalLink,
  Zap, MessageCircle, ChevronRight, Home, Eye, Package
} from 'lucide-react';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  PremiumMediaGallery, SellerCard, PriceCard, ListingDetailSkeleton,
  RelatedListings, DemoVideoSection, FeatureHighlights, CommissionBanner,
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

const typeLabels: Record<string, string> = {
  product: 'Product',
  service: 'Service',
  job: 'Job Opportunity',
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
        const { data: listingData, error } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')
          .single();
        if (error) throw error;

        const { data: sellerData } = await supabase
          .from('public_profiles')
          .select('full_name, avatar_url, location, headline')
          .eq('user_id', listingData.user_id)
          .single();

        setListing({
          ...listingData,
          listing_type: listingData.listing_type as 'product' | 'service' | 'job',
          status: listingData.status as 'active' | 'draft' | 'expired' | 'paused' | 'sold',
          seller: sellerData || undefined,
        });
      } catch (err) {
        console.error('Error fetching listing:', err);
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
    const fetchRelated = async () => {
      try {
        let query = supabase
          .from('marketplace_listings')
          .select('*')
          .eq('status', 'active')
          .neq('id', listing.id)
          .limit(6);
        if (listing.category_id) query = query.eq('category_id', listing.category_id);
        else if (listing.tags?.length) query = query.overlaps('tags', listing.tags);

        const { data } = await query;
        if (data) {
          setRelatedListings(data.map((item) => ({
            ...item,
            listing_type: item.listing_type as 'product' | 'service' | 'job',
            status: item.status as 'active' | 'draft' | 'expired' | 'paused' | 'sold',
          })));
        }
      } catch (err) { console.error('Error fetching related:', err); }
    };
    fetchRelated();
  }, [listing]);

  const handleFavorite = async () => { if (id) await toggleFavorite(id); };
  const handleContact = () => { if (listing) navigate(`/community/inbox?userId=${listing.user_id}`); };
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: listing?.title, text: listing?.description, url: window.location.href }); }
      catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) return <ListingDetailSkeleton />;

  if (!listing) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Listing not found</h2>
        <p className="text-muted-foreground mb-4 text-sm">This listing may have been removed.</p>
        <Button onClick={() => navigate('/marketplace/browse')} size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Button>
      </div>
    );
  }

  const favorited = isFavorited(listing.id);
  const formattedPrice = listing.price ? `${listing.currency || 'USD'} ${listing.price.toFixed(2)}` : 'Free';
  const createdDate = new Date(listing.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const enrichedData = marketplaceProducts.find((p) => p.title.toLowerCase() === listing.title.toLowerCase());
  const features = enrichedData?.features || [];
  const commission = enrichedData?.commission;

  return (
    <div className="min-h-screen bg-muted/20 pb-28 md:pb-8">
      {/* Breadcrumb Bar */}
      <div className="border-b bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto">
          <Link to="/" className="hover:text-primary flex items-center gap-1 flex-shrink-0">
            <Home className="w-3 h-3" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link to="/marketplace/browse" className="hover:text-primary flex-shrink-0">Marketplace</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-foreground truncate font-medium">{listing.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          
          {/* Media — Left Column */}
          <div className="lg:col-span-5">
            <PremiumMediaGallery
              images={listing.images || []}
              videos={listing.videos || []}
              title={listing.title}
            />
          </div>

          {/* Product Info — Center Column */}
          <div className="lg:col-span-4 space-y-4">
            {/* Title & Badges */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] capitalize">
                  {listing.listing_type}
                </Badge>
                {listing.is_featured && (
                  <Badge className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-lg md:text-xl font-bold leading-tight">{listing.title}</h1>
              
              {/* Rating & Stats row */}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">4.9</span>
                  <span>(128 reviews)</span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>2.4k views</span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  <span>340+ ordered</span>
                </div>
              </div>
            </div>

            {/* Mobile Price Card */}
            <div className="lg:hidden">
              <PriceCard
                price={listing.price} currency={listing.currency || 'USD'}
                deliveryTime={listing.delivery_time} creationLink={listing.creation_link}
                isFavorited={favorited} isPending={isPending(listing.id)}
                onFavorite={handleFavorite} onContact={handleContact}
                pricingTiers={(listing as any).pricing_tiers}
              />
            </div>

            {/* Tabbed Details — Alibaba style */}
            <Tabs defaultValue="description" className="mt-2">
              <TabsList className="w-full justify-start h-9 bg-muted/50 rounded-lg p-0.5">
                <TabsTrigger value="description" className="text-xs h-8 px-3 rounded-md">Description</TabsTrigger>
                <TabsTrigger value="features" className="text-xs h-8 px-3 rounded-md">Features</TabsTrigger>
                {listing.requirements && (
                  <TabsTrigger value="requirements" className="text-xs h-8 px-3 rounded-md">Requirements</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="description" className="mt-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
                {listing.tags && listing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {listing.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5 cursor-pointer hover:bg-secondary/80"
                        onClick={() => navigate(`/marketplace/browse?search=${encodeURIComponent(tag)}`)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="features" className="mt-3">
                <FeatureHighlights features={features} tags={listing.tags || []} title={listing.title} />
              </TabsContent>

              {listing.requirements && (
                <TabsContent value="requirements" className="mt-3">
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {listing.requirements}
                    </p>
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* Demo Video */}
            {listing.videos && listing.videos.length > 0 && (
              <div className="mt-4">
                <DemoVideoSection videos={listing.videos} title={listing.title} creationLink={listing.creation_link} />
              </div>
            )}

            {/* Commission Banner */}
            {commission && (
              <div className="mt-4">
                <CommissionBanner commission={commission} creationLink={listing.creation_link} title={listing.title} />
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-2 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Listed {createdDate}
              </div>
              {listing.delivery_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {listing.delivery_time} day delivery
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — Right Column (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="sticky top-20 space-y-4">
              <PriceCard
                price={listing.price} currency={listing.currency || 'USD'}
                deliveryTime={listing.delivery_time} creationLink={listing.creation_link}
                isFavorited={favorited} isPending={isPending(listing.id)}
                onFavorite={handleFavorite} onContact={handleContact}
                pricingTiers={(listing as any).pricing_tiers}
              />
              {listing.seller && (
                <SellerCard seller={listing.seller} userId={listing.user_id} onContact={handleContact} />
              )}

              {/* Share & Actions */}
              <div className="bg-card rounded-lg border p-3 flex items-center justify-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5 text-xs h-8">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Separator orientation="vertical" className="h-5" />
                <Button variant="ghost" size="sm" onClick={handleFavorite} disabled={isPending(listing.id)}
                  className={cn("gap-1.5 text-xs h-8", favorited && "text-red-500")}>
                  <Heart className={cn("w-3.5 h-3.5", favorited && "fill-current")} />
                  {favorited ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Seller Card */}
        {listing.seller && (
          <div className="lg:hidden mt-4">
            <SellerCard seller={listing.seller} userId={listing.user_id} onContact={handleContact} />
          </div>
        )}

        {/* Related Products */}
        <div className="mt-8">
          <RelatedListings
            listings={relatedListings}
            isFavorited={isFavorited}
            isPending={isPending}
            onFavorite={toggleFavorite}
          />
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card/95 backdrop-blur-lg border-t p-3 flex items-center gap-3 z-50 safe-area-inset-bottom">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground">Price</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400 truncate">{formattedPrice}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleShare} className="h-9 w-9 flex-shrink-0">
          <Share2 className="h-4 w-4" />
        </Button>
        {listing.creation_link ? (
          <Button asChild size="sm" className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white h-9">
            <a href={listing.creation_link} target="_blank" rel="noopener noreferrer">
              <Zap className="h-4 w-4" /> Use Creation
            </a>
          </Button>
        ) : (
          <Button size="sm" onClick={handleContact}
            className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white h-9">
            <MessageCircle className="h-4 w-4" /> Contact
          </Button>
        )}
      </div>
    </div>
  );
}
