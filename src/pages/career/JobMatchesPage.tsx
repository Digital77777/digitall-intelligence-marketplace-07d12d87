import { useMemo, useState } from 'react';
import { TierGate } from '@/components/tier/TierGate';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Briefcase, RefreshCw, Loader2, AlertTriangle, Building2 } from 'lucide-react';
import { useJobMatches } from '@/hooks/useJobMatches';
import { SkillsGraph } from '@/components/career/SkillsGraph';
import { AchievementsStrip } from '@/components/career/AchievementsStrip';
import { JobMatchCard } from '@/components/career/JobMatchCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'full_time', label: 'Full-time' },
  { id: 'freelance', label: 'Freelance' },
  { id: 'internship', label: 'Internships' },
  { id: 'gig', label: 'Gigs' },
];

const JobMatchesPage = () => {
  const { matches, loading, error, refresh, candidate } = useJobMatches();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => (filter === 'all' ? matches : matches.filter((m) => m.opportunity.type === filter)),
    [filter, matches]
  );

  const topMatch = matches[0];

  return (
    <TierGate feature="career_certification">
      <SEOHead
        title="AI Job Matches — Recommended for You | DIM"
        description="Personalized AI job, freelance, internship and gig matches based on your certifications, skills, and learning progress."
        canonicalUrl="/career/job-matches"
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/[0.02]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5">

          {/* HERO */}
          <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <Badge variant="outline" className="border-primary/30 bg-background/50 text-[10px] gap-1 mb-2">
                  <Sparkles className="h-3 w-3" /> AI-matched for you
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Opportunities ready for your profile
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Ranked from your {candidate.completedCerts.length} completed and {candidate.inProgressCerts.length} in-progress
                  certifications, {candidate.skills.length} skills, and {candidate.xp} XP.
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1" asChild>
                  <Link to="/career/recruiter"><Building2 className="h-3.5 w-3.5" /> Recruiter view</Link>
                </Button>
                <Button size="sm" className="h-8 text-xs gap-1" onClick={refresh} disabled={loading}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Re-match
                </Button>
              </div>
            </div>
          </section>

          {/* LEFT/RIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <div className="space-y-4 min-w-0">
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="w-full grid grid-cols-5 h-9">
                  {filters.map((f) => (
                    <TabsTrigger key={f.id} value={f.id} className="text-xs">{f.label}</TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={filter} className="mt-4 space-y-3">
                  {loading && matches.length === 0 && (
                    <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Analyzing your profile and matching opportunities…
                    </CardContent></Card>
                  )}

                  {error && (
                    <Card className="border-destructive/40">
                      <CardContent className="p-4 flex items-start gap-3 text-sm">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold">Matching failed</div>
                          <div className="text-xs text-muted-foreground mb-2">{error}</div>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={refresh}>Retry</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!loading && !error && filtered.length === 0 && (
                    <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
                      <Briefcase className="h-5 w-5 mx-auto mb-2" />
                      No opportunities for this filter yet. Complete more certifications to unlock matches.
                    </CardContent></Card>
                  )}

                  {filtered.map((m) => <JobMatchCard key={m.opportunityId} m={m} />)}
                </TabsContent>
              </Tabs>
            </div>

            {/* RIGHT RAIL */}
            <aside className="space-y-4">
              {topMatch && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4 space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Top match</div>
                    <div className="text-3xl font-bold tabular-nums text-primary">{topMatch.match}%</div>
                    <div className="text-sm font-semibold leading-tight">{topMatch.opportunity.title}</div>
                    <div className="text-[11px] text-muted-foreground">{topMatch.opportunity.company}</div>
                  </CardContent>
                </Card>
              )}
              <SkillsGraph />
              <AchievementsStrip />
            </aside>
          </div>
        </div>
      </div>
    </TierGate>
  );
};

export default JobMatchesPage;
