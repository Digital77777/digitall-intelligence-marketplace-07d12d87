import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, MapPin, DollarSign, Clock, Briefcase, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "@/components/marketplace/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FreelancerProfile {
  id: string;
  user_id: string;
  name: string;
  title: string;
  bio: string;
  hourly_rate: number;
  experience: string;
  location: string;
  skills: string[];
  languages: string[];
  availability: string;
  profile_picture: string;
  averageRating?: number;
  totalReviews?: number;
}

const BrowseFreelancersPage = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [profiles, searchQuery, experienceFilter, minRate, maxRate, availabilityFilter]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch ratings for all profiles
        const profileIds = data.map(p => p.id);
        const { data: reviewsData } = await supabase
          .from('freelancer_reviews')
          .select('freelancer_profile_id, rating')
          .in('freelancer_profile_id', profileIds);

        // Calculate average ratings
        const ratingsMap = new Map<string, { total: number; count: number }>();
        reviewsData?.forEach(review => {
          const existing = ratingsMap.get(review.freelancer_profile_id) || { total: 0, count: 0 };
          ratingsMap.set(review.freelancer_profile_id, {
            total: existing.total + review.rating,
            count: existing.count + 1
          });
        });

        const profilesWithRatings = data.map(profile => ({
          ...profile,
          averageRating: ratingsMap.has(profile.id) 
            ? Math.round((ratingsMap.get(profile.id)!.total / ratingsMap.get(profile.id)!.count) * 10) / 10
            : 0,
          totalReviews: ratingsMap.get(profile.id)?.count || 0
        }));

        setProfiles(profilesWithRatings);
      } else {
        setProfiles([]);
      }
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      toast.error("Failed to load freelancer profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...profiles];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(profile => 
        profile.name.toLowerCase().includes(query) ||
        profile.title.toLowerCase().includes(query) ||
        profile.bio.toLowerCase().includes(query) ||
        profile.skills.some(skill => skill.toLowerCase().includes(query)) ||
        (profile.location && profile.location.toLowerCase().includes(query))
      );
    }

    // Experience filter
    if (experienceFilter !== "all") {
      filtered = filtered.filter(profile => profile.experience === experienceFilter);
    }

    // Hourly rate filter
    if (minRate) {
      filtered = filtered.filter(profile => profile.hourly_rate >= parseFloat(minRate));
    }
    if (maxRate) {
      filtered = filtered.filter(profile => profile.hourly_rate <= parseFloat(maxRate));
    }

    // Availability filter
    if (availabilityFilter !== "all") {
      filtered = filtered.filter(profile => profile.availability === availabilityFilter);
    }

    setFilteredProfiles(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setExperienceFilter("all");
    setMinRate("");
    setMaxRate("");
    setAvailabilityFilter("all");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <div className="h-8 bg-muted rounded w-64 mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-96 animate-pulse" />
            </div>
            <div className="mb-8 space-y-4">
              <div className="h-12 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded w-32 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-muted rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse AI Freelancers</h1>
            <p className="text-muted-foreground">
              Find and hire expert AI professionals for your projects
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search by name, skills, title, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Filters Section */}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Experience Level */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Experience Level</label>
                        <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All levels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All levels</SelectItem>
                            <SelectItem value="Entry Level (0-2 years)">Entry Level</SelectItem>
                            <SelectItem value="Intermediate (2-5 years)">Intermediate</SelectItem>
                            <SelectItem value="Experienced (5-10 years)">Experienced</SelectItem>
                            <SelectItem value="Expert (10+ years)">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Hourly Rate Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Min Hourly Rate ($)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={minRate}
                          onChange={(e) => setMinRate(e.target.value)}
                        />
                      </div>

                      {/* Hourly Rate Max */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Hourly Rate ($)</label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={maxRate}
                          onChange={(e) => setMaxRate(e.target.value)}
                        />
                      </div>

                      {/* Availability */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Availability</label>
                        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Full-time (40+ hrs/week)">Full-time</SelectItem>
                            <SelectItem value="Part-time (20-40 hrs/week)">Part-time</SelectItem>
                            <SelectItem value="Project-based">Project-based</SelectItem>
                            <SelectItem value="Hourly as needed">Hourly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredProfiles.length} {filteredProfiles.length === 1 ? 'freelancer' : 'freelancers'} found
              </p>
            </div>
          </div>

          {/* Freelancer Grid */}
          {filteredProfiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No freelancers found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <Card 
                  key={profile.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/marketplace/freelancer/${profile.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/10">
                        <AvatarImage src={profile.profile_picture} alt={profile.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1 truncate group-hover:text-primary transition-colors">
                          {profile.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {profile.title}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {profile.bio}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.length - 4} more
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      {profile.totalReviews && profile.totalReviews > 0 ? (
                        <div className="flex items-center gap-2">
                          <StarRating rating={profile.averageRating || 0} size="sm" showValue />
                          <span className="text-muted-foreground">
                            ({profile.totalReviews})
                          </span>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-foreground">${profile.hourly_rate}/hr</span>
                      </div>
                      {profile.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile.availability && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{profile.availability}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button className="w-full mt-4" variant="outline">
                      <Briefcase className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseFreelancersPage;
