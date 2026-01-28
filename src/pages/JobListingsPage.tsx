import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMarketplace, MarketplaceListing } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { JobApplicationModal } from '@/components/marketplace/JobApplicationModal';
import {
  JobsHero,
  JobCard,
  JobFilters,
  JobSearchBar,
  ActiveFiltersBadges,
  JobCardSkeleton,
  EmptyJobsState,
} from '@/components/jobs';

const JobListingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, loading } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<MarketplaceListing | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  // Filter states
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');
  const [experienceLevel, setExperienceLevel] = useState<string>('all');
  const [jobType, setJobType] = useState<string>('all');
  const [location, setLocation] = useState<string>('');
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 300000]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Filter only job listings
  const jobListings = listings.filter(listing => listing.listing_type === 'job');

  // Helper function to parse job details from requirements
  const parseJobDetails = (requirements: string | null) => {
    if (!requirements) return {};
    const lines = requirements.split('\n');
    const details: Record<string, string> = {};
    lines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        details[key.toLowerCase()] = value;
      }
    });
    return details;
  };

  // Extract all unique skills from job listings
  const allSkills = Array.from(new Set(
    jobListings.flatMap(job => job.tags || [])
  )).sort();

  // Apply search and filters
  const filteredJobs = jobListings.filter(job => {
    const details = parseJobDetails(job.requirements);

    // Search filter
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    // Employment type filter
    const requirements = job.requirements || '';
    const matchesEmployment = employmentFilter === 'all' ||
      requirements.toLowerCase().includes(employmentFilter.toLowerCase());

    // Skills filter
    const matchesSkills = selectedSkills.length === 0 ||
      (job.tags && selectedSkills.some(skill => job.tags?.includes(skill)));

    // Experience level filter
    const matchesExperience = experienceLevel === 'all' ||
      (details.experience && details.experience.toLowerCase().includes(experienceLevel.toLowerCase()));

    // Salary range filter
    let matchesSalary = true;
    if (details.salary) {
      const salaryMatch = details.salary.match(/\d+/g);
      if (salaryMatch) {
        const jobSalary = parseInt(salaryMatch[0]);
        matchesSalary = jobSalary >= salaryRange[0] && jobSalary <= salaryRange[1];
      }
    }

    // Job type filter (remote/onsite/hybrid)
    const matchesJobType = jobType === 'all' ||
      (details.remote && (
        (jobType === 'remote' && details.remote.toLowerCase() === 'yes') ||
        (jobType === 'onsite' && details.remote.toLowerCase() === 'no') ||
        (jobType === 'hybrid' && details.remote.toLowerCase().includes('hybrid'))
      ));

    // Location filter
    const matchesLocation = !location ||
      (details.location && details.location.toLowerCase().includes(location.toLowerCase()));

    return matchesSearch && matchesEmployment && matchesSkills &&
      matchesExperience && matchesSalary && matchesJobType && matchesLocation;
  });

  // Count active filters
  const activeFiltersCount =
    (employmentFilter !== 'all' ? 1 : 0) +
    selectedSkills.length +
    (experienceLevel !== 'all' ? 1 : 0) +
    (salaryRange[0] !== 0 || salaryRange[1] !== 300000 ? 1 : 0) +
    (jobType !== 'all' ? 1 : 0) +
    (location ? 1 : 0);

  const clearAllFilters = () => {
    setEmploymentFilter('all');
    setSelectedSkills([]);
    setExperienceLevel('all');
    setSalaryRange([0, 300000]);
    setJobType('all');
    setLocation('');
    setSearchQuery('');
  };

  const handleApply = (job: MarketplaceListing) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 pt-20 pb-12">
        {/* Back Button & Post Job */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="group"
            onClick={() => navigate('/marketplace')}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </Button>

          {user && (
            <Button onClick={() => navigate('/marketplace/post-jobs')} className="gap-2">
              <Plus className="h-4 w-4" />
              Post a Job
            </Button>
          )}
        </div>

        {/* Hero Section */}
        <JobsHero totalJobs={jobListings.length} />

        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <JobSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <JobFilters
            employmentFilter={employmentFilter}
            setEmploymentFilter={setEmploymentFilter}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            jobType={jobType}
            setJobType={setJobType}
            location={location}
            setLocation={setLocation}
            salaryRange={salaryRange}
            setSalaryRange={setSalaryRange}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            allSkills={allSkills}
            activeFiltersCount={activeFiltersCount}
            clearAllFilters={clearAllFilters}
          />
        </div>

        {/* Active Filters */}
        <div className="mb-6">
          <ActiveFiltersBadges
            employmentFilter={employmentFilter}
            setEmploymentFilter={setEmploymentFilter}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            jobType={jobType}
            setJobType={setJobType}
            location={location}
            setLocation={setLocation}
            salaryRange={salaryRange}
            setSalaryRange={setSalaryRange}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
          />
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> of{' '}
            <span className="font-semibold text-foreground">{jobListings.length}</span> opportunities
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 5 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))
          ) : filteredJobs.length === 0 ? (
            <EmptyJobsState
              hasFilters={activeFiltersCount > 0 || !!searchQuery}
              isAuthenticated={!!user}
              onClearFilters={clearAllFilters}
            />
          ) : (
            filteredJobs.map((job) => {
              const details = parseJobDetails(job.requirements);
              const isOwnJob = user?.id === job.user_id;

              return (
                <JobCard
                  key={job.id}
                  job={job}
                  details={details}
                  isOwnJob={isOwnJob}
                  onApply={handleApply}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => {
            setIsApplicationModalOpen(false);
            setSelectedJob(null);
          }}
          jobListing={selectedJob}
        />
      )}
    </div>
  );
};

export default JobListingsPage;
