import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, Lightbulb, Users, MessageSquare, BookOpen, 
  Upload, Calendar, Heart, Flame, DollarSign, 
  Check, Play, Clock, LucideIcon 
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  User, Lightbulb, Users, MessageSquare, BookOpen,
  Upload, Calendar, Heart, Flame, DollarSign
};

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  icon: string;
  difficulty: string;
  status?: 'not_started' | 'in_progress' | 'completed';
  progress?: number;
}

interface QuestCardProps {
  quest: Quest;
  onStart?: (questId: string) => void;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const categoryColors: Record<string, string> = {
  onboarding: 'bg-blue-500',
  community: 'bg-purple-500',
  learning: 'bg-green-500',
  creator: 'bg-orange-500',
  engagement: 'bg-pink-500'
};

export const QuestCard = ({ quest, onStart }: QuestCardProps) => {
  const Icon = iconMap[quest.icon] || Lightbulb;
  const status = quest.status || 'not_started';
  const progress = quest.progress || 0;
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${
      isCompleted ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : ''
    }`}>
      {/* Category indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full ${categoryColors[quest.category] || 'bg-primary'}`} />
      
      <CardContent className="p-5 pl-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 p-3 rounded-xl ${
            isCompleted 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-primary/10'
          }`}>
            {isCompleted ? (
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <Icon className="w-6 h-6 text-primary" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {quest.title}
              </h3>
              <Badge variant="outline" className="flex-shrink-0 gap-1 font-bold">
                +{quest.points_reward}
                <span className="text-primary">pts</span>
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {quest.description}
            </p>
            
            {/* Progress bar for in-progress quests */}
            {isInProgress && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
            
            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${difficultyColors[quest.difficulty] || ''}`}
                >
                  {quest.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {quest.category}
                </Badge>
              </div>
              
              {!isCompleted && (
                <Button 
                  size="sm" 
                  variant={isInProgress ? 'default' : 'outline'}
                  onClick={() => onStart?.(quest.id)}
                  className="gap-1.5"
                >
                  {isInProgress ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Start
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
