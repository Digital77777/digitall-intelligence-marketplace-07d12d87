 import { useState, useMemo } from 'react';
 import { 
   CheckCircle2, XCircle, HelpCircle, ChevronRight, ChevronDown,
   Lightbulb, Home, Music, Mail, Map, ShoppingCart, Activity,
   Thermometer, Radio, Video, Calculator, FileText, BookOpen,
   Car, MessageSquare, Watch, ScanLine, Target, Award
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { Badge } from '@/components/ui/badge';
 import { cn } from '@/lib/utils';
 import type { ExerciseScenario, ModuleExerciseData } from '@/data/module1ExerciseData';
 
 interface HandsOnExerciseProps {
   exerciseData: ModuleExerciseData;
   onComplete: (score: number, totalScenarios: number) => void;
 }
 
 // Icon mapping for dynamic rendering
 const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
   Thermometer, Lightbulb, Home, Music, Radio, Video, Mail, Calculator,
   FileText, Map, BookOpen, Car, ShoppingCart, ScanLine, MessageSquare,
   Watch, Activity, Stethoscope: Activity
 };
 
 type CategoryType = 'all' | ExerciseScenario['category'];
 
 export const HandsOnExercise = ({ exerciseData, onComplete }: HandsOnExerciseProps) => {
   const [currentIndex, setCurrentIndex] = useState(0);
   const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
   const [showExplanation, setShowExplanation] = useState(false);
   const [isComplete, setIsComplete] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
   const [showReflection, setShowReflection] = useState(false);
 
   const filteredScenarios = useMemo(() => {
     if (selectedCategory === 'all') return exerciseData.scenarios;
     return exerciseData.scenarios.filter(s => s.category === selectedCategory);
   }, [exerciseData.scenarios, selectedCategory]);
 
   const currentScenario = filteredScenarios[currentIndex];
   const userAnswer = currentScenario ? answers[currentScenario.id] : null;
   const isAnswered = userAnswer !== undefined && userAnswer !== null;
   const isCorrect = isAnswered && userAnswer === currentScenario?.isAI;
 
   const stats = useMemo(() => {
     const answered = Object.keys(answers).length;
     const correct = Object.entries(answers).filter(([id, answer]) => {
       const scenario = exerciseData.scenarios.find(s => s.id === id);
       return scenario && answer === scenario.isAI;
     }).length;
     return { answered, correct, total: exerciseData.scenarios.length };
   }, [answers, exerciseData.scenarios]);
 
   const handleAnswer = (isAI: boolean) => {
     if (isAnswered || !currentScenario) return;
     setAnswers(prev => ({ ...prev, [currentScenario.id]: isAI }));
     setShowExplanation(true);
   };
 
   const handleNext = () => {
     setShowExplanation(false);
     if (currentIndex < filteredScenarios.length - 1) {
       setCurrentIndex(prev => prev + 1);
     } else if (stats.answered >= exerciseData.scenarios.length) {
       setIsComplete(true);
       onComplete(stats.correct, stats.total);
     } else {
       // More scenarios in other categories
       setSelectedCategory('all');
       const nextUnanswered = exerciseData.scenarios.findIndex(s => answers[s.id] === undefined);
       if (nextUnanswered !== -1) {
         setCurrentIndex(nextUnanswered);
       } else {
         setIsComplete(true);
         onComplete(stats.correct, stats.total);
       }
     }
   };
 
   const categories: { value: CategoryType; label: string; icon: React.ReactNode }[] = [
     { value: 'all', label: 'All', icon: <Target className="h-4 w-4" /> },
     { value: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
     { value: 'entertainment', label: 'Entertainment', icon: <Video className="h-4 w-4" /> },
     { value: 'work', label: 'Work', icon: <FileText className="h-4 w-4" /> },
     { value: 'travel', label: 'Travel', icon: <Map className="h-4 w-4" /> },
     { value: 'shopping', label: 'Shopping', icon: <ShoppingCart className="h-4 w-4" /> },
     { value: 'health', label: 'Health', icon: <Activity className="h-4 w-4" /> },
   ];
 
   // Completion View
   if (isComplete) {
     const percentage = Math.round((stats.correct / stats.total) * 100);
     const passed = percentage >= 70;
 
     return (
       <Card className="max-w-3xl mx-auto">
         <CardContent className="pt-8">
           <div className="text-center mb-8">
             <div className={cn(
               "w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center",
               passed ? "bg-green-500/20" : "bg-yellow-500/20"
             )}>
               <Award className={cn("h-10 w-10", passed ? "text-green-500" : "text-yellow-500")} />
             </div>
             
             <h2 className="text-2xl font-bold mb-2">
               {passed ? 'Excellent Work! 🎉' : 'Good Effort!'}
             </h2>
             
             <p className="text-muted-foreground mb-4">
               You correctly identified <strong>{stats.correct}</strong> out of <strong>{stats.total}</strong> scenarios ({percentage}%)
             </p>
 
             <div className="flex justify-center gap-4 mb-8">
               <Badge variant="outline" className="text-green-600 border-green-600">
                 <CheckCircle2 className="h-3 w-3 mr-1" /> {stats.correct} Correct
               </Badge>
               <Badge variant="outline" className="text-red-600 border-red-600">
                 <XCircle className="h-3 w-3 mr-1" /> {stats.total - stats.correct} Incorrect
               </Badge>
             </div>
           </div>
 
           {/* Reflection Section */}
           <div className="space-y-4">
             <button
               onClick={() => setShowReflection(!showReflection)}
               className="flex items-center gap-2 text-lg font-semibold w-full"
             >
               {showReflection ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
               <Lightbulb className="h-5 w-5 text-yellow-500" />
               Reflection Questions
             </button>
             
             {showReflection && (
               <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                 {exerciseData.reflectionQuestions.map((question, i) => (
                   <div key={i} className="flex gap-3">
                     <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                       {i + 1}
                     </span>
                     <p className="text-sm text-muted-foreground">{question}</p>
                   </div>
                 ))}
               </div>
             )}
           </div>
 
           <div className="flex justify-center mt-8">
             <Button onClick={() => {
               setIsComplete(false);
               setAnswers({});
               setCurrentIndex(0);
               setShowExplanation(false);
             }} variant="outline" className="mr-4">
               Try Again
             </Button>
             <Button onClick={() => onComplete(stats.correct, stats.total)}>
               Continue
               <ChevronRight className="h-4 w-4 ml-2" />
             </Button>
           </div>
         </CardContent>
       </Card>
     );
   }
 
   if (!currentScenario) return null;
 
   const IconComponent = iconMap[currentScenario.icon] || HelpCircle;
 
   return (
     <div className="max-w-3xl mx-auto space-y-6">
       {/* Header */}
       <Card>
         <CardHeader className="pb-4">
           <div className="flex items-center justify-between">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <Target className="h-5 w-5 text-primary" />
                 {exerciseData.exerciseTitle}
               </CardTitle>
               <CardDescription className="mt-1">{exerciseData.description}</CardDescription>
             </div>
             <Badge variant="secondary">
               {stats.answered}/{stats.total} Complete
             </Badge>
           </div>
           <Progress value={(stats.answered / stats.total) * 100} className="h-2 mt-4" />
         </CardHeader>
       </Card>
 
       {/* Category Filter */}
       <div className="flex flex-wrap gap-2">
         {categories.map(cat => {
           const categoryCount = cat.value === 'all' 
             ? exerciseData.scenarios.length 
             : exerciseData.scenarios.filter(s => s.category === cat.value).length;
           const answeredInCat = cat.value === 'all'
             ? stats.answered
             : exerciseData.scenarios.filter(s => s.category === cat.value && answers[s.id] !== undefined).length;
           
           return (
             <Button
               key={cat.value}
               variant={selectedCategory === cat.value ? 'default' : 'outline'}
               size="sm"
               onClick={() => {
                 setSelectedCategory(cat.value);
                 setCurrentIndex(0);
                 setShowExplanation(false);
               }}
               className="gap-1"
             >
               {cat.icon}
               {cat.label}
               <span className="text-xs opacity-70">({answeredInCat}/{categoryCount})</span>
             </Button>
           );
         })}
       </div>
 
       {/* Scenario Card */}
       <Card className="overflow-hidden">
         <CardContent className="pt-6">
           <div className="flex items-start gap-4 mb-6">
             <div className={cn(
               "shrink-0 w-14 h-14 rounded-xl flex items-center justify-center",
               isAnswered 
                 ? currentScenario.isAI ? "bg-green-500/20" : "bg-muted"
                 : "bg-primary/10"
             )}>
               <IconComponent className={cn(
                 "h-7 w-7",
                 isAnswered 
                   ? currentScenario.isAI ? "text-green-600" : "text-muted-foreground"
                   : "text-primary"
               )} />
             </div>
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-lg font-semibold">{currentScenario.title}</h3>
                 <Badge variant="outline" className="capitalize text-xs">
                   {currentScenario.category}
                 </Badge>
               </div>
               <p className="text-muted-foreground">{currentScenario.description}</p>
             </div>
           </div>
 
           {/* Question */}
           <div className="bg-muted/50 rounded-lg p-4 mb-6">
             <p className="font-medium text-center">Does this use Artificial Intelligence?</p>
           </div>
 
           {/* Answer Buttons */}
           <div className="grid grid-cols-2 gap-4 mb-6">
             <button
               onClick={() => handleAnswer(true)}
               disabled={isAnswered}
               className={cn(
                 "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                 !isAnswered && "hover:border-green-500 hover:bg-green-500/5 cursor-pointer",
                 isAnswered && userAnswer === true && isCorrect && "border-green-500 bg-green-500/10",
                 isAnswered && userAnswer === true && !isCorrect && "border-red-500 bg-red-500/10",
                 isAnswered && userAnswer !== true && "opacity-50"
               )}
             >
               <CheckCircle2 className={cn(
                 "h-8 w-8",
                 isAnswered && userAnswer === true && isCorrect && "text-green-500",
                 isAnswered && userAnswer === true && !isCorrect && "text-red-500",
                 !isAnswered && "text-green-600"
               )} />
               <span className="font-medium">Yes, it's AI</span>
             </button>
 
             <button
               onClick={() => handleAnswer(false)}
               disabled={isAnswered}
               className={cn(
                 "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                 !isAnswered && "hover:border-red-500 hover:bg-red-500/5 cursor-pointer",
                 isAnswered && userAnswer === false && isCorrect && "border-green-500 bg-green-500/10",
                 isAnswered && userAnswer === false && !isCorrect && "border-red-500 bg-red-500/10",
                 isAnswered && userAnswer !== false && "opacity-50"
               )}
             >
               <XCircle className={cn(
                 "h-8 w-8",
                 isAnswered && userAnswer === false && isCorrect && "text-green-500",
                 isAnswered && userAnswer === false && !isCorrect && "text-red-500",
                 !isAnswered && "text-red-600"
               )} />
               <span className="font-medium">No, not AI</span>
             </button>
           </div>
 
           {/* Explanation */}
           {showExplanation && (
             <div className={cn(
               "p-4 rounded-lg mb-6",
               isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-yellow-500/10 border border-yellow-500/20"
             )}>
               <div className="flex items-center gap-2 mb-2">
                 {isCorrect ? (
                   <CheckCircle2 className="h-5 w-5 text-green-500" />
                 ) : (
                   <Lightbulb className="h-5 w-5 text-yellow-500" />
                 )}
                 <span className="font-semibold">
                   {isCorrect ? 'Correct!' : 'Not quite...'}
                 </span>
                 <Badge variant={currentScenario.isAI ? 'default' : 'secondary'} className="ml-auto">
                   {currentScenario.isAI ? 'Uses AI' : 'Not AI'}
                 </Badge>
               </div>
               <p className="text-sm text-muted-foreground">{currentScenario.aiExplanation}</p>
             </div>
           )}
 
           {/* Navigation */}
           {isAnswered && (
             <Button onClick={handleNext} className="w-full">
               {currentIndex < filteredScenarios.length - 1 ? 'Next Scenario' : 
                stats.answered >= stats.total ? 'See Results' : 'Continue'}
               <ChevronRight className="h-4 w-4 ml-2" />
             </Button>
           )}
         </CardContent>
       </Card>
 
       {/* Progress Overview */}
       <div className="flex items-center justify-center gap-1 flex-wrap">
         {filteredScenarios.map((scenario, idx) => {
           const answered = answers[scenario.id] !== undefined;
           const correct = answered && answers[scenario.id] === scenario.isAI;
           
           return (
             <button
               key={scenario.id}
               onClick={() => {
                 setCurrentIndex(idx);
                 setShowExplanation(answered);
               }}
               className={cn(
                 "w-3 h-3 rounded-full transition-all",
                 idx === currentIndex && "ring-2 ring-primary ring-offset-2",
                 !answered && "bg-muted",
                 answered && correct && "bg-green-500",
                 answered && !correct && "bg-red-500"
               )}
             />
           );
         })}
       </div>
     </div>
   );
 };