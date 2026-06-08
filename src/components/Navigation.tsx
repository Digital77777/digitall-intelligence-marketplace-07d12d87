import { BookOpen, Brain, Store, Home, User, LogOut, Menu, Users, Gift, ArrowRight, Sparkles } from "lucide-react";
import { XPBadge } from "@/components/growth/XPBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useIsMobile } from "@/hooks/use-mobile";
import { Bell } from "lucide-react";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useTier } from "@/contexts/TierContext";
const Navigation = () => {
  const {
    user,
    signOut,
    loading
  } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { handleMouseEnter, handleTouchStart } = usePrefetch();
  const { canAccessFeature } = useTier();
  const canSell = canAccessFeature('marketplace_sell');
  const navigationItems = [{
    icon: Home,
    label: "Home",
    path: "/"
  }, {
    icon: BookOpen,
    label: "Learning Paths",
    path: "/learning-paths"
  }, {
    icon: Brain,
    label: "AI Tools",
    path: "/ai-tools"
  }, {
    icon: Store,
    label: "Marketplace",
    path: "/marketplace"
  }, {
    icon: Users,
    label: "Community",
    path: "/community"
  }, {
    icon: Sparkles,
    label: "Growth",
    path: "/growth"
  }, {
    icon: Gift,
    label: "Programs",
    path: "/referrals"
  }];
  return <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" aria-label="Main navigation">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
                <Link
                  to="/"
                  aria-label="Home"
                  onMouseEnter={() => handleMouseEnter("/")}
                  onTouchStart={() => handleTouchStart("/")}
                >
              <span className="text-xl font-bold bg-gradient-ai bg-clip-text text-transparent">
                Digital Intelligence Marketplace
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Primary navigation">
            {navigationItems.map(item => <Link 
                key={item.path} 
                to={item.path}
                onMouseEnter={() => handleMouseEnter(item.path)}
                onTouchStart={() => handleTouchStart(item.path)}
                aria-label={`Navigate to ${item.label}`}
              >
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Button>
              </Link>)}
          </div>

          <div className="flex items-center space-x-3">
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-6 w-6 text-primary" />
                      <span className="font-bold text-sm bg-gradient-ai bg-clip-text text-transparent">
                        Digital Intelligence
                      </span>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 px-4">
                     <div className="py-6 space-y-2" role="navigation" aria-label="Mobile menu navigation">
                      {navigationItems.map(item => <Link 
                          key={item.path} 
                          to={item.path} 
                          onClick={() => setIsMobileMenuOpen(false)}
                          onTouchStart={() => handleTouchStart(item.path)}
                          aria-label={`Navigate to ${item.label}`}
                        >
                          <Button variant="ghost" className="w-full justify-start gap-3 h-12 px-4 text-left">
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                            <span className="font-medium">{item.label}</span>
                          </Button>
                        </Link>)}
                    </div>
                    
                    {/* Mobile User Section */}
                    <div className="py-4 border-t border-border">
                      {loading ? <div className="px-4">
                          <div className="w-full h-12 animate-pulse bg-muted rounded" />
                        </div> : user ? <div className="px-4 space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{user.email}</p>
                              <p className="text-xs text-muted-foreground">Student Account</p>
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }} className="w-full justify-start gap-3">
                            <LogOut className="h-4 w-4" />
                            Log out
                          </Button>
                        </div> : <div className="px-4 space-y-3">
                          <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full">
                              Sign In
                            </Button>
                          </Link>
                          <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full bg-gradient-ai text-white">
                              Get Started Free
                            </Button>
                          </Link>
                        </div>}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            {loading ? <div className="w-20 h-8 animate-pulse bg-muted rounded" /> : user ? (
              <>
                {!isMobile && <XPBadge compact />}
                <Link
                  to="/notifications"
                  aria-label="Notifications"
                  onMouseEnter={() => handleMouseEnter("/notifications")}
                  onTouchStart={() => handleTouchStart("/notifications")}
                >
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Bell className="h-5 w-5" />
                  </Button>
                </Link>
                <Link
                  to="/menu"
                  aria-label="Open menu"
                  onMouseEnter={() => handleMouseEnter("/menu")}
                  onTouchStart={() => handleTouchStart("/menu")}
                >
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {!isMobile && <span>Account</span>}
                  </Button>
                </Link>
              </>
            ) : <>
                <Link
                  to="/auth"
                  onMouseEnter={() => handleMouseEnter("/auth")}
                  onTouchStart={() => handleTouchStart("/auth")}
                >
                  <Button variant="outline" size="sm" aria-label="Sign in">
                    <User className="h-4 w-4" />
                    {!isMobile && <span className="ml-2">Sign In</span>}
                  </Button>
                </Link>
                <Link
                  to="/auth"
                  onMouseEnter={() => handleMouseEnter("/auth")}
                  onTouchStart={() => handleTouchStart("/auth")}
                >
                  <Button variant="ai" size="sm" className="min-h-[44px] min-w-[44px] px-4" aria-label="Get started free">
                    <ArrowRight className="h-4 w-4" />
                    {!isMobile && <span className="ml-2">Get Started Free</span>}
                  </Button>
                </Link>
              </>}
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;