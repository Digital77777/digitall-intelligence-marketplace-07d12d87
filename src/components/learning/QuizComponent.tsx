import { useState } from 'react';
import { Check, X, RotateCcw, ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizComponentProps {
  title: string;
  questions: QuizQuestion[];
  passingScore?: number; // percentage
  onComplete?: (passed: boolean, score: number) => void;
}

export const QuizComponent = ({
  title,
  questions,
  passingScore = 70,
  onComplete,
}: QuizComponentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;

  const handleSelectAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate final score
      const correctCount = selectedAnswers.reduce((count, answer, index) => {
        return count + (answer === questions[index].correctIndex ? 1 : 0);
      }, 0);
      const score = (correctCount / questions.length) * 100;
      const passed = score >= passingScore;
      
      setShowResults(true);
      onComplete?.(passed, score);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
    setShowExplanation(false);
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Results View
  if (showResults) {
    const correctCount = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === questions[index].correctIndex ? 1 : 0);
    }, 0);
    const score = (correctCount / questions.length) * 100;
    const passed = score >= passingScore;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 text-center">
          <div className={cn(
            "w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center",
            passed ? "bg-green-500/20" : "bg-red-500/20"
          )}>
            {passed ? (
              <Trophy className="h-10 w-10 text-green-500" />
            ) : (
              <X className="h-10 w-10 text-red-500" />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {passed ? 'Congratulations! 🎉' : 'Keep Learning!'}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            You scored <strong>{Math.round(score)}%</strong> ({correctCount}/{questions.length} correct)
          </p>

          {!passed && (
            <p className="text-sm text-muted-foreground mb-6">
              You need {passingScore}% to pass. Don't give up!
            </p>
          )}

          <div className="flex justify-center gap-4">
            {!passed && (
              <Button onClick={handleRetry} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button onClick={() => onComplete?.(passed, score)}>
              {passed ? 'Continue' : 'Review Lesson'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz View
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="text-lg font-medium">
          {currentQuestion.question}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === currentQuestion.correctIndex;
            const showCorrectness = isAnswered;

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={isAnswered}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  !isAnswered && "cursor-pointer",
                  isAnswered && "cursor-default",
                  isSelected && !showCorrectness && "border-primary bg-primary/10",
                  showCorrectness && isCorrectOption && "border-green-500 bg-green-500/10",
                  showCorrectness && isSelected && !isCorrectOption && "border-red-500 bg-red-500/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium",
                    !showCorrectness && "bg-muted",
                    showCorrectness && isCorrectOption && "bg-green-500 text-white",
                    showCorrectness && isSelected && !isCorrectOption && "bg-red-500 text-white"
                  )}>
                    {showCorrectness && isCorrectOption ? (
                      <Check className="h-4 w-4" />
                    ) : showCorrectness && isSelected && !isCorrectOption ? (
                      <X className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </span>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && currentQuestion.explanation && (
          <div className={cn(
            "p-4 rounded-lg",
            isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-yellow-500/10 border border-yellow-500/20"
          )}>
            <p className="text-sm font-medium mb-1">
              {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <Button onClick={handleNext} className="w-full">
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Sample quiz data for testing
export const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What does AI stand for?',
    options: [
      'Automated Intelligence',
      'Artificial Intelligence',
      'Advanced Integration',
      'Algorithmic Inference'
    ],
    correctIndex: 1,
    explanation: 'AI stands for Artificial Intelligence, which refers to computer systems designed to perform tasks that typically require human intelligence.'
  },
  {
    id: '2',
    question: 'Which of the following is an example of narrow AI?',
    options: [
      'A robot that can do any human task',
      'A self-aware computer system',
      'A spam filter in your email',
      'A superintelligent machine'
    ],
    correctIndex: 2,
    explanation: 'A spam filter is a narrow AI because it\'s designed for one specific task. It cannot do anything beyond detecting spam emails.'
  },
  {
    id: '3',
    question: 'What is machine learning?',
    options: [
      'Programming computers with explicit rules',
      'Teaching computers to learn from data',
      'Building physical robots',
      'Creating computer graphics'
    ],
    correctIndex: 1,
    explanation: 'Machine learning is a subset of AI where computers learn patterns from data rather than being explicitly programmed with rules.'
  }
];
