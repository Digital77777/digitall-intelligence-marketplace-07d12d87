import { useMemo } from 'react';
import { Check, Circle, Loader2, Trophy, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Module } from '@/data/foundationPathLessons';

interface ModuleProgressTrackerProps {
  module: Module;
  completedLessons: string[];
  currentLessonId?: string;
  isSyncing?: boolean;
  className?: string;
}

export const ModuleProgressTracker = ({
  module,
  completedLessons,
  currentLessonId,
  isSyncing = false,
  className,
}: ModuleProgressTrackerProps) => {
  const stats = useMemo(() => {
    const total = module.lessons.length;
    const completed = module.lessons.filter(l => completedLessons.includes(l.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = completed === total;
    
    // Calculate total watch time
    const totalDuration = module.lessons.reduce((acc, l) => acc + l.videoDurationSeconds, 0);
    const completedDuration = module.lessons
      .filter(l => completedLessons.includes(l.id))
      .reduce((acc, l) => acc + l.videoDurationSeconds, 0);
    
    return { total, completed, percentage, isComplete, totalDuration, completedDuration };
  }, [module, completedLessons]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className={cn("bg-card rounded-lg border p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            stats.isComplete 
              ? "bg-green-500/20 text-green-500" 
              : "bg-primary/20 text-primary"
          )}>
            {stats.isComplete ? (
              <Trophy className="h-4 w-4" />
            ) : (
              <span className="text-sm font-bold">{module.id}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">Module {module.id}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
              {module.title}
            </p>
          </div>
        </div>
        
        {/* Sync indicator */}
        {isSyncing && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Syncing</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {stats.completed} of {stats.total} lessons
          </span>
          <span className={cn(
            "font-medium",
            stats.isComplete ? "text-green-500" : "text-primary"
          )}>
            {stats.percentage}%
          </span>
        </div>
        <Progress 
          value={stats.percentage} 
          className={cn(
            "h-2",
            stats.isComplete && "[&>div]:bg-green-500"
          )}
        />
        <p className="text-xs text-muted-foreground">
          {formatTime(stats.completedDuration)} / {formatTime(stats.totalDuration)} watched
        </p>
      </div>

      {/* Lesson indicators - compact view */}
      <div className="flex flex-wrap gap-1.5">
        {module.lessons.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          
          return (
            <div
              key={lesson.id}
              title={lesson.title}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                isCompleted && "bg-green-500/20 text-green-500",
                isCurrent && !isCompleted && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-3 w-3" />
              ) : isCurrent ? (
                <Play className="h-3 w-3 fill-current" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {stats.isComplete && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 text-green-600 text-sm">
          <Trophy className="h-4 w-4 shrink-0" />
          <span className="font-medium">Module Complete! 🎉</span>
        </div>
      )}
    </div>
  );
};
