import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Search, Bell, MessageSquare, Heart, Users, Calendar, ShoppingBag, Award, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow, isToday, isYesterday, subDays, isAfter } from 'date-fns';

interface NotificationData {
  id: number;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata: Record<string, any> | null;
}

interface EnrichedNotification extends NotificationData {
  actorProfile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const typeIconMap: Record<string, { icon: typeof Heart; color: string }> = {
  insight_like: { icon: Heart, color: 'text-red-500' },
  insight_comment: { icon: MessageSquare, color: 'text-blue-500' },
  topic_reply: { icon: MessageSquare, color: 'text-green-500' },
  topic_mention: { icon: Users, color: 'text-purple-500' },
  new_message: { icon: MessageSquare, color: 'text-primary' },
  message: { icon: MessageSquare, color: 'text-primary' },
  event_registration: { icon: Calendar, color: 'text-orange-500' },
  event_update: { icon: Calendar, color: 'text-orange-500' },
  listing_comment: { icon: ShoppingBag, color: 'text-emerald-500' },
  listing_purchase: { icon: ShoppingBag, color: 'text-emerald-500' },
  follow: { icon: Users, color: 'text-blue-500' },
  achievement: { icon: Award, color: 'text-yellow-500' },
};

const getNavigationPath = (notification: NotificationData): string | null => {
  const { type, metadata } = notification;
  switch (type) {
    case 'insight_like':
    case 'insight_comment':
      if (metadata?.insight_id) return `/community?insight=${metadata.insight_id}`;
      break;
    case 'topic_reply':
    case 'topic_mention':
      if (metadata?.topic_id) return `/community/topic/${metadata.topic_id}`;
      break;
    case 'new_message':
    case 'message':
      if (metadata?.sender_id) return `/community/inbox?user=${metadata.sender_id}`;
      return '/community/inbox';
    case 'event_registration':
    case 'event_update':
      if (metadata?.event_id) return `/community/browse-events?event=${metadata.event_id}`;
      break;
    case 'listing_comment':
    case 'listing_purchase':
      if (metadata?.listing_id) return `/marketplace/listing/${metadata.listing_id}`;
      break;
    case 'follow':
      if (metadata?.follower_id) return `/profile/${metadata.follower_id}`;
      break;
  }
  return null;
};

const NotificationItem = ({
  notification,
  onPress,
}: {
  notification: EnrichedNotification;
  onPress: () => void;
}) => {
  const typeInfo = typeIconMap[notification.type] || { icon: Bell, color: 'text-muted-foreground' };
  const IconComponent = typeInfo.icon;
  const initials = notification.actorProfile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <button
      onClick={onPress}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 active:bg-muted ${
        !notification.is_read ? 'bg-primary/5' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-14 w-14">
          <AvatarImage src={notification.actorProfile?.avatar_url || ''} />
          <AvatarFallback className="text-sm font-semibold bg-muted">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-background flex items-center justify-center`}>
          <div className={`h-5 w-5 rounded-full flex items-center justify-center ${notification.type === 'insight_like' ? 'bg-red-500' : notification.type.includes('message') ? 'bg-primary' : notification.type.includes('event') ? 'bg-orange-500' : notification.type.includes('topic') ? 'bg-green-500' : notification.type.includes('listing') ? 'bg-emerald-500' : 'bg-muted-foreground'}`}>
            <IconComponent className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.is_read ? 'font-semibold' : 'text-foreground/80'}`}>
          {notification.message}
        </p>
        <p className={`text-xs mt-1 ${!notification.is_read ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {!notification.is_read && (
        <div className="flex-shrink-0 mt-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
        </div>
      )}
    </button>
  );
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<EnrichedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('notifications-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        fetchNotifications();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        toast.error('Failed to load notifications');
        return;
      }

      const raw = (data || []) as NotificationData[];

      // Fetch actor profiles from metadata
      const actorIds = [...new Set(raw.map(n => (n.metadata as any)?.actor_id || (n.metadata as any)?.sender_id || (n.metadata as any)?.follower_id).filter(Boolean))];
      
      let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', actorIds);
        if (profiles) {
          profiles.forEach(p => {
            profilesMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
          });
        }
      }

      const enriched: EnrichedNotification[] = raw.map(n => ({
        ...n,
        metadata: n.metadata as Record<string, any> | null,
        actorProfile: profilesMap[(n.metadata as any)?.actor_id || (n.metadata as any)?.sender_id || (n.metadata as any)?.follower_id] || undefined,
      }));

      setNotifications(enriched);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: EnrichedNotification) => {
    if (!user) return;

    // Mark as read
    if (!notification.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id)
        .eq('user_id', user.id);
      
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
    }

    const path = getNavigationPath(notification);
    if (path) navigate(path);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    if (error) {
      toast.error('Failed to mark all as read');
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Group: New (today), Earlier
  const grouped = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const newItems = notifications.filter(n => isAfter(new Date(n.created_at), todayStart));
    const earlierItems = notifications.filter(n => !isAfter(new Date(n.created_at), todayStart));
    
    return { newItems, earlierItems };
  }, [notifications]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="icon" onClick={handleMarkAllRead} title="Mark all as read" className="h-9 w-9">
                <Check className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate('/notification-settings')} title="Settings" className="h-9 w-9">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="space-y-1 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">No notifications yet</h2>
            <p className="text-sm text-muted-foreground text-center">
              We'll notify you when something happens — likes, comments, messages, and more.
            </p>
          </div>
        ) : (
          <>
            {grouped.newItems.length > 0 && (
              <div>
                <h2 className="text-base font-bold px-4 pt-4 pb-2">New</h2>
                {grouped.newItems.map(n => (
                  <NotificationItem key={n.id} notification={n} onPress={() => handleNotificationClick(n)} />
                ))}
              </div>
            )}

            {grouped.earlierItems.length > 0 && (
              <div>
                <h2 className="text-base font-bold px-4 pt-4 pb-2">Earlier</h2>
                {grouped.earlierItems.map(n => (
                  <NotificationItem key={n.id} notification={n} onPress={() => handleNotificationClick(n)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
