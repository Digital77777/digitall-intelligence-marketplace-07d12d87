import { useState } from 'react';
import { useCommunityPrograms } from '@/hooks/useCommunityPrograms';
import { ProgramHero } from '@/components/programs/ProgramHero';
import { QuestCard } from '@/components/programs/QuestCard';
import { StatsCard } from '@/components/programs/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Target, Trophy, Flame, Star, 
  User, Users, BookOpen, Upload, Sparkles,
  CheckCircle2, Clock, Gift
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const categoryInfo: Record<string, { icon: typeof User; color: string; label: string }> = {
  onboarding: { icon: User, color: 'bg-blue-500', label: 'Onboarding' },
  community: { icon: Users, color: 'bg-purple-500', label: 'Community' },
  learning: { icon: BookOpen, color: 'bg-green-500', label: 'Learning' },
  creator: { icon: Upload, color: 'bg-orange-500', label: 'Creator' },
  engagement: { icon: Flame, color: 'bg-pink-500', label: 'Engagement' }
};

export default function QuestsPage() {
  const { quests, loading, startQuest } = useCommunityPrograms();
  const [activeCategory, setActiveCategory] = useState('all');

  const completedQuests = quests.filter(q => q.status === 'completed');
  const inProgressQuests = quests.filter(q => q.status === 'in_progress');
  const availableQuests = quests.filter(q => q.status === 'not_started');
  
  const totalPointsEarned = completedQuests.reduce((sum, q) => sum + q.points_reward, 0);
  const totalPointsAvailable = quests.reduce((sum, q) => sum + q.points_reward, 0);

  const filteredQuests = activeCategory === 'all' 
    ? quests 
    : quests.filter(q => q.category === activeCategory);

  const handleStartQuest = async (questId: string) => {
    const result = await startQuest(questId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Quest started! Good luck!');
    }
  };

  const categories = ['all', ...Object.keys(categoryInfo)];

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
        icon={Target}
        title="DIM Quest Missions"
        description="Complete gamified tasks to earn points, unlock rewards, and level up your DIM experience. New quests rotate daily and weekly!"
        badge="Community Rewards"
      >
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Daily Reset: 12h 34m
          </Badge>
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Weekly Reset: 3d 12h
          </Badge>
        </div>
      </ProgramHero>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatsCard
          icon={CheckCircle2}
          label="Completed Quests"
          value={completedQuests.length}
          iconColor="text-green-500"
        />
        <StatsCard
          icon={Clock}
          label="In Progress"
          value={inProgressQuests.length}
          iconColor="text-yellow-500"
        />
        <StatsCard
          icon={Target}
          label="Available"
          value={availableQuests.length}
        />
        <StatsCard
          icon={Star}
          label="Points Earned"
          value={`${totalPointsEarned}/${totalPointsAvailable}`}
          iconColor="text-primary"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => {
          const info = categoryInfo[category];
          const isActive = activeCategory === category;
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {info ? <info.icon className="w-4 h-4" /> : <Target className="w-4 h-4" />}
              {info?.label || 'All Quests'}
            </button>
          );
        })}
      </div>

      {/* Quests Tabs */}
      <Tabs defaultValue="active" className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="active" className="gap-2">
            <Clock className="w-4 h-4" />
            Active ({inProgressQuests.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-2">
            <Target className="w-4 h-4" />
            Available ({availableQuests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed ({completedQuests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {inProgressQuests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressQuests
                .filter(q => activeCategory === 'all' || q.category === activeCategory)
                .map(quest => (
                  <QuestCard key={quest.id} quest={quest} onStart={handleStartQuest} />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No active quests</p>
                <p className="text-muted-foreground">Start a quest from the Available tab to begin earning points!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available">
          {availableQuests.filter(q => activeCategory === 'all' || q.category === activeCategory).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {availableQuests
                .filter(q => activeCategory === 'all' || q.category === activeCategory)
                .map(quest => (
                  <QuestCard key={quest.id} quest={quest} onStart={handleStartQuest} />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No available quests</p>
                <p className="text-muted-foreground">Check back later for new quests!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedQuests.filter(q => activeCategory === 'all' || q.category === activeCategory).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {completedQuests
                .filter(q => activeCategory === 'all' || q.category === activeCategory)
                .map(quest => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No completed quests yet</p>
                <p className="text-muted-foreground">Complete quests to earn points and badges!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Rewards Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Quest Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { milestone: '5 Quests', reward: 'Explorer Badge', icon: Star, color: 'text-blue-500' },
              { milestone: '15 Quests', reward: 'Adventurer Badge + 100 Bonus Points', icon: Trophy, color: 'text-yellow-500' },
              { milestone: '30 Quests', reward: 'Quest Master Badge + Premium Perks', icon: Sparkles, color: 'text-purple-500' },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl border-2 border-dashed text-center ${
                  completedQuests.length >= parseInt(item.milestone) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted'
                }`}
              >
                <item.icon className={`w-10 h-10 mx-auto mb-3 ${item.color}`} />
                <p className="font-bold text-lg">{item.milestone}</p>
                <p className="text-sm text-muted-foreground">{item.reward}</p>
                {completedQuests.length >= parseInt(item.milestone) && (
                  <Badge className="mt-2" variant="default">Unlocked!</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
