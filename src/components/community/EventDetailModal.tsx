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
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, Clock, Users, MapPin, ExternalLink, Check, 
  Globe, Tag, FileText, Mail, Pencil, Trash2, Building2, User, Share2
} from "lucide-react";
import type { CommunityEvent } from "@/types/community";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCommunity } from "@/hooks/useCommunity";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const { user } = useAuth();
  const { deleteEvent } = useCommunity();
  const { toast } = useToast();
  
  if (!event) return null;

  const isOwner = user?.id === event.user_id;
  
  // Calculate capacity
  const capacityPercentage = event.max_attendees 
    ? Math.min((event.attendees_count / event.max_attendees) * 100, 100) 
    : null;
  const isNearCapacity = capacityPercentage !== null && capacityPercentage >= 80;
  const isFull = capacityPercentage !== null && capacityPercentage >= 100;

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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community/browse-events?eventId=${event.id}`;
    const shareText = `Join me at "${event.title}" - ${format(new Date(event.event_date), "MMMM d, yyyy")}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, copy to clipboard instead
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied!", description: "Event link copied to clipboard" });
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Event link copied to clipboard" });
    }
  };

  const formatTimezone = (tz?: string | null) => {
    if (!tz) return "";
    const parts = tz.split("/");
    return parts[parts.length - 1].replace(/_/g, " ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Cover Image Header with Gradient Overlay */}
        {event.cover_image && (
          <div className="relative w-full h-64 bg-gradient-to-b from-primary/10 to-background">
            <img
              src={event.cover_image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        )}
        
        <div className={`${event.cover_image ? 'px-6 pb-6 -mt-8 relative z-10' : 'p-6'}`}>
          <DialogHeader className={event.cover_image ? 'mb-4' : ''}>
            <DialogTitle className="text-2xl font-bold pr-8">
              {event.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Event Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="backdrop-blur-sm">{event.event_type}</Badge>
              {event.is_online ? (
                <Badge variant="outline" className="backdrop-blur-sm">
                  <Globe className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="backdrop-blur-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  In-Person
                </Badge>
              )}
              <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'} className="backdrop-blur-sm">
                {event.status}
              </Badge>
              {event.language && event.language !== "English" && (
                <Badge variant="outline" className="backdrop-blur-sm">{event.language}</Badge>
              )}
            </div>

            {/* Capacity Progress Bar */}
            {capacityPercentage !== null && (
              <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={`font-medium ${isNearCapacity ? 'text-warning' : isFull ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {isFull ? 'Event Full' : isNearCapacity ? 'Almost Full!' : 'Registration Open'}
                  </span>
                  <span className="font-medium">{event.attendees_count}/{event.max_attendees} spots</span>
                </div>
                <Progress 
                  value={capacityPercentage} 
                  className={`h-2 ${isNearCapacity ? '[&>div]:bg-warning' : ''} ${isFull ? '[&>div]:bg-destructive' : ''}`}
                />
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Event Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event_date), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.event_time}
                    {event.timezone && (
                      <span className="ml-1">({formatTimezone(event.timezone)})</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {event.duration_minutes || 60} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Attendees</p>
                  <p className="text-sm text-muted-foreground">
                    {event.attendees_count} registered
                    {event.max_attendees && ` • ${event.max_attendees} max`}
                  </p>
                </div>
              </div>

              {/* In-person location details */}
              {!event.is_online && (event.venue_name || event.full_address) && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Location</p>
                    {event.venue_name && (
                      <p className="text-sm font-medium text-foreground">{event.venue_name}</p>
                    )}
                    {event.full_address && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.full_address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {event.meeting_link && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <ExternalLink className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Meeting Link</p>
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

            {event.contact_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Contact</p>
                  <a
                    href={`mailto:${event.contact_email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {event.contact_email}
                  </a>
                </div>
              </div>
            )}

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Event Description */}
            {event.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">About This Event</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* Requirements */}
            {event.requirements && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Prerequisites / Requirements
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-xl border border-border/50">
                  {event.requirements}
                </p>
              </div>
            )}

            {/* Attendees List */}
            {attendees.length > 0 && (
              <>
                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    Attendees ({attendees.length})
                  </h3>
                  <ScrollArea className="h-64 pr-4">
                    <div className="space-y-2">
                      {attendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          onClick={() => navigate(`/profile/${attendee.user_id}`)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer min-h-[56px]"
                        >
                          <Avatar className="h-11 w-11 ring-2 ring-background">
                            <AvatarImage
                              src={attendee.profiles?.avatar_url || undefined}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
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
                            <p className="text-xs text-muted-foreground shrink-0">
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
            <>
              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
              <div>
                <h3 className="font-semibold text-lg mb-3">Hosted By</h3>
                {event.is_personal_host === false && event.hosted_by ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{event.hosted_by}</p>
                      {event.profiles?.full_name && (
                        <p className="text-sm text-muted-foreground">
                          Organized by {event.profiles.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                ) : event.profiles ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <Avatar className="h-12 w-12 ring-2 ring-background">
                      <AvatarImage src={event.profiles.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(event.profiles.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {event.profiles.full_name || "Community Member"}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Personal host
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 sticky bottom-0 bg-background pb-2">
              {isOwner ? (
                <>
                  <Button
                    onClick={() => {
                      onClose();
                      navigate(`/community/edit-event/${event.id}`);
                    }}
                    className="flex-1 min-h-[44px]"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="min-h-[44px] min-w-[44px]"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="min-h-[44px] min-w-[44px]">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All registrations will be cancelled.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await deleteEvent.mutateAsync(event.id);
                            onClose();
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleJoinClick}
                    disabled={event.status !== 'upcoming' || isFull}
                    className="flex-1 min-h-[44px]"
                    variant={event.is_registered ? "outline" : "default"}
                  >
                    {event.is_registered ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Registered
                      </>
                    ) : isFull ? (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Event Full
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Register for Event
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="min-h-[44px] min-w-[44px]"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
