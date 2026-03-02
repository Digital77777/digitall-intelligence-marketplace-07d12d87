import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Brain, TrendingUp, Zap, Target, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
const NewHeroSection = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  useEffect(() => {
    const fetchUserCount = async () => {
      const {
        count
      } = await supabase.from('profiles').select('*', {
        count: 'exact',
        head: true
      });
      setUserCount(count);
    };
    fetchUserCount();

    // Subscribe to real-time changes
    const channel = supabase.channel('profiles-count-hero').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'profiles'
    }, () => setUserCount(prev => (prev ?? 0) + 1)).on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'profiles'
    }, () => setUserCount(prev => Math.max(0, (prev ?? 1) - 1))).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleNavigation = (path: string) => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate(path);
    }
  };
  return <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-12 md:py-16 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI-Powered Learning Platform</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight animate-fade-in">
            Learn, Build & Earn
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent [text-shadow:none] [-webkit-text-fill-color:transparent] [background-clip:text] [-webkit-background-clip:text] font-bold">
              with AI Technology
            </span>
          </h1>

          {/* Mission statement */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in leading-relaxed">
            Empowering the next generation with AI skills through interactive learning paths, 
            professional tools, and real earning opportunities. Start your journey today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2 animate-fade-in">
            <Button size="lg" onClick={() => handleNavigation("/learning-paths")} className="text-base px-6 py-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
              <Rocket className="w-5 h-5 mr-2" />
              Start Learning Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleNavigation("/ai-tools")} className="text-base px-6 py-5 border-2 hover:bg-accent/10 transition-all">
              <Zap className="w-5 h-5 mr-2" />
              Explore AI Tools
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 max-w-5xl mx-auto">
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">50+ AI Tools</h3>
              <p className="text-sm text-muted-foreground">
                Access professional-grade AI tools for development, design, and analysis
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-primary-glow">
                <Target className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Learning Paths</h3>
              <p className="text-sm text-muted-foreground">
                Structured courses from beginner to advanced levels with hands-on projects
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-primary-glow">
                <TrendingUp className="w-6 h-6 text-primary-foreground bg-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">100% Free Access</h3>
              <p className="text-sm text-muted-foreground">
                Start earning by building AI projects and offering your skills to others
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-8 text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{userCount !== null ? userCount.toLocaleString() : "..."}</div>
              <div className="text-sm">Active Learners</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">50+</div>
              <div className="text-sm">AI Tools</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-sm">Free Access</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default NewHeroSection;