import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMarketplace, MarketplaceListing } from '@/hooks/useMarketplace';
import { ListingDetailsModal } from '@/components/marketplace/ListingDetailsModal';
import { useAuth } from '@/hooks/useAuth';
import { TierGate } from '@/components/tier/TierGate';
import { useOptimisticFavorites } from '@/hooks/useOptimisticFavorites';
import {
  MarketplaceHero,
  SearchBar,
  AnimatedTabs,
  TopChartsList,
  CategoryGrid,
  CategoryCarousel,
  NewAndNoteworthy,
  MarketplaceSkeleton,
  FloatingFilterButton,
} from '@/components/marketplace/browse';
import { cn } from '@/lib/utils';

export default function BrowseMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('for-you');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { 
    listings, 
    categories, 
    suggestedListings, 
    topChartListings, 
    categoryListings, 
    loading, 
    hasMore, 
    fetchListings 
  } = useMarketplace();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite, isPending, favoriteIds } = useOptimisticFavorites();
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver>();

  // Get featured listings for hero
  const featuredListings = listings.filter(l => l.is_featured).slice(0, 5);
  const heroListings = featuredListings.length > 0 ? featuredListings : suggestedListings.slice(0, 5);

  const lastListingElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    setPage(1);
    if (selectedTab === 'top-charts') {
      fetchListings({ search: searchQuery, page: 1, sortBy: 'rating' }, true);
    } else {
      fetchListings({ search: searchQuery, page: 1 }, true);
    }
  }, [searchQuery, selectedTab, fetchListings]);

  useEffect(() => {
    if (page > 1) {
      if (selectedTab === 'top-charts') {
        fetchListings({ search: searchQuery, page, sortBy: 'rating' });
      } else {
        fetchListings({ search: searchQuery, page });
      }
    }
  }, [page, fetchListings, searchQuery, selectedTab]);

  const handleViewDetails = useCallback((listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setIsDetailsModalOpen(true);
  }, []);

  const handleFavorite = useCallback((listingId: string) => {
    toggleFavorite(listingId);
  }, [toggleFavorite]);

  const isInitialLoading = loading && page === 1;

  return (
    <TierGate feature="marketplace_buy">
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 space-y-8">
          {/* Hero Section */}
          {selectedTab === 'for-you' && (
            <MarketplaceHero 
              featuredListings={heroListings} 
              isLoading={isInitialLoading} 
            />
          )}

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products, services, jobs..."
            trendingSearches={['AI Tools', 'Templates', 'Web Design', 'Automation']}
            wishlistCount={favoriteIds.size}
          />

          {/* Animated Tabs */}
          <AnimatedTabs
            activeTab={selectedTab}
            onTabChange={setSelectedTab}
          />

          {/* Tab Content */}
          <div className="min-h-[50vh]">
            {/* For You Tab */}
            {selectedTab === 'for-you' && (
              <div className="space-y-10">
                {isInitialLoading ? (
                  <>
                    <MarketplaceSkeleton variant="carousel" />
                    <MarketplaceSkeleton variant="grid" />
                  </>
                ) : (
                  <>
                    {/* New & Noteworthy */}
                    <NewAndNoteworthy
                      listings={listings}
                      onFavorite={handleFavorite}
                      isFavorited={isFavorited}
                      isPending={isPending}
                    />

                    {/* Suggested for You */}
                    {suggestedListings.length > 0 && (
                      <CategoryCarousel
                        title="Suggested for You"
                        listings={suggestedListings}
                        onFavorite={handleFavorite}
                        isFavorited={isFavorited}
                        isPending={isPending}
                        showBadge
                        badgeText="Personalized"
                      />
                    )}

                    {/* Category Sections */}
                    {Object.entries(categoryListings).map(([categoryName, categoryItems], index) => {
                      const isLastCategory = index === Object.entries(categoryListings).length - 1;
                      return (
                        <div key={categoryName} ref={isLastCategory ? lastListingElementRef : null}>
                          <CategoryCarousel
                            title={categoryName}
                            listings={categoryItems}
                            onFavorite={handleFavorite}
                            isFavorited={isFavorited}
                            isPending={isPending}
                          />
                        </div>
                      );
                    })}

                    {/* Loading indicator */}
                    {loading && page > 1 && (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Loading more...
                        </div>
                      </div>
                    )}

                    {/* End of results */}
                    {!hasMore && listings.length > 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        You've seen all the listings
                      </div>
                    )}

                    {/* Empty state */}
                    {listings.length === 0 && !loading && (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or check back later</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Top Charts Tab */}
            {selectedTab === 'top-charts' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Top Charts</h2>
                  <span className="text-sm text-muted-foreground">Most popular listings</span>
                </div>
                
                {isInitialLoading ? (
                  <MarketplaceSkeleton variant="topCharts" />
                ) : (
                  <>
                    <TopChartsList
                      listings={topChartListings}
                      onFavorite={handleFavorite}
                      isFavorited={isFavorited}
                      isPending={isPending}
                    />
                    
                    {/* Infinite scroll trigger */}
                    {topChartListings.length > 0 && (
                      <div ref={lastListingElementRef} className="h-4" />
                    )}
                    
                    {loading && page > 1 && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Loading more...
                        </div>
                      </div>
                    )}
                    
                    {!hasMore && topChartListings.length > 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        End of rankings
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Categories Tab */}
            {selectedTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Categories</h2>
                  <span className="text-sm text-muted-foreground">Browse by category</span>
                </div>
                
                {isInitialLoading ? (
                  <MarketplaceSkeleton variant="categories" />
                ) : (
                  <CategoryGrid
                    categories={categories}
                    listingCounts={Object.fromEntries(
                      Object.entries(categoryListings).map(([name, items]) => {
                        const category = categories.find(c => c.name === name);
                        return [category?.id || '', items.length];
                      })
                    )}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Filter Button (Mobile) */}
        <FloatingFilterButton
          onApplyFilters={(filters) => {
            console.log('Applying filters:', filters);
            // Filter logic can be implemented here
          }}
        />

        {/* Listing Details Modal */}
        <ListingDetailsModal
          listing={selectedListing}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onFavorite={toggleFavorite}
          isFavorited={selectedListing ? isFavorited(selectedListing.id) : false}
          isPending={selectedListing ? isPending(selectedListing.id) : false}
        />
      </div>
    </TierGate>
  );
}
