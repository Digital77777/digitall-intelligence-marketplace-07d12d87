import { useAuth } from '@/hooks/useAuth';
import { useCommunityPrograms } from '@/hooks/useCommunityPrograms';
import { ProgramHero } from '@/components/programs/ProgramHero';
import { StatsCard } from '@/components/programs/StatsCard';
import { RewardTierCard } from '@/components/programs/RewardTierCard';
import { LeaderboardCard } from '@/components/programs/LeaderboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, MessageSquare, Lightbulb, HelpCircle, 
  Trophy, Medal, Award, Crown,
  TrendingUp, Users
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityHeroPage() {
  const { user } = useAuth();
  const { heroScore, heroLeaderboard, loading } = useCommunityPrograms();

  // Default values if no hero score exists
  const score = heroScore || {
    questions_answered: 0,
    helpful_replies: 0,
    topics_created: 0,
    insights_shared: 0,
    total_score: 0,
    current_tier: 'bronze'
  };

  // Calculate tier progress
  const tierThresholds = { bronze: 0, silver: 100, gold: 300, diamond: 600 };
  const tiers = ['bronze', 'silver', 'gold', 'diamond'];
  const currentTierIndex = tiers.indexOf(score.current_tier);
  const nextTier = tiers[currentTierIndex + 1];
  const nextThreshold = nextTier ? tierThresholds[nextTier as keyof typeof tierThresholds] : tierThresholds.diamond;
  const currentThreshold = tierThresholds[score.current_tier as keyof typeof tierThresholds];
  const progressToNext = nextTier 
    ? Math.min(100, Math.round(((score.total_score - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    : 100;

  // Format leaderboard for display
  const formattedLeaderboard = heroLeaderboard.map((entry, index) => ({
    id: entry.user_id,
    name: `Community Member ${index + 1}`,
    avatar_url: '',
    score: entry.total_score,
    rank: index + 1
  }));

  const rewardTiers = [
    {
      icon: Medal,
      name: 'Bronze Helper',
      description: 'Just getting started',
      requirements: '0 - 99 points',
      perks: ['Community badge', 'Access to helper forums', 'Monthly recognition'],
      isUnlocked: true,
      isCurrent: score.current_tier === 'bronze',
      progress: score.current_tier === 'bronze' ? progressToNext : 100,
      color: 'bg-amber-600'
    },
    {
      icon: Award,
      name: 'Silver Guide',
      description: 'Active contributor',
      requirements: '100 - 299 points',
      perks: ['Silver badge', 'Priority support access', '5% marketplace discount', 'Featured in weekly digest'],
      isUnlocked: score.total_score >= 100,
      isCurrent: score.current_tier === 'silver',
      progress: score.current_tier === 'silver' ? progressToNext : (score.total_score >= 100 ? 100 : 0),
      color: 'bg-gray-400'
    },
    {
      icon: Trophy,
      name: 'Gold Mentor',
      description: 'Trusted community leader',
      requirements: '300 - 599 points',
      perks: ['Gold badge', 'Mentorship program access', '10% marketplace discount', 'Early feature access', 'Custom profile flair'],
      isUnlocked: score.total_score >= 300,
      isCurrent: score.current_tier === 'gold',
      progress: score.current_tier === 'gold' ? progressToNext : (score.total_score >= 300 ? 100 : 0),
      color: 'bg-yellow-500'
    },
    {
      icon: Crown,
      name: 'Diamond Hero',
      description: 'Elite community champion',
      requirements: '600+ points',
      perks: ['Diamond badge', 'VIP event access', '15% marketplace discount', 'Direct team communication', 'Ambassador eligibility', 'Annual recognition award'],
      isUnlocked: score.total_score >= 600,
      isCurrent: score.current_tier === 'diamond',
      progress: 100,
      color: 'bg-cyan-500'
    }
  ];

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl pb-20 md:pb-0">
        <Skeleton className="h-48 w-full rounded-2xl mb-8" />
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl pb-20 md:pb-0">
      {/* Hero */}
      <ProgramHero
        icon={Heart}
        title="Community Hero Program"
        description="Get recognized and rewarded for helping others, answering questions, and contributing meaningfully to the DIM community."
        badge="Community Rewards"
      />

      {/* Score Dashboard */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <StatsCard
          icon={HelpCircle}
          label="Questions Answered"
          value={score.questions_answered}
        />
        <StatsCard
          icon={MessageSquare}
          label="Helpful Replies"
          value={score.helpful_replies}
        />
        <StatsCard
          icon={Lightbulb}
          label="Topics Created"
          value={score.topics_created}
        />
        <StatsCard
          icon={Users}
          label="Insights Shared"
          value={score.insights_shared}
        />
        <StatsCard
          icon={TrendingUp}
          label="Total Hero Score"
          value={score.total_score}
          iconColor="text-primary"
        />
      </div>

      {/* Tabs for Tiers and Leaderboard */}
      <Tabs defaultValue="tiers" className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="tiers">Reward Tiers</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers">
          <div className="grid gap-6 md:grid-cols-2">
            {rewardTiers.map((tier, index) => (
              <RewardTierCard key={index} {...tier} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Top Community Heroes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formattedLeaderboard.length > 0 ? (
                <LeaderboardCard
                  users={formattedLeaderboard}
                  currentUserId={user?.id}
                  scoreLabel="hero points"
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Be the first to join the leaderboard!</p>
                  <p className="text-sm mt-2">Start helping others to earn hero points.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle>How to Earn Hero Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: HelpCircle, action: 'Answer a question', points: '+10', color: 'text-blue-500' },
              { icon: MessageSquare, action: 'Post a helpful reply', points: '+5', color: 'text-green-500' },
              { icon: Lightbulb, action: 'Start a new topic', points: '+15', color: 'text-yellow-500' },
              { icon: Users, action: 'Share an insight', points: '+20', color: 'text-purple-500' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <item.icon className={`w-8 h-8 ${item.color}`} />
                <div>
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-primary font-bold">{item.points} points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
