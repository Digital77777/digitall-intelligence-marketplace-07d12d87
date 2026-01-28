import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActiveFreelancerFiltersProps {
  experienceFilter: string;
  minRate: string;
  maxRate: string;
  availabilityFilter: string;
  onRemoveExperience: () => void;
  onRemoveRate: () => void;
  onRemoveAvailability: () => void;
  onClearAll: () => void;
}

export const ActiveFreelancerFilters = ({
  experienceFilter,
  minRate,
  maxRate,
  availabilityFilter,
  onRemoveExperience,
  onRemoveRate,
  onRemoveAvailability,
  onClearAll,
}: ActiveFreelancerFiltersProps) => {
  const hasFilters = 
    experienceFilter !== "all" || 
    minRate !== "" || 
    maxRate !== "" || 
    availabilityFilter !== "all";

  if (!hasFilters) return null;

  const getExperienceLabel = (value: string) => {
    const labels: Record<string, string> = {
      "Entry Level (0-2 years)": "Entry Level",
      "Intermediate (2-5 years)": "Intermediate",
      "Experienced (5-10 years)": "Experienced",
      "Expert (10+ years)": "Expert",
    };
    return labels[value] || value;
  };

  const getAvailabilityLabel = (value: string) => {
    const labels: Record<string, string> = {
      "Full-time (40+ hrs/week)": "Full-time",
      "Part-time (20-40 hrs/week)": "Part-time",
      "Project-based": "Project-based",
      "Hourly as needed": "Hourly",
    };
    return labels[value] || value;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {experienceFilter !== "all" && (
        <Badge variant="secondary" className="gap-1 pr-1">
          {getExperienceLabel(experienceFilter)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={onRemoveExperience}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {(minRate !== "" || maxRate !== "") && (
        <Badge variant="secondary" className="gap-1 pr-1">
          ${minRate || "0"} - ${maxRate || "500+"}/hr
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={onRemoveRate}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {availabilityFilter !== "all" && (
        <Badge variant="secondary" className="gap-1 pr-1">
          {getAvailabilityLabel(availabilityFilter)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={onRemoveAvailability}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  );
};
