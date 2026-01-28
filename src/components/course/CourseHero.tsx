import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  BookOpen, 
  Users, 
  Star,
  CheckCircle,
  Loader2,
  Play
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface CourseHeroProps {
  title: string;
  description: string;
  tier: string;
  totalLessons: number;
  duration: string;
  enrolledCount: number;
  rating: number;
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
  onContinue?: () => void;
}

export const CourseHero = ({
  title,
  description,
  tier,
  totalLessons,
  duration,
  enrolledCount,
  rating,
  isEnrolled,
  isEnrolling,
  onEnroll,
  onContinue,
}: CourseHeroProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEnrollClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    onEnroll();
  };

  const stats = [
    { icon: Clock, value: duration, label: 'Duration' },
    { icon: BookOpen, value: `${totalLessons}`, label: 'Lessons' },
    { icon: Users, value: enrolledCount.toLocaleString(), label: 'Students' },
    { icon: Star, value: rating.toFixed(1), label: 'Rating' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-3xl">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {tier}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-600">
              Free Course
            </Badge>
            <Badge variant="outline">
              Beginner Friendly
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-in">
            {description}
          </p>

          {/* Stats Grid - Mobile 2x2, Desktop 4 cols */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="flex flex-col items-center p-4 rounded-xl bg-card/50 border animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="w-5 h-5 text-primary mb-2" />
                <span className="text-xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons - Mobile Only */}
          <div className="flex flex-col sm:flex-row gap-3 md:hidden animate-fade-in">
            {isEnrolled ? (
              <Button 
                size="lg" 
                variant="ai" 
                className="w-full sm:w-auto"
                onClick={onContinue}
              >
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="ai" 
                className="w-full sm:w-auto"
                onClick={handleEnrollClick}
                disabled={isEnrolling}
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enroll Now — Free
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground animate-fade-in">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span>Join {(enrolledCount + 3241).toLocaleString()}+ learners</span>
          </div>
        </div>
      </div>
    </div>
  );
};
