import { Brain, Store, Gift, TrendingUp, Sparkles, Hammer, Rocket, DollarSign, Lock, Edit3, RefreshCw, Loader2, CheckCircle2, Award, Zap, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TierHero } from './shared/TierHero';
import { FeatureCard } from './shared/FeatureCard';
import { BenefitsList } from './shared/BenefitsList';
import { QuickStats } from './shared/QuickStats';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTier } from '@/contexts/TierContext';
import { useCreatorProfile } from '@/hooks/useCreatorProfile';
import { toast } from 'sonner';

export const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tierName } = useTier();
  const { profile, loading, refresh, completion } = useCreatorProfile();
  const [regenerating, setRegenerating] = useState(false);

  // Subscription gate — only Creator/Career may use this dashboard's onboarding
  const hasCreatorSubscription = tierName === 'creator' || tierName === 'career';
  const fullyUnlocked = hasCreatorSubscription && !!profile?.onboarding_completed;

  const regenerateRecommendations = async () => {
    if (!user || !profile) return;
    setRegenerating(true);
    try {
      const payload = {
        creator_type: profile.creator_type,
        project_details: profile.project_details,
        goals: profile.goals,
        business_stage: profile.business_stage,
        revenue_stage: profile.revenue_stage,
        skills: profile.skills,
      };
      const { data: ai, error: aiErr } = await supabase.functions.invoke('creator-onboarding-ai', { body: payload });
      if (aiErr) throw new Error(aiErr.message);
      if (!ai || (ai as any).error) throw new Error((ai as any)?.error || 'AI failed');
      const r = ai as any;
      const { error: upErr } = await (supabase as any).from('creator_profiles').update({
        creator_category: r.creator_category,
        creator_score: r.creator_score,
        ai_summary: r.ai_summary,
        recommended_paths: r.recommended_paths,
        recommended_marketplace: r.recommended_marketplace,
        recommended_communities: r.recommended_communities,
        growth_opportunities: r.growth_opportunities,
        dashboard_config: r.dashboard_config,
      }).eq('user_id', user.id);
      if (upErr) throw upErr;
      await refresh();
      toast.success('AI recommendations regenerated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to regenerate');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Onboarding not completed — show progress card with %
  if (!profile?.onboarding_completed) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Welcome to Creator Tier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Complete your Creator Profile to unlock your personalized dashboard, AI recommendations, and all Creator Tier features.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Onboarding progress</span>
              <span className="font-medium">{completion.percent}% · {completion.filled}/{completion.total} steps</span>
            </div>
            <Progress value={completion.percent} className="h-2" />
          </div>
          {!hasCreatorSubscription ? (
            <Button size="lg" onClick={() => navigate('/subscription')}>
              <Lock className="h-4 w-4 mr-2" /> Subscribe to Creator Tier (R95/mo)
            </Button>
          ) : (
            <Button size="lg" onClick={() => navigate('/creator/onboarding')}>
              {completion.percent > 0 ? 'Continue Onboarding' : 'Start Creator Onboarding'} <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const benefits = [
    "Access to 7 advanced AI creation tools",
    "List up to 5 products in marketplace",
    "Referral program with enhanced rewards",
    "Creator analytics dashboard",
    "Advanced learning materials",
    "Priority email support within 24 hours",
    "Community featured creator badge",
    "Monthly creator webinars"
  ];

  const stats = [
    { value: "7", label: "AI Tools", icon: <Brain className="h-6 w-6 text-primary" /> },
    { value: "5", label: "Marketplace Listings", icon: <Store className="h-6 w-6 text-primary" /> },
    { value: "15%", label: "Referral Commission", icon: <DollarSign className="h-6 w-6 text-primary" /> }
  ];

  const completedAt = profile.updated_at ? new Date(profile.updated_at) : null;

  const LockedCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <Card className="opacity-60 border-dashed">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          {icon}
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardTitle className="text-base mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <Button size="sm" variant="outline" className="w-full" onClick={() => navigate('/subscription')} disabled={!hasCreatorSubscription}>
          {hasCreatorSubscription ? 'Locked' : 'Upgrade to unlock'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderFeature = (
    icon: React.ReactNode,
    title: string,
    description: string,
    buttonText: string,
    route: string,
    variant: 'premium' | 'highlighted' | 'default' = 'default',
  ) => fullyUnlocked
    ? <FeatureCard icon={icon} title={title} description={description} buttonText={buttonText} onClick={() => navigate(route)} variant={variant} />
    : <LockedCard icon={icon} title={title} description={description} />;

  return (
    <div className="space-y-8">
      <TierHero 
        title="Build Your AI Empire"
        subtitle="For creators ready to build, monetize, and grow with AI-powered tools"
        icon={<Hammer className="h-16 w-16 text-primary" />}
        gradient="ai"
      />

      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Your Personalized Plan</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{profile.creator_category} · {profile.creator_score}/100</Badge>
              <Button size="sm" variant="outline" onClick={() => navigate('/creator/onboarding?edit=1')}>
                <Edit3 className="h-3 w-3 mr-1" /> Edit Profile
              </Button>
              <Button size="sm" variant="outline" onClick={regenerateRecommendations} disabled={regenerating}>
                {regenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                Regenerate AI
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-primary" /> Onboarding {completion.percent}% complete
              </span>
              {completedAt && (
                <span className="text-muted-foreground">Completed {completedAt.toLocaleDateString()} · {completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
            <Progress value={completion.percent} className="h-1.5" />
          </div>

          {profile.ai_summary && <p className="text-sm text-muted-foreground">{profile.ai_summary}</p>}
          {Array.isArray(profile.recommended_paths) && profile.recommended_paths.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1 text-muted-foreground">Recommended Learning Paths</div>
              <div className="flex flex-wrap gap-2">
                {profile.recommended_paths.slice(0, 4).map((p: any, i: number) => <Badge key={i} variant="outline">{p.title}</Badge>)}
              </div>
            </div>
          )}
          {Array.isArray(profile.growth_opportunities) && profile.growth_opportunities.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1 text-muted-foreground">Growth Opportunities</div>
              <div className="flex flex-wrap gap-2">
                {profile.growth_opportunities.slice(0, 4).map((g: any, i: number) => <Badge key={i} variant="outline">{g.name}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <QuickStats stats={stats} />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Creator Benefits</h2>
        <BenefitsList benefits={benefits} columns={2} />
      </div>

      <div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-center">Your Creation Hub</h2>
          {fullyUnlocked && <Badge variant="secondary" className="ml-2"><CheckCircle2 className="h-3 w-3 mr-1" />All unlocked</Badge>}
        </div>
        {!fullyUnlocked && (
          <p className="text-center text-xs text-muted-foreground mb-6">
            {!hasCreatorSubscription ? 'Subscribe to Creator Tier to unlock all features.' : 'Complete onboarding to unlock all features.'}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderFeature(<Brain className="h-10 w-10 text-primary" />, "Advanced AI Tools", "7 powerful AI tools to build anything you imagine", "Launch Tools", '/ai-tools', 'premium')}
          {renderFeature(<Store className="h-10 w-10 text-primary" />, "Priority Marketplace Listings", "Sell your AI-powered products with priority placement", "Start Selling", '/marketplace', 'premium')}
          {renderFeature(<Gift className="h-10 w-10 text-primary" />, "15% Referral Commission", "Earn recurring income by referring others", "Get Link", '/referrals', 'highlighted')}
          {renderFeature(<TrendingUp className="h-10 w-10 text-primary" />, "Analytics Dashboard", "Track your earnings and performance metrics", "View Stats", '/analytics')}
          {renderFeature(<DollarSign className="h-10 w-10 text-primary" />, "Revenue Tracking", "Monitor earnings across products and referrals", "Open", '/analytics')}
          {renderFeature(<Sparkles className="h-10 w-10 text-primary" />, "Growth Insights", "AI-driven recommendations to scale", "Explore", '/growth')}
          {renderFeature(<Trophy className="h-10 w-10 text-primary" />, "Creator Challenges", "Compete, win prizes, build reputation", "Join", '/growth/quests')}
          {renderFeature(<Award className="h-10 w-10 text-primary" />, "Creator Badge", "Featured creator badge across the platform", "View", '/profile')}
          {renderFeature(<Zap className="h-10 w-10 text-primary" />, "Early Access Features", "First access to new tools and beta releases", "Explore", '/ai-tools')}
          {renderFeature(<Rocket className="h-10 w-10 text-primary" />, "Learning Hub", "Advanced courses to level up your skills", "Learn More", '/learning-paths')}
        </div>
      </div>

      <div className="bg-gradient-ai p-8 rounded-lg text-center text-primary-foreground">
        <Sparkles className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">You're Creating Magic</h3>
        <p className="mb-4 opacity-90">Join thousands of creators building and earning with AI</p>
        <Button 
          variant="secondary" 
          size="lg"
          onClick={() => navigate('/subscription')}
          className="mt-4"
        >
          Unlock Career Tier
        </Button>
      </div>
    </div>
  );
};
