import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ChevronRight, Home, TrendingUp, BookOpen, User } from 'lucide-react';
import { useMarketplace, MarketplaceListing } from '@/hooks/useMarketplace';
import { ListingDetailsModal } from '@/components/marketplace/ListingDetailsModal';
import { useAuth } from '@/hooks/useAuth';
import { TierGate } from '@/components/tier/TierGate';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ToolCard } from '@/components/marketplace/ToolCard';
import { TopChartCard } from '@/components/marketplace/TopChartCard';
import { CategoryCard } from '@/components/marketplace/CategoryCard';
import { useOptimisticFavorites } from '@/hooks/useOptimisticFavorites';

// Memoized category section component
const CategorySection = memo(({ 
  categoryName, 
  categoryListings, 
  onViewDetails 
}: { 
  categoryName: string; 
  categoryListings: MarketplaceListing[]; 
  onViewDetails: (listing: MarketplaceListing) => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold">{categoryName}</h2>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-4 pb-4">
        {categoryListings.slice(0, 10).map((listing, idx) => (
          <ToolCard
            key={listing.id}
            listing={listing}
            onClick={() => onViewDetails(listing)}
            colorIndex={idx}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </div>
));

CategorySection.displayName = 'CategorySection';

export default function BrowseMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('for-you');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { listings, categories, suggestedListings, topChartListings, categoryListings, loading, hasMore, fetchListings } = useMarketplace();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite, isPending } = useOptimisticFavorites();
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver>();

  const lastListingElementRef = useCallback(node => {
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


  return (
    <TierGate feature="marketplace_buy">
      <div className="min-h-screen bg-background pb-20">
        {/* Top Navigation Tabs */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="container mx-auto px-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="w-full justify-start h-12 bg-transparent border-0 rounded-none">
                <TabsTrigger value="for-you" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  For you
                </TabsTrigger>
                <TabsTrigger value="top-charts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Top charts
                </TabsTrigger>
                <TabsTrigger value="categories" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Categories
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for tools"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-full bg-muted/50"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="container mx-auto px-4">
          {loading && page === 1 ? (
            <div className="space-y-6">
              {selectedTab === 'for-you' && (
                <>
                  {/* Suggested Section Skeleton */}
                  <div>
                    <div className="h-6 bg-muted rounded w-40 mb-4 animate-pulse" />
                    <div className="flex space-x-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-[160px] h-[200px] bg-muted rounded-lg animate-pulse flex-shrink-0" />
                      ))}
                    </div>
                  </div>
                  {/* Category Sections Skeleton */}
                  {[1, 2, 3].map(section => (
                    <div key={section}>
                      <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse" />
                      <div className="flex space-x-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-[160px] h-[200px] bg-muted rounded-lg animate-pulse flex-shrink-0" />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
              {selectedTab === 'top-charts' && (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              )}
              {selectedTab === 'categories' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {selectedTab === 'for-you' && (
            <div className="space-y-6">
              {/* Suggested for you */}
              {suggestedListings.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Suggested for you</h2>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 pb-4">
                      {suggestedListings.map((listing, idx) => (
                        <ToolCard
                          key={listing.id}
                          listing={listing}
                          onClick={() => handleViewDetails(listing)}
                          colorIndex={idx}
                        />
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              )}

              {/* Category Sections */}
              {Object.entries(categoryListings).map(([categoryName, listingsResult], index) => {
                const isLastCategory = index === Object.entries(categoryListings).length - 1;
                return (
                  <div key={categoryName} ref={isLastCategory ? lastListingElementRef : null}>
                    <CategorySection
                      categoryName={categoryName}
                      categoryListings={listingsResult}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                );
              })}

              {loading && <div className="text-center py-4">Loading more...</div>}
              {!hasMore && listings.length > 0 && <div className="text-center py-4 text-muted-foreground">No more results</div>}

              {listings.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tools found</p>
                </div>
              )}
            </div>
              )}
            </>
          )}

          {selectedTab === 'top-charts' && !(loading && page === 1) && (
            <div className="space-y-2">
              {topChartListings.map((listing, idx) => {
                if (topChartListings.length === idx + 1) {
                  return (
                    <div ref={lastListingElementRef} key={listing.id}>
                       <TopChartCard
                        listing={listing}
                        onClick={() => handleViewDetails(listing)}
                        rank={idx + 1}
                        colorIndex={idx}
                      />
                    </div>
                  )
                }
                return <TopChartCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => handleViewDetails(listing)}
                  rank={idx + 1}
                  colorIndex={idx}
                />
              })}
              {loading && <div className="text-center py-4">Loading more...</div>}
              {!hasMore && <div className="text-center py-4 text-muted-foreground">No more results</div>}
            </div>
          )}

          {selectedTab === 'categories' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category, idx) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  colorIndex={idx}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-20">
          <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
            <Button variant="ghost" className="flex-col h-auto py-2 gap-1">
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button variant="ghost" className="flex-col h-auto py-2 gap-1">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Top</span>
            </Button>
            <Button variant="ghost" className="flex-col h-auto py-2 gap-1">
              <Search className="h-5 w-5" />
              <span className="text-xs">Search</span>
            </Button>
            <Button variant="ghost" className="flex-col h-auto py-2 gap-1">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Library</span>
            </Button>
            <Button variant="ghost" className="flex-col h-auto py-2 gap-1">
              <User className="h-5 w-5" />
              <span className="text-xs">You</span>
            </Button>
          </div>
        </div>

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