import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTier } from '@/contexts/TierContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';

const CREATOR_TYPES = ['Founder', 'Developer', 'Designer', 'Educator', 'Marketer', 'Researcher', 'Agency', 'Other'];
const BUSINESS_STAGES = ['Idea', 'Building', 'Pre-launch', 'Launched', 'Scaling'];
const REVENUE_STAGES = ['Pre-revenue', '<R5k/mo', 'R5k-R50k/mo', 'R50k-R500k/mo', 'R500k+/mo'];
const GOALS = ['Build a product', 'Earn revenue', 'Grow audience', 'Land clients', 'Learn AI', 'Build authority', 'Hire team'];
const SKILLS = ['Prompt Engineering', 'Coding', 'Design', 'Marketing', 'Sales', 'Writing', 'Data', 'Video', 'Automation', 'No-code'];

type Recs = {
  creator_category: string;
  creator_score: number;
  ai_summary: string;
  recommended_paths: { title: string; reason: string }[];
  recommended_marketplace: { category: string; reason: string }[];
  recommended_communities: { group: string; reason: string }[];
  growth_opportunities: { name: string; reason: string }[];
  dashboard_config: { primary_focus: string; widgets: string[]; next_action: string };
};

export default function CreatorOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tierName, loading: tierLoading } = useTier();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [recs, setRecs] = useState<Recs | null>(null);

  const [creatorType, setCreatorType] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [businessStage, setBusinessStage] = useState('');
  const [revenueStage, setRevenueStage] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Redirect non-creator users away
  useEffect(() => {
    if (!tierLoading && tierName && tierName !== 'creator' && tierName !== 'career') {
      navigate('/subscription');
    }
  }, [tierName, tierLoading, navigate]);

  // If already completed, send to dashboard
  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from('creator_profiles').select('onboarding_completed').eq('user_id', user.id).maybeSingle();
      if (data?.onboarding_completed) navigate('/dashboard');
    })();
  }, [user, navigate]);

  const steps = [
    { title: 'Creator Type', desc: 'Which best describes you?' },
    { title: 'Project Details', desc: 'Tell us what you are building' },
    { title: 'Goals', desc: 'What do you want to achieve?' },
    { title: 'Business Stage', desc: 'Where are you in your journey?' },
    { title: 'Revenue', desc: 'Current monthly revenue' },
    { title: 'Skills', desc: 'What you bring to the table' },
    { title: 'Review', desc: 'Confirm and personalize' },
  ];

  const toggleArr = (arr: string[], val: string, setter: (v: string[]) => void) =>
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const canNext = () => {
    switch (step) {
      case 0: return !!creatorType;
      case 1: return projectName.trim().length > 1 && projectDescription.trim().length > 4;
      case 2: return goals.length > 0;
      case 3: return !!businessStage;
      case 4: return !!revenueStage;
      case 5: return skills.length > 0;
      default: return true;
    }
  };

  const submit = async () => {
    if (!user) { toast.error('Please sign in'); return; }
    setSubmitting(true);
    try {
      const payload = {
        creator_type: creatorType,
        project_details: { name: projectName, description: projectDescription, url: projectUrl },
        goals,
        business_stage: businessStage,
        revenue_stage: revenueStage,
        skills,
      };

      const { data: ai, error: aiErr } = await supabase.functions.invoke('creator-onboarding-ai', { body: payload });
      if (aiErr || !ai || ai.error) throw new Error(ai?.error || aiErr?.message || 'AI failed');

      const recommendations = ai as Recs;

      const { error: upErr } = await supabase.from('creator_profiles').upsert({
        user_id: user.id,
        ...payload,
        creator_category: recommendations.creator_category,
        creator_score: recommendations.creator_score,
        ai_summary: recommendations.ai_summary,
        recommended_paths: recommendations.recommended_paths,
        recommended_marketplace: recommendations.recommended_marketplace,
        recommended_communities: recommendations.recommended_communities,
        growth_opportunities: recommendations.growth_opportunities,
        dashboard_config: recommendations.dashboard_config,
        onboarding_completed: true,
      }, { onConflict: 'user_id' });
      if (upErr) throw upErr;

      setRecs(recommendations);
      toast.success('Creator Tier unlocked!');
    } catch (e: any) {
      toast.error(e?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (recs) {
    return (
      <div className="min-h-screen bg-background py-12 animate-fade-in">
        <SEOHead title="Welcome to Creator Tier" description="Your personalized Creator Tier dashboard" />
        <div className="container mx-auto px-6 max-w-3xl space-y-6">
          <div className="text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Welcome, {recs.creator_category}</h1>
            <p className="text-muted-foreground">{recs.ai_summary}</p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">Creator Score: {recs.creator_score}/100</Badge>
              <Badge>Focus: {recs.dashboard_config.primary_focus}</Badge>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Recommended Learning Paths</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recs.recommended_paths.map((p, i) => (
                <div key={i} className="text-sm border rounded p-3"><strong>{p.title}</strong> — <span className="text-muted-foreground">{p.reason}</span></div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Marketplace Categories</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {recs.recommended_marketplace.map((m, i) => <Badge key={i} variant="outline">{m.category}</Badge>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Community Groups</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {recs.recommended_communities.map((c, i) => <Badge key={i} variant="outline">{c.group}</Badge>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Growth Opportunities</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recs.growth_opportunities.map((g, i) => (
                <div key={i} className="text-sm"><strong>{g.name}</strong> — <span className="text-muted-foreground">{g.reason}</span></div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/30">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" />Creator Tier Unlocked</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm grid grid-cols-2 gap-2">
                <li>✓ Analytics Dashboard</li>
                <li>✓ 15% Referral Commission</li>
                <li>✓ Creator Badge</li>
                <li>✓ Priority Marketplace Listings</li>
                <li>✓ Revenue Tracking</li>
                <li>✓ Growth Insights</li>
                <li>✓ Creator Challenges</li>
                <li>✓ Early Access Features</li>
              </ul>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={() => navigate('/dashboard')}>
            Go to my Creator Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background py-12 animate-fade-in">
      <SEOHead title="Creator Onboarding" description="Set up your DIM Creator Tier profile" />
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{steps[step].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[step].title}</CardTitle>
            <p className="text-sm text-muted-foreground">{steps[step].desc}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <div className="grid grid-cols-2 gap-2">
                {CREATOR_TYPES.map((t) => (
                  <Button key={t} type="button" variant={creatorType === t ? 'default' : 'outline'} onClick={() => setCreatorType(t)}>{t}</Button>
                ))}
              </div>
            )}
            {step === 1 && (
              <>
                <div><Label>Project name</Label><Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. SnapBuilder" maxLength={120} /></div>
                <div><Label>Description</Label><Textarea value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="What does it do? Who is it for?" maxLength={500} /></div>
                <div><Label>URL (optional)</Label><Input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://..." maxLength={250} /></div>
              </>
            )}
            {step === 2 && (
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <Button key={g} size="sm" type="button" variant={goals.includes(g) ? 'default' : 'outline'} onClick={() => toggleArr(goals, g, setGoals)}>{g}</Button>
                ))}
              </div>
            )}
            {step === 3 && (
              <div className="grid grid-cols-2 gap-2">
                {BUSINESS_STAGES.map((s) => (
                  <Button key={s} type="button" variant={businessStage === s ? 'default' : 'outline'} onClick={() => setBusinessStage(s)}>{s}</Button>
                ))}
              </div>
            )}
            {step === 4 && (
              <div className="grid grid-cols-1 gap-2">
                {REVENUE_STAGES.map((r) => (
                  <Button key={r} type="button" variant={revenueStage === r ? 'default' : 'outline'} onClick={() => setRevenueStage(r)}>{r}</Button>
                ))}
              </div>
            )}
            {step === 5 && (
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <Button key={s} size="sm" type="button" variant={skills.includes(s) ? 'default' : 'outline'} onClick={() => toggleArr(skills, s, setSkills)}>{s}</Button>
                ))}
              </div>
            )}
            {step === 6 && (
              <div className="space-y-2 text-sm">
                <div><strong>Type:</strong> {creatorType}</div>
                <div><strong>Project:</strong> {projectName}</div>
                <div><strong>Goals:</strong> {goals.join(', ')}</div>
                <div><strong>Stage:</strong> {businessStage} · {revenueStage}</div>
                <div><strong>Skills:</strong> {skills.join(', ')}</div>
                <p className="pt-2 text-muted-foreground">Submit to generate your personalized Creator Dashboard with AI.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Personalizing…</> : <><Sparkles className="h-4 w-4 mr-2" /> Unlock Creator Tier</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
