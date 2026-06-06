import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Flame, Rocket, Star, Trophy, Zap } from 'lucide-react';
import { useCertificationProgress } from '@/hooks/useCertificationProgress';

interface Achievement {
  id: string;
  label: string;
  icon: any;
  unlocked: boolean;
  hint: string;
}

export const AchievementsStrip = () => {
  const { stats } = useCertificationProgress();

  const achievements: Achievement[] = [
    { id: 'first-step', label: 'First Step', icon: Rocket, unlocked: stats.started >= 1, hint: 'Start a certification' },
    { id: 'committed', label: 'Committed', icon: Flame, unlocked: stats.started >= 3, hint: 'Have 3 certs in progress' },
    { id: 'first-cert', label: 'First Cert', icon: Award, unlocked: stats.completed >= 1, hint: 'Complete 1 cert' },
    { id: 'specialist', label: 'Specialist', icon: Star, unlocked: stats.completed >= 3, hint: 'Complete 3 certs' },
    { id: 'pro', label: 'Pro', icon: Trophy, unlocked: stats.completed >= 5, hint: 'Complete 5 certs' },
    { id: 'xp-1k', label: '1K XP', icon: Zap, unlocked: stats.xp >= 1000, hint: 'Earn 1,000 XP' },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" /> Achievements
          </h3>
          <Badge variant="outline" className="text-[10px]">
            {achievements.filter((a) => a.unlocked).length}/{achievements.length}
          </Badge>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {achievements.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                title={a.hint}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition ${
                  a.unlocked
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/60 bg-muted/30 opacity-60 grayscale'
                }`}
              >
                <Icon className={`h-4 w-4 ${a.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-[10px] font-medium leading-tight">{a.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
