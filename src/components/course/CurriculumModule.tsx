import { useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Play,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Topic {
  title: string;
  duration?: string;
}

interface CurriculumModuleProps {
  moduleNumber: number;
  title: string;
  description: string;
  duration: string;
  lessonCount: number;
  topics: Topic[];
  externalLink?: string;
  isLocked: boolean;
  isCompleted: boolean;
  progress?: number;
  onStart?: () => void;
}

export const CurriculumModule = ({
  moduleNumber,
  title,
  description,
  duration,
  lessonCount,
  topics,
  externalLink,
  isLocked,
  isCompleted,
  progress = 0,
  onStart,
}: CurriculumModuleProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={`module-${moduleNumber}`} className="border rounded-xl px-4 md:px-6 bg-card/50 hover:bg-card/80 transition-colors">
        <AccordionTrigger className="hover:no-underline py-5">
          <div className="flex items-start gap-4 text-left w-full pr-4">
            {/* Module Number Badge */}
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
              ${isCompleted 
                ? 'bg-green-500 text-white' 
                : isLocked 
                  ? 'bg-muted text-muted-foreground' 
                  : 'bg-primary/10 text-primary'
              }
            `}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : isLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                moduleNumber
              )}
            </div>

            {/* Module Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-base md:text-lg truncate">
                  {title}
                </h3>
                {isCompleted && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                    Completed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 hidden sm:block">
                {description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {lessonCount} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {duration}
                </span>
              </div>
              {/* Progress bar for enrolled users */}
              {!isLocked && progress > 0 && !isCompleted && (
                <div className="mt-3 max-w-xs">
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pb-5">
          <div className="pl-14 space-y-4">
            {/* Description (mobile) */}
            <p className="text-sm text-muted-foreground sm:hidden">
              {description}
            </p>

            {/* Topics List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-3">What you'll learn:</h4>
              <ul className="grid gap-2">
                {topics.map((topic, index) => (
                  <li 
                    key={index}
                    className={`
                      flex items-center gap-3 text-sm p-2 rounded-lg
                      ${isLocked ? 'text-muted-foreground' : 'text-foreground'}
                    `}
                  >
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <Play className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                    )}
                    <span className="flex-1">{topic.title}</span>
                    {topic.duration && (
                      <span className="text-xs text-muted-foreground">{topic.duration}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {!isLocked && (
                <Button 
                  size="sm" 
                  variant={isCompleted ? 'outline' : 'default'}
                  onClick={onStart}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  {isCompleted ? 'Review Module' : 'Start Module'}
                </Button>
              )}
              {externalLink && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  asChild
                >
                  <a href={externalLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Resources
                  </a>
                </Button>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
