import { useEffect, useMemo, useState } from 'react';
import { TierGate } from '@/components/tier/TierGate';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { CERTIFICATIONS, getCertBySlug } from '@/data/certifications';
import { Briefcase, Building2, GraduationCap, Search, Loader2, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Candidate {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  certs: { slug: string; status: string; progress_pct: number }[];
  skills: string[];
  readiness: number;
}

const RecruiterDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [certFilter, setCertFilter] = useState<string | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: progress } = await supabase
        .from('certification_progress')
        .select('user_id,cert_slug,status,progress_pct')
        .order('progress_pct', { ascending: false })
        .limit(500);

      const byUser = new Map<string, Candidate>();
      (progress || []).forEach((row: any) => {
        const cert = getCertBySlug(row.cert_slug);
        if (!cert) return;
        let c = byUser.get(row.user_id);
        if (!c) {
          c = {
            user_id: row.user_id,
            full_name: null,
            avatar_url: null,
            headline: null,
            certs: [],
            skills: [],
            readiness: 0,
          };
          byUser.set(row.user_id, c);
        }
        c.certs.push({ slug: row.cert_slug, status: row.status, progress_pct: row.progress_pct });
        if (row.status === 'completed' || row.progress_pct >= 50) {
          cert.skills.forEach((s) => { if (!c!.skills.includes(s)) c!.skills.push(s); });
        }
      });

      // Compute readiness
      byUser.forEach((c) => {
        const done = c.certs.filter((x) => x.status === 'completed').length;
        const avg = c.certs.reduce((s, x) => s + (x.progress_pct || 0), 0) / Math.max(1, c.certs.length);
        c.readiness = Math.min(100, Math.round(done * 18 + avg * 0.5));
      });

      const ids = Array.from(byUser.keys()).slice(0, 50);
      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id,full_name,avatar_url,headline')
          .in('user_id', ids);
        (profiles || []).forEach((p: any) => {
          const c = byUser.get(p.user_id);
          if (c) {
            c.full_name = p.full_name;
            c.avatar_url = p.avatar_url;
            c.headline = p.headline;
          }
        });
      }

      setCandidates(Array.from(byUser.values()).sort((a, b) => b.readiness - a.readiness));
      setLoading(false);
    };
    load();
  }, []);

  const allSkills = useMemo(() => {
    const s = new Set<string>();
    candidates.forEach((c) => c.skills.forEach((x) => s.add(x)));
    return Array.from(s).sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (search && !((c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.headline || '').toLowerCase().includes(search.toLowerCase()))) return false;
      if (certFilter !== 'all' && !c.certs.some((x) => x.slug === certFilter && x.status === 'completed')) return false;
      if (skillFilter && !c.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))) return false;
      return true;
    });
  }, [candidates, search, certFilter, skillFilter]);

  return (
    <TierGate feature="career_certification">
      <SEOHead
        title="Recruiter Dashboard — Hire AI-Certified Talent | DIM"
        description="Post jobs and search certified AI talent. Filter candidates by certification, skills, and readiness score."
        canonicalUrl="/career/recruiter"
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5">

          <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <Badge variant="outline" className="border-primary/30 bg-background/50 text-[10px] gap-1 mb-2">
                  <Building2 className="h-3 w-3" /> Recruiter / Company
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hire AI-certified talent</h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Filter by certification, skills, and readiness score. Post jobs and reach a curated pool of AI-ready candidates.
                </p>
              </div>
              <Button size="sm" className="h-9 gap-1.5" asChild>
                <Link to="/create-job-posting"><Plus className="h-4 w-4" /> Post a job</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="rounded-lg border bg-background/60 p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Candidates</div>
                <div className="text-xl font-bold tabular-nums">{candidates.length}</div>
              </div>
              <div className="rounded-lg border bg-background/60 p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Certifications</div>
                <div className="text-xl font-bold tabular-nums">{CERTIFICATIONS.length}</div>
              </div>
              <div className="rounded-lg border bg-background/60 p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg readiness</div>
                <div className="text-xl font-bold tabular-nums">
                  {candidates.length === 0
                    ? 0
                    : Math.round(candidates.reduce((s, c) => s + c.readiness, 0) / candidates.length)}
                </div>
              </div>
            </div>
          </section>

          {/* Filters */}
          <Card>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or headline…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <select
                value={certFilter}
                onChange={(e) => setCertFilter(e.target.value as any)}
                className="h-9 border rounded-md bg-background px-3 text-sm"
              >
                <option value="all">All certifications</option>
                {CERTIFICATIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
              <Input
                placeholder="Filter by skill…"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="h-9"
                list="skills-list"
              />
              <datalist id="skills-list">
                {allSkills.map((s) => <option key={s} value={s} />)}
              </datalist>
            </CardContent>
          </Card>

          {/* Candidate grid */}
          {loading ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Loading certified candidates…
            </div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
              <Users className="h-6 w-6 mx-auto mb-2" />
              No candidates match these filters yet.
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((c) => (
                <Card key={c.user_id} className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold uppercase">
                        {(c.full_name || 'A').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{c.full_name || 'Anonymous candidate'}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{c.headline || 'AI Learner'}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold tabular-nums text-primary">{c.readiness}</div>
                        <div className="text-[10px] text-muted-foreground">readiness</div>
                      </div>
                    </div>

                    <Progress value={c.readiness} className="h-1.5" />

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> Certifications
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.certs.slice(0, 4).map((x) => {
                          const cert = getCertBySlug(x.slug);
                          return (
                            <Badge key={x.slug} variant={x.status === 'completed' ? 'default' : 'outline'} className="text-[10px]">
                              {cert?.providerCode} · {x.progress_pct}%
                            </Badge>
                          );
                        })}
                        {c.certs.length > 4 && <Badge variant="outline" className="text-[10px]">+{c.certs.length - 4}</Badge>}
                      </div>
                    </div>

                    {c.skills.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Skills</div>
                        <div className="flex flex-wrap gap-1">
                          {c.skills.slice(0, 6).map((s) => (
                            <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                          ))}
                          {c.skills.length > 6 && <Badge variant="outline" className="text-[10px]">+{c.skills.length - 6}</Badge>}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="h-8 text-xs flex-1" asChild>
                        <Link to={`/profile/${c.user_id}`}>View profile</Link>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                        <Briefcase className="h-3 w-3" /> Invite
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TierGate>
  );
};

export default RecruiterDashboardPage;
