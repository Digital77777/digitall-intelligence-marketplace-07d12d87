import { LoyaltyProgramsSection } from '@/components/loyalty/LoyaltyProgramsSection';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

export default function ReferralPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEOHead 
        title="Loyalty & Growth Programs - DIM"
        description="Unlock rewards, perks, and recognition as you learn, create, and grow. Join DIM's comprehensive loyalty programs for learners, creators, and community heroes."
        keywords={["loyalty program", "rewards", "learning rewards", "creator rewards", "community rewards", "AI learning"]}
      />
      <LoyaltyProgramsSection />
    </div>
  );
}