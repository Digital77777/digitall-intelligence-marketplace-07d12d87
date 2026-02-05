 import { useState } from 'react';
 import { BookOpen, ClipboardList, Trophy, ChevronRight, ArrowLeft } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Badge } from '@/components/ui/badge';
 import { cn } from '@/lib/utils';
 import { QuizComponent } from './QuizComponent';
 import { HandsOnExercise } from './HandsOnExercise';
 import type { ModuleQuizData } from '@/data/module1QuizData';
 import type { ModuleExerciseData } from '@/data/module1ExerciseData';
 
 interface ModuleAssessmentProps {
   quizData: ModuleQuizData;
   exerciseData: ModuleExerciseData;
   onComplete?: (quizPassed: boolean, exerciseScore: number) => void;
   onBack?: () => void;
 }
 
 type AssessmentStep = 'intro' | 'quiz' | 'exercise' | 'complete';
 
 interface CompletionState {
   quizCompleted: boolean;
   quizPassed: boolean;
   quizScore: number;
   exerciseCompleted: boolean;
   exerciseScore: number;
   exerciseTotal: number;
 }
 
 export const ModuleAssessment = ({
   quizData,
   exerciseData,
   onComplete,
   onBack
 }: ModuleAssessmentProps) => {
   const [activeTab, setActiveTab] = useState<'quiz' | 'exercise'>('quiz');
   const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
   const [completion, setCompletion] = useState<CompletionState>({
     quizCompleted: false,
     quizPassed: false,
     quizScore: 0,
     exerciseCompleted: false,
     exerciseScore: 0,
     exerciseTotal: 0
   });
 
   const handleQuizComplete = (passed: boolean, score: number) => {
     setCompletion(prev => ({
       ...prev,
       quizCompleted: true,
       quizPassed: passed,
       quizScore: score
     }));
     
     if (completion.exerciseCompleted) {
       setCurrentStep('complete');
       onComplete?.(passed, completion.exerciseScore);
     }
   };
 
   const handleExerciseComplete = (score: number, total: number) => {
     setCompletion(prev => ({
       ...prev,
       exerciseCompleted: true,
       exerciseScore: score,
       exerciseTotal: total
     }));
     
     if (completion.quizCompleted) {
       setCurrentStep('complete');
       onComplete?.(completion.quizPassed, score);
     }
   };
 
   const allCompleted = completion.quizCompleted && completion.exerciseCompleted;
   const overallPassed = completion.quizPassed && (completion.exerciseScore / completion.exerciseTotal >= 0.7);
 
   // Introduction View
   if (currentStep === 'intro') {
     return (
       <div className="max-w-3xl mx-auto space-y-6">
         {onBack && (
           <Button variant="ghost" onClick={onBack} className="mb-2">
             <ArrowLeft className="h-4 w-4 mr-2" />
             Back to Lessons
           </Button>
         )}
         
         <Card>
           <CardHeader className="text-center pb-2">
             <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
               <Trophy className="h-8 w-8 text-primary" />
             </div>
             <CardTitle className="text-2xl">Module {quizData.moduleId} Assessment</CardTitle>
             <CardDescription className="text-base mt-2">
               {quizData.moduleTitle}
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             <p className="text-center text-muted-foreground">
               Complete both the quiz and hands-on exercise to finish this module.
             </p>
 
             {/* Assessment Components */}
             <div className="grid md:grid-cols-2 gap-4">
               {/* Quiz Card */}
               <Card className={cn(
                 "relative overflow-hidden transition-all cursor-pointer hover:shadow-md",
                 completion.quizCompleted && "ring-2 ring-green-500"
               )} onClick={() => { setActiveTab('quiz'); setCurrentStep('quiz'); }}>
                 <CardContent className="pt-6">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                       <ClipboardList className="h-5 w-5 text-blue-500" />
                     </div>
                     <div>
                       <h3 className="font-semibold">Knowledge Quiz</h3>
                       <p className="text-xs text-muted-foreground">{quizData.questions.length} questions</p>
                     </div>
                     {completion.quizCompleted && (
                       <Badge variant={completion.quizPassed ? 'default' : 'destructive'} className="ml-auto">
                         {Math.round(completion.quizScore)}%
                       </Badge>
                     )}
                   </div>
                   <p className="text-sm text-muted-foreground">
                     Test your understanding of AI concepts, history, types, and ethics.
                   </p>
                   <div className="mt-4 flex items-center text-sm text-primary font-medium">
                     {completion.quizCompleted ? 'Review Quiz' : 'Start Quiz'}
                     <ChevronRight className="h-4 w-4 ml-1" />
                   </div>
                 </CardContent>
               </Card>
 
               {/* Exercise Card */}
               <Card className={cn(
                 "relative overflow-hidden transition-all cursor-pointer hover:shadow-md",
                 completion.exerciseCompleted && "ring-2 ring-green-500"
               )} onClick={() => { setActiveTab('exercise'); setCurrentStep('exercise'); }}>
                 <CardContent className="pt-6">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                       <BookOpen className="h-5 w-5 text-purple-500" />
                     </div>
                     <div>
                       <h3 className="font-semibold">Hands-On Exercise</h3>
                       <p className="text-xs text-muted-foreground">{exerciseData.scenarios.length} scenarios</p>
                     </div>
                     {completion.exerciseCompleted && (
                       <Badge variant="default" className="ml-auto">
                         {completion.exerciseScore}/{completion.exerciseTotal}
                       </Badge>
                     )}
                   </div>
                   <p className="text-sm text-muted-foreground">
                     Identify AI applications in everyday scenarios and understand how they work.
                   </p>
                   <div className="mt-4 flex items-center text-sm text-primary font-medium">
                     {completion.exerciseCompleted ? 'Review Exercise' : 'Start Exercise'}
                     <ChevronRight className="h-4 w-4 ml-1" />
                   </div>
                 </CardContent>
               </Card>
             </div>
 
             {/* Learning Objectives */}
             <div className="bg-muted/50 rounded-lg p-4">
               <h4 className="font-medium mb-3 flex items-center gap-2">
                 <BookOpen className="h-4 w-4" />
                 Learning Objectives
               </h4>
               <ul className="grid gap-2 text-sm text-muted-foreground">
                 {exerciseData.learningObjectives.map((obj, i) => (
                   <li key={i} className="flex items-start gap-2">
                     <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                       {i + 1}
                     </span>
                     {obj}
                   </li>
                 ))}
               </ul>
             </div>
 
             {/* Requirements */}
             <div className="text-center text-sm text-muted-foreground">
               <p>Passing requirements: <strong>{quizData.passingScore}%</strong> on quiz • <strong>70%</strong> on exercise</p>
             </div>
           </CardContent>
         </Card>
       </div>
     );
   }
 
   // Completion View
   if (currentStep === 'complete' && allCompleted) {
     return (
       <Card className="max-w-2xl mx-auto">
         <CardContent className="pt-8 text-center">
           <div className={cn(
             "w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center",
             overallPassed ? "bg-green-500/20" : "bg-yellow-500/20"
           )}>
             <Trophy className={cn("h-10 w-10", overallPassed ? "text-green-500" : "text-yellow-500")} />
           </div>
 
           <h2 className="text-2xl font-bold mb-2">
             {overallPassed ? 'Module Complete! 🎉' : 'Almost There!'}
           </h2>
           
           <p className="text-muted-foreground mb-6">
             {overallPassed 
               ? 'Congratulations! You\'ve successfully completed Module 1: Introduction to AI.' 
               : 'You\'ve completed the assessments but need a higher score to pass.'}
           </p>
 
           <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-muted/50 rounded-lg p-4">
               <div className="text-2xl font-bold text-primary">{Math.round(completion.quizScore)}%</div>
               <div className="text-sm text-muted-foreground">Quiz Score</div>
               <Badge variant={completion.quizPassed ? 'default' : 'destructive'} className="mt-2">
                 {completion.quizPassed ? 'Passed' : 'Not Passed'}
               </Badge>
             </div>
             <div className="bg-muted/50 rounded-lg p-4">
               <div className="text-2xl font-bold text-primary">
                 {Math.round((completion.exerciseScore / completion.exerciseTotal) * 100)}%
               </div>
               <div className="text-sm text-muted-foreground">Exercise Score</div>
               <Badge variant={(completion.exerciseScore / completion.exerciseTotal >= 0.7) ? 'default' : 'destructive'} className="mt-2">
                 {completion.exerciseScore}/{completion.exerciseTotal} Correct
               </Badge>
             </div>
           </div>
 
           <div className="flex justify-center gap-4">
             <Button variant="outline" onClick={() => setCurrentStep('intro')}>
               Review Assessment
             </Button>
             <Button onClick={() => onComplete?.(overallPassed, completion.exerciseScore)}>
               {overallPassed ? 'Continue to Next Module' : 'Try Again'}
               <ChevronRight className="h-4 w-4 ml-2" />
             </Button>
           </div>
         </CardContent>
       </Card>
     );
   }
 
   // Quiz/Exercise View with Tabs
   return (
     <div className="max-w-4xl mx-auto">
       <Button variant="ghost" onClick={() => setCurrentStep('intro')} className="mb-4">
         <ArrowLeft className="h-4 w-4 mr-2" />
         Back to Overview
       </Button>
 
       <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'quiz' | 'exercise')}>
         <TabsList className="grid w-full grid-cols-2 mb-6">
           <TabsTrigger value="quiz" className="gap-2">
             <ClipboardList className="h-4 w-4" />
             Quiz
             {completion.quizCompleted && (
               <Badge variant="secondary" className="ml-1">{Math.round(completion.quizScore)}%</Badge>
             )}
           </TabsTrigger>
           <TabsTrigger value="exercise" className="gap-2">
             <BookOpen className="h-4 w-4" />
             Exercise
             {completion.exerciseCompleted && (
               <Badge variant="secondary" className="ml-1">{completion.exerciseScore}/{completion.exerciseTotal}</Badge>
             )}
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="quiz">
           <QuizComponent
             title={quizData.moduleTitle}
             questions={quizData.questions}
             passingScore={quizData.passingScore}
             onComplete={handleQuizComplete}
           />
         </TabsContent>
 
         <TabsContent value="exercise">
           <HandsOnExercise
             exerciseData={exerciseData}
             onComplete={handleExerciseComplete}
           />
         </TabsContent>
       </Tabs>
     </div>
   );
 };