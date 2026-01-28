import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FreelancerFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experienceFilter: string;
  onExperienceChange: (value: string) => void;
  minRate: string;
  maxRate: string;
  onMinRateChange: (value: string) => void;
  onMaxRateChange: (value: string) => void;
  availabilityFilter: string;
  onAvailabilityChange: (value: string) => void;
  onClearFilters: () => void;
}

const experienceLevels = [
  { value: "all", label: "All Levels" },
  { value: "Entry Level (0-2 years)", label: "Entry Level (0-2 yrs)" },
  { value: "Intermediate (2-5 years)", label: "Intermediate (2-5 yrs)" },
  { value: "Experienced (5-10 years)", label: "Experienced (5-10 yrs)" },
  { value: "Expert (10+ years)", label: "Expert (10+ yrs)" },
];

const availabilityOptions = [
  { value: "all", label: "Any Availability" },
  { value: "Full-time (40+ hrs/week)", label: "Full-time (40+ hrs)" },
  { value: "Part-time (20-40 hrs/week)", label: "Part-time (20-40 hrs)" },
  { value: "Project-based", label: "Project-based" },
  { value: "Hourly as needed", label: "Hourly" },
];

export const FreelancerFilters = ({
  open,
  onOpenChange,
  experienceFilter,
  onExperienceChange,
  minRate,
  maxRate,
  onMinRateChange,
  onMaxRateChange,
  availabilityFilter,
  onAvailabilityChange,
  onClearFilters,
}: FreelancerFiltersProps) => {
  const currentMinRate = minRate ? parseInt(minRate) : 0;
  const currentMaxRate = maxRate ? parseInt(maxRate) : 500;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Filter Freelancers</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          <SheetDescription>
            Refine your search to find the perfect AI expert
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Experience Level */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Experience Level</Label>
            <div className="grid grid-cols-1 gap-2">
              {experienceLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={experienceFilter === level.value ? "default" : "outline"}
                  size="sm"
                  className="justify-start h-10"
                  onClick={() => onExperienceChange(level.value)}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Hourly Rate Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Hourly Rate</Label>
              <span className="text-sm text-muted-foreground">
                ${currentMinRate} - ${currentMaxRate}+
              </span>
            </div>
            <div className="px-2">
              <Slider
                value={[currentMinRate, currentMaxRate]}
                min={0}
                max={500}
                step={10}
                onValueChange={(values) => {
                  onMinRateChange(values[0].toString());
                  onMaxRateChange(values[1].toString());
                }}
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Min ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minRate}
                  onChange={(e) => onMinRateChange(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Max ($)</Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={maxRate}
                  onChange={(e) => onMaxRateChange(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Availability */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Availability</Label>
            <div className="grid grid-cols-1 gap-2">
              {availabilityOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={availabilityFilter === option.value ? "default" : "outline"}
                  size="sm"
                  className="justify-start h-10"
                  onClick={() => onAvailabilityChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="pt-4 border-t">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
