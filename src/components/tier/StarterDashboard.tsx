import { BookOpen, Brain, Users, Sparkles, GraduationCap, PlayCircle, HeadphonesIcon, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TierHero } from './shared/TierHero';
import { FeatureCard } from './shared/FeatureCard';
import { useTier } from '@/contexts/TierContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Check } from 'lucide-react';

export const StarterDashboard = () => {
  const navigate = useNavigate();
  const { maxToolsAccess, maxListings } = useTier();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchMemberCount = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setMemberCount(count);
    };
    
    fetchMemberCount();

    const channel = supabase
      .channel('profiles-count')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        setMemberCount(prev => (prev ?? 0) + 1);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, () => {
        setMemberCount(prev => Math.max(0, (prev ?? 1) - 1));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const benefits = [
    `Access to ${maxToolsAccess} essential AI learning tools`,
    "Foundation-level courses and tutorials",
    "Browse and purchase from marketplace",
    `${maxListings} marketplace listing${maxListings !== 1 ? 's' : ''}`,
    "Community discussion forums",
    "Basic learning path recommendations",
    "Email support within 48 hours"
  ];

  const stats = [
    { value: String(maxToolsAccess), label: "AI Tools", icon: <Brain className="h-5 w-5 text-primary" /> },
    { value: "10+", label: "Free Courses", icon: <GraduationCap className="h-5 w-5 text-primary" /> },
    { value: memberCount !== null ? memberCount.toLocaleString() : "...", label: "Community Members", icon: <Users className="h-5 w-5 text-primary" /> }
  ];

  const featureCards = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Learning Paths",
      description: "Begin with curated courses designed for AI beginners",
      buttonText: "Explore Courses",
      onClick: () => navigate('/learning-paths'),
      variant: 'highlighted' as const,
    },
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "Basic AI Tools",
      description: `Get hands-on with ${maxToolsAccess} powerful AI tools`,
      buttonText: "Try Tools",
      onClick: () => navigate('/ai-tools'),
      variant: 'highlighted' as const,
    },
    {
      icon: <Store className="h-10 w-10 text-primary" />,
      title: "Marketplace",
      description: "Browse and purchase AI tools and resources",
      buttonText: "Browse",
      onClick: () => navigate('/marketplace'),
      variant: 'highlighted' as const,
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Join Community",
      description: "Connect with fellow learners and share experiences",
      buttonText: "Join Now",
      onClick: () => navigate('/community'),
      variant: 'default' as const,
    },
  ];

  if (isMobile) {
    return (
      <div className="space-y-5">
        {/* Compact Hero */}
        <TierHero 
          title="Start Your AI Journey"
          subtitle="Perfect for beginners ready to explore the world of artificial intelligence"
          icon={<Sparkles className="h-12 w-12 text-primary" />}
          gradient="learning"
        />

        {/* Stats as compact horizontal row */}
        <div className="flex gap-2">
          {stats.map((stat, i) => (
            <Card key={i} className="flex-1 p-3 text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-primary">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Benefits as 2-column card grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-center">What You Get</h2>
          <div className="grid grid-cols-2 gap-2">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-2.5 flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-foreground leading-tight">{benefit}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature cards as horizontal scroll */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-center">Start Learning Today</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
            {featureCards.map((card, i) => (
              <div key={i} className="min-w-[70vw] snap-start flex-shrink-0">
                <FeatureCard {...card} />
              </div>
            ))}
          </div>
        </div>

        {/* Support - horizontal scroll single card */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
          <Card className="min-w-[70vw] snap-start flex-shrink-0 p-4 text-center">
            <HeadphonesIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="text-base font-bold mb-1">Need Help?</h3>
            <p className="text-xs text-muted-foreground mb-3">Get email support within 48 hours from our team</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/support')}>
              Get Support
            </Button>
          </Card>
        </div>

        {/* Upgrade CTA - keep the same */}
        <div className="bg-gradient-learning p-6 rounded-lg text-center text-primary-foreground">
          <PlayCircle className="h-10 w-10 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Ready to Level Up?</h3>
          <p className="text-sm mb-3 opacity-90">Upgrade to Creator or Career tier for more tools and earning opportunities</p>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate('/subscription')}
          >
            View Upgrade Options
          </Button>
        </div>
      </div>
    );
  }

  // Desktop layout unchanged
  return (
    <div className="space-y-8">
      <TierHero 
        title="Start Your AI Journey"
        subtitle="Perfect for beginners ready to explore the world of artificial intelligence"
        icon={<Sparkles className="h-16 w-16 text-primary" />}
        gradient="learning"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 text-center hover:shadow-soft transition-shadow">
            <div className="flex justify-center mb-3">{stat.icon}</div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">What You Get</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-sm text-foreground">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Start Learning Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card, i) => (
            <FeatureCard key={i} {...card} />
          ))}
        </div>
      </div>

      <div className="bg-card border border-border p-8 rounded-lg text-center">
        <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
        <p className="text-muted-foreground mb-4">Get email support within 48 hours from our team</p>
        <Button variant="outline" size="lg" onClick={() => navigate('/support')}>
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
