import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { useCommunityPrograms } from "@/hooks/useCommunityPrograms";
import { usePartnerStats } from "@/hooks/usePartnerStats";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Users, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { XPBadge } from "@/components/growth/XPBadge";
import { SuccessWallStrip } from "@/components/growth/SuccessWallStrip";
import { PartnerFunnelCard } from "@/components/growth/PartnerFunnelCard";
import { formatDistanceToNow } from "date-fns";

export default function GrowthHubPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: xp } = useXP();
  const { quests, loading: questsLoading } = useCommunityPrograms();
  const { data: partner } = usePartnerStats();

  const questSummary = useMemo(() => {
    const total = quests.length;
    const completed = quests.filter((q) => q.status === "completed").length;
    return { total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
  }, [quests]);

  if (authLoading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl space-y-5 animate-fade-in">
      <SEOHead
        title="Growth Hub — DIM"
        description="Track XP, complete quests, grow the community as a DIM Partner, and share your wins on the Success Wall."
      />

      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          DIM Growth Engine
        </p>
        <h1 className="text-2xl md:text-3xl font-bold">
          Learn. Build. Connect. Earn.
        </h1>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Total XP
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {(xp?.total ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              +{xp?.week ?? 0} this week
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              Quests done
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {questSummary.completed}/{questSummary.total}
            </div>
            <Progress value={questSummary.pct} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              Active referrals
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {partner?.active ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {partner?.registrations ?? 0} signups
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Level
            </div>
            <div className="text-2xl font-bold capitalize">
              {xp?.level ?? "explorer"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {partner?.isAmbassador ? "Ambassador track" : "Growing"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Quests
            </CardTitle>
            <Button asChild size="sm" variant="ghost" className="gap-1">
              <Link to="/growth/quests">All quests <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {questsLoading ? (
              <p className="text-sm text-muted-foreground">Loading quests…</p>
            ) : (
              quests
                .filter((q) => q.status !== "completed")
                .slice(0, 4)
                .map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-border/60 hover:bg-accent/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{q.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {q.category} · +{q.points_reward} XP
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {q.difficulty}
                    </Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Recent XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(xp?.recent ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Earn XP by completing lessons, sharing insights, or inviting friends.
              </p>
            ) : (
              <ul className="space-y-2">
                {xp!.recent.slice(0, 6).map((e) => (
                  <li key={e.id} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-muted-foreground">{e.source}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                      </span>
                      <span className="font-semibold tabular-nums text-emerald-500">
                        +{e.amount}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Partner Program
          </CardTitle>
          <Button asChild size="sm" variant="ghost" className="gap-1">
            <Link to="/growth/partner">Open dashboard <ArrowRight className="w-3 h-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {partner ? (
            <PartnerFunnelCard stats={partner} />
          ) : (
            <p className="text-sm text-muted-foreground">Loading partner stats…</p>
          )}
        </CardContent>
      </Card>

      <SuccessWallStrip />
    </main>
  );
}
