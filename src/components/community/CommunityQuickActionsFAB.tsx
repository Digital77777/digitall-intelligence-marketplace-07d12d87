import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  X, 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  Lightbulb, 
  Users,
  PenSquare,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  route: string;
  requiresAuth?: boolean;
  description?: string;
}

const quickActions: QuickAction[] = [
  { 
    label: 'My Activity', 
    icon: TrendingUp, 
    route: '/my-activity', 
    requiresAuth: true,
    description: 'View your recent activity'
  },
  { 
    label: 'Start Discussion', 
    icon: MessageSquare, 
    route: '/community/start-topic',
    description: 'Begin a new conversation'
  },
  { 
    label: 'Create Post', 
    icon: PenSquare, 
    route: '/community/share-insight',
    description: 'Share your thoughts'
  },
  { 
    label: 'Ask Question', 
    icon: HelpCircle, 
    route: '/community/start-topic',
    description: 'Get help from the community'
  },
  { 
    label: 'Create Event', 
    icon: Calendar, 
    route: '/community/host-event',
    description: 'Organize a community event'
  },
  { 
    label: 'Share Insight', 
    icon: Lightbulb, 
    route: '/community/share-insight',
    description: 'Post your insights'
  },
  { 
    label: 'Find Members', 
    icon: Users, 
    route: '/community/find-members',
    description: 'Discover community members'
  },
];

export const CommunityQuickActionsFAB = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollDirection } = useScrollPosition();

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isExpanded) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-fab-container]')) {
        setIsExpanded(false);
      }
    };
    
    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isExpanded]);

  const handleActionClick = useCallback((action: QuickAction) => {
    // Smooth scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (action.requiresAuth && !user) {
      navigate('/auth');
    } else {
      navigate(action.route);
    }
    setIsExpanded(false);
  }, [navigate, user]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const filteredActions = quickActions.filter(
    (action) => !action.requiresAuth || user
  );

  // Primary actions shown first (Create Post, Start Discussion, Ask Question)
  const primaryActions = filteredActions.slice(0, 4);
  const secondaryActions = filteredActions.slice(4);

  return (
    <div 
      data-fab-container
      className={cn(
        // Base positioning
        "fixed z-50",
        // Position with safe-area support for mobile notch
        "bottom-20 right-6 md:bottom-6",
        "pb-[env(safe-area-inset-bottom)]",
        "pr-[env(safe-area-inset-right)]"
      )}
    >
      {/* Backdrop for mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* Expanded Menu */}
      {isExpanded && (
        <Card 
          className={cn(
            "mb-4 w-72 shadow-xl border-primary/20 z-50",
            "animate-in fade-in-0 slide-in-from-bottom-4 duration-200"
          )}
          role="menu"
          aria-label="Quick actions menu"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary text-base">Quick Actions</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0 hover:bg-muted"
                aria-label="Close quick actions menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Primary Actions */}
            <div className="space-y-1 mb-3">
              {primaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="w-full justify-start h-11 text-sm hover:bg-primary/10 group"
                    onClick={() => handleActionClick(action)}
                    role="menuitem"
                  >
                    <Icon className="h-4 w-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{action.label}</span>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Divider */}
            {secondaryActions.length > 0 && (
              <div className="border-t border-border my-2" />
            )}

            {/* Secondary Actions */}
            <div className="space-y-1">
              {secondaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="w-full justify-start h-10 text-sm hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    onClick={() => handleActionClick(action)}
                    role="menuitem"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAB Button */}
      <Button
        onClick={toggleExpanded}
        className={cn(
          // Size and shape
          "h-14 w-14 rounded-full",
          // Colors
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          // Shadow and depth
          "shadow-lg hover:shadow-xl",
          // Transitions
          "transition-all duration-300 ease-out",
          // Scroll-based subtle animation
          scrollDirection === 'down' && !isExpanded && "scale-95 opacity-90",
          scrollDirection === 'up' && "scale-100 opacity-100",
          scrollDirection === 'idle' && "scale-100",
          // Expanded state
          isExpanded && "bg-primary/90 scale-105"
        )}
        size="sm"
        aria-expanded={isExpanded}
        aria-haspopup="menu"
        aria-label={isExpanded ? "Close quick actions" : "Open quick actions"}
      >
        <Plus 
          className={cn(
            "h-6 w-6 transition-transform duration-300 ease-out",
            isExpanded && "rotate-45"
          )} 
        />
      </Button>
    </div>
  );
};
