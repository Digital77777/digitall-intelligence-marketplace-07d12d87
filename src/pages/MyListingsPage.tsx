import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarketplace, MarketplaceListing } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { TierGate } from '@/components/tier/TierGate';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Eye, Heart } from 'lucide-react';
import { toast } from 'sonner';

const MyListingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteListing } = useMarketplace();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchUserListings();
  }, [user]);

  const fetchUserListings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings((data || []) as MarketplaceListing[]);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteListing(id);
      setListings(prev => prev.filter(listing => listing.id !== id));
      toast.success('Listing deleted successfully');
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (!user) {
    return null;
  }

  return (
    <TierGate feature="marketplace_sell">
      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto px-6 pt-24 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Listings</h1>
              <p className="text-muted-foreground">Manage your marketplace listings</p>
            </div>
            <Button onClick={() => navigate('/marketplace/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading your listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first listing to start selling on the marketplace
              </p>
              <Button onClick={() => navigate('/marketplace/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge className={`text-xs ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {listing.listing_type}
                      </Badge>
                    </div>

                    {listing.images && listing.images.length > 0 && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <CardTitle className="text-lg line-clamp-2">
                      {listing.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {listing.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        {listing.price && (
                          <div className="text-lg font-bold text-primary">
                            {formatPrice(listing.price, listing.currency)}
                            {listing.listing_type === 'service' && '/hr'}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          General Category
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          0
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          0
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/edit-listing/${listing.id}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(listing.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TierGate>
  );
};

export default MyListingsPage;