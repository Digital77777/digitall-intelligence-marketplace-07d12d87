import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FreelancersHero,
  FreelancerCard,
  FreelancerSearchBar,
  FreelancerFilters,
  FreelancerCardSkeleton,
  EmptyFreelancersState,
  ActiveFreelancerFilters,
} from "@/components/freelancers";

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
        const profileIds = data.map(p => p.id);
        const { data: reviewsData } = await supabase
          .from('freelancer_reviews')
          .select('freelancer_profile_id, rating')
          .in('freelancer_profile_id', profileIds);

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

    if (experienceFilter !== "all") {
      filtered = filtered.filter(profile => profile.experience === experienceFilter);
    }

    if (minRate) {
      filtered = filtered.filter(profile => profile.hourly_rate >= parseFloat(minRate));
    }
    if (maxRate) {
      filtered = filtered.filter(profile => profile.hourly_rate <= parseFloat(maxRate));
    }

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

  const activeFiltersCount = [
    experienceFilter !== "all",
    minRate !== "" || maxRate !== "",
    availabilityFilter !== "all",
  ].filter(Boolean).length;

  const hasFilters = 
    searchQuery !== "" ||
    experienceFilter !== "all" || 
    minRate !== "" || 
    maxRate !== "" || 
    availabilityFilter !== "all";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <FreelancersHero totalFreelancers={profiles.length} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Search and Filter Bar */}
        <FreelancerSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={() => setFiltersOpen(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Active Filters */}
        <ActiveFreelancerFilters
          experienceFilter={experienceFilter}
          minRate={minRate}
          maxRate={maxRate}
          availabilityFilter={availabilityFilter}
          onRemoveExperience={() => setExperienceFilter("all")}
          onRemoveRate={() => {
            setMinRate("");
            setMaxRate("");
          }}
          onRemoveAvailability={() => setAvailabilityFilter("all")}
          onClearAll={clearFilters}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredProfiles.length}</span>
            {" "}
            {filteredProfiles.length === 1 ? "freelancer" : "freelancers"} found
          </p>
        </div>

        {/* Freelancer Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <FreelancerCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <EmptyFreelancersState 
            hasFilters={hasFilters} 
            onClearFilters={clearFilters} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <FreelancerCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>

      {/* Filters Sheet */}
      <FreelancerFilters
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        experienceFilter={experienceFilter}
        onExperienceChange={setExperienceFilter}
        minRate={minRate}
        maxRate={maxRate}
        onMinRateChange={setMinRate}
        onMaxRateChange={setMaxRate}
        availabilityFilter={availabilityFilter}
        onAvailabilityChange={setAvailabilityFilter}
        onClearFilters={clearFilters}
      />
    </div>
  );
};

export default BrowseFreelancersPage;
