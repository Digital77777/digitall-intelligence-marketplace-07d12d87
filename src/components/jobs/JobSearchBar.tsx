import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface JobSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export const JobSearchBar = ({ searchQuery, setSearchQuery }: JobSearchBarProps) => {
  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl opacity-30" />
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by job title, skills, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-10 h-12 text-base bg-background/80 backdrop-blur-sm border-2 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
