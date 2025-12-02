
import { Brain, Zap, Sparkles, ArrowRight, Code2, Terminal, Wrench, ExternalLink, Trophy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AITool } from "@/types/aiTools";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToolCard } from "@/components/ai-tools/ToolCard";
import { FeatureHighlight } from "@/components/ai-tools/FeatureHighlight";
import { CategoryFilter } from "@/components/ai-tools/CategoryFilter";
import { ToolAccessBanner } from "@/components/tier/ToolAccessBanner";
import { useTier } from "@/contexts/TierContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";

const AIToolsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { maxToolsAccess, tierName } = useTier();

  const tools: AITool[] = [
    {
      id: 1,
      name: "Lovable.dev",
      title: "Lovable.dev",
      description: "Build full-stack web applications with AI assistance. Create, iterate, and deploy production-ready apps in minutes.",
      icon: Code2,
      category: "Development",
      features: ["AI-powered development", "Full-stack capabilities", "Instant deployment"],
      pricing: "Free",
      usage: "Free to start",
      gradient: "from-blue-500 to-cyan-500",
      route: "https://lovable.dev"
    },
    {
      id: 2,
      name: "Replit",
      title: "Replit",
      description: "Collaborative coding platform with instant execution. Write, run, and share code in 50+ programming languages.",
      icon: Terminal,
      category: "Development",
      features: ["Real-time collaboration", "Cloud IDE", "Instant hosting"],
      pricing: "Free",
      usage: "Free tier available",
      gradient: "from-purple-500 to-pink-500",
      route: "https://replit.com"
    },
    {
      id: 3,
      name: "Cursor",
      title: "Cursor",
      description: "AI-first code editor built for productivity. Write code faster with intelligent AI pair programming.",
      icon: Wrench,
      category: "Development",
      features: ["AI code completion", "Natural language editing", "Advanced refactoring"],
      pricing: "Free",
      usage: "Free trial available",
      gradient: "from-emerald-500 to-teal-500",
      route: "https://cursor.sh"
    }
  ];

  interface Challenge {
    id: number;
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    requiredTier: "starter" | "creator" | "career";
    points: number;
    tools: string[];
  }

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Build Your First Landing Page",
      description: "Create a responsive landing page for a fictional product using any of the available tools.",
      difficulty: "Beginner",
      requiredTier: "starter",
      points: 100,
      tools: ["Lovable.dev", "Replit"]
    },
    {
      id: 2,
      title: "AI-Powered Todo App",
      description: "Build a todo application with AI features like smart categorization or priority suggestions.",
      difficulty: "Intermediate",
      requiredTier: "creator",
      points: 250,
      tools: ["Lovable.dev", "Cursor"]
    },
    {
      id: 3,
      title: "Full-Stack E-commerce Platform",
      description: "Create a complete e-commerce solution with product listings, cart, and checkout functionality.",
      difficulty: "Advanced",
      requiredTier: "career",
      points: 500,
      tools: ["Lovable.dev", "Replit", "Cursor"]
    },
    {
      id: 4,
      title: "Interactive Portfolio Website",
      description: "Design and deploy a professional portfolio showcasing your projects and skills.",
      difficulty: "Beginner",
      requiredTier: "starter",
      points: 150,
      tools: ["Lovable.dev", "Replit"]
    },
    {
      id: 5,
      title: "Real-time Chat Application",
      description: "Build a chat app with real-time messaging, user authentication, and message history.",
      difficulty: "Advanced",
      requiredTier: "career",
      points: 400,
      tools: ["Lovable.dev", "Cursor"]
    }
  ];

  const categories: string[] = ["All", "Development", "Creative", "Analytics", "Communication", "Research", "Machine Learning"];

  const featureHighlights = [
    { title: "Lightning Fast", description: "Optimized for speed and efficiency to boost your productivity", icon: Zap },
    { title: "Intelligent", description: "Powered by the latest AI models and machine learning algorithms", icon: Brain },
    { title: "Easy to Use", description: "Intuitive interfaces designed for both beginners and experts", icon: Sparkles }
  ];

  const filteredTools = selectedCategory === "All" 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  // Limit tools based on tier (Starter: 2, Creator: 10, Career: unlimited)
  const accessibleTools = tierName === 'career' ? filteredTools : filteredTools.slice(0, maxToolsAccess);

  const handleTryTools = () => {
    console.log("Try tools free clicked");
  };

  const handleViewPricing = () => {
    console.log("View pricing clicked");
  };

  const handleTryTool = (tool: AITool) => {
    if (tool.route) {
      // Open external links in new tab
      if (tool.route.startsWith('http')) {
        window.open(tool.route, '_blank', 'noopener,noreferrer');
      } else {
        navigate(tool.route);
      }
    }
  };

  const canAccessChallenge = (challenge: Challenge) => {
    const tierHierarchy = { starter: 0, creator: 1, career: 2 };
    const currentTierLevel = tierHierarchy[tierName as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[challenge.requiredTier];
    return currentTierLevel >= requiredTierLevel;
  };

  const handleLearnMore = (toolId: number) => {
    console.log(`Learn more about tool ${toolId} clicked`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="AI Tools - Build Anything with AI"
        description="Access powerful AI development tools including Lovable.dev, Replit, and Cursor. Build websites, apps, and AI-powered projects with ease."
        keywords={["AI tools", "AI development", "Lovable.dev", "Replit", "Cursor", "code editor", "web development", "AI coding"]}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/10 rounded-full">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Latest AI Tools</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-ai bg-clip-text text-transparent">
                Build Anything with AI
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Access powerful development tools to create, code, and deploy your ideas. Build websites, apps, and AI-powered projects with ease.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-ai text-white hover:opacity-90" onClick={handleTryTools}>
                <Zap className="h-5 w-5 mr-2" />
                Try Tools Free
              </Button>
              <Button size="lg" variant="outline" onClick={handleViewPricing}>
                View Pricing
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ToolAccessBanner />

      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Tools Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {accessibleTools.map((tool) => (
              <ToolCard
                key={tool.id}
                {...tool}
                onTryTool={() => handleTryTool(tool)}
                onLearnMore={() => handleLearnMore(tool.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Build & Compete</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Challenges</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join challenges to build real projects, showcase your skills, and earn points. Use the tools above to complete these challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => {
              const isLocked = !canAccessChallenge(challenge);
              
              return (
                <Card 
                  key={challenge.id} 
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isLocked ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-destructive/10 text-destructive rounded-full p-2">
                        <Lock className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={
                        challenge.difficulty === "Beginner" ? "secondary" :
                        challenge.difficulty === "Intermediate" ? "default" : "destructive"
                      }>
                        {challenge.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                        <Trophy className="h-4 w-4" />
                        <span>{challenge.points} pts</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {challenge.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">Recommended Tools:</h4>
                      <div className="flex flex-wrap gap-2">
                        {challenge.tools.map((tool, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {isLocked ? (
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        disabled
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Requires {challenge.requiredTier.charAt(0).toUpperCase() + challenge.requiredTier.slice(1)} Tier
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/challenge/${challenge.id}`)}
                      >
                        Join Challenge
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Use These Tools?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Build anything you can imagine with these powerful development platforms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featureHighlights.map((feature, index) => (
              <FeatureHighlight key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIToolsPage;
