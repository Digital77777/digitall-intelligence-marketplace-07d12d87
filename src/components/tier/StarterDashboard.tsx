import { BookOpen, Brain, Users, Sparkles, GraduationCap, PlayCircle, HeadphonesIcon, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TierHero } from './shared/TierHero';
import { FeatureCard } from './shared/FeatureCard';
import { BenefitsList } from './shared/BenefitsList';
import { QuickStats } from './shared/QuickStats';
import { supabase } from '@/integrations/supabase/client';

export const StarterDashboard = () => {
  const navigate = useNavigate();
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchMemberCount = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setMemberCount(count);
    };
    fetchMemberCount();
  }, []);

  const benefits = [
    "Access to 3 essential AI learning tools",
    "Foundation-level courses and tutorials",
    "Browse and purchase from marketplace",
    "Community discussion forums",
    "Basic learning path recommendations",
    "Progress tracking dashboard",
    "Email support within 48 hours"
  ];

  const stats = [
    { value: "3", label: "AI Tools", icon: <Brain className="h-6 w-6 text-primary" /> },
    { value: "10+", label: "Free Courses", icon: <GraduationCap className="h-6 w-6 text-primary" /> },
    { value: memberCount !== null ? memberCount.toLocaleString() : "...", label: "Community Members", icon: <Users className="h-6 w-6 text-primary" /> }
  ];

  return (
    <div className="space-y-8">
      <TierHero 
        title="Start Your AI Journey"
        subtitle="Perfect for beginners ready to explore the world of artificial intelligence"
        icon={<Sparkles className="h-16 w-16 text-primary" />}
        gradient="learning"
      />

      <QuickStats stats={stats} />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">What You Get</h2>
        <BenefitsList benefits={benefits} columns={2} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Start Learning Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<BookOpen className="h-10 w-10 text-primary" />}
            title="Learning Paths"
            description="Begin with curated courses designed for AI beginners"
            buttonText="Explore Courses"
            onClick={() => navigate('/learning-paths')}
            variant="highlighted"
          />

          <FeatureCard
            icon={<Brain className="h-10 w-10 text-primary" />}
            title="Basic AI Tools"
            description="Get hands-on with 3 powerful AI tools"
            buttonText="Try Tools"
            onClick={() => navigate('/ai-tools')}
            variant="highlighted"
          />

          <FeatureCard
            icon={<Store className="h-10 w-10 text-primary" />}
            title="Marketplace"
            description="Browse and purchase AI tools and resources"
            buttonText="Browse"
            onClick={() => navigate('/marketplace')}
            variant="highlighted"
          />

          <FeatureCard
            icon={<Users className="h-10 w-10 text-primary" />}
            title="Join Community"
            description="Connect with fellow learners and share experiences"
            buttonText="Join Now"
            onClick={() => navigate('/community')}
            variant="default"
          />
        </div>
      </div>

      <div className="bg-card border border-border p-8 rounded-lg text-center">
        <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
        <p className="text-muted-foreground mb-4">Get email support within 48 hours from our team</p>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/support')}
        >
          Get Support
        </Button>
      </div>

      <div className="bg-gradient-learning p-8 rounded-lg text-center text-primary-foreground">
        <PlayCircle className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Ready to Level Up?</h3>
        <p className="mb-4 opacity-90">Upgrade to Creator or Career tier for more tools and earning opportunities</p>
        <Button 
          variant="secondary" 
          size="lg"
          onClick={() => navigate('/subscription')}
          className="mt-4"
        >
          View Upgrade Options
        </Button>
      </div>
    </div>
  );
};
