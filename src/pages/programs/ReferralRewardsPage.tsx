import { useReferrals } from '@/hooks/useReferrals';
import { useAuth } from '@/hooks/useAuth';
import { ProgramHero } from '@/components/programs/ProgramHero';
import { StatsCard } from '@/components/programs/StatsCard';
import { LeaderboardCard } from '@/components/programs/LeaderboardCard';
import { ShareReferralLink } from '@/components/referrals/ShareReferralLink';
import { InviteByEmail } from '@/components/referrals/InviteByEmail';
import { ReferralsList } from '@/components/referrals/ReferralsList';
import { ReferralProgress } from '@/components/referrals/ReferralProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gift, Trophy, TrendingUp, Star, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReferralRewardsPage() {
  const { user } = useAuth();
  const { referrals, contestStatus, loading, referralLink, createReferral } = useReferrals();

  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const totalPoints = completedReferrals * 50; // 50 points per completed referral

  // Mock leaderboard data (would come from database in production)
  const leaderboardData = [
    { id: '1', name: 'Sarah M.', avatar_url: '', score: 850, rank: 1 },
    { id: '2', name: 'John D.', avatar_url: '', score: 720, rank: 2 },
    { id: '3', name: 'Emily R.', avatar_url: '', score: 650, rank: 3 },
    { id: '4', name: 'Michael K.', avatar_url: '', score: 520, rank: 4 },
    { id: '5', name: 'Lisa T.', avatar_url: '', score: 480, rank: 5 },
  ];

  const rewardTiers = [
    { referrals: 1, reward: '50 DIM Points', icon: Star },
    { referrals: 3, reward: 'Bronze Badge + 150 Points', icon: Gift },
    { referrals: 5, reward: 'Contest Entry (R1000 Prize)', icon: Trophy },
    { referrals: 10, reward: 'Silver Badge + Premium Feature Unlock', icon: TrendingUp },
  ];

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl pb-20 md:pb-0">
        <Skeleton className="h-48 w-full rounded-2xl mb-8" />
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl pb-20 md:pb-0">
      {/* Hero */}
      <ProgramHero
        icon={Users}
        title="Referral Rewards"
        description="Earn points and exclusive perks for every friend who signs up and activates their account. The more you share, the more you earn!"
        badge="Community Rewards"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatsCard
          icon={Users}
          label="Total Referrals"
          value={referrals.length}
        />
        <StatsCard
          icon={Check}
          label="Completed"
          value={completedReferrals}
          iconColor="text-green-500"
        />
        <StatsCard
          icon={TrendingUp}
          label="Pending"
          value={pendingReferrals}
          iconColor="text-yellow-500"
        />
        <StatsCard
          icon={Star}
          label="Points Earned"
          value={totalPoints}
          iconColor="text-primary"
        />
      </div>

      {/* Contest Progress */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <ReferralProgress
          completedReferrals={completedReferrals}
          totalRequired={5}
          isEligible={contestStatus?.is_eligible || false}
          prizeAmount={contestStatus?.prize_amount?.toString()}
        />
        <ShareReferralLink referralLink={referralLink} />
      </div>

      {/* Invite Section */}
      <div className="mb-8">
        <InviteByEmail onInvite={createReferral} />
      </div>

      {/* Rewards Breakdown & Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Rewards Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Rewards Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rewardTiers.map((tier, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  completedReferrals >= tier.referrals
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  completedReferrals >= tier.referrals 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-primary/10'
                }`}>
                  <tier.icon className={`w-5 h-5 ${
                    completedReferrals >= tier.referrals 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-primary'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{tier.referrals} Referral{tier.referrals > 1 ? 's' : ''}</p>
                  <p className="text-sm text-muted-foreground">{tier.reward}</p>
                </div>
                {completedReferrals >= tier.referrals && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderboardCard
              users={leaderboardData}
              currentUserId={user?.id}
              scoreLabel="referrals"
            />
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <ReferralsList referrals={referrals} loading={loading} />
    </main>
  );
}
