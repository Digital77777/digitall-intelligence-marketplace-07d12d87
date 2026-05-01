import { Store, Briefcase, Users, Code, DollarSign, ArrowRight, Star, MapPin, Clock, TrendingUp, Shield, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierGate } from "@/components/tier/TierGate";
import { useTier } from "@/contexts/TierContext";
import { SEOHead } from "@/components/SEOHead";
import { PrefetchLink } from "@/components/PrefetchLink";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const MarketplacePage = () => {
  const navigate = useNavigate();
  const {
    handleMouseEnter,
    handleTouchStart
  } = usePrefetch();
  const {
    canAccessFeature
  } = useTier();
  const canSell = canAccessFeature('marketplace_sell');

  // Fetch featured listings from the database
  const { data: featuredListings = [], isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: async () => {
      // First try to get featured listings
      const { data: featured, error: featuredError } = await supabase
        .from('marketplace_listings')
        .select(`
          id,
          title,
          description,
          price,
          currency,
          listing_type,
          images,
          tags,
          user_id,
          is_featured,
          created_at
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (featuredError) throw featuredError;

      // If we have featured listings, use them
      if (featured && featured.length > 0) {
        // Fetch seller profiles for these listings
        const userIds = [...new Set(featured.map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        return featured.map(listing => ({
          ...listing,
          seller_name: profileMap.get(listing.user_id) || 'Unknown Seller'
        }));
      }

      // Fallback to most recent active listings if no featured ones
      const { data: recent, error: recentError } = await supabase
        .from('marketplace_listings')
        .select(`
          id,
          title,
          description,
          price,
          currency,
          listing_type,
          images,
          tags,
          user_id,
          is_featured,
          created_at
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (recentError) throw recentError;

      if (recent && recent.length > 0) {
        const userIds = [...new Set(recent.map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        return recent.map(listing => ({
          ...listing,
          seller_name: profileMap.get(listing.user_id) || 'Unknown Seller'
        }));
      }

      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const marketplaceCategories = [{
    id: 1,
    title: "Sell Your Creations",
    description: "Monetize your AI tools, templates, courses, and digital products",
    feature: "No listing fees",
    icon: <Store className="h-8 w-8" />,
    category: "Products",
    gradient: "from-emerald-500 to-teal-500"
  }, {
    id: 2,
    title: "Freelance Services",
    description: "Offer your AI expertise, consulting, and specialized skills to clients",
    feature: "Set your rates",
    icon: <Briefcase className="h-8 w-8" />,
    category: "Services",
    gradient: "from-blue-500 to-cyan-500"
  }, {
    id: 3,
    title: "Post Job Opportunities",
    description: "Find talented AI professionals and hire for your projects",
    feature: "Verified profiles",
    icon: <Users className="h-8 w-8" />,
    category: "Jobs",
    gradient: "from-purple-500 to-pink-500"
  }, {
    id: 4,
    title: "AI Development",
    description: "Custom AI solutions, model training, and integration services",
    feature: "Enterprise ready",
    icon: <Code className="h-8 w-8" />,
    category: "Development",
    gradient: "from-orange-500 to-red-500"
  }];
  // Helper function to format price
  const formatPrice = (price: number | null, currency: string | null, listingType: string) => {
    if (price === null) return listingType === 'job' ? 'Negotiable' : 'Free';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'ZAR' ? 'R' : '$';
    if (listingType === 'service') return `${currencySymbol}${price}/hr`;
    if (listingType === 'job') return `${currencySymbol}${price.toLocaleString()}`;
    return `${currencySymbol}${price}`;
  };

  // Helper to get category from tags
  const getCategory = (tags: string[] | null, listingType: string) => {
    if (tags && tags.length > 0) return tags[0];
    if (listingType === 'job') return 'Job';
    if (listingType === 'service') return 'Service';
    return 'Product';
  };
  const stats = [{
    label: "Active Sellers",
    value: "8,500+",
    icon: <Store className="h-5 w-5" />
  }, {
    label: "Total Sales",
    value: "$2.8M+",
    icon: <DollarSign className="h-5 w-5" />
  }, {
    label: "Jobs Posted",
    value: "1,200+",
    icon: <Briefcase className="h-5 w-5" />
  }, {
    label: "Success Rate",
    value: "94%",
    icon: <TrendingUp className="h-5 w-5" />
  }];
  return <TierGate feature="marketplace_buy">
      <div className="min-h-screen bg-background">
        <SEOHead title="AI Marketplace - Buy & Sell AI Products and Services" description="Discover and monetize AI tools, templates, courses, and services. Connect with AI professionals, find freelance opportunities, and post job listings." keywords={["AI marketplace", "AI products", "AI services", "freelance AI", "AI jobs", "sell AI tools", "AI consulting"]} />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-20 pb-16">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-success/10 rounded-full">
                <Store className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">AI Marketplace</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-earn bg-clip-text text-transparent">
                  AI Marketplace
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Buy, sell, and hire in the world's largest AI marketplace. Connect with experts, showcase your skills, and grow your business
              </p>
            </div>

            {/* Facebook-style icon button strip */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-5 gap-2 md:gap-3">
                {[
                  { label: "Browse", icon: <LayoutGrid className="h-5 w-5" />, to: "/marketplace/browse", gradient: "from-emerald-500 to-teal-500" },
                  { label: "Freelancers", icon: <Users className="h-5 w-5" />, to: "/marketplace/browse-freelancers", gradient: "from-blue-500 to-cyan-500" },
                  { label: "Jobs", icon: <Briefcase className="h-5 w-5" />, to: "/marketplace/jobs", gradient: "from-purple-500 to-pink-500" },
                  { label: "Products", icon: <Store className="h-5 w-5" />, to: "/marketplace/browse", gradient: "from-orange-500 to-red-500" },
                  { label: "Dashboard", icon: <Clock className="h-5 w-5" />, to: "/client-dashboard", gradient: "from-indigo-500 to-violet-500" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.to)}
                    onMouseEnter={() => handleMouseEnter(item.to)}
                    onTouchStart={() => handleTouchStart(item.to)}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-ai transition-all"
                  >
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <span className="text-[11px] md:text-xs font-medium text-foreground text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-b border-border/50">
          <div className="container mx-auto px-6">
            
          </div>
        </section>

        {/* Marketplace Categories */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Marketplace Categories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover opportunities to monetize your AI skills and connect with the global AI community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {marketplaceCategories.map(category => {
              const isSellFeature = category.title === "Sell Your Creations" || category.title === "Freelance Services" || category.title === "Post Job Opportunities" || category.title === "AI Development";
              const targetUrl = isSellFeature && !canSell ? "/subscription" : category.title === "Sell Your Creations" ? "/marketplace/sell-products" : category.title === "Freelance Services" ? "/marketplace/freelance-services" : category.title === "Post Job Opportunities" ? "/marketplace/post-jobs" : "/marketplace/ai-development";
              return <Card key={category.id} className="group hover:shadow-ai transition-all duration-300 border-border/50">
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${category.gradient} flex items-center justify-center text-white mb-4`}>
                        {category.icon}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {category.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-bold text-success">
                          {category.feature}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <PrefetchLink to={targetUrl}>
                        <Button className="w-full group/btn">
                          {isSellFeature && !canSell ? "Upgrade to Access" : "Get Started"}
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </PrefetchLink>
                    </CardContent>
                  </Card>;
            })}
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Listings</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore top-rated products, services, and job opportunities in the AI marketplace
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingFeatured ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : featuredListings.length > 0 ? (
                featuredListings.slice(0, 6).map(listing => (
                  <Card key={listing.id} className="border-border/50 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      {/* Listing image */}
                      {listing.images && listing.images.length > 0 && (
                        <div className="mb-4 rounded-lg overflow-hidden h-32 bg-muted">
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="outline" className="text-xs">
                          {getCategory(listing.tags, listing.listing_type)}
                        </Badge>
                        {listing.is_featured && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">Featured</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-semibold mb-2 line-clamp-2">{listing.title}</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                          by {listing.seller_name}
                        </span>
                        <span className="font-bold text-primary">
                          {formatPrice(listing.price, listing.currency, listing.listing_type)}
                        </span>
                      </div>
                      
                      <PrefetchLink to={`/marketplace/listing/${listing.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          {listing.listing_type === "job" ? "View Job" : "View Details"}
                        </Button>
                      </PrefetchLink>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No listings available yet. Be the first to create one!</p>
                  <PrefetchLink to="/marketplace/sell-products">
                    <Button className="mt-4" variant="outline">
                      Create Listing
                    </Button>
                  </PrefetchLink>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
              <p className="text-muted-foreground">Jump straight to what you need</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="lg" onClick={() => navigate('/marketplace/browse')} onMouseEnter={() => handleMouseEnter('/marketplace/browse')} onTouchStart={() => handleTouchStart('/marketplace/browse')}>
                <Store className="h-5 w-5 mr-2" />
                Browse Products
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/marketplace/browse-freelancers')} onMouseEnter={() => handleMouseEnter('/marketplace/browse-freelancers')} onTouchStart={() => handleTouchStart('/marketplace/browse-freelancers')}>
                <Users className="h-5 w-5 mr-2" />
                Find Freelancers
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/marketplace/jobs')} onMouseEnter={() => handleMouseEnter('/marketplace/jobs')} onTouchStart={() => handleTouchStart('/marketplace/jobs')}>
                <Briefcase className="h-5 w-5 mr-2" />
                Browse Jobs
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/client-dashboard')} onMouseEnter={() => handleMouseEnter('/client-dashboard')} onTouchStart={() => handleTouchStart('/client-dashboard')}>
                <Clock className="h-5 w-5 mr-2" />
                Client Dashboard
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Simple steps to start selling, buying, or hiring in the AI marketplace
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Set up your profile, showcase your skills, and build your reputation
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">List or Browse</h3>
                <p className="text-muted-foreground">
                  Create listings for your services or browse available opportunities
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect & Transact</h3>
                <p className="text-muted-foreground">
                  Secure transactions with built-in protection and payment processing
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Trust */}
        <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Secure & Trusted</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your transactions are protected with secure payment processing, verified profiles, and comprehensive dispute resolution
              </p>
            </div>
          </div>
        </section>
      </div>
    </TierGate>;
};
export default MarketplacePage;