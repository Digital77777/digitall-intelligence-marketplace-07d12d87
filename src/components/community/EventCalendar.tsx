import React, { useMemo, useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Video, Users, Building2, MapPin, Globe, Clock, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { CommunityEvent } from "@/types/community";

interface EventCalendarProps {
  events: CommunityEvent[];
  viewMode: "month" | "week";
  onEventClick: (event: CommunityEvent) => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  webinar: "bg-blue-500",
  workshop: "bg-purple-500",
  meetup: "bg-green-500",
  conference: "bg-orange-500",
  hackathon: "bg-red-500",
  networking: "bg-cyan-500",
  qa: "bg-pink-500",
  demo: "bg-amber-500",
};

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  viewMode,
  onEventClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      try {
        const eventDate = parseISO(event.event_date);
        return isSameDay(eventDate, date);
      } catch {
        return false;
      }
    });
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [currentDate, viewMode]);

  // Navigation
  const goToPrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
    setSelectedDate(null);
  };

  const goToNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevious} className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext} className="h-9 w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg sm:text-xl font-semibold ml-2">
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy")
              : `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d, yyyy")}`}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday} className="h-9">
          Today
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-2 sm:p-4">
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 1)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar days grid */}
              <div
                className={cn(
                  "grid grid-cols-7 gap-1",
                  viewMode === "week" ? "min-h-[200px]" : ""
                )}
              >
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isDayToday = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "relative p-1.5 sm:p-2 rounded-xl transition-all duration-200 text-left touch-manipulation active:scale-95",
                        "min-h-[60px] sm:min-h-[80px] md:min-h-[100px]",
                        viewMode === "week" && "min-h-[120px] sm:min-h-[150px]",
                        isCurrentMonth
                          ? "bg-card hover:bg-accent/50"
                          : "bg-muted/30 text-muted-foreground",
                        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-accent/50",
                        isDayToday && !isSelected && "bg-primary/5 border-2 border-primary"
                      )}
                    >
                      {/* Today indicator with pulse */}
                      {isDayToday && (
                        <div className="absolute inset-0 rounded-xl ring-2 ring-primary/50 animate-pulse pointer-events-none" />
                      )}
                      
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium relative z-10",
                          isDayToday && "text-primary font-bold"
                        )}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Event indicators */}
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, viewMode === "week" ? 5 : 2).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                            className={cn(
                              "text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 transition-opacity",
                              EVENT_TYPE_COLORS[event.event_type] || "bg-primary"
                            )}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > (viewMode === "week" ? 5 : 2) && (
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground pl-1">
                            +{dayEvents.length - (viewMode === "week" ? 5 : 2)} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Events Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">
                  {selectedDate
                    ? format(selectedDate, "EEEE, MMMM d")
                    : "Select a date"}
                </h3>
              </div>

              {!selectedDate ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Click on a date to see events
                </p>
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    No events on this date
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    Host Event
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-3">
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <Card
                        key={event.id}
                        className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
                        onClick={() => onEventClick(event)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2 mb-2">
                            <div
                              className={cn(
                                "w-1 h-full min-h-[40px] rounded-full shrink-0",
                                EVENT_TYPE_COLORS[event.event_type] || "bg-primary"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge
                                  variant="secondary"
                                  className="text-xs capitalize"
                                >
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
                              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {event.event_time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {event.attendees_count}
                                </span>
                              </div>
                              {event.is_personal_host === false && event.hosted_by ? (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                  <Building2 className="h-3 w-3" />
                                  <span className="truncate">{event.hosted_by}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legend - Collapsible on mobile */}
      <Collapsible open={isLegendOpen} onOpenChange={setIsLegendOpen}>
        <Card>
          <CardContent className="p-3">
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full text-left sm:cursor-default">
                <span className="text-sm font-medium text-muted-foreground">Event Types</span>
                <ChevronRight className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform sm:hidden",
                  isLegendOpen && "rotate-90"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="sm:block">
              <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
                {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className={cn("w-3 h-3 rounded", color)} />
                    <span className="text-xs capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    </div>
  );
};
