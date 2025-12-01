import { useState } from 'react';
import { 
  BookOpen, 
  Trophy, 
  Users, 
  Sparkles, 
  Flame, 
  MessageCircle, 
  TrendingUp, 
  Target, 
  Award, 
  Star 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoyaltyProgramCard } from './LoyaltyProgramCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const LoyaltyProgramsSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learning');

  const learningPrograms = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Learn to Earn Points',
      description: 'Earn points for completing lessons, building projects, joining events, and inviting friends. Every learning activity counts toward your growth.',
      badge: 'Active',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/learning-paths')}>
          Start Learning
        </Button>
      )
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Skill Level Tiers',
      description: 'Progress through Bronze → Silver → Gold → Diamond tiers. Unlock advanced tools, perks, and recognition as you level up your skills.',
      badge: 'Bronze',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
          View Progress
        </Button>
      )
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: 'Project Completion Streaks',
      description: 'Maintain 7-day, 14-day, and 30-day learning or building streaks. Consistency unlocks special rewards and badges.',
      badge: 'New',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
          Track Streak
        </Button>
      )
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Certification Bonuses',
      description: 'Earn certificates to unlock mentorship access, fee discounts, and exclusive certificate-holder badges.',
      badge: 'Premium',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/career-certification')}>
          View Certifications
        </Button>
      )
    }
  ];

  const creatorPrograms = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Creator Rewards',
      description: 'Upload templates, tools, or projects to earn bonuses, badges, marketplace boosts, and community recognition.',
      badge: 'Popular',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/marketplace/create-listing')}>
          Start Creating
        </Button>
      )
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Marketplace Loyalty Boost',
      description: 'Consistent creators get earning boosts: 5% → 10% → 15% each month. The more you create, the more you earn.',
      badge: 'Trending',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
          View Marketplace
        </Button>
      )
    }
  ];

  const communityPrograms = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Referral Rewards',
      description: 'Earn points and perks for every friend who signs up and activates their account. Grow the community, grow your rewards.',
      badge: 'Active',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/referral')}>
          Share Link
        </Button>
      )
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Community Hero Program',
      description: 'Get rewarded for answering questions, helping others, and contributing meaningfully to the community.',
      badge: 'Featured',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/community')}>
          Join Community
        </Button>
      )
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'DIM Quest Missions',
      description: 'Complete gamified tasks like "Upload first project," "Invite 3 friends," or "Complete 3 lessons" to unlock special rewards.',
      badge: 'New',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
          View Quests
        </Button>
      )
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Ambassador Loyalty Program',
      description: 'Become an ambassador and earn rewards, badges, bonuses, and exclusive opportunities for consistent monthly performance.',
      badge: 'Exclusive',
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/community')}>
          Learn More
        </Button>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          DIM Loyalty & Growth Programs
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Unlock rewards, perks, and recognition as you learn, create, and grow with DIM. 
          Every action counts toward your success.
        </p>
      </div>

      {/* Tabs for Program Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Learning Rewards
          </TabsTrigger>
          <TabsTrigger value="creator" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Creator Rewards
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community Rewards
          </TabsTrigger>
        </TabsList>

        {/* Learning Programs */}
        <TabsContent value="learning" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {learningPrograms.map((program, index) => (
              <LoyaltyProgramCard key={index} {...program} />
            ))}
          </div>
        </TabsContent>

        {/* Creator Programs */}
        <TabsContent value="creator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {creatorPrograms.map((program, index) => (
              <LoyaltyProgramCard key={index} {...program} />
            ))}
          </div>
        </TabsContent>

        {/* Community Programs */}
        <TabsContent value="community" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {communityPrograms.map((program, index) => (
              <LoyaltyProgramCard key={index} {...program} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Tagline */}
      <div className="mt-12 text-center py-8 border-t border-border/50">
        <p className="text-2xl font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Learn. Build. Connect. Earn.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Your journey to AI mastery starts here
        </p>
      </div>
    </div>
  );
};
