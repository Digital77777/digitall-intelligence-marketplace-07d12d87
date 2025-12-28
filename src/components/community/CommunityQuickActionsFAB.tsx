import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, TrendingUp, MessageSquare, Calendar, Lightbulb, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  route: string;
  requiresAuth?: boolean;
}

const quickActions: QuickAction[] = [
  { label: 'My Activity', icon: TrendingUp, route: '/my-activity', requiresAuth: true },
  { label: 'Start Discussion', icon: MessageSquare, route: '/community/start-topic' },
  { label: 'Create Event', icon: Calendar, route: '/community/host-event' },
  { label: 'Share Insight', icon: Lightbulb, route: '/community/share-insight' },
  { label: 'Find Members', icon: Users, route: '/community/find-members' },
];

export const CommunityQuickActionsFAB = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleActionClick = (action: QuickAction) => {
    if (action.requiresAuth && !user) {
      navigate('/auth');
    } else {
      navigate(action.route);
    }
    setIsExpanded(false);
  };

  const filteredActions = quickActions.filter(
    (action) => !action.requiresAuth || user
  );

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50">
      {isExpanded && (
        <Card className="mb-4 w-64 shadow-xl border-primary/20 animate-scale-in">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-primary text-sm">Quick Actions</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="w-full justify-start h-10 text-sm hover:bg-primary/10"
                    onClick={() => handleActionClick(action)}
                  >
                    <Icon className="h-4 w-4 mr-3 text-primary" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
        size="sm"
      >
        <Plus 
          className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`} 
        />
      </Button>
    </div>
  );
};
