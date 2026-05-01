import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Search, ShoppingCart, MoreHorizontal,
  MessageCircle, Send, BadgeCheck, ShoppingBag, Wrench, Briefcase, Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { cn } from '@/lib/utils';

interface AlibabaPreviewCardProps {
  listing: MarketplaceListing;
  showTopBar?: boolean;
  onBack?: () => void;
}

const typeIcons = { product: ShoppingBag, service: Wrench, job: Briefcase };
const gradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
];

export const AlibabaPreviewCard: React.FC<AlibabaPreviewCardProps> = ({
  listing, showTopBar, onBack,
}) => {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const TypeIcon = typeIcons[listing.listing_type] || ShoppingBag;
  const gradient = gradients[listing.title.charCodeAt(0) % gradients.length];
  const images = listing.images && listing.images.length > 0 ? listing.images : [null];

  // Simulated trust stats — same seed pattern as ProductCard
  const code = listing.title.charCodeAt(0);
  const sold = Math.floor((code * 7 + listing.title.length * 13) % 900 + 100);
  const moq = (code % 5) + 1;
  const yrs = (code % 10) + 2;
  const isPremium = !!listing.is_featured;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.currency || 'USD', maximumFractionDigits: 2 }).format(n);

  const priceDisplay = listing.price && listing.price > 0
    ? `${formatPrice(listing.price)} - ${formatPrice(listing.price * 1.35)}`
    : 'Contact for price';

  const goDetail = () => navigate(`/marketplace/listing/${listing.id}`);

  const handleScroll = () => {
    if (!scrollerRef.current) return;
    const w = scrollerRef.current.clientWidth;
    setActiveImage(Math.round(scrollerRef.current.scrollLeft / w));
  };

  return (
    <article className="bg-card overflow-hidden">
      {/* Media area with overlay controls (Alibaba style) */}
      <div className="relative bg-muted">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
          {images.map((src, i) => (
            <div key={i} className="relative w-full flex-shrink-0 snap-center aspect-square">
              {src ? (
                <img src={src} alt={`${listing.title} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', gradient)}>
                  <TypeIcon className="h-16 w-16 text-white/80" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Top overlay bar */}
        {showTopBar && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <button
              onClick={onBack || (() => navigate(-1))}
              className="w-9 h-9 rounded-full bg-background/85 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-95 transition"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-background/85 backdrop-blur-sm flex items-center justify-center shadow-sm" aria-label="Search">
                <Search className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-background/85 backdrop-blur-sm flex items-center justify-center shadow-sm" aria-label="Cart">
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-background/85 backdrop-blur-sm flex items-center justify-center shadow-sm" aria-label="More">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Image dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1 rounded-full bg-white/60 transition-all',
                  activeImage === i ? 'w-5 bg-white' : 'w-1.5'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        {/* Title row → tap to detail */}
        <button
          onClick={goDetail}
          className="w-full flex items-start gap-2 text-left group"
        >
          {isPremium && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
          <h2 className="flex-1 text-[15px] font-semibold leading-snug line-clamp-1 group-active:text-primary">
            {listing.title}
          </h2>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        </button>

        {/* Price — Alibaba red/orange */}
        <div className="text-orange-600 dark:text-orange-400 text-xl font-bold tracking-tight">
          {priceDisplay}
        </div>

        {/* MOQ + sold */}
        <div className="text-xs text-muted-foreground">
          MOQ: {moq} <span className="mx-1.5">|</span> {sold} sold
        </div>

        {/* Certifications row */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-1.5 py-0.5 border border-border rounded text-[10px] font-semibold">CE</span>
          <span className="px-1.5 py-0.5 border border-border rounded text-[10px] font-semibold">CB</span>
          <span className="text-muted-foreground">certifications</span>
        </div>

        {/* Verified line */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified
          </span>
          <span className="text-muted-foreground">{yrs} yrs</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">CN</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground line-clamp-1 flex-1 min-w-0">
            Trusted seller on the platform
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1.5">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-full border-border font-semibold text-sm gap-1.5"
            onClick={goDetail}
          >
            <MessageCircle className="w-4 h-4" />
            Chat now
          </Button>
          <Button
            className="flex-1 h-10 rounded-full font-semibold text-sm gap-1.5 bg-orange-600 hover:bg-orange-700 text-white shadow-none"
            onClick={goDetail}
          >
            <Send className="w-4 h-4" />
            Send inquiry
          </Button>
        </div>
      </div>
    </article>
  );
};
