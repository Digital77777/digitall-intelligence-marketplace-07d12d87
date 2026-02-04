import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Lock, Play, FileText, HelpCircle, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Module, Lesson, formatDuration } from '@/data/foundationPathLessons';
import { ModuleProgressTracker } from './ModuleProgressTracker';

interface LessonSidebarProps {
  modules: Module[];
  currentLessonId: string;
  completedLessons: string[];
  isEnrolled: boolean;
  onSelectLesson: (lessonId: string) => void;
  resources?: { title: string; type: string; url: string }[];
  notes?: React.ReactNode;
  bookmarks?: React.ReactNode;
  isSyncing?: boolean;
}

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Play className="h-4 w-4" />;
    case 'quiz':
      return <HelpCircle className="h-4 w-4" />;
    case 'project':
      return <Folder className="h-4 w-4" />;
    case 'article':
      return <FileText className="h-4 w-4" />;
    default:
      return <Play className="h-4 w-4" />;
  }
};

export const LessonSidebar = ({
  modules,
  currentLessonId,
  completedLessons,
  isEnrolled,
  onSelectLesson,
  resources = [],
  notes,
  bookmarks,
  isSyncing = false,
}: LessonSidebarProps) => {
  const [expandedModules, setExpandedModules] = useState<number[]>([
    // Auto-expand the module containing the current lesson
    modules.find(m => m.lessons.some(l => l.id === currentLessonId))?.id || 1
  ]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isLessonAccessible = (lesson: Lesson, index: number, allLessons: Lesson[]) => {
    if (!isEnrolled) return lesson.isPreview;
    if (index === 0) return true;
    
    // Check if previous lesson is completed
    const prevLesson = allLessons[index - 1];
    return completedLessons.includes(prevLesson.id);
  };

  // Flatten all lessons to check accessibility across modules
  const allLessons = modules.flatMap(m => m.lessons);

  // Get current module
  const currentModule = modules.find(m => m.lessons.some(l => l.id === currentLessonId));

  return (
    <div className="h-full flex flex-col bg-card border-l">
      <Tabs defaultValue="content" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="content" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Content
          </TabsTrigger>
          <TabsTrigger 
            value="resources"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Resources
          </TabsTrigger>
          <TabsTrigger 
            value="notes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Notes
          </TabsTrigger>
          <TabsTrigger 
            value="bookmarks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Bookmarks
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="content" className="m-0 p-0">
            {/* Current Module Progress */}
            {currentModule && (
              <div className="p-4 border-b">
                <ModuleProgressTracker
                  module={currentModule}
                  completedLessons={completedLessons}
                  currentLessonId={currentLessonId}
                  isSyncing={isSyncing}
                />
              </div>
            )}
            
            <div className="p-4 space-y-2">
              {modules.map((module) => {
                const isExpanded = expandedModules.includes(module.id);
                const moduleCompletedCount = module.lessons.filter(l => 
                  completedLessons.includes(l.id)
                ).length;
                const isModuleComplete = moduleCompletedCount === module.lessons.length;

                return (
                  <div key={module.id} className="border rounded-lg overflow-hidden">
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className="text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            Module {module.id}: {module.title}
                          </span>
                          {isModuleComplete && (
                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {moduleCompletedCount}/{module.lessons.length} lessons
                        </p>
                      </div>
                    </button>

                    {/* Lessons List */}
                    {isExpanded && (
                      <div className="border-t">
                        {module.lessons.map((lesson, index) => {
                          const globalIndex = allLessons.findIndex(l => l.id === lesson.id);
                          const isAccessible = isLessonAccessible(lesson, globalIndex, allLessons);
                          const isCompleted = completedLessons.includes(lesson.id);
                          const isCurrent = lesson.id === currentLessonId;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => isAccessible && onSelectLesson(lesson.id)}
                              disabled={!isAccessible}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 text-left transition-colors",
                                isCurrent && "bg-primary/10 border-l-2 border-primary",
                                isAccessible && !isCurrent && "hover:bg-muted/50",
                                !isAccessible && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <span className={cn(
                                "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs",
                                isCompleted && "bg-green-500/20 text-green-500",
                                isCurrent && !isCompleted && "bg-primary/20 text-primary",
                                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                              )}>
                                {isCompleted ? (
                                  <Check className="h-3 w-3" />
                                ) : !isAccessible ? (
                                  <Lock className="h-3 w-3" />
                                ) : (
                                  getContentTypeIcon(lesson.contentType)
                                )}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm truncate",
                                  isCurrent && "font-medium"
                                )}>
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDuration(lesson.videoDurationSeconds)}
                                  {lesson.isPreview && !isEnrolled && (
                                    <span className="ml-2 text-primary">Preview</span>
                                  )}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="m-0 p-4">
            {resources.length > 0 ? (
              <div className="space-y-2">
                {resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{resource.title}</p>
                      <p className="text-xs text-muted-foreground uppercase">{resource.type}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No resources for this lesson</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="m-0 p-4">
            {notes || (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Take notes while watching</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="m-0 p-4">
            {bookmarks || (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Bookmark important moments</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
