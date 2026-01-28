import { Users, Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyFreelancersStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const EmptyFreelancersState = ({ hasFilters, onClearFilters }: EmptyFreelancersStateProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-dashed border-2 bg-card/50">
      <CardContent className="py-16 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            {hasFilters ? (
              <Search className="h-8 w-8 text-primary" />
            ) : (
              <Users className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {hasFilters ? "No matching freelancers" : "No freelancers yet"}
            </h3>
            <p className="text-muted-foreground">
              {hasFilters
                ? "Try adjusting your filters or search terms to find more AI experts."
                : "Be the first to join our AI talent marketplace and showcase your expertise."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {hasFilters ? (
              <>
                <Button onClick={onClearFilters} variant="outline">
                  Clear All Filters
                </Button>
                <Button onClick={() => navigate('/marketplace/create-freelancer-profile')}>
                  Become a Freelancer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/marketplace/create-freelancer-profile')}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                Create Your Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
