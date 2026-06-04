import { Brain, Store, Gift, TrendingUp, Sparkles, Hammer, Rocket, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TierHero } from './shared/TierHero';
import { FeatureCard } from './shared/FeatureCard';
import { BenefitsList } from './shared/BenefitsList';
import { QuickStats } from './shared/QuickStats';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) { setChecked(true); return; }
      const { data } = await (supabase as any).from('creator_profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile(data);
      setChecked(true);
    })();
  }, [user]);

  if (checked && !profile?.onboarding_completed) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Welcome to Creator Tier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Complete your 2-minute Creator Profile to unlock your personalized dashboard, AI recommendations, and Creator Tier features.</p>
          <Button size="lg" onClick={() => navigate('/creator/onboarding')}>
            Start Creator Onboarding <Sparkles className="h-4 w-4 ml-2" />
          </Button>
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

  return (
    <div className="space-y-8">
      <TierHero 
        title="Build Your AI Empire"
        subtitle="For creators ready to build, monetize, and grow with AI-powered tools"
        icon={<Hammer className="h-16 w-16 text-primary" />}
        gradient="ai"
      />

      {profile?.onboarding_completed && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Your Personalized Plan</span>
              <Badge variant="secondary">{profile.creator_category} · {profile.creator_score}/100</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
      )}

      <QuickStats stats={stats} />


      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Creator Benefits</h2>
        <BenefitsList benefits={benefits} columns={2} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Your Creation Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Brain className="h-10 w-10 text-primary" />}
            title="Advanced AI Tools"
            description="7 powerful AI tools to build anything you imagine"
            buttonText="Launch Tools"
            onClick={() => navigate('/ai-tools')}
            variant="premium"
          />

          <FeatureCard
            icon={<Store className="h-10 w-10 text-primary" />}
            title="Marketplace"
            description="Sell your AI-powered products and services"
            buttonText="Start Selling"
            onClick={() => navigate('/marketplace')}
            variant="premium"
          />

          <FeatureCard
            icon={<Gift className="h-10 w-10 text-primary" />}
            title="Referral Program"
            description="Earn recurring income by referring others"
            buttonText="Get Link"
            onClick={() => navigate('/referrals')}
            variant="highlighted"
          />

          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-primary" />}
            title="Analytics"
            description="Track your earnings and performance metrics"
            buttonText="View Stats"
            onClick={() => navigate('/dashboard')}
            variant="default"
          />

          <FeatureCard
            icon={<Sparkles className="h-10 w-10 text-primary" />}
            title="Creator Tools"
            description="Enhanced suite for professional creators"
            buttonText="Explore"
            onClick={() => navigate('/ai-tools')}
            variant="default"
          />

          <FeatureCard
            icon={<Rocket className="h-10 w-10 text-primary" />}
            title="Learning Hub"
            description="Advanced courses to level up your skills"
            buttonText="Learn More"
            onClick={() => navigate('/learning-paths')}
            variant="default"
          />
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
