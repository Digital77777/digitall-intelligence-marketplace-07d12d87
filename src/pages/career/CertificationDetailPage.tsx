import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TierGate } from '@/components/tier/TierGate';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCertBySlug } from '@/data/certifications';
import { useCertificationProgress } from '@/hooks/useCertificationProgress';
import {
  ArrowLeft, ExternalLink, Award, CheckCircle2, Clock, TrendingUp,
  BookOpen, Briefcase, Users, Target, Sparkles, Save,
} from 'lucide-react';
import { toast } from 'sonner';

const CertificationDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const cert = slug ? getCertBySlug(slug) : undefined;
  const { items, start, updateProgress, saveNotes } = useCertificationProgress();
  const progress = slug ? items[slug] : undefined;

  const [notes, setNotes] = useState('');
  const [checkedModules, setCheckedModules] = useState<boolean[]>([]);

  useEffect(() => {
    if (cert) setCheckedModules(new Array(cert.modules.length).fill(false));
  }, [cert]);

  useEffect(() => {
    if (progress?.prep_notes) setNotes(progress.prep_notes);
  }, [progress?.prep_notes]);

  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Certification not found.</p>
          <Button onClick={() => navigate('/career-certification')}>Back to catalog</Button>
        </div>
      </div>
    );
  }

  const status = progress?.status || 'not_started';
  const pct = progress?.progress_pct || 0;
  const isDone = status === 'completed';

  const toggleModule = (i: number) => {
    const next = [...checkedModules];
    next[i] = !next[i];
    setCheckedModules(next);
    const done = next.filter(Boolean).length;
    const newPct = Math.round((done / next.length) * 100);
    updateProgress(cert.slug, newPct);
  };

  const markComplete = () => {
    updateProgress(cert.slug, 100);
    toast.success(`🎉 ${cert.title} marked complete! +500 XP`);
  };

  return (
    <TierGate feature="career_certification">
      <SEOHead
        title={`${cert.title} — Career Certification | DIM`}
        description={cert.summary}
        canonicalUrl={`/career-certification/${cert.slug}`}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">

          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate('/career-certification')}>
            <ArrowLeft className="h-4 w-4" /> All certifications
          </Button>

          {/* HEADER */}
          <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-4 sm:p-6">
            <div className="grid sm:grid-cols-[auto,1fr,auto] gap-4 items-start">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                {cert.providerCode}
              </div>
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">{cert.provider}</span>
                  <Badge variant="outline" className="text-[10px]">{cert.difficulty}</Badge>
                  {isDone && (
                    <Badge className="text-[10px] bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">{cert.title}</h1>
                <p className="text-sm text-muted-foreground">{cert.summary}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{cert.duration}</span>
                  <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />{cert.salary}</span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 sm:min-w-[140px]">
                {status === 'not_started' ? (
                  <Button size="sm" className="gap-1.5 flex-1" onClick={() => start(cert.slug)}>
                    <Sparkles className="h-4 w-4" /> Start Prep
                  </Button>
                ) : !isDone ? (
                  <Button size="sm" className="gap-1.5 flex-1" onClick={markComplete}>
                    <Award className="h-4 w-4" /> Mark Complete
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1" disabled>
                    <Award className="h-4 w-4" /> Earned
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-1.5 flex-1" asChild>
                  <a href={cert.examUrl} target="_blank" rel="noopener noreferrer">
                    Official <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>

            {status !== 'not_started' && (
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Your prep progress</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            )}
          </section>

          {/* TABS */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="modules" className="text-xs">Prep Modules</TabsTrigger>
              <TabsTrigger value="outcomes" className="text-xs">Career Outcomes</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs">My Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> About this certification
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cert.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    DIM is your <span className="font-semibold text-foreground">prep platform</span>.
                    The official exam is delivered by <span className="font-semibold">{cert.provider}</span>.
                    Use the modules below to track your readiness, then book the exam directly with the provider.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Skills you'll gain
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cert.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="modules" className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Prep checklist</h3>
                  <p className="text-xs text-muted-foreground">Tick off as you study. Your progress auto-saves.</p>
                  <div className="space-y-2 pt-1">
                    {cert.modules.map((m, i) => (
                      <button
                        key={m}
                        onClick={() => toggleModule(i)}
                        className="w-full flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          checkedModules[i] ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                        }`}>
                          {checkedModules[i] && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                        </div>
                        <span className={`text-sm ${checkedModules[i] ? 'line-through text-muted-foreground' : ''}`}>
                          {m}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> Roles this unlocks
                  </h3>
                  <div className="grid gap-2">
                    {cert.outcomes.map((o) => (
                      <div key={o} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{o}</span>
                        </div>
                        <Link to="/job-placement" className="text-xs text-primary font-medium hover:underline">
                          Find jobs →
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground pt-1 inline-flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Salary range: <span className="font-semibold text-foreground">{cert.salary}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Your private study notes
                  </h3>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key concepts, exam tips, weak areas…"
                    className="min-h-[180px] text-sm"
                  />
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => { saveNotes(cert.slug, notes); toast.success('Notes saved'); }}
                  >
                    <Save className="h-4 w-4" /> Save notes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TierGate>
  );
};

export default CertificationDetailPage;
