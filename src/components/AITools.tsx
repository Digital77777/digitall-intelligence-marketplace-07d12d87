
import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Terminal, Wrench, Sparkles, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AITool } from "@/types/aiTools";
import { useAuth } from "@/hooks/useAuth";

const aiTools: AITool[] = [
  {
    id: 1,
    name: "Lovable.dev",
    title: "Lovable.dev",
    description: "Build full-stack web applications with AI assistance. Create, iterate, and deploy production-ready apps in minutes.",
    icon: Code2,
    category: "Development",
    features: ["AI-powered development", "Full-stack capabilities", "Instant deployment"],
    usage: "Free to start",
    pricing: "Free",
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
    usage: "Free tier available",
    pricing: "Free",
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
    usage: "Free trial available",
    pricing: "Free",
    gradient: "from-emerald-500 to-teal-500",
    route: "https://cursor.sh"
  }
];

// Memoized tool card component
const ToolCardMemo = memo(({ tool, onClick }: { tool: AITool; onClick: () => void }) => (
  <Card className="hover:shadow-ai transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient}`} />
    
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.gradient}`}>
          <tool.icon className="h-6 w-6 text-white" />
        </div>
        <Badge variant="secondary" className="text-xs">
          {tool.usage}
        </Badge>
      </div>
      <CardTitle className="text-lg">{tool.title}</CardTitle>
      <p className="text-muted-foreground text-sm">{tool.description}</p>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Features:</h4>
        <div className="space-y-1">
          {tool.features.map((feature, idx) => (
            <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full" variant="outline" onClick={onClick}>
        Try {tool.name}
        <ExternalLink className="h-4 w-4 ml-2" />
      </Button>
    </CardContent>
  </Card>
));

ToolCardMemo.displayName = 'ToolCardMemo';

const AITools = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleToolClick = (path: string) => {
    if (!user) {
      navigate('/auth');
    } else {
      // Open external links in new tab
      if (path.startsWith('http')) {
        window.open(path, '_blank', 'noopener,noreferrer');
      } else {
        navigate(path);
      }
    }
  };

  const handleToolAccess = () => {
    navigate('/ai-tools');
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 bg-accent px-3 py-1.5 rounded-full">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">3 Powerful Development Tools</span>
          </div>
          <h2 className="text-3xl font-bold">Build Anything with AI</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Access professional development tools to create websites, apps, and AI-powered projects. 
            Build whatever you imagine with these powerful platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {aiTools.map((tool) => (
            <ToolCardMemo 
              key={tool.id} 
              tool={tool} 
              onClick={() => handleToolClick(tool.route || '/ai-tools')} 
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="ai" size="lg" className="px-6" onClick={handleToolAccess}>
            Access All AI Tools Free
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AITools;
