import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, Palette, Code, BookOpen, Briefcase, Wrench, 
  Layers, Zap, Globe, Music, Video, Camera,
  Grid3x3, LucideIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketplaceCategory } from '@/hooks/useMarketplace';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  categories: MarketplaceCategory[];
  listingCounts?: Record<string, number>;
  onCategoryClick?: (categoryId: string) => void;
}

interface CategoryConfig {
  icon: LucideIcon;
  gradient: string;
  bgColor: string;
}

const categoryConfigs: Record<string, CategoryConfig> = {
  'AI Tools': { 
    icon: Cpu, 
    gradient: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  'Templates': { 
    icon: Layers, 
    gradient: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  'Development': { 
    icon: Code, 
    gradient: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  'Courses': { 
    icon: BookOpen, 
    gradient: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  'Jobs': { 
    icon: Briefcase, 
    gradient: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
  },
  'Services': { 
    icon: Wrench, 
    gradient: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  'Design': { 
    icon: Palette, 
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20'
  },
  'Automation': { 
    icon: Zap, 
    gradient: 'from-yellow-500 to-orange-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  'Web': { 
    icon: Globe, 
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20'
  },
  'Audio': { 
    icon: Music, 
    gradient: 'from-red-500 to-pink-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  },
  'Video': { 
    icon: Video, 
    gradient: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
  'Photography': { 
    icon: Camera, 
    gradient: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20'
  },
};

const defaultConfig: CategoryConfig = {
  icon: Grid3x3,
  gradient: 'from-gray-500 to-gray-600',
  bgColor: 'bg-gray-50 dark:bg-gray-900/20'
};

interface CategoryCardItemProps {
  category: MarketplaceCategory;
  listingCount?: number;
  onClick?: () => void;
}

const CategoryCardItem = memo(({ category, listingCount, onClick }: CategoryCardItemProps) => {
  const config = categoryConfigs[category.name] || defaultConfig;
  const Icon = config.icon;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]",
        config.bgColor
      )}
    >
      <div className="p-6 text-center space-y-4">
        {/* Icon with gradient background */}
        <div className={cn(
          "w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center",
          "transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
          "shadow-lg",
          config.gradient
        )}>
          <Icon className="h-8 w-8 text-white" />
        </div>

        {/* Category name */}
        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Listing count */}
        {listingCount !== undefined && listingCount > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 font-semibold"
          >
            {listingCount} {listingCount === 1 ? 'item' : 'items'}
          </Badge>
        )}
      </div>

      {/* Decorative gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
        "bg-gradient-to-br",
        config.gradient
      )} />
    </Card>
  );
});

CategoryCardItem.displayName = 'CategoryCardItem';

export const CategoryGrid = memo(({ 
  categories, 
  listingCounts = {},
  onCategoryClick 
}: CategoryGridProps) => {
  const navigate = useNavigate();

  const handleClick = (category: MarketplaceCategory) => {
    if (onCategoryClick) {
      onCategoryClick(category.id);
    } else {
      // Default: filter by category
      navigate(`/marketplace/browse?category=${category.id}`);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3x3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {categories.map((category) => (
        <CategoryCardItem
          key={category.id}
          category={category}
          listingCount={listingCounts[category.id]}
          onClick={() => handleClick(category)}
        />
      ))}
    </div>
  );
});

CategoryGrid.displayName = 'CategoryGrid';
