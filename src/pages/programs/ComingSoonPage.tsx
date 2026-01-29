import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Rocket, Sparkles, ArrowLeft, Bell, Share2, Twitter, Linkedin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const programInfo: Record<string, { title: string; description: string; icon: 'rocket' | 'sparkles' }> = {
  'learn-to-earn': {
    title: 'Learn to Earn Points',
    description: 'Earn points for completing lessons, building projects, joining events, and inviting friends. Every learning activity counts toward your growth.',
    icon: 'sparkles'
  },
  'skill-tiers': {
    title: 'Skill Level Tiers',
    description: 'Progress through Bronze → Silver → Gold → Diamond tiers. Unlock advanced tools, perks, and recognition as you level up your skills.',
    icon: 'rocket'
  },
  'streaks': {
    title: 'Project Completion Streaks',
    description: 'Maintain 7-day, 14-day, and 30-day learning or building streaks. Consistency unlocks special rewards and badges.',
    icon: 'sparkles'
  },
  'certification-bonuses': {
    title: 'Certification Bonuses',
    description: 'Earn certificates to unlock mentorship access, fee discounts, and exclusive certificate-holder badges.',
    icon: 'rocket'
  },
  'creator-rewards': {
    title: 'Creator Rewards',
    description: 'Upload templates, tools, or projects to earn bonuses, badges, marketplace boosts, and community recognition.',
    icon: 'sparkles'
  },
  'marketplace-boost': {
    title: 'Marketplace Loyalty Boost',
    description: 'Consistent creators get earning boosts: 5% → 10% → 15% each month. The more you create, the more you earn.',
    icon: 'rocket'
  }
};

export default function ComingSoonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const program = searchParams.get('program') || 'learn-to-earn';
  const category = searchParams.get('category') || 'learning';
  const info = programInfo[program] || programInfo['learn-to-earn'];

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    // Simulate subscription
    setIsSubscribed(true);
    toast.success("You'll be notified when this feature launches!");
    setEmail('');
  };

  const handleShare = (platform: 'twitter' | 'linkedin') => {
    const text = `Excited for the upcoming ${info.title} feature on DIM! 🚀`;
    const url = window.location.href;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/referrals')}
          className="mb-8 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Programs
        </Button>

        {/* Main Card */}
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20 shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center">
            {/* Animated Icon */}
            <div className="relative inline-flex mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary to-primary/60 p-6 rounded-full">
                {info.icon === 'rocket' ? (
                  <Rocket className="w-12 h-12 text-primary-foreground animate-bounce" />
                ) : (
                  <Sparkles className="w-12 h-12 text-primary-foreground animate-pulse" />
                )}
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {category === 'learning' ? 'Learning Rewards' : 'Creator Rewards'}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {info.title}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              {info.description}
            </p>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">Coming Soon</span>
            </div>

            {/* Progress Indicator */}
            <div className="max-w-xs mx-auto mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Development Progress</span>
                <span>75%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000"
                  style={{ width: '75%' }}
                />
              </div>
            </div>

            {/* Notify Form */}
            {!isSubscribed ? (
              <form onSubmit={handleNotifyMe} className="max-w-md mx-auto mb-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to know when this feature launches!
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" className="gap-2">
                    <Bell className="w-4 h-4" />
                    Notify Me
                  </Button>
                </div>
              </form>
            ) : (
              <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✓ You're on the list! We'll notify you when this launches.
                </p>
              </div>
            )}

            {/* Share Section */}
            <div className="pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Share your excitement
              </p>
              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  className="gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                  className="gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Building something amazing takes time. We appreciate your patience! 💙
        </p>
      </div>
    </main>
  );
}
