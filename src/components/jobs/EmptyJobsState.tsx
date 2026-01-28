import { Briefcase, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyJobsStateProps {
  hasFilters: boolean;
  isAuthenticated: boolean;
  onClearFilters: () => void;
}

export const EmptyJobsState = ({ hasFilters, isAuthenticated, onClearFilters }: EmptyJobsStateProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-dashed">
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          {hasFilters ? (
            <Search className="h-10 w-10 text-muted-foreground" />
          ) : (
            <Briefcase className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2">
          {hasFilters ? 'No matching jobs found' : 'No jobs posted yet'}
        </h3>
        
        <p className="text-muted-foreground max-w-md mb-6">
          {hasFilters
            ? "Try adjusting your search criteria or removing some filters to see more opportunities."
            : "Be the first to post a job opportunity and connect with talented professionals in our community."}
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          {hasFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear All Filters
            </Button>
          )}
          {isAuthenticated && (
            <Button onClick={() => navigate('/marketplace/post-jobs')} className="gap-2">
              <Plus className="h-4 w-4" />
              Post a Job
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
