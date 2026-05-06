import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Trophy, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SEOHead } from "@/components/SEOHead";
import { useTier } from "@/contexts/TierContext";
import { STARTER_PATHS } from "@/data/starterMissionPaths";
import { useMissionProgress } from "@/hooks/useMissionProgress";

const LegacyPathsForUpperTiers = () => {
  const navigate = useNavigate();
  // For Creator/Career: keep showing existing course routes
  const items = [
    { id: "ai-product-design", title: "Designing Human-Centered AI", level: "Advanced" },
    { id: "ai-entrepreneurship", title: "From Student to Founder", level: "Advanced" },
    { id: "applied-ai-industry", title: "AI Specialist Tracks", level: "Advanced" },
    { id: "responsible-ai", title: "Building AI for Good", level: "Advanced" },
    { id: "advanced-technical-ai", title: "AI Research & Innovation", level: "Advanced" },
    { id: "technical-developer", title: "Future AI Engineer", level: "Professional" },
    { id: "business-careers", title: "AI for Work & Startups", level: "Professional" },
  ];
  return (
    <section className="container mx-auto px-4 sm:px-6 py-10">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Premium Tier Paths</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((p) => (
          <Card
            key={p.id}
            onClick={() => navigate(`/course/${p.id}`)}
            className="p-4 cursor-pointer hover:shadow-card transition"
          >
            <Badge variant="secondary" className="text-xs mb-2">{p.level}</Badge>
            <p className="font-semibold text-sm">{p.title}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

const LearningPaths = () => {
  const navigate = useNavigate();
  const { tierName } = useTier();
  const { totalXp, pathStats, loading } = useMissionProgress();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Learning Paths — Learn, Build, Earn"
        description="Follow structured AI paths. Complete real missions. Build outputs. Unlock earning opportunities."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative container mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" /> Mission-Based Learning
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Pick a path. <span className="text-primary">Complete missions.</span> Earn real outcomes.
              </h1>
              <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                Each mission = Learn → Do → Output → Reward. No passive watching. Build something every step.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-card border rounded-lg px-4 py-3 shadow-sm">
              <Trophy className="h-5 w-5 text-warning" />
              <div>
                <div className="text-xs text-muted-foreground">Total XP</div>
                <div className="font-bold text-lg leading-none">{loading ? "—" : totalXp}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Paths Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {STARTER_PATHS.map((path, idx) => {
            const stats = pathStats(path.id);
            const locked = idx > 0 && stats.completed === 0 && false; // all unlocked for now
            return (
              <Card
                key={path.id}
                onClick={() => !locked && navigate(`/learning-paths/${path.id}`)}
                className={`group relative overflow-hidden cursor-pointer border hover:shadow-elevation transition-all ${
                  locked ? "opacity-60" : ""
                }`}
              >
                <div className={`h-1.5 bg-gradient-to-r ${path.gradient}`} />
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`text-3xl w-12 h-12 rounded-lg bg-gradient-to-br ${path.gradient} flex items-center justify-center shadow-sm`}>
                      <span className="drop-shadow">{path.emoji}</span>
                    </div>
                    {locked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {path.courses.length} courses
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight mb-1">
                    {path.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                    {path.description}
                  </p>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Progress</span>
                      <span>{stats.completed}/{stats.total} missions</span>
                    </div>
                    <Progress value={stats.pct} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-success font-medium truncate pr-2">
                      → {path.outcome}
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Premium tier paths preserved */}
      {tierName && tierName !== "starter" && <LegacyPathsForUpperTiers />}

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 pb-16">
        <Card className="p-6 sm:p-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Want bigger missions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Unlock Creator and Career tier paths with deeper specialisations.
          </p>
          <Button onClick={() => navigate("/subscription")}>
            View Subscription Tiers <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default LearningPaths;
