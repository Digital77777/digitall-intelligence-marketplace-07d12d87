import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Users, Clock, MapPin, Search, 
  Globe, CalendarPlus, CalendarCheck, ChevronRight,
  LayoutGrid, CalendarDays, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, isBefore, isAfter, addMinutes, isPast } from "date-fns";
import { EventDetailModal } from "@/components/community/EventDetailModal";
import { EventCalendar } from "@/components/community/EventCalendar";
import { EventGridCard, getCategoryConfig, getInitials, formatEventDate } from "@/components/community/events";
import type { CommunityEvent } from "@/types/community";

// Category config for filter bar
const EVENT_CATEGORIES = [
  { id: 'all', label: 'All Events', icon: Calendar },
  { id: 'webinar', label: 'Webinars' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'meetup', label: 'Meetups' },
  { id: 'conference', label: 'Conferences' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'networking', label: 'Networking' },
  { id: 'qa', label: 'Q&A Sessions' },
  { id: 'demo', label: 'Demos' },
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
  const [activeTab, setActiveTab] = useState<"discover" | "my-events">("discover");
  const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const { useEvents, useMyRegisteredEvents, registerForEvent } = useCommunity();
  const { data: events = [], isLoading } = useEvents(searchQuery);
  const { data: myRegisteredEvents = [], isLoading: isLoadingMyEvents } = useMyRegisteredEvents();

  useEffect(() => {
    if (highlightedEventId && eventRefs.current[highlightedEventId]) {
      setTimeout(() => {
        eventRefs.current[highlightedEventId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlightedEventId, events]);

  const isEventLive = (eventDate: string, eventTime: string, durationMinutes: number) => {
    try {
      const eventDateTime = parseISO(`${eventDate}T${eventTime}`);
      const now = new Date();
      return isAfter(now, eventDateTime) && isBefore(now, addMinutes(eventDateTime, durationMinutes));
    } catch { return false; }
  };

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    events.forEach(event => {
      if (event.city) locations.add(event.city);
      if (event.country) locations.add(event.country);
    });
    return Array.from(locations).slice(0, 10);
  }, [events]);

  const { liveEvents, featuredEvents, upcomingEvents } = useMemo(() => {
    const live = events.filter(e => isEventLive(e.event_date, e.event_time, e.duration_minutes || 60));
    const notLive = events.filter(e => !isEventLive(e.event_date, e.event_time, e.duration_minutes || 60));
    return { liveEvents: live, featuredEvents: notLive.slice(0, 3), upcomingEvents: notLive };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return upcomingEvents.filter(event => {
      if (selectedCategory !== "all" && event.event_type !== selectedCategory) return false;
      if (locationFilter) {
        const s = locationFilter.toLowerCase();
        if (!event.city?.toLowerCase().includes(s) && !event.country?.toLowerCase().includes(s) && !event.location?.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [upcomingEvents, selectedCategory, locationFilter]);

  const handleJoinEvent = async (eventId: string, isLive: boolean) => {
    try {
      await registerForEvent.mutateAsync(eventId);
      toast({ title: isLive ? "Joining Live Event!" : "Registered Successfully!", description: isLive ? "You're now registered for this live event!" : "You've been registered. We'll send you a reminder." });
    } catch {
      toast({ title: "Registration Failed", description: "Unable to register. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/community")} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />Community
          </Button>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Discover Events</h1>
              <p className="text-muted-foreground text-lg max-w-xl">Join workshops, webinars, and meetups with AI professionals</p>
            </div>
            <div className="flex gap-3">
              {user && (
                <Button variant={activeTab === "my-events" ? "default" : "outline"} onClick={() => setActiveTab(activeTab === "my-events" ? "discover" : "my-events")} className="shadow-sm">
                  <CalendarCheck className="mr-2 h-5 w-5" />My Events
                  {myRegisteredEvents.length > 0 && <Badge variant="secondary" className="ml-2 bg-primary-foreground/20">{myRegisteredEvents.length}</Badge>}
                </Button>
              )}
              <Button onClick={() => navigate("/community/host-event")} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
                <CalendarPlus className="mr-2 h-5 w-5" />Host Event
              </Button>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11 bg-card border-border/50 rounded-xl" />
            </div>
            <div className="relative flex-1 max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="City or country..." value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="pl-10 h-11 bg-card border-border/50 rounded-xl" list="location-suggestions" />
              <datalist id="location-suggestions">{uniqueLocations.map(loc => <option key={loc} value={loc} />)}</datalist>
            </div>
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)} className="bg-card border border-border/50 rounded-xl p-1">
              <ToggleGroupItem value="list" aria-label="List view" className="rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-h-[40px] px-3 gap-1.5">
                <LayoutGrid className="h-4 w-4" /><span className="hidden md:inline text-xs">List</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="month" aria-label="Month view" className="rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-h-[40px] px-3 gap-1.5">
                <Calendar className="h-4 w-4" /><span className="hidden md:inline text-xs">Month</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="week" aria-label="Week view" className="rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-h-[40px] px-3 gap-1.5">
                <CalendarDays className="h-4 w-4" /><span className="hidden md:inline text-xs">Week</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card/80 to-transparent z-10 pointer-events-none" />
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 py-3 px-1">
                {EVENT_CATEGORIES.map((category) => {
                  const config = getCategoryConfig(category.id);
                  const Icon = config.icon;
                  const isActive = selectedCategory === category.id;
                  const count = category.id === 'all' ? events.length : events.filter(e => e.event_type === category.id).length;
                  return (
                    <button key={category.id} onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap min-h-[44px] touch-manipulation ${
                        isActive ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' : 'bg-muted/50 hover:bg-muted text-foreground hover:scale-[1.02]'
                      }`}>
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.label}</span>
                      <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                      {count > 0 && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background/80 text-muted-foreground'}`}>{count}</span>}
                    </button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card/80 to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* My Events Tab */}
      {activeTab === "my-events" && user && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">My Registered Events</h2>
            <p className="text-muted-foreground">Events you've signed up for</p>
          </div>
          {isLoadingMyEvents ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (<Card key={i} className="overflow-hidden"><Skeleton className="h-32 w-full" /><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>))}
            </div>
          ) : myRegisteredEvents.length === 0 ? (
            <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4"><CalendarCheck className="h-8 w-8 text-muted-foreground" /></div>
              <h3 className="font-semibold text-lg mb-1">No registered events yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">Browse upcoming events and register to see them here!</p>
              <Button onClick={() => setActiveTab("discover")}><Calendar className="mr-2 h-4 w-4" />Discover Events</Button>
            </CardContent></Card>
          ) : (
            <>
              {(() => {
                const upcoming = myRegisteredEvents.filter(e => !isPast(parseISO(e.event_date)));
                const past = myRegisteredEvents.filter(e => isPast(parseISO(e.event_date)));
                return (
                  <>
                    {upcoming.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-primary" />Upcoming ({upcoming.length})</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {upcoming.map(event => (
                            <EventGridCard key={event.id} event={event} currentUserId={user?.id} onSelect={setSelectedEvent} onJoin={(id) => handleJoinEvent(id, false)} onManage={() => navigate('/community/my-activity')} />
                          ))}
                        </div>
                      </div>
                    )}
                    {past.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground"><Clock className="h-5 w-5" />Past Events ({past.length})</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75">
                          {past.map(event => (
                            <EventGridCard key={event.id} event={event} currentUserId={user?.id} onSelect={setSelectedEvent} onJoin={(id) => handleJoinEvent(id, false)} onManage={() => navigate('/community/my-activity')} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === "discover" && (
        <div className="container mx-auto px-4 py-8">
          {(viewMode === "month" || viewMode === "week") && (
            <EventCalendar events={filteredEvents} viewMode={viewMode} onEventClick={setSelectedEvent} />
          )}

          {viewMode === "list" && (
            <>
              {/* Live Events */}
              {liveEvents.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                    <h2 className="text-xl font-semibold">Happening Now</h2>
                  </div>
                  <div className="grid gap-4">
                    {liveEvents.map(event => {
                      const config = getCategoryConfig(event.event_type);
                      const Icon = config.icon;
                      return (
                        <Card key={event.id} className="border-destructive/50 bg-gradient-to-r from-destructive/5 to-transparent cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedEvent(event)}>
                          <CardContent className="p-5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className={`h-16 w-16 rounded-xl ${config.color} flex items-center justify-center shrink-0`}><Icon className="h-8 w-8" /></div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="destructive" className="animate-pulse text-xs">● LIVE</Badge>
                                    <Badge variant="secondary" className="capitalize text-xs">{event.event_type}</Badge>
                                  </div>
                                  <h3 className="font-semibold text-lg">{event.title}</h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Users className="h-3.5 w-3.5" />{event.attendees_count} watching</p>
                                </div>
                              </div>
                              <Button onClick={(e) => { e.stopPropagation(); event.meeting_link ? window.open(event.meeting_link, '_blank') : handleJoinEvent(event.id, true); }} className="bg-destructive hover:bg-destructive/90 shrink-0">
                                Join Now<ChevronRight className="ml-1 h-4 w-4" />
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
                  <h2 className="text-xl font-semibold mb-4">Featured Events</h2>
                  <ScrollArea className="w-full whitespace-nowrap pb-4">
                    <div className="flex gap-4">
                      {featuredEvents.map(event => {
                        const config = getCategoryConfig(event.event_type);
                        const Icon = config.icon;
                        return (
                          <Card key={event.id} className="w-[320px] shrink-0 cursor-pointer hover:shadow-lg transition-all group overflow-hidden" onClick={() => setSelectedEvent(event)}>
                            <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 relative">
                              {event.cover_image ? <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" /> : (
                                <div className={`absolute inset-0 flex items-center justify-center ${config.color}`}><Icon className="h-12 w-12 opacity-50" /></div>
                              )}
                              <div className="absolute top-3 left-3"><Badge className="bg-background/90 text-foreground text-xs">{event.is_online ? <><Globe className="h-3 w-3 mr-1" />Online</> : <><MapPin className="h-3 w-3 mr-1" />{event.city || 'In-Person'}</>}</Badge></div>
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`h-6 w-6 rounded-md ${config.color} flex items-center justify-center`}><Icon className="h-3.5 w-3.5" /></div>
                                <span className="text-xs text-muted-foreground capitalize">{event.event_type}</span>
                              </div>
                              <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatEventDate(event.event_date)}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.event_time}</span>
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                  {event.is_personal_host === false && event.hosted_by ? (
                                    <><div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center"><Building2 className="h-3 w-3 text-primary" /></div><span className="text-xs text-muted-foreground truncate max-w-[100px] font-medium">{event.hosted_by}</span></>
                                  ) : (
                                    <><Avatar className="h-6 w-6"><AvatarImage src={event.profiles?.avatar_url} /><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(event.profiles?.full_name)}</AvatarFallback></Avatar><span className="text-xs text-muted-foreground truncate max-w-[100px]">{event.profiles?.full_name || 'Host'}</span></>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">{event.attendees_count} going</span>
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

              {/* All Events Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {searchQuery || selectedCategory !== 'all' || locationFilter ? `${filteredEvents.length} Events Found` : 'Upcoming Events'}
                  </h2>
                  {locationFilter && <Button variant="ghost" size="sm" onClick={() => setLocationFilter("")} className="text-muted-foreground">Clear location filter</Button>}
                </div>
                {isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1,2,3,4,5,6].map(i => (<Card key={i} className="overflow-hidden"><Skeleton className="h-32 w-full" /><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-3/4" /><div className="flex justify-between pt-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-16" /></div></CardContent></Card>))}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4"><Calendar className="h-8 w-8 text-muted-foreground" /></div>
                    <h3 className="font-semibold text-lg mb-1">No events found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mb-6">
                      {searchQuery || locationFilter ? "No events match your search." : selectedCategory !== 'all' ? `No ${selectedCategory} events scheduled.` : "There are no upcoming events."}
                    </p>
                    <Button onClick={() => navigate("/community/host-event")}><CalendarPlus className="mr-2 h-4 w-4" />Host an Event</Button>
                  </CardContent></Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map(event => (
                      <EventGridCard
                        key={event.id}
                        event={event}
                        highlightedEventId={highlightedEventId}
                        currentUserId={user?.id}
                        onSelect={setSelectedEvent}
                        onJoin={(id) => handleJoinEvent(id, false)}
                        onManage={() => navigate('/community/my-activity')}
                        cardRef={(el) => { eventRefs.current[event.id] = el; }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} onJoinEvent={async (id) => handleJoinEvent(id, false)} />
      )}
    </div>
  );
};

export default BrowseEventsPage;
