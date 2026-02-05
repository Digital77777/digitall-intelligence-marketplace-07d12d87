import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ArrowRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LessonPlayer, 
  LessonSidebar, 
  LessonNotes, 
  LessonBookmarks,
  ModuleProgressTracker,
  ModuleAssessment,
} from '@/components/learning';
import { 
  foundationPathModules, 
  FOUNDATION_PATH_ID,
  FOUNDATION_PATH_TITLE,
  getLessonById,
  getNextLesson,
  getPreviousLesson,
} from '@/data/foundationPathLessons';
import { 
  practicalSkillsModules, 
  PRACTICAL_SKILLS_ID,
  PRACTICAL_SKILLS_TITLE,
  getPracticalSkillsLessonById,
  getPracticalSkillsNextLesson,
  getPracticalSkillsPreviousLesson,
} from '@/data/practicalSkillsLessons';
import { useCourseEnrollment } from '@/hooks/useCourseEnrollment';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useRealtimeModuleProgress } from '@/hooks/useRealtimeLessonProgress';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { module1QuizData } from '@/data/module1QuizData';
import { module1ExerciseData } from '@/data/module1ExerciseData';

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Determine which course data to use
  const isFoundationPath = courseId === FOUNDATION_PATH_ID;
  const modules = isFoundationPath ? foundationPathModules : practicalSkillsModules;
  const courseTitle = isFoundationPath ? FOUNDATION_PATH_TITLE : PRACTICAL_SKILLS_TITLE;

  // Get lesson data
  const lesson = useMemo(() => {
    if (!lessonId) return null;
    return isFoundationPath 
      ? getLessonById(lessonId) 
      : getPracticalSkillsLessonById(lessonId);
  }, [lessonId, isFoundationPath]);

  // Get next/previous lessons
  const nextLesson = useMemo(() => {
    if (!lessonId) return null;
    return isFoundationPath 
      ? getNextLesson(lessonId) 
      : getPracticalSkillsNextLesson(lessonId);
  }, [lessonId, isFoundationPath]);

  const previousLesson = useMemo(() => {
    if (!lessonId) return null;
    return isFoundationPath 
      ? getPreviousLesson(lessonId) 
      : getPracticalSkillsPreviousLesson(lessonId);
  }, [lessonId, isFoundationPath]);

  // Enrollment and progress
  const { isEnrolled, isLoading: enrollmentLoading } = useCourseEnrollment(courseId || '');
  const { isCompleted, markComplete } = useLessonProgress(lessonId || '');
  
  // Real-time progress tracking
  const { 
    completedLessons, 
    moduleProgress: allModuleProgress, 
    isSyncing,
    isLoading: progressLoading 
  } = useRealtimeModuleProgress(courseId || '', modules);

  // Current module
  const currentModule = useMemo(() => {
    return modules.find(m => m.lessons.some(l => l.id === lessonId));
  }, [modules, lessonId]);

  // Get current module progress
  const currentModuleProgress = useMemo(() => {
    return allModuleProgress.find(mp => mp.moduleId === currentModule?.id);
  }, [allModuleProgress, currentModule]);

  // Check if this is a quiz/assessment lesson
  const isAssessmentLesson = lesson?.contentType === 'quiz';
  const isModule1Assessment = lessonId === 'fp-1-8';

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access lessons');
      navigate('/auth');
    }
  }, [user, navigate]);

  // Redirect if lesson not found
  useEffect(() => {
    if (!lesson && lessonId) {
      toast.error('Lesson not found');
      navigate(`/course/${courseId}`);
    }
  }, [lesson, lessonId, courseId, navigate]);

  // Handle lesson navigation
  const handleSelectLesson = (newLessonId: string) => {
    navigate(`/course/${courseId}/lesson/${newLessonId}`);
    setSidebarOpen(false);
  };

  const handleNext = () => {
    if (nextLesson) {
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  const handlePrevious = () => {
    if (previousLesson) {
      navigate(`/course/${courseId}/lesson/${previousLesson.id}`);
    }
  };

  const handleComplete = () => {
    markComplete();
    if (nextLesson) {
      toast.success('Great job! Moving to the next lesson...');
      setTimeout(() => handleNext(), 1500);
    }
  };

  // Loading state
  if (enrollmentLoading || progressLoading || !lesson) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 border-b px-4 flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex">
          <div className="flex-1 p-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4 mt-4" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
          <div className="hidden lg:block w-80">
            <Skeleton className="h-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/course/${courseId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block">
            <p className="text-sm font-medium truncate max-w-[300px]">{courseTitle}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
              Module {currentModule?.id}: {currentModule?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="hidden sm:flex items-center gap-1 text-sm text-green-600 font-medium">
              <Check className="h-4 w-4" />
              Completed
            </span>
          )}

          {/* Mobile sidebar toggle */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 p-0">
              <LessonSidebar
                modules={modules}
                currentLessonId={lessonId || ''}
                completedLessons={completedLessons}
                isEnrolled={isEnrolled}
                onSelectLesson={handleSelectLesson}
                resources={lesson.resources}
                notes={<LessonNotes lessonId={lessonId || ''} currentTime={currentTime} />}
                bookmarks={<LessonBookmarks lessonId={lessonId || ''} />}
                isSyncing={isSyncing}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video & Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Assessment or Video Content */}
            {isAssessmentLesson && isModule1Assessment ? (
              <ModuleAssessment
                quizData={module1QuizData}
                exerciseData={module1ExerciseData}
                onComplete={(passed, exerciseScore) => {
                  if (passed) {
                    markComplete();
                    toast.success('Module 1 completed! Great work! 🎉');
                    if (nextLesson) {
                      setTimeout(() => handleNext(), 2000);
                    }
                  }
                }}
                onBack={() => navigate(`/course/${courseId}`)}
              />
            ) : (
              <>
                {/* Video Player */}
                <LessonPlayer
                  lessonId={lessonId || ''}
                  videoUrl={lesson.videoUrl}
                  duration={lesson.videoDurationSeconds}
                  title={lesson.title}
                  onComplete={handleComplete}
                  onNext={nextLesson ? handleNext : undefined}
                  onPrevious={previousLesson ? handlePrevious : undefined}
                  hasNext={!!nextLesson}
                  hasPrevious={!!previousLesson}
                />

                {/* Lesson Info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold">{lesson.title}</h1>
                    <p className="text-muted-foreground mt-2">{lesson.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {!isCompleted && (
                      <Button onClick={() => markComplete()} variant="outline">
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    )}
                    
                    {nextLesson && (
                      <Button onClick={handleNext}>
                        Next: {nextLesson.title}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}

                    {!nextLesson && isCompleted && (
                      <Button onClick={() => navigate(`/course/${courseId}`)}>
                        Back to Course
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Module Progress Tracker - Mobile */}
            {currentModule && !isAssessmentLesson && (
              <div className="lg:hidden">
                <ModuleProgressTracker
                  module={currentModule}
                  completedLessons={completedLessons}
                  currentLessonId={lessonId}
                  isSyncing={isSyncing}
                />
              </div>
            )}

            {/* Mobile Notes Section */}
            {!isAssessmentLesson && (
              <div className="lg:hidden space-y-4 pt-6 border-t">
                <h3 className="font-semibold">Your Notes</h3>
                <LessonNotes lessonId={lessonId || ''} currentTime={currentTime} />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sidebar */}
        {!isAssessmentLesson && (
          <div className="hidden lg:block w-80 xl:w-96 shrink-0 border-l overflow-hidden">
            <LessonSidebar
              modules={modules}
              currentLessonId={lessonId || ''}
              completedLessons={completedLessons}
              isEnrolled={isEnrolled}
              onSelectLesson={handleSelectLesson}
              resources={lesson.resources}
              notes={<LessonNotes lessonId={lessonId || ''} currentTime={currentTime} />}
              bookmarks={<LessonBookmarks lessonId={lessonId || ''} />}
              isSyncing={isSyncing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
