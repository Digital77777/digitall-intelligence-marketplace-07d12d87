import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Heart, 
  Share2, 
  Clock, 
  BookOpen, 
  Award, 
  Infinity,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface EnrollmentCardProps {
  courseId: string;
  isEnrolled: boolean;
  isEnrolling: boolean;
  progressPercent: number;
  onEnroll: () => void;
  onContinue?: () => void;
  totalLessons: number;
  duration: string;
  videoPlaceholder?: string;
}

export const EnrollmentCard = ({
  courseId,
  isEnrolled,
  isEnrolling,
  progressPercent,
  onEnroll,
  onContinue,
  totalLessons,
  duration,
  videoPlaceholder,
}: EnrollmentCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEnrollClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    onEnroll();
  };

  const features = [
    { icon: BookOpen, label: `${totalLessons} lessons` },
    { icon: Clock, label: duration },
    { icon: Award, label: 'Certificate included' },
    { icon: Infinity, label: 'Lifetime access' },
  ];

  return (
    <Card className="sticky top-24 shadow-lg border-2 overflow-hidden">
      {/* Video Preview Section */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group cursor-pointer">
        {videoPlaceholder ? (
          <img 
            src={videoPlaceholder} 
            alt="Course preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        <Badge className="absolute top-3 left-3 bg-green-500 text-white">
          Free
        </Badge>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Progress or CTA */}
        {isEnrolled ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your progress</span>
              <span className="font-semibold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <Button 
              className="w-full" 
              size="lg"
              variant="ai"
              onClick={onContinue}
            >
              <Play className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            size="lg"
            variant="ai"
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
                Enroll Now — It's Free
              </>
            )}
          </Button>
        )}

        {/* Secondary Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            Wishlist
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t pt-5">
          <h4 className="font-semibold mb-3 text-sm">This course includes:</h4>
          <ul className="space-y-2.5">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                <feature.icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
