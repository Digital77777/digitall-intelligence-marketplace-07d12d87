import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Users, Clock, MapPin, Edit2, Search, 
  Video, Building2, Sparkles, ChevronRight, Globe, Zap, CalendarPlus,
  Mic, Network, Code, Presentation, MessageCircle, GraduationCap, User,
  LayoutGrid, CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, isBefore, isAfter, addMinutes, isToday, isTomorrow } from "date-fns";
import { EventDetailModal } from "@/components/community/EventDetailModal";
import { EventCalendar } from "@/components/community/EventCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CommunityEvent } from "@/types/community";

// Event category configuration with icons and colors
const EVENT_CATEGORIES = [
  { id: 'all', label: 'All Events', icon: Calendar, color: 'bg-primary/10 text-primary' },
  { id: 'webinar', label: 'Webinars', icon: Video, color: 'bg-blue-500/10 text-blue-600' },
  { id: 'workshop', label: 'Workshops', icon: Sparkles, color: 'bg-purple-500/10 text-purple-600' },
  { id: 'meetup', label: 'Meetups', icon: Users, color: 'bg-green-500/10 text-green-600' },
  { id: 'conference', label: 'Conferences', icon: Building2, color: 'bg-orange-500/10 text-orange-600' },
  { id: 'hackathon', label: 'Hackathons', icon: Code, color: 'bg-red-500/10 text-red-600' },
  { id: 'networking', label: 'Networking', icon: Network, color: 'bg-cyan-500/10 text-cyan-600' },
  { id: 'qa', label: 'Q&A Sessions', icon: MessageCircle, color: 'bg-pink-500/10 text-pink-600' },
  { id: 'demo', label: 'Demos', icon: Presentation, color: 'bg-amber-500/10 text-amber-600' },
];

const BrowseEventsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightedEventId = searchParams.get("eventId") || searchParams.get("event");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "month" | "week">("list");
  const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const { useEvents, registerForEvent } = useCommunity();
  const { data: events = [], isLoading } = useEvents(searchQuery);

  // Scroll to highlighted event
  useEffect(() => {
    if (highlightedEventId && eventRefs.current[highlightedEventId]) {
      setTimeout(() => {
        eventRefs.current[highlightedEventId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [highlightedEventId, events]);

  // Check if an event is live right now
  const isEventLive = (eventDate: string, eventTime: string, durationMinutes: number) => {
    try {
      const eventDateTime = parseISO(`${eventDate}T${eventTime}`);
      const now = new Date();
      const eventEndTime = addMinutes(eventDateTime, durationMinutes);
      return isAfter(now, eventDateTime) && isBefore(now, eventEndTime);
    } catch (error) {
      return false;
    }
  };

  // Get unique locations for filter suggestions
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    events.forEach(event => {
      if (event.city) locations.add(event.city);
      if (event.country) locations.add(event.country);
    });
    return Array.from(locations).slice(0, 10);
  }, [events]);

  // Separate events
  const { liveEvents, featuredEvents, upcomingEvents } = useMemo(() => {
    const live = events.filter(event => 
      isEventLive(event.event_date, event.event_time, event.duration_minutes || 60)
    );
    const notLive = events.filter(event => 
      !isEventLive(event.event_date, event.event_time, event.duration_minutes || 60)
    );
    const featured = notLive.slice(0, 3);
    return { liveEvents: live, featuredEvents: featured, upcomingEvents: notLive };
  }, [events]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    return upcomingEvents.filter(event => {
      // Category filter
      if (selectedCategory !== "all" && event.event_type !== selectedCategory) {
        return false;
      }
      // Location filter
      if (locationFilter) {
        const searchLower = locationFilter.toLowerCase();
        const matchesCity = event.city?.toLowerCase().includes(searchLower);
        const matchesCountry = event.country?.toLowerCase().includes(searchLower);
        const matchesLocation = event.location?.toLowerCase().includes(searchLower);
        if (!matchesCity && !matchesCountry && !matchesLocation) {
          return false;
        }
      }
      return true;
    });
  }, [upcomingEvents, selectedCategory, locationFilter]);

  const handleJoinEvent = async (eventId: string, isLive: boolean) => {
    try {
      await registerForEvent.mutateAsync(eventId);
      toast({
        title: isLive ? "Joining Live Event!" : "Registered Successfully!",
        description: isLive 
          ? "You're now registered for this live event!"
          : "You've been registered. We'll send you a reminder before the event starts.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Unable to register for this event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatEventDate = (date: string) => {
    const parsed = parseISO(date);
    if (isToday(parsed)) return 'Today';
    if (isTomorrow(parsed)) return 'Tomorrow';
    return format(parsed, 'EEE, MMM d');
  };

  const getCategoryConfig = (eventType: string) => {
    return EVENT_CATEGORIES.find(c => c.id === eventType) || EVENT_CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/community")}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Community
          </Button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Discover Events
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                Join workshops, webinars, and meetups with AI professionals and enthusiasts
              </p>
            </div>
            <Button 
              onClick={() => navigate("/community/host-event")} 
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              <CalendarPlus className="mr-2 h-5 w-5" />
              Host Event
            </Button>
          </div>

          {/* Search & Location Filter */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-card border-border/50 rounded-xl"
              />
            </div>
            <div className="relative flex-1 max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City or country..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 h-11 bg-card border-border/50 rounded-xl"
                list="location-suggestions"
              />
              <datalist id="location-suggestions">
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
            {/* View Mode Toggle - Icon only on mobile, with labels on desktop */}
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => value && setViewMode(value as "list" | "month" | "week")}
              className="bg-card border border-border/50 rounded-xl p-1"
            >
              <ToggleGroupItem 
                value="list" 
                aria-label="List view" 
                className="rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-h-[40px] px-3 gap-1.5"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden md:inline text-xs">List</span>
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="month" 
                aria-label="Month view" 
                className="rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-h-[40px] px-3 gap-1.5"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Month</span>
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="week" 
                aria-label="Week view" 
                className="rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-h-[40px] px-3 gap-1.5"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Week</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* Category Filter Bar with scroll indicators */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* Left fade indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card/80 to-transparent z-10 pointer-events-none" />
            
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 py-3 px-1">
                {EVENT_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.id;
                  // Count events for this category
                  const categoryCount = category.id === 'all' 
                    ? events.length 
                    : events.filter(e => e.event_type === category.id).length;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap min-h-[44px] touch-manipulation ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' 
                          : 'bg-muted/50 hover:bg-muted text-foreground hover:scale-[1.02]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.label}</span>
                      <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                      {categoryCount > 0 && (
                        <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-primary-foreground/20 text-primary-foreground' 
                            : 'bg-background/80 text-muted-foreground'
                        }`}>
                          {categoryCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
            {/* Right fade indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card/80 to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Calendar View */}
        {(viewMode === "month" || viewMode === "week") && (
          <EventCalendar
            events={filteredEvents}
            viewMode={viewMode}
            onEventClick={setSelectedEvent}
          />
        )}

        {/* List View */}
        {viewMode === "list" && (
          <>
            {/* Live Events Banner */}
            {liveEvents.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
              <h2 className="text-xl font-semibold">Happening Now</h2>
            </div>
            <div className="grid gap-4">
              {liveEvents.map((event) => {
                const categoryConfig = getCategoryConfig(event.event_type);
                return (
                  <Card 
                    key={event.id}
                    className="border-destructive/50 bg-gradient-to-r from-destructive/5 to-transparent cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`h-16 w-16 rounded-xl ${categoryConfig.color} flex items-center justify-center shrink-0`}>
                            <categoryConfig.icon className="h-8 w-8" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="destructive" className="animate-pulse text-xs">
                                ● LIVE
                              </Badge>
                              <Badge variant="secondary" className="capitalize text-xs">
                                {event.event_type}
                              </Badge>
                              {event.city && (
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {event.city}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Users className="h-3.5 w-3.5" />
                              {event.attendees_count} watching
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.meeting_link) {
                              window.open(event.meeting_link, '_blank');
                            } else {
                              handleJoinEvent(event.id, true);
                            }
                          }}
                          className="bg-destructive hover:bg-destructive/90 shrink-0"
                        >
                          Join Now
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Featured Events */}
        {featuredEvents.length > 0 && !searchQuery && selectedCategory === 'all' && !locationFilter && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Featured Events</h2>
            </div>
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex gap-4">
                {featuredEvents.map((event) => {
                  const categoryConfig = getCategoryConfig(event.event_type);
                  return (
                    <Card 
                      key={event.id}
                      className="w-[320px] shrink-0 cursor-pointer hover:shadow-lg transition-all group overflow-hidden"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {/* Event Cover */}
                      <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 relative">
                        {event.cover_image ? (
                          <img 
                            src={event.cover_image} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`absolute inset-0 flex items-center justify-center ${categoryConfig.color}`}>
                            <categoryConfig.icon className="h-12 w-12 opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-background/90 text-foreground text-xs">
                            {event.is_online ? (
                              <><Globe className="h-3 w-3 mr-1" />Online</>
                            ) : (
                              <><MapPin className="h-3 w-3 mr-1" />{event.city || 'In-Person'}</>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-6 w-6 rounded-md ${categoryConfig.color} flex items-center justify-center`}>
                            <categoryConfig.icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{event.event_type}</span>
                        </div>
                        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatEventDate(event.event_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {event.event_time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            {event.is_personal_host === false && event.hosted_by ? (
                              <>
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Building2 className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-xs text-muted-foreground truncate max-w-[100px] font-medium">
                                  {event.hosted_by}
                                </span>
                              </>
                            ) : (
                              <>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={event.profiles?.avatar_url} />
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {getInitials(event.profiles?.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                  {event.profiles?.full_name || 'Host'}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {event.attendees_count} going
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* All Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {searchQuery || selectedCategory !== 'all' || locationFilter 
                ? `${filteredEvents.length} Events Found` 
                : 'Upcoming Events'}
            </h2>
            {locationFilter && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocationFilter("")}
                className="text-muted-foreground"
              >
                Clear location filter
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">No events found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  {searchQuery || locationFilter
                    ? `No events match your search. Try different keywords or location.`
                    : selectedCategory !== 'all'
                    ? `No ${selectedCategory} events scheduled. Check back later!`
                    : "There are no upcoming events. Be the first to host one!"}
                </p>
                <Button onClick={() => navigate("/community/host-event")}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Host an Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const categoryConfig = getCategoryConfig(event.event_type);
                return (
                  <Card 
                    key={event.id}
                    ref={(el) => eventRefs.current[event.id] = el}
                    className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all group ${
                      highlightedEventId === event.id ? 'ring-2 ring-primary shadow-xl' : ''
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Event Cover */}
                    <div className="h-28 relative">
                      {event.cover_image ? (
                        <img 
                          src={event.cover_image} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`absolute inset-0 ${categoryConfig.color} flex items-center justify-center`}>
                          <categoryConfig.icon className="h-10 w-10 opacity-30" />
                        </div>
                      )}
                      
                      {/* Date Badge */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-background/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center shadow-sm">
                          <div className="text-xs font-bold text-primary uppercase">
                            {format(parseISO(event.event_date), 'MMM')}
                          </div>
                          <div className="text-lg font-bold leading-none">
                            {format(parseISO(event.event_date), 'd')}
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1">
                        {event.is_registered && (
                          <Badge className="bg-green-600/90 text-white text-xs">
                            ✓ Going
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary" className={`text-xs capitalize flex items-center gap-1 ${categoryConfig.color}`}>
                          <categoryConfig.icon className="h-3 w-3" />
                          {event.event_type}
                        </Badge>
                        {event.is_online ? (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Online
                          </Badge>
                        ) : event.city && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.city}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {event.event_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event.attendees_count} going
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          {event.is_personal_host === false && event.hosted_by ? (
                            <>
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-xs text-muted-foreground truncate max-w-[80px] font-medium">
                                {event.hosted_by}
                              </span>
                            </>
                          ) : (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={event.profiles?.avatar_url} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {getInitials(event.profiles?.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                {event.profiles?.full_name || 'Host'}
                              </span>
                            </>
                          )}
                        </div>
                        {user?.id === event.user_id ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/community/my-activity');
                            }}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            className="h-8 text-xs"
                            disabled={event.is_registered}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinEvent(event.id, false);
                            }}
                          >
                            {event.is_registered ? 'Registered' : 'Register'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onJoinEvent={async (eventId) => {
            await handleJoinEvent(eventId, false);
          }}
        />
      )}
    </div>
  );
};

export default BrowseEventsPage;
