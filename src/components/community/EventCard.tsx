import React, { memo, useCallback } from "react";
import { Calendar, Users, Check, Clock, MapPin, Globe, Building2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CommunityEvent } from "@/types/community";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";

interface EventCardProps {
  event: CommunityEvent;
  onJoinEvent: (eventId: string, isRegistered: boolean) => Promise<void>;
  onViewDetails?: (event: CommunityEvent) => void;
}

export const EventCard = memo(({ event, onJoinEvent, onViewDetails }: EventCardProps) => {
  const { isOfficial, badgeLabel } = useIsOfficialAccount(event.user_id);
  
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
      {/* Cover Image - Full display like Instagram */}
      {event.cover_image && (
        <div className="w-full bg-black">
          <img 
            src={event.cover_image} 
            alt={event.title}
            className="w-full max-h-[300px] object-contain"
          />
        </div>
      )}
      
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 h-5 sm:h-auto">
                {event.event_type}
              </Badge>
              {event.is_online ? (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 h-5 sm:h-auto">
                  <Globe className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 h-5 sm:h-auto">
                  <MapPin className="w-3 h-3 mr-1" />
                  In-Person
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
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {event.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
                {event.tags.length > 3 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    +{event.tags.length - 3}
                  </Badge>
                )}
              </div>
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
            
            {/* Location preview for in-person events */}
            {!event.is_online && event.venue_name && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{event.venue_name}</span>
              </div>
            )}
            
            {/* Host information */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
              {event.is_personal_host === false && event.hosted_by ? (
                <>
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span className="truncate font-medium">{event.hosted_by}</span>
                  {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
                </>
              ) : event.profiles?.full_name ? (
                <>
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Hosted by {event.profiles.full_name}</span>
                  {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
                </>
              ) : null}
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