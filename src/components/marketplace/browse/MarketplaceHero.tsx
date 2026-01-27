import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketplaceListing } from '@/hooks/useMarketplace';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MarketplaceHeroProps {
  featuredListings: MarketplaceListing[];
  isLoading?: boolean;
}

const gradients = [
  'from-blue-600 via-indigo-600 to-purple-700',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-orange-500 via-red-500 to-pink-600',
  'from-violet-600 via-purple-600 to-fuchsia-600',
  'from-cyan-500 via-blue-500 to-indigo-600',
];

export const MarketplaceHero = ({ featuredListings, isLoading }: MarketplaceHeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="relative w-full h-[280px] md:h-[400px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
          <div className="h-8 w-3/4 bg-white/20 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (featuredListings.length === 0) {
    return (
      <div className="relative w-full h-[280px] md:h-[400px] rounded-2xl overflow-hidden bg-gradient-to-r from-primary via-primary/80 to-accent">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 px-6">
            <Sparkles className="h-12 w-12 mx-auto opacity-80" />
            <h2 className="text-2xl md:text-4xl font-bold">Discover Amazing Products</h2>
            <p className="text-white/80 max-w-md">Explore our marketplace for the best AI tools, services, and opportunities</p>
          </div>
        </div>
      </div>
    );
  }

  const currentListing = featuredListings[currentIndex];
  const gradient = gradients[currentIndex % gradients.length];

  return (
    <div 
      className="relative w-full h-[280px] md:h-[400px] rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background with gradient and image */}
      <div className={cn(
        "absolute inset-0 transition-all duration-700 ease-out bg-gradient-to-br",
        gradient
      )}>
        {currentListing.images?.[0] && (
          <img 
            src={currentListing.images[0]} 
            alt={currentListing.title}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
          />
        )}
      </div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="space-y-3 md:space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </Badge>
            {currentListing.is_featured && (
              <Badge className="bg-yellow-500/80 text-white border-0">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Editor's Choice
              </Badge>
            )}
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
            {currentListing.title}
          </h2>
          
          <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-lg">
            {currentListing.description}
          </p>
          
          <div className="flex items-center gap-4 pt-2">
            <Button 
              onClick={() => navigate(`/marketplace/listing/${currentListing.id}`)}
              className="bg-white text-black hover:bg-white/90 font-semibold px-6"
            >
              View Details
            </Button>
            {currentListing.price && (
              <span className="text-white font-bold text-lg md:text-xl">
                {currentListing.currency || '$'}{currentListing.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {featuredListings.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Pagination dots */}
      {featuredListings.length > 1 && (
        <div className="absolute bottom-4 right-6 md:right-10 flex items-center gap-2">
          {featuredListings.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === currentIndex 
                  ? "w-8 bg-white" 
                  : "w-2 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
