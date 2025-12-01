import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Users, MapPin, ExternalLink, Check } from "lucide-react";
import type { CommunityEvent } from "@/types/community";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface EventDetailModalProps {
  event: CommunityEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinEvent: (eventId: string, isRegistered: boolean) => Promise<void>;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onJoinEvent,
}) => {
  const navigate = useNavigate();
  
  if (!event) return null;

  // Fetch event attendees with their profiles
  const { data: attendees = [] } = useQuery({
    queryKey: ["event-attendees", event.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_attendees")
        .select(`
          id,
          user_id,
          joined_at,
          profiles:user_id (
            user_id,
            full_name,
            avatar_url,
            headline
          )
        `)
        .eq("event_id", event.id)
        .order("joined_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleJoinClick = async () => {
    await onJoinEvent(event.id, event.is_registered || false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Cover Image */}
          {event.cover_image && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <img
                src={event.cover_image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{event.event_type}</Badge>
            {event.is_online && (
              <Badge variant="outline">Online</Badge>
            )}
            <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.event_date), "EEEE, MMMM d, yyyy")} at {event.event_time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {event.duration_minutes || 60} minutes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Attendees</p>
                <p className="text-sm text-muted-foreground">
                  {event.attendees_count} registered
                  {event.max_attendees && ` • ${event.max_attendees} max`}
                </p>
              </div>
            </div>

            {!event.is_online && event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}

            {event.meeting_link && (
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Meeting Link</p>
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {event.meeting_link}
                  </a>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Event Description */}
          {event.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">About This Event</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Attendees List */}
          {attendees.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Attendees ({attendees.length})
                </h3>
                <ScrollArea className="h-64 pr-4">
                  <div className="space-y-3">
                    {attendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        onClick={() => navigate(`/profile/${attendee.user_id}`)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={attendee.profiles?.avatar_url || undefined}
                          />
                          <AvatarFallback>
                            {getInitials(attendee.profiles?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {attendee.profiles?.full_name || "Anonymous User"}
                          </p>
                          {attendee.profiles?.headline && (
                            <p className="text-sm text-muted-foreground truncate">
                              {attendee.profiles.headline}
                            </p>
                          )}
                        </div>
                        {attendee.joined_at && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(attendee.joined_at), "MMM d")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {/* Host Information */}
          {event.profiles && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-3">Hosted By</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={event.profiles.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(event.profiles.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {event.profiles.full_name || "Unknown User"}
                    </p>
                    {event.profiles.email && (
                      <p className="text-sm text-muted-foreground">
                        {event.profiles.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleJoinClick}
              disabled={event.status !== 'upcoming'}
              className="flex-1"
              variant={event.is_registered ? "outline" : "default"}
            >
              {event.is_registered ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Registered
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Register for Event
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
