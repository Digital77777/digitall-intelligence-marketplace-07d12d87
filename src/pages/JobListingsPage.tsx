import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Users, Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { JobApplicationModal } from '@/components/marketplace/JobApplicationModal';

const JobListingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, loading } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Advanced filters
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('all');
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 300000]);
  const [jobType, setJobType] = useState<string>('all'); // remote/onsite/hybrid
  const [location, setLocation] = useState<string>('');

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
      (job.tags && selectedSkills.some(skill => job.tags.includes(skill)));
    
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
  };

  const handleApply = (job: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 pt-24 pb-12">
        <Button 
          variant="ghost" 
          className="mb-6 group"
          onClick={() => navigate('/marketplace')}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
          <p className="text-muted-foreground">
            Browse and apply to AI-related job opportunities from top companies
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, skills, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant={isFilterOpen ? "default" : "outline"}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
            {isFilterOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {isFilterOpen && (
          <Card className="mb-6 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Advanced Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Employment Type */}
                <div className="space-y-2">
                  <Label>Employment Type</Label>
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
                <div className="space-y-2">
                  <Label>Experience Level</Label>
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

                {/* Job Type (Remote/Onsite) */}
                <div className="space-y-2">
                  <Label>Work Location</Label>
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

                {/* Location */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., San Francisco, Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-background"
                  />
                </div>

                {/* Salary Range */}
                <div className="space-y-3 md:col-span-2">
                  <Label>
                    Salary Range: ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
                  </Label>
                  <Slider
                    min={0}
                    max={300000}
                    step={10000}
                    value={salaryRange}
                    onValueChange={(value) => setSalaryRange(value as [number, number])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$300k+</span>
                  </div>
                </div>
              </div>

              {/* Skills Filter */}
              {allSkills.length > 0 && (
                <div className="mt-6 space-y-3">
                  <Label>Required Skills ({selectedSkills.length} selected)</Label>
                  <div className="flex flex-wrap gap-2 p-4 bg-background rounded-lg border max-h-48 overflow-y-auto">
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
                          className="text-sm font-normal cursor-pointer"
                        >
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {employmentFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {employmentFilter}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setEmploymentFilter('all')}
                />
              </Badge>
            )}
            {experienceLevel !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {experienceLevel}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setExperienceLevel('all')}
                />
              </Badge>
            )}
            {jobType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {jobType}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setJobType('all')}
                />
              </Badge>
            )}
            {location && (
              <Badge variant="secondary" className="gap-1">
                Location: {location}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setLocation('')}
                />
              </Badge>
            )}
            {(salaryRange[0] !== 0 || salaryRange[1] !== 300000) && (
              <Badge variant="secondary" className="gap-1">
                ${salaryRange[0].toLocaleString()}-${salaryRange[1].toLocaleString()}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setSalaryRange([0, 300000])}
                />
              </Badge>
            )}
            {selectedSkills.map(skill => (
              <Badge key={skill} variant="secondary" className="gap-1">
                {skill}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredJobs.length} of {jobListings.length} jobs
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-9 bg-muted rounded w-24 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-20 animate-pulse" />
                    <div className="h-6 bg-muted rounded w-24 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || employmentFilter !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "No job opportunities have been posted yet"}
              </p>
              {user && (
                <Button onClick={() => navigate('/marketplace/post-jobs')}>
                  Post a Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => {
              const details = parseJobDetails(job.requirements);
              const isOwnJob = user?.id === job.user_id;
              
              return (
                <Card key={job.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {details.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {details.location}
                            </span>
                          )}
                          {details.employment && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {details.employment}
                            </span>
                          )}
                          {details.salary && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {details.salary}
                            </span>
                          )}
                          {details.remote && (
                            <Badge variant="secondary" className="text-xs">
                              {details.remote === 'Yes' ? 'Remote' : 'On-site'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleApply(job)}
                        disabled={isOwnJob}
                        className={isOwnJob ? 'opacity-50' : ''}
                      >
                        {isOwnJob ? 'Your Job' : 'Apply Now'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-4">
                      {job.description}
                    </CardDescription>
                    
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.tags.slice(0, 6).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {job.tags.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.tags.length - 6} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      {details.experience && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {details.experience}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
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
