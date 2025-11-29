import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NewHeroSection from "@/components/NewHeroSection";
import Footer from "@/components/Footer";
import { WhatsAppReferralButton } from "@/components/WhatsAppReferralButton";
import { useAuth } from "@/hooks/useAuth";
import { useTier } from "@/contexts/TierContext";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user } = useAuth();
  const { tierName, loading } = useTier();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to their tier-specific dashboard
    if (user && !loading && tierName) {
      navigate('/dashboard');
    }
  }, [user, tierName, loading, navigate]);

  // Show loading state while checking authentication
  if (user && loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
    );
  }

  // Show standard landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Learning Platform - Learn, Build & Earn with AI</title>
        <meta name="description" content="Empowering the next generation with AI skills through interactive learning paths, professional tools, and real earning opportunities." />
      </Helmet>
      <NewHeroSection />
      <Footer />
      <WhatsAppReferralButton />
    </div>
  );
};

export default Index;
