import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTier } from "@/contexts/TierContext";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Store,
  UserPlus,
  Clapperboard,
  BookOpen,
  Brain,
  Gift,
  CreditCard,
  Star,
  Heart,
  Bell,
  Shield,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Briefcase,
  Trophy,
  Calendar,
  Settings,
  Sparkles,
  ShoppingBag,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MenuPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { canAccessFeature } = useTier();
  const canSell = canAccessFeature("marketplace_sell");
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
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U";
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", color: "text-blue-600" },
    { icon: MessageSquare, label: "Messages", path: "/community/inbox", color: "text-violet-600" },
    { icon: Users, label: "My Network", path: "/community/my-network", color: "text-sky-600" },
    { icon: Store, label: "Marketplace", path: "/marketplace", color: "text-emerald-600" },
    { icon: UserPlus, label: "Find Members", path: "/community/find-members", color: "text-blue-500" },
    { icon: Clapperboard, label: "Reels", path: "/community/reels", color: "text-rose-500" },
    { icon: BookOpen, label: "Learning Paths", path: "/learning-paths", color: "text-amber-600" },
    { icon: Brain, label: "AI Tools", path: "/ai-tools", color: "text-purple-600" },
    { icon: Calendar, label: "Events", path: "/community/browse-events", color: "text-red-500" },
    { icon: Gift, label: "Programs & Rewards", path: "/referrals", color: "text-pink-500" },
    { icon: Heart, label: "Wishlist", path: "/marketplace/wishlist", color: "text-rose-600" },
    { icon: Trophy, label: "Challenges", path: "/challenge/1", color: "text-yellow-600" },
  ];

  const sellerItems = canSell
    ? [
        { icon: ShoppingBag, label: "My Listings", path: "/marketplace/my-listings", color: "text-teal-600" },
        { icon: PlusCircle, label: "Create Listing", path: "/marketplace/create", color: "text-green-600" },
        { icon: Briefcase, label: "Seller Dashboard", path: "/seller-dashboard", color: "text-indigo-600" },
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

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Profile Card */}
        <Link
          to={user ? `/profile/${user.id}` : "/auth"}
          className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border shadow-sm active:bg-muted/50 transition-colors"
        >
          <Avatar className="h-14 w-14 border-2 border-border">
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
          className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border shadow-sm active:bg-muted/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Heart className="h-5 w-5 text-rose-500" />
          </div>
          <span className="font-medium">Invite friends</span>
        </Link>

        {/* Main Feature Grid */}
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col gap-2 bg-card rounded-xl p-4 border border-border shadow-sm active:bg-muted/50 transition-colors min-h-[80px]"
            >
              <item.icon className={cn("h-6 w-6", item.color)} />
              <span className="text-sm font-medium leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Seller Section */}
        {sellerItems.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Seller Tools
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sellerItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col gap-2 bg-card rounded-xl p-4 border border-border shadow-sm active:bg-muted/50 transition-colors min-h-[80px]"
                >
                  <item.icon className={cn("h-6 w-6", item.color)} />
                  <span className="text-sm font-medium leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Settings & Privacy Accordion */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-sm active:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="font-medium">Settings & preferences</span>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              settingsOpen && "rotate-180"
            )}
          />
        </button>
        {settingsOpen && (
          <div className="space-y-1 -mt-2 bg-card rounded-xl border border-border overflow-hidden">
            {settingsItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3.5 active:bg-muted/50 transition-colors"
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Help & Support Accordion */}
        <button
          onClick={() => setHelpOpen(!helpOpen)}
          className="w-full flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-sm active:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="font-medium">Help & support</span>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              helpOpen && "rotate-180"
            )}
          />
        </button>
        {helpOpen && (
          <div className="space-y-1 -mt-2 bg-card rounded-xl border border-border overflow-hidden">
            {helpItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3.5 active:bg-muted/50 transition-colors"
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Log out */}
        <button
          onClick={() => {
            signOut();
            navigate("/");
          }}
          className="w-full flex items-center gap-3 bg-card rounded-xl p-4 border border-border shadow-sm active:bg-muted/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="font-medium">Log out</span>
        </button>

        {/* Bottom spacing for mobile footer */}
        <div className="h-4" />
      </div>
    </div>
  );
};

export default MenuPage;
