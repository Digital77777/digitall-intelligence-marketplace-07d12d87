import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useMarketplace, MarketplaceListing } from '@/hooks/useMarketplace';
import { AlibabaPreviewCard } from '@/components/marketplace/preview/AlibabaPreviewCard';
import { TierGate } from '@/components/tier/TierGate';
import { SEOHead } from '@/components/SEOHead';
import { Loader2 } from 'lucide-react';

export default function ListingPreviewFeedPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings: feedListings, fetchListings, hasMore, loading } = useMarketplace();

  const [primary, setPrimary] = useState<MarketplaceListing | null>(null);
  const [primaryLoading, setPrimaryLoading] = useState(true);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch the primary (tapped) listing
  useEffect(() => {
    if (!id) return;
    setPrimaryLoading(true);
    (async () => {
      const { data } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      setPrimary(data as any);
      setPrimaryLoading(false);
      window.scrollTo({ top: 0 });
    })();
  }, [id]);

  // Fetch initial feed of related listings
  useEffect(() => {
    fetchListings({ page: 1 }, true);
    setPage(1);
  }, [id, fetchListings]);

  // Load more when needed
  useEffect(() => {
    if (page > 1) fetchListings({ page });
  }, [page, fetchListings]);

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: '600px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  // Filter the primary out of the feed list to avoid duplicate
  const feed = useMemo(
    () => feedListings.filter((l) => l.id !== id),
    [feedListings, id]
  );

  return (
    <TierGate feature="marketplace_buy">
      <SEOHead
        title={primary?.title ? `${primary.title} - Marketplace` : 'Product Preview'}
        description={primary?.description?.slice(0, 155) || 'Browse AI products and services.'}
        canonicalUrl={`/marketplace/preview/${id}`}
      />

      {/* Black background mimics Alibaba inter-card gap */}
      <div className="min-h-screen bg-black">
        {primaryLoading || !primary ? (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Primary card with overlay top bar */}
            <AlibabaPreviewCard listing={primary} showTopBar onBack={() => navigate(-1)} />

            {/* Following cards */}
            {feed.map((listing) => (
              <div key={listing.id} className="mt-2">
                <AlibabaPreviewCard listing={listing} />
              </div>
            ))}

            {/* Sentinel + loading */}
            <div ref={sentinelRef} className="h-4" />
            {loading && (
              <div className="flex items-center justify-center py-6 text-white/70 text-sm gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more...
              </div>
            )}
            {!hasMore && feed.length > 0 && (
              <div className="text-center py-8 text-white/50 text-xs">
                You've reached the end
              </div>
            )}
          </>
        )}
      </div>
    </TierGate>
  );
}
