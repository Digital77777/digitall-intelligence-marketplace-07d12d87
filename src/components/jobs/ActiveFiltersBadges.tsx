import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActiveFiltersBadgesProps {
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
}

export const ActiveFiltersBadges = ({
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
}: ActiveFiltersBadgesProps) => {
  const hasActiveFilters = 
    employmentFilter !== 'all' ||
    experienceLevel !== 'all' ||
    jobType !== 'all' ||
    location ||
    salaryRange[0] !== 0 ||
    salaryRange[1] !== 300000 ||
    selectedSkills.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {employmentFilter !== 'all' && (
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-primary/10 hover:bg-primary/20 transition-colors">
          {employmentFilter}
          <X
            className="h-3.5 w-3.5 cursor-pointer hover:text-destructive transition-colors"
            onClick={() => setEmploymentFilter('all')}
          />
        </Badge>
      )}
      {experienceLevel !== 'all' && (
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-primary/10 hover:bg-primary/20 transition-colors">
          {experienceLevel}
          <X
            className="h-3.5 w-3.5 cursor-pointer hover:text-destructive transition-colors"
            onClick={() => setExperienceLevel('all')}
          />
        </Badge>
      )}
      {jobType !== 'all' && (
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-primary/10 hover:bg-primary/20 transition-colors">
          {jobType}
          <X
            className="h-3.5 w-3.5 cursor-pointer hover:text-destructive transition-colors"
            onClick={() => setJobType('all')}
          />
        </Badge>
      )}
      {location && (
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-primary/10 hover:bg-primary/20 transition-colors">
          📍 {location}
          <X
            className="h-3.5 w-3.5 cursor-pointer hover:text-destructive transition-colors"
            onClick={() => setLocation('')}
          />
        </Badge>
      )}
      {(salaryRange[0] !== 0 || salaryRange[1] !== 300000) && (
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-primary/10 hover:bg-primary/20 transition-colors">
          💰 ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
          <X
            className="h-3.5 w-3.5 cursor-pointer hover:text-destructive transition-colors"
            onClick={() => setSalaryRange([0, 300000])}
          />
        </Badge>
      )}
      {selectedSkills.map(skill => (
        <Badge key={skill} variant="secondary" className="gap-1.5 py-1.5 px-3 bg-accent/10 hover:bg-accent/20 transition-colors">
          {skill}
          <X
            className="h-3.5 w-3.5 cursor-pointer hover:text-destructive transition-colors"
            onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
          />
        </Badge>
      ))}
    </div>
  );
};
