import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, TrendingDown, Bell, BellOff, Trash2, ShoppingBag, Filter, Grid, List, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOptimisticFavorites } from '@/hooks/useOptimisticFavorites';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import MobileFooter from '@/components/MobileFooter';

interface WishlistItem {
  id: string;
  listing_id: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    description: string;
    price: number | null;
    currency: string;
    images: string[];
    listing_type: string;
    status: string;
    user_id: string;
  };
  price_history?: {
    price: number;
    recorded_at: string;
  }[];
  price_drop?: {
    oldPrice: number;
    newPrice: number;
    percentOff: number;
  } | null;
}

const WishlistSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="overflow-hidden">
        <div className="flex gap-4 p-4">
          <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const EmptyWishlist = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Heart className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Start adding items you love to your wishlist and we'll notify you when prices drop!
      </p>
      <Button onClick={() => navigate('/marketplace/browse')} className="gap-2">
        <ShoppingBag className="h-4 w-4" />
        Browse Marketplace
      </Button>
    </div>
  );
};

interface WishlistItemCardProps {
  item: WishlistItem;
  viewMode: 'list' | 'grid';
  onRemove: (listingId: string) => void;
  isRemoving: boolean;
}

const WishlistItemCard = ({ item, viewMode, onRemove, isRemoving }: WishlistItemCardProps) => {
  const navigate = useNavigate();
  const { listing, price_drop } = item;
  
  const hasImage = listing.images && listing.images.length > 0;
  const isAvailable = listing.status === 'active';
  
  const handleClick = () => {
    if (isAvailable) {
      navigate(`/marketplace/listing/${listing.id}`);
    }
  };
  
  if (viewMode === 'grid') {
    return (
      <Card 
        className={cn(
          "group overflow-hidden cursor-pointer transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-1",
          !isAvailable && "opacity-60"
        )}
        onClick={handleClick}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {hasImage ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {price_drop && (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white border-0 gap-1">
              <TrendingDown className="h-3 w-3" />
              {price_drop.percentOff}% OFF
            </Badge>
          )}
          
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Unavailable</Badge>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(listing.id);
            }}
            disabled={isRemoving}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        
        <CardContent className="p-3 space-y-1">
          <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
          <div className="flex items-center gap-2">
            {price_drop ? (
              <>
                <span className="text-sm font-bold text-green-600">
                  ${listing.price}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  ${price_drop.oldPrice}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold">
                {listing.price ? `$${listing.price}` : 'Contact for price'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // List view
  return (
    <Card 
      className={cn(
        "group overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-md",
        !isAvailable && "opacity-60"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {hasImage ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {price_drop && (
            <Badge className="absolute -top-1 -left-1 bg-green-500 text-white border-0 text-xs px-1.5 py-0.5">
              -{price_drop.percentOff}%
            </Badge>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {listing.description}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(listing.id);
              }}
              disabled={isRemoving}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            {price_drop ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  ${listing.price}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${price_drop.oldPrice}
                </span>
                <Badge variant="secondary" className="gap-1 text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  Save ${(price_drop.oldPrice - price_drop.newPrice).toFixed(2)}
                </Badge>
              </>
            ) : (
              <span className="text-lg font-bold">
                {listing.price ? `$${listing.price}` : 'Contact for price'}
              </span>
            )}
          </div>
          
          {!isAvailable && (
            <Badge variant="secondary" className="mt-2">
              Currently unavailable
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isPending } = useOptimisticFavorites();
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [priceDropsOnly, setPriceDropsOnly] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchWishlist();
  }, [user]);
  
  const fetchWishlist = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch favorites with listing details
      const { data: favorites, error: favError } = await supabase
        .from('marketplace_favorites')
        .select(`
          id,
          listing_id,
          created_at,
          listing:marketplace_listings (
            id,
            title,
            description,
            price,
            currency,
            images,
            listing_type,
            status,
            user_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (favError) throw favError;
      
      // Fetch price history for all favorited listings
      const listingIds = favorites?.map(f => f.listing_id) || [];
      
      let priceHistoryMap: Record<string, { price: number; recorded_at: string }[]> = {};
      
      if (listingIds.length > 0) {
        const { data: priceHistory } = await supabase
          .from('listing_price_history')
          .select('listing_id, price, recorded_at')
          .in('listing_id', listingIds)
          .order('recorded_at', { ascending: false });
        
        // Group by listing_id
        priceHistory?.forEach(ph => {
          if (!priceHistoryMap[ph.listing_id]) {
            priceHistoryMap[ph.listing_id] = [];
          }
          priceHistoryMap[ph.listing_id].push({
            price: ph.price,
            recorded_at: ph.recorded_at
          });
        });
      }
      
      // Process items with price drop detection
      const processedItems: WishlistItem[] = (favorites || [])
        .filter(f => f.listing) // Filter out any with missing listings
        .map(f => {
          const history = priceHistoryMap[f.listing_id] || [];
          let priceDrop = null;
          
          // Check if there was a price drop (compare current price with previous)
          if (history.length >= 2 && f.listing) {
            const currentPrice = f.listing.price;
            const previousPrice = history[1]?.price; // Second most recent is the "old" price
            
            if (currentPrice && previousPrice && currentPrice < previousPrice) {
              priceDrop = {
                oldPrice: previousPrice,
                newPrice: currentPrice,
                percentOff: Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
              };
            }
          }
          
          return {
            ...f,
            listing: f.listing as WishlistItem['listing'],
            price_history: history,
            price_drop: priceDrop
          };
        });
      
      setWishlistItems(processedItems);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      toast({
        title: 'Error loading wishlist',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemove = async (listingId: string) => {
    setRemovingId(listingId);
    await toggleFavorite(listingId);
    setWishlistItems(prev => prev.filter(item => item.listing_id !== listingId));
    setRemovingId(null);
  };
  
  const filteredItems = priceDropsOnly 
    ? wishlistItems.filter(item => item.price_drop !== null)
    : wishlistItems;
  
  const priceDropCount = wishlistItems.filter(item => item.price_drop !== null).length;
  
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              {priceDropCount > 0 && (
                <span className="text-green-600 ml-2">
                  • {priceDropCount} with price drops!
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Price Drop Notification Banner */}
        {priceDropCount > 0 && !isLoading && (
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  {priceDropCount} Price {priceDropCount === 1 ? 'Drop' : 'Drops'}!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Some items in your wishlist are now on sale
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => setPriceDropsOnly(!priceDropsOnly)}
              >
                {priceDropsOnly ? 'Show All' : 'View Deals'}
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Filters & View Toggle */}
        {wishlistItems.length > 0 && !isLoading && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="price-drops"
                  checked={priceDropsOnly}
                  onCheckedChange={setPriceDropsOnly}
                />
                <Label htmlFor="price-drops" className="text-sm cursor-pointer">
                  Price drops only
                </Label>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Content */}
        {isLoading ? (
          <WishlistSkeleton />
        ) : wishlistItems.length === 0 ? (
          <EmptyWishlist />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items with price drops yet</p>
            <Button 
              variant="link" 
              onClick={() => setPriceDropsOnly(false)}
              className="mt-2"
            >
              Show all items
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <WishlistItemCard
                key={item.id}
                item={item}
                viewMode="grid"
                onRemove={handleRemove}
                isRemoving={removingId === item.listing_id}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <WishlistItemCard
                key={item.id}
                item={item}
                viewMode="list"
                onRemove={handleRemove}
                isRemoving={removingId === item.listing_id}
              />
            ))}
          </div>
        )}
        
        {/* Notification Settings Hint */}
        {wishlistItems.length > 0 && !isLoading && (
          <Card className="mt-8 border-dashed">
            <CardContent className="flex items-center gap-4 p-4">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  You'll automatically receive notifications when prices drop on your wishlist items
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default WishlistPage;
