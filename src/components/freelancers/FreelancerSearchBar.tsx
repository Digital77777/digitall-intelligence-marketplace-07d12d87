import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FreelancerSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  activeFiltersCount: number;
}

export const FreelancerSearchBar = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  activeFiltersCount,
}: FreelancerSearchBarProps) => {
  return (
    <div className="relative flex gap-3">
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl opacity-50" />
        <div className="relative flex items-center bg-card/80 backdrop-blur-md border border-border/50 rounded-xl shadow-lg overflow-hidden">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, skills, title, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-4 h-14 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />
        </div>
      </div>
      <Button
        variant="outline"
        size="lg"
        onClick={onFilterClick}
        className="h-14 px-5 bg-card/80 backdrop-blur-md border-border/50 hover:bg-accent/50 relative"
      >
        <SlidersHorizontal className="h-5 w-5 mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
            {activeFiltersCount}
          </span>
        )}
      </Button>
    </div>
  );
};
