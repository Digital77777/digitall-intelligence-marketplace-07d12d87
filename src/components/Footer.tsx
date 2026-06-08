import { Brain, BookOpen, Code, Users, Mail, Twitter, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Digital Intelligence</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering the next generation with AI skills and opportunities.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/learning-paths" className="hover:text-primary transition-colors">Learning Paths</a></li>
              <li><a href="/ai-tools" className="hover:text-primary transition-colors">AI Tools</a></li>
              <li><a href="/marketplace" className="hover:text-primary transition-colors">Marketplace</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/community" className="hover:text-primary transition-colors">Forums</a></li>
              <li><a href="/community/reels" className="hover:text-primary transition-colors">Reels</a></li>
              <li><a href="/referrals" className="hover:text-primary transition-colors">Referrals</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon"><Twitter className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Linkedin className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Github className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {currentYear} Digital Intelligence Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;