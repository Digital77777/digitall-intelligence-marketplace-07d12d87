import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Clock, Target, CheckCircle2, Code2, Terminal, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";
import { ChallengeSubmissionForm } from "@/components/challenges/ChallengeSubmissionForm";

const ChallengePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const challenges = [
    {
      id: 1,
      title: "Build Your First Landing Page",
      description: "Create a responsive landing page for a fictional product using any of the available tools.",
      difficulty: "Beginner" as const,
      requiredTier: "starter",
      points: 100,
      tools: ["Lovable.dev", "Replit"],
      estimatedTime: "2-3 hours",
      objectives: [
        "Create a hero section with compelling headline",
        "Add at least 3 feature sections",
        "Include a call-to-action form",
        "Make it fully responsive for mobile and desktop"
      ],
      requirements: [
        "Use semantic HTML5 elements",
        "Implement responsive design with CSS/Tailwind",
        "Deploy the landing page to a live URL",
        "Submit project link for review"
      ],
      resources: [
        { name: "Lovable.dev", url: "https://lovable.dev", icon: Code2 },
        { name: "Replit", url: "https://replit.com", icon: Terminal }
      ]
    },
    {
      id: 2,
      title: "AI-Powered Todo App",
      description: "Build a todo application with AI features like smart categorization or priority suggestions.",
      difficulty: "Intermediate" as const,
      requiredTier: "creator",
      points: 250,
      tools: ["Lovable.dev", "Cursor"],
      estimatedTime: "4-6 hours",
      objectives: [
        "Create a functional todo list with CRUD operations",
        "Integrate AI to suggest task priorities",
        "Add smart categorization for tasks",
        "Implement local storage or database persistence"
      ],
      requirements: [
        "Use React or similar modern framework",
        "Integrate an AI API for smart features",
        "Deploy to production",
        "Include user authentication"
      ],
      resources: [
        { name: "Lovable.dev", url: "https://lovable.dev", icon: Code2 },
        { name: "Cursor", url: "https://cursor.sh", icon: Wrench }
      ]
    },
    {
      id: 3,
      title: "Full-Stack E-commerce Platform",
      description: "Create a complete e-commerce solution with product listings, cart, and checkout functionality.",
      difficulty: "Advanced" as const,
      requiredTier: "career",
      points: 500,
      tools: ["Lovable.dev", "Replit", "Cursor"],
      estimatedTime: "10-15 hours",
      objectives: [
        "Build product catalog with search and filters",
        "Implement shopping cart functionality",
        "Create secure checkout process",
        "Add order management dashboard"
      ],
      requirements: [
        "Full-stack application with database",
        "Payment gateway integration",
        "User authentication and authorization",
        "Responsive design across all devices"
      ],
      resources: [
        { name: "Lovable.dev", url: "https://lovable.dev", icon: Code2 },
        { name: "Replit", url: "https://replit.com", icon: Terminal },
        { name: "Cursor", url: "https://cursor.sh", icon: Wrench }
      ]
    },
    {
      id: 4,
      title: "Interactive Portfolio Website",
      description: "Design and deploy a professional portfolio showcasing your projects and skills.",
      difficulty: "Beginner" as const,
      requiredTier: "starter",
      points: 150,
      tools: ["Lovable.dev", "Replit"],
      estimatedTime: "3-4 hours",
      objectives: [
        "Create an about section with your bio",
        "Showcase at least 3 projects with descriptions",
        "Add a contact form",
        "Include social media links"
      ],
      requirements: [
        "Clean, professional design",
        "Smooth animations and transitions",
        "SEO optimized",
        "Fast loading performance"
      ],
      resources: [
        { name: "Lovable.dev", url: "https://lovable.dev", icon: Code2 },
        { name: "Replit", url: "https://replit.com", icon: Terminal }
      ]
    },
    {
      id: 5,
      title: "Real-time Chat Application",
      description: "Build a chat app with real-time messaging, user authentication, and message history.",
      difficulty: "Advanced" as const,
      requiredTier: "career",
      points: 400,
      tools: ["Lovable.dev", "Cursor"],
      estimatedTime: "8-12 hours",
      objectives: [
        "Implement real-time messaging with WebSockets",
        "Add user authentication and profiles",
        "Create message history and persistence",
        "Include typing indicators and read receipts"
      ],
      requirements: [
        "Real-time bidirectional communication",
        "Secure authentication system",
        "Message encryption",
        "Scalable backend architecture"
      ],
      resources: [
        { name: "Lovable.dev", url: "https://lovable.dev", icon: Code2 },
        { name: "Cursor", url: "https://cursor.sh", icon: Wrench }
      ]
    }
  ];

  const challenge = challenges.find(c => c.id === parseInt(id || "0"));

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Challenge Not Found</h1>
          <Button onClick={() => navigate("/ai-tools")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AI Tools
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${challenge.title} - Challenge`}
        description={challenge.description}
        keywords={["AI challenge", "coding challenge", ...challenge.tools]}
      />

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate("/ai-tools")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to AI Tools
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={
                  challenge.difficulty === "Beginner" ? "secondary" :
                  challenge.difficulty === "Intermediate" ? "default" : "destructive"
                }>
                  {challenge.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <Trophy className="h-5 w-5" />
                  <span>{challenge.points} Points</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-3">{challenge.title}</h1>
              <p className="text-lg text-muted-foreground">{challenge.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{challenge.estimatedTime}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Challenge Objectives
              </CardTitle>
              <CardDescription>
                Complete all these objectives to earn {challenge.points} points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {challenge.objectives.map((objective, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                Your submission must meet these technical requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {challenge.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Tools</CardTitle>
              <CardDescription>
                Use these tools to build your solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {challenge.resources.map((resource, idx) => {
                  const Icon = resource.icon;
                  return (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{resource.name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                      >
                        Open Tool
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Ready to Start?</h3>
                <p className="text-muted-foreground mb-6">
                  Choose a tool above and start building your solution. Good luck!
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="bg-gradient-ai text-white"
                    onClick={() => window.open(challenge.resources[0].url, '_blank', 'noopener,noreferrer')}
                  >
                    Start Building
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/ai-tools")}
                  >
                    View Other Challenges
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <ChallengeSubmissionForm 
            challengeId={challenge.id} 
            challengeTitle={challenge.title} 
          />
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
