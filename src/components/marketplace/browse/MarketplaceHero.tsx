import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketplaceListing, MarketplaceCategory } from '@/hooks/useMarketplace';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MarketplaceHeroProps {
  featuredListings: MarketplaceListing[];
  categories?: MarketplaceCategory[];
  onCategoryClick?: (categoryId: string) => void;
  isLoading?: boolean;
}

const gradients = [
  'from-blue-600 via-indigo-600 to-purple-700',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-orange-500 via-red-500 to-pink-600',
  'from-violet-600 via-purple-600 to-fuchsia-600',
  'from-cyan-500 via-blue-500 to-indigo-600',
];

const categoryIcons: Record<string, string> = {
  'AI Tools': '🤖',
  'Templates': '📋',
  'Development': '💻',
  'Courses': '📚',
  'Jobs': '💼',
  'Services': '🔧',
  'Design': '🎨',
  'Automation': '⚡',
  'Web': '🌐',
  'Audio': '🎵',
  'Video': '🎬',
  'Photography': '📷',
  'Robotics & Automation': '🦾',
  'African AI': '🌍',
  'Data Science': '📊',
  'NLP': '💬',
  'Computer Vision': '👁️',
};

export const MarketplaceHero = ({ featuredListings, categories = [], onCategoryClick, isLoading }: MarketplaceHeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const nextSlide = useCallback(() => {
    if (featuredListings.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredListings.length);
  }, [featuredListings.length]);

  const prevSlide = useCallback(() => {
    if (featuredListings.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + featuredListings.length) % featuredListings.length);
  }, [featuredListings.length]);

  useEffect(() => {
    if (!isAutoPlaying || featuredListings.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, featuredListings.length]);

  // Mobile: horizontal category strip
  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Mobile Category Strip */}
        {categories.length > 0 && (
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
              {categories.slice(0, 10).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryClick?.(cat.id)}
                  className="flex flex-col items-center gap-1.5 min-w-[60px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-xl shadow-sm">
                    {categoryIcons[cat.name] || '📦'}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight line-clamp-1 max-w-[60px]">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Banner Carousel */}
        <div
          className="relative w-full h-[160px] rounded-xl overflow-hidden"
          onTouchStart={() => setIsAutoPlaying(false)}
          onTouchEnd={() => setIsAutoPlaying(true)}
        >
          {isLoading ? (
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse rounded-xl" />
          ) : featuredListings.length > 0 ? (
            <>
              <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-500", gradients[currentIndex % gradients.length])}>
                {featuredListings[currentIndex]?.images?.[0] && (
                  <img
                    src={featuredListings[currentIndex].images![0]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-sm line-clamp-1">{featuredListings[currentIndex]?.title}</h3>
                <p className="text-white/70 text-xs line-clamp-1 mt-0.5">{featuredListings[currentIndex]?.description}</p>
              </div>
              {featuredListings.length > 1 && (
                <div className="absolute bottom-2 right-3 flex gap-1">
                  {featuredListings.map((_, idx) => (
                    <div key={idx} className={cn("h-1 rounded-full transition-all", idx === currentIndex ? "w-4 bg-white" : "w-1 bg-white/40")} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <div className="text-center text-white px-4">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <h3 className="font-bold text-sm">Discover AI Products</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop: Category sidebar + Banner
  const currentListing = featuredListings[currentIndex];
  const gradient = gradients[currentIndex % gradients.length];

  return (
    <div className="flex gap-0 h-[360px] rounded-2xl overflow-hidden border border-border/30 shadow-sm">
      {/* Category Sidebar */}
      {categories.length > 0 && (
        <div className="w-[220px] bg-card border-r border-border/30 overflow-y-auto flex-shrink-0">
          <div className="py-2">
            {categories.slice(0, 12).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryClick?.(cat.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 hover:text-primary transition-colors group text-left"
              >
                <span className="text-base">{categoryIcons[cat.name] || '📦'}</span>
                <span className="flex-1 truncate text-foreground/80 group-hover:text-primary font-medium text-[13px]">
                  {cat.name}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Banner Carousel */}
      <div
        className="relative flex-1 group"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {isLoading ? (
          <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse" />
        ) : featuredListings.length > 0 && currentListing ? (
          <>
            <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-700", gradient)}>
              {currentListing.images?.[0] && (
                <img
                  src={currentListing.images[0]}
                  alt={currentListing.title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                  {currentListing.is_featured && (
                    <Badge className="bg-yellow-500/80 text-white border-0 text-xs">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Top Pick
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{currentListing.title}</h2>
                <p className="text-white/80 text-sm line-clamp-2 max-w-lg">{currentListing.description}</p>
                <Button
                  onClick={() => navigate(`/marketplace/listing/${currentListing.id}`)}
                  className="bg-white text-black hover:bg-white/90 font-semibold px-6"
                  size="sm"
                >
                  View Details
                </Button>
              </div>
            </div>

            {/* Nav arrows */}
            {featuredListings.length > 1 && (
              <>
                <Button variant="ghost" size="icon" onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Dots */}
            {featuredListings.length > 1 && (
              <div className="absolute bottom-3 right-6 flex gap-1.5">
                {featuredListings.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn("h-1.5 rounded-full transition-all", idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40")}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center">
            <div className="text-center text-white space-y-3">
              <Sparkles className="h-10 w-10 mx-auto opacity-80" />
              <h2 className="text-2xl font-bold">Discover Amazing Products</h2>
              <p className="text-white/80 text-sm">Explore AI tools, services, and opportunities</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
