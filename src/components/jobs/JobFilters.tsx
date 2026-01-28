import { X, SlidersHorizontal, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface JobFiltersProps {
  employmentFilter: string;
  setEmploymentFilter: (value: string) => void;
  experienceLevel: string;
  setExperienceLevel: (value: string) => void;
  jobType: string;
  setJobType: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  salaryRange: [number, number];
  setSalaryRange: (value: [number, number]) => void;
  selectedSkills: string[];
  setSelectedSkills: (value: string[]) => void;
  allSkills: string[];
  activeFiltersCount: number;
  clearAllFilters: () => void;
}

export const JobFilters = ({
  employmentFilter,
  setEmploymentFilter,
  experienceLevel,
  setExperienceLevel,
  jobType,
  setJobType,
  location,
  setLocation,
  salaryRange,
  setSalaryRange,
  selectedSkills,
  setSelectedSkills,
  allSkills,
  activeFiltersCount,
  clearAllFilters,
}: JobFiltersProps) => {
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Employment Type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Employment Type</Label>
        <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Experience Level</Label>
        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="entry">Entry Level</SelectItem>
            <SelectItem value="junior">Junior (1-3 years)</SelectItem>
            <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
            <SelectItem value="senior">Senior (5+ years)</SelectItem>
            <SelectItem value="lead">Lead/Principal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Work Location */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Work Location</Label>
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* City/Region */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">City / Region</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="e.g., San Francisco, London"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      <Separator />

      {/* Salary Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Salary Range</Label>
          <span className="text-xs text-muted-foreground">
            ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
          </span>
        </div>
        <Slider
          min={0}
          max={300000}
          step={10000}
          value={salaryRange}
          onValueChange={(value) => setSalaryRange(value as [number, number])}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$0</span>
          <span>$300k+</span>
        </div>
      </div>

      <Separator />

      {/* Skills Filter */}
      {allSkills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Skills</Label>
            {selectedSkills.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedSkills.length} selected
              </Badge>
            )}
          </div>
          <ScrollArea className="h-48 rounded-lg border bg-background p-3">
            <div className="space-y-2">
              {allSkills.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSkills([...selectedSkills, skill]);
                      } else {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill));
                      }
                    }}
                  />
                  <Label
                    htmlFor={`skill-${skill}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Filter Jobs</span>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-destructive">
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-10rem)] py-6">
          <FilterContent />
        </ScrollArea>
        <SheetFooter className="pt-4 border-t">
          <SheetTrigger asChild>
            <Button className="w-full">Apply Filters</Button>
          </SheetTrigger>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
