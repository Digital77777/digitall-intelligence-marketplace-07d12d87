import { Home, BookOpen, Brain, Store, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { usePrefetch } from "@/hooks/usePrefetch";

const MobileFooter = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { handleTouchStart } = usePrefetch();
  
  const navigationItems = [
    {
      icon: Home,
      label: "Home",
      path: "/"
    },
    {
      icon: BookOpen,
      label: "Learning",
      path: "/learning-paths"
    },
    {
      icon: Brain,
      label: "AI Tools",
      path: "/ai-tools"
    },
    {
      icon: Store,
      label: "Market",
      path: "/marketplace"
    },
    {
      icon: Users,
      label: "Community",
      path: "/community"
    }
  ];

  const handleNavClick = (path: string, isCurrentlyActive: boolean) => {
    if (isCurrentlyActive) {
      // Tap active tab to scroll to top (WhatsApp behavior)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-sm pb-[env(safe-area-inset-bottom)] touch-action-manipulation" 
      style={{ 
        WebkitBackdropFilter: 'blur(16px)',
        willChange: 'transform',
        position: 'fixed',
        bottom: 0
      }}
      aria-label="Mobile navigation" 
      role="navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => handleNavClick(item.path, isActive)}
              onMouseEnter={() => handleTouchStart(item.path)}
              onTouchStart={() => handleTouchStart(item.path)}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all min-w-0 flex-1 active:scale-[0.98] active:bg-muted/50",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground active:text-foreground"
              )}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                willChange: 'transform'
              }}
            >
              <item.icon className={cn("h-6 w-6", isActive && "text-primary")} aria-hidden="true" />
              <span className={cn(
                "text-[10px] font-medium truncate",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileFooter;
