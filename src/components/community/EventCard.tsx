import React, { memo, useCallback } from "react";
import { Calendar, Users, Check, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { CommunityEvent } from "@/types/community";

interface EventCardProps {
  event: CommunityEvent;
  onJoinEvent: (eventId: string, isRegistered: boolean) => Promise<void>;
  onViewDetails?: (event: CommunityEvent) => void;
}

export const EventCard = memo(({ event, onJoinEvent, onViewDetails }: EventCardProps) => {
  const handleJoinClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onJoinEvent(event.id, event.is_registered || false);
  }, [event.id, event.is_registered, onJoinEvent]);

  const handleCardClick = useCallback(() => {
    onViewDetails?.(event);
  }, [event, onViewDetails]);

  return (
    <Card 
      className="hover:shadow-md transition-shadow overflow-hidden cursor-pointer" 
      onClick={handleCardClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 h-5 sm:h-auto">
                {event.event_type}
              </Badge>
              {event.is_online && (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 h-5 sm:h-auto">
                  Online
                </Badge>
              )}
              <Badge 
                variant={event.status === 'upcoming' ? 'default' : 'secondary'}
                className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 h-5 sm:h-auto"
              >
                {event.status}
              </Badge>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 leading-tight line-clamp-2">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                {event.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{event.event_time}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{event.attendees_count} attending</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant={event.is_registered ? "outline" : "default"}
            className="w-full sm:w-auto shrink-0 text-xs sm:text-sm h-8 sm:h-9"
            onClick={handleJoinClick}
            disabled={event.status !== 'upcoming'}
          >
            {event.is_registered ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Registered</span>
                <span className="sm:hidden">Joined</span>
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Join Event
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.attendees_count === nextProps.event.attendees_count &&
    prevProps.event.is_registered === nextProps.event.is_registered &&
    prevProps.event.status === nextProps.event.status
  );
});

EventCard.displayName = "EventCard";