import { Check, Clock, BookOpen, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Module } from '@/data/foundationPathLessons';
import { cn } from '@/lib/utils';

interface ModuleProgressProps {
  modules: Module[];
  completedLessons: string[];
  currentModuleId?: number;
  totalWatchTime?: number; // in seconds
}

export const ModuleProgress = ({
  modules,
  completedLessons,
  currentModuleId,
  totalWatchTime = 0,
}: ModuleProgressProps) => {
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completedLessons.length;
  const overallProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const formatWatchTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-semibold">Course Progress</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {Math.round(overallProgress)}%
            </span>
          </div>
          
          <Progress value={overallProgress} className="h-3 mb-4" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>
                <strong>{completedCount}</strong> of {totalLessons} lessons
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                <strong>{formatWatchTime(totalWatchTime)}</strong> watched
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Progress List */}
      <div className="space-y-2">
        {modules.map((module) => {
          const moduleCompletedCount = module.lessons.filter(l => 
            completedLessons.includes(l.id)
          ).length;
          const moduleProgress = (moduleCompletedCount / module.lessons.length) * 100;
          const isComplete = moduleCompletedCount === module.lessons.length;
          const isCurrent = module.id === currentModuleId;

          return (
            <div
              key={module.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                isCurrent && "border-primary bg-primary/5",
                isComplete && "bg-green-500/5 border-green-500/20"
              )}
            >
              {/* Status Icon */}
              <div className={cn(
                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                isComplete && "bg-green-500/20 text-green-500",
                !isComplete && isCurrent && "bg-primary/20 text-primary",
                !isComplete && !isCurrent && "bg-muted text-muted-foreground"
              )}>
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{module.id}</span>
                )}
              </div>

              {/* Module Info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isCurrent && "text-primary"
                )}>
                  {module.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress 
                    value={moduleProgress} 
                    className="h-1.5 flex-1" 
                  />
                  <span className="text-xs text-muted-foreground shrink-0">
                    {moduleCompletedCount}/{module.lessons.length}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
