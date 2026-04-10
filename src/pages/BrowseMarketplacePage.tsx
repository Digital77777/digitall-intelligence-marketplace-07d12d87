import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarketplace, MarketplaceListing } from '@/hooks/useMarketplace';
import { ListingDetailsModal } from '@/components/marketplace/ListingDetailsModal';
import { useAuth } from '@/hooks/useAuth';
import { TierGate } from '@/components/tier/TierGate';
import { useOptimisticFavorites } from '@/hooks/useOptimisticFavorites';
import { SEOHead } from '@/components/SEOHead';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('for-you');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setSelectedTab('for-you');
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    if (selectedTab === 'top-charts') {
      fetchListings({ search: searchQuery, page: 1, sortBy: 'rating' }, true);
    } else {
      fetchListings({ search: searchQuery, page: 1, category: selectedCategory || undefined }, true);
    }
  }, [searchQuery, selectedTab, selectedCategory, fetchListings]);

  useEffect(() => {
    if (page > 1) {
      if (selectedTab === 'top-charts') {
        fetchListings({ search: searchQuery, page, sortBy: 'rating' });
      } else {
        fetchListings({ search: searchQuery, page, category: selectedCategory || undefined });
      }
    }
  }, [page, fetchListings, searchQuery, selectedTab, selectedCategory]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedTab('for-you');
    setSearchParams({ category: categoryId });
  }, [setSearchParams]);

  const selectedCategoryName = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)?.name 
    : null;

  const clearCategoryFilter = useCallback(() => {
    setSelectedCategory(null);
    setSearchParams({});
  }, [setSearchParams]);

  const handleFavorite = useCallback((listingId: string) => {
    toggleFavorite(listingId);
  }, [toggleFavorite]);

  const isInitialLoading = loading && page === 1;

  return (
    <TierGate feature="marketplace_buy">
      <SEOHead
        title="Marketplace - Browse AI Products & Services"
        description="Discover premium AI tools, templates, and services. Find automation solutions, expert freelancers, and innovative digital products in our curated marketplace."
        keywords={['AI marketplace', 'AI tools', 'digital products', 'freelance services', 'automation', 'templates', 'machine learning']}
        canonicalUrl="/marketplace/browse"
      />
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 space-y-5 md:space-y-6">
          {/* Hero with category sidebar */}
          {selectedTab === 'for-you' && (
            <MarketplaceHero 
              featuredListings={heroListings}
              categories={categories}
              onCategoryClick={handleCategoryClick}
              isLoading={isInitialLoading} 
            />
          )}

          {/* Search */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products, services, tools..."
            trendingSearches={['AI Tools', 'Templates', 'Automation', 'Data Science']}
            wishlistCount={favoriteIds.size}
          />

          {/* Tabs */}
          <AnimatedTabs activeTab={selectedTab} onTabChange={setSelectedTab} />

          {/* Content */}
          <div className="min-h-[50vh]">
            {/* For You */}
            {selectedTab === 'for-you' && (
              <div className="space-y-6 md:space-y-8">
                {selectedCategoryName && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filtered by:</span>
                    <button
                      onClick={clearCategoryFilter}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      {selectedCategoryName}
                      <span className="text-xs">✕</span>
                    </button>
                  </div>
                )}

                {isInitialLoading ? (
                  <>
                    <MarketplaceSkeleton variant="carousel" />
                    <MarketplaceSkeleton variant="grid" />
                  </>
                ) : (
                  <>
                    {/* Hot Picks */}
                    <NewAndNoteworthy
                      listings={listings}
                      onFavorite={handleFavorite}
                      isFavorited={isFavorited}
                      isPending={isPending}
                    />

                    {/* Suggested */}
                    {suggestedListings.length > 0 && (
                      <CategoryCarousel
                        title="Recommended For You"
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
                      const isLast = index === Object.entries(categoryListings).length - 1;
                      return (
                        <div key={categoryName} ref={isLast ? lastListingElementRef : null}>
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

                    {loading && page > 1 && (
                      <div className="text-center py-6">
                        <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Loading more...
                        </div>
                      </div>
                    )}

                    {!hasMore && listings.length > 0 && (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        You've explored all listings
                      </div>
                    )}

                    {listings.length === 0 && !loading && (
                      <div className="text-center py-16">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <h3 className="text-base font-semibold mb-1">No listings found</h3>
                        <p className="text-sm text-muted-foreground">Try adjusting your search or check back later</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Top Charts */}
            {selectedTab === 'top-charts' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="text-lg md:text-xl font-bold">Top Charts</h2>
                  <span className="text-xs text-muted-foreground">Most popular</span>
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
                    {topChartListings.length > 0 && <div ref={lastListingElementRef} className="h-4" />}
                    {loading && page > 1 && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Loading more...
                        </div>
                      </div>
                    )}
                    {!hasMore && topChartListings.length > 0 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">End of rankings</div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Categories */}
            {selectedTab === 'categories' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="text-lg md:text-xl font-bold">Categories</h2>
                  <span className="text-xs text-muted-foreground">Browse by category</span>
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
                    onCategoryClick={handleCategoryClick}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <FloatingFilterButton
          onApplyFilters={(filters) => {
            console.log('Applying filters:', filters);
          }}
        />

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
