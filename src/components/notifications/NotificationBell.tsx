import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Actor {
  id: string;
  username: string;
}

interface Notification {
  id: number;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actors: Actor[] | null;
  metadata: Record<string, any>;
}

const renderNotificationMessage = (notification: Notification) => {
  if (!notification.is_read && notification.actors && notification.actors.length > 0) {
    const actorNames = notification.actors.map(a => a.username);
    if (actorNames.length === 1) {
      return `${actorNames[0]} liked your insight.`;
    } else if (actorNames.length === 2) {
      return `${actorNames[0]} and ${actorNames[1]} liked your insight.`;
    } else {
      return `${actorNames[0]} and ${actorNames.length - 1} others liked your insight.`;
    }
  }
  return notification.message;
};

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const subscription = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
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
        .limit(20);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } else {
        const notificationsWithActors = (data || []).map(n => ({
          ...n,
          actors: null,
          metadata: n.metadata as Record<string, any>
        }));
        setNotifications(notificationsWithActors);
        setUnreadCount(notificationsWithActors.filter((n: Notification) => !n.is_read).length || 0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getNavigationPath = (notification: Notification): string | null => {
    const { type, metadata } = notification;

    switch (type) {
      case 'insight_like':
      case 'insight_comment':
        if (metadata?.insight_id) {
          return `/community?insight=${metadata.insight_id}`;
        }
        break;
      case 'topic_reply':
      case 'topic_mention':
        if (metadata?.topic_id) {
          return `/community/topic/${metadata.topic_id}`;
        }
        break;
      case 'new_message':
      case 'message':
        return '/community/inbox';
      case 'event_registration':
      case 'event_update':
        if (metadata?.event_id) {
          return `/community/events?event=${metadata.event_id}`;
        }
        break;
      case 'listing_comment':
      case 'listing_purchase':
        if (metadata?.listing_id) {
          return `/marketplace?listing=${metadata.listing_id}`;
        }
        break;
      default:
        return null;
    }
    return null;
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!user) return;

    try {
      // Mark as read
      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('id', notification.id);

      const { error } = await query;
      
      if (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Failed to update notification');
      } else {
        fetchNotifications();
      }

      // Navigate to relevant page
      const path = getNavigationPath(notification);
      if (path) {
        navigate(path);
      }
    } catch (error) {
      console.error('Error handling notification:', error);
      toast.error('Something went wrong');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        toast.error('Failed to mark all as read');
      } else {
        toast.success('All notifications marked as read');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Something went wrong');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-xs" variant="destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <div className="p-2 flex justify-between items-center sticky top-0 bg-background z-10">
          <div className="font-semibold">Notifications</div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs h-7"
              >
                Mark all read
              </Button>
            )}
            <Link to="/notification-settings">
              <Button variant="ghost" size="icon" aria-label="Notification settings">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-8 text-sm text-muted-foreground text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <div className="text-sm text-muted-foreground font-medium">No notifications yet</div>
            <div className="text-xs text-muted-foreground mt-1">We'll notify you when something happens</div>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem 
              key={notification.id} 
              onSelect={() => handleNotificationClick(notification)}
              className="cursor-pointer focus:outline-none p-0"
            >
              <div className={`p-3 w-full transition-all duration-200 hover:bg-muted/50 relative ${
                !notification.is_read 
                  ? 'bg-primary/5 border-l-2 border-primary' 
                  : ''
              }`}>
                <div className="text-sm font-semibold capitalize">{notification.type.replace(/_/g, ' ')}</div>
                <div className="text-sm mt-1 text-foreground/90">{renderNotificationMessage(notification)}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </div>
                {!notification.is_read && (
                  <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
