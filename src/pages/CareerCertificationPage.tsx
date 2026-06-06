import { useMemo } from 'react';
import { TierGate } from '@/components/tier/TierGate';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useCertificationProgress } from '@/hooks/useCertificationProgress';
import { CERT_CATEGORIES, CERTIFICATIONS, getCertsByCategory } from '@/data/certifications';
import { CertificationCard } from '@/components/certification/CertificationCard';
import { Flame, Sparkles, Trophy, Target, Zap, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkillsGraph } from '@/components/career/SkillsGraph';
import { AchievementsStrip } from '@/components/career/AchievementsStrip';

const ranks = [
  { min: 0, name: 'AI Explorer' },
  { min: 500, name: 'AI Builder' },
  { min: 1500, name: 'AI Specialist' },
  { min: 3000, name: 'AI Professional' },
  { min: 6000, name: 'AI Leader' },
];

const CareerCertificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, stats, start, loading } = useCertificationProgress();

  const firstName = (user?.user_metadata?.full_name || user?.email || 'there').toString().split(' ')[0].split('@')[0];

  const rank = useMemo(
    () => [...ranks].reverse().find((r) => stats.xp >= r.min) || ranks[0],
    [stats.xp]
  );
  const nextRank = useMemo(
    () => ranks.find((r) => stats.xp < r.min),
    [stats.xp]
  );
  const xpToNext = nextRank ? nextRank.min - stats.xp : 0;
  const xpPct = nextRank
    ? Math.round(((stats.xp - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;

  const inProgressCert = CERTIFICATIONS.find((c) => items[c.slug]?.status === 'in_progress');
  const overallPct = Math.round((stats.completed / stats.total) * 100);

  return (
    <TierGate feature="career_certification">
      <SEOHead
        title="Career Certification — AI Career Operating System | DIM"
        description="AI-powered career certification hub. Track your prep across AWS, Microsoft, Google, Salesforce and DIM credentials, earn XP, and unlock career roles."
        canonicalUrl="/career-certification"
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/[0.02]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">

          {/* HERO */}
          <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-4 sm:p-6">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

            <div className="relative grid sm:grid-cols-3 gap-4 items-start">
              <div className="sm:col-span-2 space-y-2">
                <Badge variant="outline" className="border-primary/30 bg-background/50 backdrop-blur text-[10px] gap-1">
                  <Sparkles className="h-3 w-3" /> Career Tier
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome back, {firstName} 👋
                </h1>
                <p className="text-sm text-muted-foreground max-w-lg">
                  {inProgressCert
                    ? `You're ${items[inProgressCert.slug].progress_pct}% through ${inProgressCert.title}. Keep the streak alive.`
                    : 'Pick a certification to begin building your AI career roadmap.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="inline-flex items-center gap-1.5 text-sm">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold">{rank.name}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-sm">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{stats.xp.toLocaleString()} XP</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-sm">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold">{stats.started} active</span>
                  </div>
                </div>

                {nextRank && (
                  <div className="pt-3 space-y-1 max-w-sm">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{rank.name}</span>
                      <span>{xpToNext} XP to {nextRank.name}</span>
                    </div>
                    <Progress value={xpPct} className="h-1.5" />
                  </div>
                )}
              </div>

              {/* Overall ring */}
              <div className="bg-background/60 backdrop-blur border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Overall progress</span>
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="text-3xl font-bold">{overallPct}%</div>
                <Progress value={overallPct} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div>
                    <div className="text-sm font-bold">{stats.completed}</div>
                    <div className="text-[10px] text-muted-foreground">Done</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{stats.started - stats.completed}</div>
                    <div className="text-[10px] text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{stats.total}</div>
                    <div className="text-[10px] text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* JOB PLACEMENT CTA */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">AI Job Matching</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {stats.completed > 0
                    ? `Based on ${stats.completed} cert${stats.completed > 1 ? 's' : ''}, we've matched roles for you.`
                    : 'Complete certifications to unlock personalized role matches.'}
                </div>
              </div>
              <Button size="sm" className="h-8 text-xs" onClick={() => navigate('/career/job-matches')}>
                View matches
              </Button>
            </CardContent>
          </Card>

          {/* SKILLS GRAPH + ACHIEVEMENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkillsGraph />
            <AchievementsStrip />
          </div>

          {/* CATEGORIES */}
          {CERT_CATEGORIES.map((cat) => {
            const certs = getCertsByCategory(cat.id);
            return (
              <section key={cat.id} className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {cat.label}
                    </h2>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{certs.length} certs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {certs.map((c) => (
                    <CertificationCard
                      key={c.slug}
                      cert={c}
                      progress={items[c.slug]}
                      onStart={() => start(c.slug)}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {loading && (
            <div className="text-center text-xs text-muted-foreground py-4">Loading your progress…</div>
          )}
        </div>
      </div>
    </TierGate>
  );
};

export default CareerCertificationPage;
