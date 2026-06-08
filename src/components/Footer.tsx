import { Brain, BookOpen, Code, Users, Mail, Twitter, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">Digital Intelligence Marketplace</span>
          </div>
          <div className="flex space-x-6">
            <a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
            <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
            <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="text-sm text-muted-foreground">
            © {currentYear} Digital Intelligence Marketplace. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;