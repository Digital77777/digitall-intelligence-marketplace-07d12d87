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
