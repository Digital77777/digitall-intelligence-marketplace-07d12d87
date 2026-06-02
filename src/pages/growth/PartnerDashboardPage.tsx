import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerStats } from "@/hooks/usePartnerStats";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Crown, Sparkles } from "lucide-react";
import { PartnerFunnelCard } from "@/components/growth/PartnerFunnelCard";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function PartnerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: stats, isLoading } = usePartnerStats();

  const copyLink = async () => {
    if (!stats?.referralLink) return;
    await navigator.clipboard.writeText(stats.referralLink);
    toast.success("Referral link copied");
  };

  const share = async () => {
    if (!stats?.referralLink) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join me on DIM",
          text: "Learn, build, connect, and earn on Digital Intelligence Marketplace.",
          url: stats.referralLink,
        });
      } else {
        await copyLink();
      }
    } catch {/* user cancelled */}
  };

  if (authLoading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;

  const ambassadorProgress = stats
    ? Math.min(100, Math.round((stats.active / 10) * 100))
    : 0;

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl space-y-5 animate-fade-in">
      <SEOHead title="Partner Program — DIM Growth Hub" description="Track your referral funnel, conversion, revenue, and ambassador qualification on DIM's Partner Program." />
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          DIM Partner Program
        </p>
        <h1 className="text-2xl md:text-3xl font-bold">Grow DIM. Grow with DIM.</h1>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your referral link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-10" />
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <Input readOnly value={stats?.referralLink ?? ""} className="font-mono text-xs" />
              <div className="flex gap-2">
                <Button onClick={copyLink} variant="outline" size="sm" className="gap-1.5">
                  <Copy className="w-4 h-4" /> Copy
                </Button>
                <Button onClick={share} size="sm" className="gap-1.5">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {stats && <PartnerFunnelCard stats={stats} />}

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" /> Ambassador qualification
          </CardTitle>
          {stats?.isAmbassador && (
            <Badge className="gap-1"><Sparkles className="w-3 h-3" /> Qualified</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{stats?.active ?? 0} of 10 active referrals</span>
            <span>or ${(stats?.revenue ?? 0).toLocaleString()} of $1,000 revenue</span>
          </div>
          <Progress value={ambassadorProgress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            Ambassadors unlock the Champions program, leadership chat, and featured visibility.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats || stats.referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No referrals yet. Share your link to get started.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {stats.referrals.slice(0, 20).map((r: any) => (
                <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <div className="truncate">{r.referred_email}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge
                    variant={r.status === "completed" ? "default" : "outline"}
                    className="capitalize text-[10px]"
                  >
                    {r.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
