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
  
  const isOwner = user?.id === event?.user_id;
  
  // Calculate capacity
  const capacityPercentage = event.max_attendees 
    ? Math.min((event.attendees_count / event.max_attendees) * 100, 100) 
    : null;
  const isNearCapacity = capacityPercentage !== null && capacityPercentage >= 80;
  const isFull = capacityPercentage !== null && capacityPercentage >= 100;

  // Fetch event attendees with their profiles
  const { data: attendees = [] } = useQuery({
    queryKey: ["event-attendees", event?.id],
    queryFn: async () => {
      if (!event?.id) return [];
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
    enabled: !!event?.id && isOpen,
  });

  if (!event) return null;

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
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden p-0 rounded-xl sm:rounded-2xl border-0 shadow-2xl">
        {/* Cover Image Header with Gradient Overlay */}
        <div className="relative w-full h-40 sm:h-56 md:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
          {event.cover_image ? (
            <>
              <img
                src={event.cover_image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-primary/30" />
            </div>
          )}
          
          {/* Floating Date Badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-background/95 backdrop-blur-md rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg border border-border/50">
            <p className="text-xs sm:text-sm font-bold text-primary">
              {format(new Date(event.event_date), "MMM d")}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {format(new Date(event.event_date), "EEE")}
            </p>
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <ScrollArea className="max-h-[calc(90vh-10rem)] sm:max-h-[calc(85vh-14rem)]">
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-6 sm:-mt-8 relative z-10">
            <DialogHeader className="mb-3 sm:mb-4 bg-background/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-sm border border-border/30">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold pr-8 leading-tight">
                {event.title}
              </DialogTitle>
              
              {/* Event Badges */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                <Badge variant="secondary" className="text-[10px] sm:text-xs backdrop-blur-sm">
                  {event.event_type}
                </Badge>
                {event.is_online ? (
                  <Badge variant="outline" className="text-[10px] sm:text-xs backdrop-blur-sm">
                    <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] sm:text-xs backdrop-blur-sm">
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    In-Person
                  </Badge>
                )}
                <Badge 
                  variant={event.status === 'upcoming' ? 'default' : 'secondary'} 
                  className="text-[10px] sm:text-xs backdrop-blur-sm"
                >
                  {event.status}
                </Badge>
                {event.language && event.language !== "English" && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs backdrop-blur-sm">
                    {event.language}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6">

              {/* Capacity Progress Bar */}
              {capacityPercentage !== null && (
                <div className="p-3 sm:p-4 rounded-xl bg-muted/50 space-y-2 border border-border/30">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className={`font-medium ${isNearCapacity ? 'text-warning' : isFull ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {isFull ? 'Event Full' : isNearCapacity ? 'Almost Full!' : 'Registration Open'}
                    </span>
                    <span className="font-medium">{event.attendees_count}/{event.max_attendees} spots</span>
                  </div>
                  <Progress 
                    value={capacityPercentage} 
                    className={`h-1.5 sm:h-2 ${isNearCapacity ? '[&>div]:bg-warning' : ''} ${isFull ? '[&>div]:bg-destructive' : ''}`}
                  />
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {event.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-[10px] sm:text-xs">
                      <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Event Details Grid */}
              <div className="grid gap-2 sm:gap-3 grid-cols-2">
                <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/20">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm">Date</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {format(new Date(event.event_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/20">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm">Time</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {event.event_time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/20">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm">Duration</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {event.duration_minutes || 60} min
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/20">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm">Attendees</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {event.attendees_count}{event.max_attendees && `/${event.max_attendees}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* In-person location details - Full width */}
              {!event.is_online && (event.venue_name || event.full_address) && (
                <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/20">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm">Location</p>
                    {event.venue_name && (
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{event.venue_name}</p>
                    )}
                    {event.full_address && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{event.full_address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Meeting Link */}
              {event.meeting_link && (
                <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm">Meeting Link</p>
                    <a
                      href={event.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] sm:text-xs text-primary hover:underline break-all line-clamp-1"
                    >
                      {event.meeting_link}
                    </a>
                  </div>
                </div>
              )}

              {/* Contact Email */}
              {event.contact_email && (
                <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border/20">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm">Contact</p>
                    <a
                      href={`mailto:${event.contact_email}`}
                      className="text-[10px] sm:text-xs text-primary hover:underline"
                    >
                      {event.contact_email}
                    </a>
                  </div>
                </div>
              )}

              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent my-2 sm:my-4" />

              {/* Event Description */}
              {event.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg">About This Event</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {event.requirements && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Requirements
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 sm:p-4 rounded-xl border border-border/50">
                    {event.requirements}
                  </p>
                </div>
              )}

              {/* Attendees List */}
              {attendees.length > 0 && (
                <>
                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent my-2 sm:my-4" />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg">
                      Attendees ({attendees.length})
                    </h3>
                    <div className="space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto pr-2">
                      {attendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          onClick={() => navigate(`/profile/${attendee.user_id}`)}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer min-h-[48px] sm:min-h-[56px] border border-transparent hover:border-border/30"
                        >
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-background shrink-0">
                            <AvatarImage
                              src={attendee.profiles?.avatar_url || undefined}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                              {getInitials(attendee.profiles?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">
                              {attendee.profiles?.full_name || "Anonymous User"}
                            </p>
                            {attendee.profiles?.headline && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                {attendee.profiles.headline}
                              </p>
                            )}
                          </div>
                          {attendee.joined_at && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground shrink-0 hidden sm:block">
                              {format(new Date(attendee.joined_at), "MMM d")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Host Information */}
              <>
                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent my-2 sm:my-4" />
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg">Hosted By</h3>
                  {event.is_personal_host === false && event.hosted_by ? (
                    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border/20">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{event.hosted_by}</p>
                        {event.profiles?.full_name && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            Organized by {event.profiles.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : event.profiles ? (
                    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border/20">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-background shrink-0">
                        <AvatarImage src={event.profiles.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(event.profiles.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {event.profiles.full_name || "Community Member"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          Personal host
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Action Buttons Footer */}
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            {isOwner ? (
              <>
                <Button
                  onClick={() => {
                    onClose();
                    navigate(`/community/edit-event/${event.id}`);
                  }}
                  className="flex-1 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm"
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Edit Event
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]"
                  onClick={handleShare}
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]">
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[90vw] max-w-md rounded-xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base sm:text-lg">Delete Event?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs sm:text-sm">
                        This action cannot be undone. All registrations will be cancelled.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                      <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await deleteEvent.mutateAsync(event.id);
                          onClose();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs sm:text-sm"
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
                  className="flex-1 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm"
                  variant={event.is_registered ? "outline" : "default"}
                >
                  {event.is_registered ? (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Registered
                    </>
                  ) : isFull ? (
                    <>
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Event Full
                    </>
                  ) : (
                    <>
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Register
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]"
                  onClick={handleShare}
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
