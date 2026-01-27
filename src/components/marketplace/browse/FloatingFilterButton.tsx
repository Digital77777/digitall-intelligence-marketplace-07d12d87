import React, { useState } from 'react';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FilterOptions {
  types: string[];
  priceRange: [number, number];
  sortBy: string;
}

interface FloatingFilterButtonProps {
  onApplyFilters?: (filters: FilterOptions) => void;
  className?: string;
}

const listingTypes = [
  { id: 'product', label: 'Products' },
  { id: 'service', label: 'Services' },
  { id: 'job', label: 'Jobs' },
];

const sortOptions = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Highest Rated' },
];

export const FloatingFilterButton = ({ onApplyFilters, className }: FloatingFilterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('newest');

  const activeFilterCount = selectedTypes.length + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleApply = () => {
    onApplyFilters?.({
      types: selectedTypes,
      priceRange,
      sortBy,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setPriceRange([0, 1000]);
    setSortBy('newest');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className={cn(
            "fixed bottom-24 right-4 z-40 rounded-full shadow-xl",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "h-14 px-6 gap-2",
            "animate-fade-in",
            "md:hidden", // Only show on mobile
            className
          )}
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Filters</SheetTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReset}
              className="text-muted-foreground"
            >
              Reset all
            </Button>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-8 overflow-y-auto max-h-[calc(80vh-160px)]">
          {/* Listing Type */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Type</Label>
            <div className="flex flex-wrap gap-2">
              {listingTypes.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <Button
                    key={type.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTypeToggle(type.id)}
                    className={cn(
                      "rounded-full",
                      isSelected && "gap-1"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Price Range</Label>
              <span className="text-sm text-muted-foreground">
                ${priceRange[0]} - ${priceRange[1]}+
              </span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              max={1000}
              step={10}
              className="w-full"
            />
          </div>

          {/* Sort By */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Sort By</Label>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors",
                    sortBy === option.id 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  {sortBy === option.id && (
                    <Check className="h-5 w-5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="pt-4 border-t">
          <Button 
            onClick={handleApply}
            className="w-full h-12 rounded-xl font-semibold"
          >
            Apply Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
