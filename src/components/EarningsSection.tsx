import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Users, DollarSign, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const earningOpportunities = [
  {
    title: "Freelance AI Projects",
    description: "Complete AI projects for real clients while building your portfolio",
    earnings: "$200-$2,000",
    timeframe: "per project",
    difficulty: "Beginner",
    icon: Coins,
    features: ["Guided project matching", "Skill verification", "Client communication", "Payment protection"],
    color: "text-emerald-600"
  },
  {
    title: "AI Tutoring & Mentoring",
    description: "Teach other students and earn while reinforcing your own knowledge",
    earnings: "$15-$50",
    timeframe: "per hour",
    difficulty: "Intermediate",
    icon: Users,
    features: ["Flexible scheduling", "Subject expertise", "Progress tracking", "Performance bonus"],
    color: "text-blue-600"
  },
  {
    title: "Content Creation",
    description: "Create AI-powered content, courses, and educational materials",
    earnings: "$100-$5,000",
    timeframe: "per month",
    difficulty: "Advanced",
    icon: TrendingUp,
    features: ["Content monetization", "Audience building", "Revenue sharing", "Marketing support"],
    color: "text-purple-600"
  }
];

const successStories = [
  {
    name: "Sarah Chen",
    university: "Stanford University",
    earnings: "$3,200",
    timeframe: "last month",
    story: "Built 3 AI chatbots for local businesses while completing her CS degree"
  },
  {
    name: "Marcus Johnson",
    university: "MIT",
    earnings: "$8,500",
    timeframe: "this semester",
    story: "Created an AI course that now has 500+ enrolled students"
  },
  {
    name: "Elena Rodriguez",
    university: "UC Berkeley",
    earnings: "$1,800",
    timeframe: "part-time",
    story: "Tutors 15 students weekly in machine learning fundamentals"
  }
];

const EarningsSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEarningClick = (path: string) => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate(path);
    }
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-earn px-3 py-1.5 rounded-full">
            <DollarSign className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Earn While Learning</span>
          </div>
          <h2 className="text-3xl font-bold">Turn Your AI Skills Into Income</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Start earning money with your AI knowledge from day one. Our platform connects 
            you with real opportunities to monetize your skills while you study.
          </p>
        </div>

        {/* Earning Opportunities */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {earningOpportunities.map((opportunity, index) => (
            <Card key={index} className="hover:shadow-ai transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-gradient-earn`}>
                    <opportunity.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary">{opportunity.difficulty}</Badge>
                </div>
                <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                <p className="text-muted-foreground">{opportunity.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-background rounded-lg border-2 border-success/20">
                  <div className={`text-2xl font-bold ${opportunity.color}`}>
                    {opportunity.earnings}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {opportunity.timeframe}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">What you get:</h4>
                  <div className="space-y-1">
                    {opportunity.features.map((feature, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-success rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" variant="earn" onClick={() => handleEarningClick('/marketplace')}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Stories */}
        <div className="space-y-5">
          <h3 className="text-2xl font-bold text-center">Student Success Stories</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {successStories.map((story, index) => (
              <Card key={index} className="bg-background border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-earn rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">{story.name}</div>
                      <div className="text-sm text-muted-foreground">{story.university}</div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-success">{story.earnings}</div>
                    <div className="text-sm text-muted-foreground">{story.timeframe}</div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground italic">
                    "{story.story}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Button variant="earn" size="lg" className="px-8 group" onClick={() => handleEarningClick('/marketplace')}>
            Start Earning Today
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EarningsSection;