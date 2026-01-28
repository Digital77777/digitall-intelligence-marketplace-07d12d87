import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, BookOpen, Users, Store, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useTier } from '@/contexts/TierContext';

interface WelcomeOnboardingProps {
  isNewUser: boolean;
  onComplete: () => void;
}

const ONBOARDING_STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to Your AI Journey!",
    content: "You're on the Starter tier — completely free! Let's explore what you can do.",
    highlight: "FREE"
  },
  {
    icon: Brain,
    title: "Your AI Tools",
    content: "Access powerful AI tools to help you learn, create, and grow. Start experimenting today!",
    highlight: "3 AI Tools"
  },
  {
    icon: BookOpen,
    title: "Learning Paths",
    content: "Begin with our foundation courses designed for AI beginners. Learn at your own pace.",
    highlight: "10+ Courses"
  },
  {
    icon: Users,
    title: "Join the Community",
    content: "Connect with fellow AI enthusiasts, share insights, and learn from others.",
    highlight: "Connect"
  },
  {
    icon: Store,
    title: "Explore the Marketplace",
    content: "Browse AI tools, resources, and services created by our community.",
    highlight: "Discover"
  }
];

export const WelcomeOnboarding = ({ isNewUser, onComplete }: WelcomeOnboardingProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { maxToolsAccess } = useTier();

  useEffect(() => {
    if (isNewUser) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isNewUser]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    setOpen(false);
    onComplete();
  };

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;

  // Update step 2 with dynamic tool count
  const displayContent = currentStep === 1 
    ? step.content 
    : step.content;
  const displayHighlight = currentStep === 1 
    ? `${maxToolsAccess} AI Tools` 
    : step.highlight;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <StepIcon className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {displayHighlight}
            </span>
            <DialogTitle className="text-xl">{step.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {displayContent}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-center gap-1 mt-3">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip} className="sm:order-1">
            Skip Tour
          </Button>
          <Button onClick={handleNext} className="gap-2 sm:order-2">
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Get Started
                <Check className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};