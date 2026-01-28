import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  MessageCircle, 
  Calendar, 
  Lightbulb, 
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
  requiresAuth?: boolean;
}

const quickActions: QuickAction[] = [
  { id: "activity", icon: TrendingUp, label: "My Activity", path: "/community/my-activity", requiresAuth: true },
  { id: "discussion", icon: MessageCircle, label: "Join Community", path: "/community/join-whatsapp" },
  { id: "event", icon: Calendar, label: "Create Event", path: "/community/host-event" },
  { id: "insight", icon: Lightbulb, label: "Share Insight", path: "/community/share-insight" },
  { id: "members", icon: Users, label: "Find Members", path: "/community/find-members" },
];

interface QuickActionsRowProps {
  isLoggedIn?: boolean;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({ isLoggedIn = false }) => {
  const navigate = useNavigate();
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [longPressLabel, setLongPressLabel] = useState<string | null>(null);

  // Filter actions based on auth state
  const visibleActions = quickActions.filter(
    action => !action.requiresAuth || isLoggedIn
  );

  const handleTap = useCallback((action: QuickAction) => {
    if (action.requiresAuth && !isLoggedIn) {
      navigate("/auth");
      return;
    }
    navigate(action.path);
  }, [navigate, isLoggedIn]);

  // Long press detection for mobile tooltip
  const handleTouchStart = useCallback((id: string, label: string) => {
    const timer = setTimeout(() => {
      setLongPressLabel(label);
    }, 500);
    setPressedId(id);
    return () => clearTimeout(timer);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setPressedId(null);
    // Hide tooltip after a delay
    setTimeout(() => setLongPressLabel(null), 1500);
  }, []);

  return (
    <div className="w-full px-4 mt-6">
      {/* Mobile long-press label */}
      {longPressLabel && (
        <div className="text-center mb-2 animate-fade-in">
          <span className="text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
            {longPressLabel}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          const isPressed = pressedId === action.id;
          
          return (
            <Tooltip key={action.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleTap(action)}
                  onTouchStart={() => handleTouchStart(action.id, action.label)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  className={cn(
                    // Base styles - 44px minimum touch target
                    "relative flex items-center justify-center",
                    "w-11 h-11 sm:w-12 sm:h-12",
                    "rounded-full",
                    // Background gradient
                    "bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10",
                    "border border-primary/20",
                    // Hover/active states
                    "hover:from-primary/20 hover:via-secondary/10 hover:to-accent/20",
                    "hover:border-primary/40 hover:shadow-md",
                    "active:scale-95",
                    // Transition
                    "transition-all duration-200 ease-out",
                    // Focus state for accessibility
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    // Pressed state
                    isPressed && "scale-95 from-primary/25 via-secondary/15 to-accent/25"
                  )}
                  aria-label={action.label}
                  role="button"
                  tabIndex={0}
                >
                  {/* Ripple effect on tap */}
                  <span 
                    className={cn(
                      "absolute inset-0 rounded-full bg-primary/20 opacity-0",
                      isPressed && "animate-ping opacity-30"
                    )}
                  />
                  
                  {/* Icon */}
                  <Icon 
                    className={cn(
                      "w-5 h-5 sm:w-5.5 sm:h-5.5",
                      "text-primary",
                      "transition-transform duration-200",
                      "group-hover:scale-110"
                    )}
                    strokeWidth={1.75}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                className="bg-foreground text-background text-xs font-medium"
              >
                {action.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsRow;
