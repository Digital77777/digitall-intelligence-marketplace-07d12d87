import React from 'react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { Calendar, Clock, Users, MapPin, Globe, Building2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CommunityEvent } from '@/types/community';

const EVENT_CATEGORIES = [
  { id: 'all', label: 'All Events', color: 'bg-primary/10 text-primary' },
  { id: 'webinar', label: 'Webinars', color: 'bg-blue-500/10 text-blue-600' },
  { id: 'workshop', label: 'Workshops', color: 'bg-purple-500/10 text-purple-600' },
  { id: 'meetup', label: 'Meetups', color: 'bg-green-500/10 text-green-600' },
  { id: 'conference', label: 'Conferences', color: 'bg-orange-500/10 text-orange-600' },
  { id: 'hackathon', label: 'Hackathons', color: 'bg-red-500/10 text-red-600' },
  { id: 'networking', label: 'Networking', color: 'bg-cyan-500/10 text-cyan-600' },
  { id: 'qa', label: 'Q&A Sessions', color: 'bg-pink-500/10 text-pink-600' },
  { id: 'demo', label: 'Demos', color: 'bg-amber-500/10 text-amber-600' },
];

// Dynamic icon imports are complex, so we use a simple map approach
import { Video, Sparkles, Code, Network, MessageCircle, Presentation, Mic } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  all: Calendar,
  webinar: Video,
  workshop: Sparkles,
  meetup: Users,
  conference: Building2,
  hackathon: Code,
  networking: Network,
  qa: MessageCircle,
  demo: Presentation,
};

export const getCategoryConfig = (eventType: string) => {
  const cat = EVENT_CATEGORIES.find(c => c.id === eventType) || EVENT_CATEGORIES[0];
  const icon = CATEGORY_ICONS[eventType] || Calendar;
  return { ...cat, icon };
};

export const getInitials = (name?: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const formatEventDate = (date: string) => {
  const parsed = parseISO(date);
  if (isToday(parsed)) return 'Today';
  if (isTomorrow(parsed)) return 'Tomorrow';
  return format(parsed, 'EEE, MMM d');
};

interface EventGridCardProps {
  event: CommunityEvent;
  highlightedEventId?: string | null;
  currentUserId?: string;
  onSelect: (event: CommunityEvent) => void;
  onJoin: (eventId: string) => void;
  onManage: () => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

export const EventGridCard: React.FC<EventGridCardProps> = ({
  event, highlightedEventId, currentUserId, onSelect, onJoin, onManage, cardRef,
}) => {
  const categoryConfig = getCategoryConfig(event.event_type);
  const CategoryIcon = categoryConfig.icon;

  return (
    <Card
      ref={cardRef}
      className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all group ${
        highlightedEventId === event.id ? 'ring-2 ring-primary shadow-xl' : ''
      }`}
      onClick={() => onSelect(event)}
    >
      <div className="h-28 relative">
        {event.cover_image ? (
          <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`absolute inset-0 ${categoryConfig.color} flex items-center justify-center`}>
            <CategoryIcon className="h-10 w-10 opacity-30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center shadow-sm">
            <div className="text-xs font-bold text-primary uppercase">{format(parseISO(event.event_date), 'MMM')}</div>
            <div className="text-lg font-bold leading-none">{format(parseISO(event.event_date), 'd')}</div>
          </div>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {event.is_registered && (
            <Badge className="bg-green-600/90 text-white text-xs">✓ Going</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="secondary" className={`text-xs capitalize flex items-center gap-1 ${categoryConfig.color}`}>
            <CategoryIcon className="h-3 w-3" />
            {event.event_type}
          </Badge>
          {event.is_online ? (
            <Badge variant="outline" className="text-xs"><Globe className="h-3 w-3 mr-1" />Online</Badge>
          ) : event.city && (
            <Badge variant="outline" className="text-xs"><MapPin className="h-3 w-3 mr-1" />{event.city}</Badge>
          )}
        </div>
        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.event_time}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.attendees_count} going</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            {event.is_personal_host === false && event.hosted_by ? (
              <>
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[80px] font-medium">{event.hosted_by}</span>
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
          {currentUserId === event.user_id ? (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); onManage(); }}>
              <Edit2 className="h-3 w-3 mr-1" />Manage
            </Button>
          ) : (
            <Button size="sm" className="h-8 text-xs" disabled={event.is_registered} onClick={(e) => { e.stopPropagation(); onJoin(event.id); }}>
              {event.is_registered ? 'Registered' : 'Register'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
