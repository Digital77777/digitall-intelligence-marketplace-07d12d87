import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Clock, MapPin, Filter, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, isToday, isBefore, isAfter, addMinutes } from "date-fns";
import { EventDetailModal } from "@/components/community/EventDetailModal";
import type { CommunityEvent } from "@/types/community";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BrowseEventsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightedEventId = searchParams.get("eventId") || searchParams.get("event");
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
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

  // Separate events into live and upcoming
  const { liveEvents, upcomingEvents } = useMemo(() => {
    const live = events.filter(event => 
      isEventLive(event.event_date, event.event_time, event.duration_minutes || 60)
    );
    const upcoming = events.filter(event => 
      !isEventLive(event.event_date, event.event_time, event.duration_minutes || 60)
    );
    return { liveEvents: live, upcomingEvents: upcoming };
  }, [events]);

  // Apply filters
  const filteredUpcomingEvents = useMemo(() => {
    return upcomingEvents.filter(event => {
      if (eventTypeFilter !== "all" && event.event_type !== eventTypeFilter) {
        return false;
      }
      return true;
    });
  }, [upcomingEvents, eventTypeFilter]);

  const filteredLiveEvents = useMemo(() => {
    return liveEvents.filter(event => {
      if (eventTypeFilter !== "all" && event.event_type !== eventTypeFilter) {
        return false;
      }
      return true;
    });
  }, [liveEvents, eventTypeFilter]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/community")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-ai bg-clip-text text-transparent">
            Browse Events
          </h1>
          <p className="text-muted-foreground text-lg">
            Join workshops, Q&A sessions, and live demos with AI experts
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button onClick={() => navigate("/community/host-event")} className="w-full sm:w-auto bg-gradient-ai text-white">
              <Calendar className="mr-2 h-4 w-4" />
              Host Event
            </Button>
          </div>

          {showFilters && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Type</label>
                    <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="meetup">Meetup</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary/10">
              <Calendar className="h-4 w-4 mr-1.5 shrink-0" />
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden text-xs">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-primary/10">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-1.5 shrink-0" />
              <span className="hidden sm:inline">Live Now</span>
              <span className="sm:hidden text-xs">Live</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading events...</div>
            ) : filteredUpcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming events found. {eventTypeFilter !== "all" && "Try adjusting your filters."}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredUpcomingEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    ref={(el) => eventRefs.current[event.id] = el}
                    className={`hover:shadow-lg transition-all cursor-pointer ${
                      highlightedEventId === event.id 
                        ? 'ring-2 ring-primary shadow-xl' 
                        : ''
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="capitalize">{event.event_type}</Badge>
                            <Badge variant="outline">{event.is_online ? "Virtual" : "In-Person"}</Badge>
                            {event.is_registered && (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                ✓ Registered
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
                          <p className="text-muted-foreground mb-4">{event.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{format(parseISO(event.event_date), "MMMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{event.event_time} ({event.duration_minutes || 60} min)</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees_count}/{event.max_attendees || "Unlimited"} attendees</span>
                            </div>
                            {!event.is_online && event.location && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {user?.id === event.user_id ? (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/community/my-activity');
                            }}
                            variant="outline"
                            className="md:self-start"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Manage Event
                          </Button>
                        ) : (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinEvent(event.id, false);
                            }}
                            className="bg-gradient-ai text-white md:self-start"
                            disabled={event.is_registered}
                          >
                            {event.is_registered ? "Already Registered" : "Register"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="live" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading live events...</div>
            ) : filteredLiveEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No live events at the moment. Check back later!
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredLiveEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    ref={(el) => eventRefs.current[event.id] = el}
                    className={`hover:shadow-lg transition-all border-primary cursor-pointer ${
                      highlightedEventId === event.id 
                        ? 'ring-2 ring-primary shadow-xl' 
                        : ''
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="destructive" className="animate-pulse">● LIVE</Badge>
                            <Badge variant="secondary" className="capitalize">{event.event_type}</Badge>
                            <Badge variant="outline">{event.is_online ? "Virtual" : "In-Person"}</Badge>
                            {event.is_registered && (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                ✓ Registered
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
                          <p className="text-muted-foreground mb-4">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees_count} watching now</span>
                            </div>
                            {event.meeting_link && (
                              <a 
                                href={event.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Join Meeting Link
                              </a>
                            )}
                          </div>
                        </div>
                        {user?.id === event.user_id ? (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/community/my-activity');
                            }}
                            variant="outline"
                            className="md:self-start"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Manage Event
                          </Button>
                        ) : (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinEvent(event.id, true);
                            }}
                            className="bg-gradient-ai text-white md:self-start"
                            disabled={event.is_registered}
                          >
                            {event.is_registered ? "Already Registered" : "Join Live"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
