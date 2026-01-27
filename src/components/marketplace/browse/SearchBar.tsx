import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Mic, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  trendingSearches?: string[];
  onSearch?: (query: string) => void;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search marketplace...",
  recentSearches = [],
  trendingSearches = ['AI Tools', 'Templates', 'Web Development', 'Design'],
  onSearch,
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSearch = (query: string) => {
    onChange(query);
    setShowSuggestions(false);
    onSearch?.(query);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSearch?.(value);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={cn(
        "relative flex items-center transition-all duration-300 rounded-2xl",
        isFocused 
          ? "bg-background shadow-lg ring-2 ring-primary/20" 
          : "bg-muted/60 hover:bg-muted/80"
      )}>
        <Search className={cn(
          "absolute left-4 h-5 w-5 transition-colors",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-12 md:h-14 pl-12 pr-24 bg-transparent border-0 rounded-2xl text-base",
            "placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            title="Voice search (coming soon)"
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && !value && (recentSearches.length > 0 || trendingSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl shadow-xl border border-border/50 overflow-hidden z-50 animate-fade-in">
          {recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2 px-2">
                <Clock className="h-3 w-3" />
                Recent Searches
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 3).map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(search)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-left transition-colors"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {trendingSearches.length > 0 && (
            <div className="p-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2 px-2">
                <TrendingUp className="h-3 w-3" />
                Trending
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary text-sm transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
