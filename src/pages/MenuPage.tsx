import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTier } from "@/contexts/TierContext";
import {
  LayoutDashboard, MessageSquare, Users, Store, UserPlus, Clapperboard,
  BookOpen, Brain, Gift, CreditCard, Bell, RefreshCw, HelpCircle,
  ChevronDown, ChevronRight, LogOut, ArrowLeft, Briefcase, Trophy,
  Calendar, Settings, Sparkles, ShoppingBag, PlusCircle, Heart,
  Star, Shield, Compass, TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  color: string;
  description?: string;
}

const MenuGridCard = ({ item }: { item: MenuItem }) => (
  <Link
    to={item.path}
    className="group flex flex-col gap-2 bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md hover:border-primary/20 active:bg-muted/50 transition-all duration-200 min-h-[80px]"
  >
    <div className="flex items-center justify-between">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-muted/80 group-hover:scale-105 transition-transform")}>
        <item.icon className={cn("h-5 w-5", item.color)} />
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div>
      <span className="text-sm font-semibold leading-tight">{item.label}</span>
      {item.description && (
        <p className="text-xs text-muted-foreground mt-0.5 hidden lg:block">{item.description}</p>
      )}
    </div>
  </Link>
);

const AccordionSection = ({
  icon: Icon,
  title,
  items,
  open,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  items: { icon: React.ElementType; label: string; path: string }[];
  open: boolean;
  onToggle: () => void;
}) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md active:bg-muted/50 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronDown
        className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
      />
    </button>
    {open && (
      <div className="space-y-0.5 mt-1 bg-card rounded-xl border border-border overflow-hidden">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 active:bg-muted/50 transition-colors"
          >
            <item.icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    )}
  </div>
);

const MenuPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { canAccessFeature } = useTier();
  const canSell = canAccessFeature("marketplace_sell");
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, headline")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U";
  };

  const mainItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", color: "text-blue-600", description: "Overview & stats" },
    { icon: MessageSquare, label: "Messages", path: "/community/inbox", color: "text-violet-600", description: "Chat with members" },
    { icon: Users, label: "My Network", path: "/community/my-network", color: "text-sky-600", description: "Connections & follows" },
    { icon: Store, label: "Marketplace", path: "/marketplace", color: "text-emerald-600", description: "Browse & sell products" },
    { icon: UserPlus, label: "Find Members", path: "/community/find-members", color: "text-blue-500", description: "Discover people" },
    { icon: Clapperboard, label: "Reels", path: "/community/reels", color: "text-rose-500", description: "Short video content" },
    { icon: BookOpen, label: "Learning Paths", path: "/learning-paths", color: "text-amber-600", description: "Courses & tutorials" },
    { icon: Brain, label: "AI Tools", path: "/ai-tools", color: "text-purple-600", description: "AI-powered tools" },
    { icon: Calendar, label: "Events", path: "/community/browse-events", color: "text-red-500", description: "Upcoming events" },
    { icon: Gift, label: "Programs & Rewards", path: "/referrals", color: "text-pink-500", description: "Earn rewards" },
    { icon: Heart, label: "Wishlist", path: "/marketplace/wishlist", color: "text-rose-600", description: "Saved items" },
    { icon: Trophy, label: "Challenges", path: "/challenge/1", color: "text-yellow-600", description: "Compete & win" },
  ];

  const sellerItems: MenuItem[] = canSell
    ? [
        { icon: ShoppingBag, label: "My Listings", path: "/marketplace/my-listings", color: "text-teal-600", description: "Manage products" },
        { icon: PlusCircle, label: "Create Listing", path: "/marketplace/create", color: "text-green-600", description: "Add new product" },
        { icon: Briefcase, label: "Seller Dashboard", path: "/seller-dashboard", color: "text-indigo-600", description: "Sales analytics" },
      ]
    : [];

  const settingsItems = [
    { icon: CreditCard, label: "Subscription", path: "/subscription" },
    { icon: Bell, label: "Notification Settings", path: "/notification-settings" },
    { icon: RefreshCw, label: "Update App", path: "/update-app" },
  ];

  const helpItems = [
    { icon: HelpCircle, label: "Support", path: "/support" },
    { icon: MessageSquare, label: "Feedback", path: "/feedback" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Menu</h1>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link to="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Desktop: two-column layout / Mobile: single column */}
      <div className={cn(
        "px-4 py-6 mx-auto",
        isMobile ? "max-w-lg space-y-4" : "max-w-5xl"
      )}>
        {/* Profile Card - full width */}
        <Link
          to={user ? `/profile/${user.id}` : "/auth"}
          className="flex items-center gap-4 bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md active:bg-muted/50 transition-all duration-200 mb-4"
        >
          <Avatar className={cn("border-2 border-border", isMobile ? "h-14 w-14" : "h-16 w-16")}>
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">
              {profile?.full_name || user?.email || "User"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {profile?.headline || "View your profile"}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </Link>

        {/* Invite Friends */}
        <Link
          to="/referrals"
          className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md active:bg-muted/50 transition-all duration-200 mb-6"
        >
          <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Heart className="h-5 w-5 text-rose-500" />
          </div>
          <span className="font-medium">Invite friends</span>
        </Link>

        <div className={cn(isMobile ? "space-y-4" : "grid grid-cols-[1fr_320px] gap-6")}>
          {/* Left column: Feature grid */}
          <div className="space-y-4">
            <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
              {mainItems.map((item) => (
                <MenuGridCard key={item.path} item={item} />
              ))}
            </div>

            {/* Seller Section */}
            {sellerItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pt-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Seller Tools
                  </span>
                </div>
                <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
                  {sellerItems.map((item) => (
                    <MenuGridCard key={item.path} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column (desktop) / Below (mobile): Settings, Help, Logout */}
          <div className="space-y-3">
            <AccordionSection
              icon={Settings}
              title="Settings & preferences"
              items={settingsItems}
              open={settingsOpen}
              onToggle={() => setSettingsOpen(!settingsOpen)}
            />

            <AccordionSection
              icon={HelpCircle}
              title="Help & support"
              items={helpItems}
              open={helpOpen}
              onToggle={() => setHelpOpen(!helpOpen)}
            />

            {/* Log out */}
            <button
              onClick={() => { signOut(); navigate("/"); }}
              className="w-full flex items-center gap-3 bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md active:bg-muted/50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
};

export default MenuPage;
