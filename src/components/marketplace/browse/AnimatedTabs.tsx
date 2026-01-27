import React from 'react';
import { Sparkles, TrendingUp, Grid3x3, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface AnimatedTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const tabs: Tab[] = [
  { id: 'for-you', label: 'For You', icon: Sparkles },
  { id: 'top-charts', label: 'Top Charts', icon: TrendingUp },
  { id: 'categories', label: 'Categories', icon: Grid3x3 },
];

export const AnimatedTabs = ({ activeTab, onTabChange, className }: AnimatedTabsProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-2xl backdrop-blur-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300",
                isActive 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <span 
                  className="absolute inset-0 bg-primary rounded-xl shadow-lg"
                  style={{
                    animation: 'scale-in 0.2s ease-out',
                  }}
                />
              )}
              <Icon className={cn(
                "relative z-10 h-4 w-4 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
