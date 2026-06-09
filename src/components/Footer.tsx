import { Brain, BookOpen, Code, Users, Mail, Twitter, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-ai bg-clip-text text-transparent">
                Digital Intelligence Marketplace
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Empowering the next generation with AI skills through interactive learning paths,
              professional tools, and real earning opportunities.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                <Github className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="/learning-paths" className="text-muted-foreground hover:text-primary transition-colors">Learning Paths</a></li>
              <li><a href="/ai-tools" className="text-muted-foreground hover:text-primary transition-colors">AI Tools</a></li>
              <li><a href="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">Marketplace</a></li>
              <li><a href="/community" className="text-muted-foreground hover:text-primary transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="/support" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="/support" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="/support" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/support" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Digital Intelligence Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              info@dimarketplace.com
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;