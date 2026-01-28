import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RelatedPath {
  id: string;
  title: string;
  description: string;
  tier: string;
  duration: string;
  lessonCount: number;
  href: string;
  gradient: string;
}

interface RelatedPathsProps {
  currentPathId: string;
  paths?: RelatedPath[];
}

const defaultPaths: RelatedPath[] = [
  {
    id: 'practical-skills',
    title: 'Practical AI Skills',
    description: 'Hands-on projects and real-world applications to build your portfolio.',
    tier: 'Tier 1',
    duration: '6-8 weeks',
    lessonCount: 32,
    href: '/course/practical-skills',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'technical-developer',
    title: 'Technical AI Developer',
    description: 'Deep dive into AI/ML engineering with Python, TensorFlow, and more.',
    tier: 'Tier 2',
    duration: '10-12 weeks',
    lessonCount: 48,
    href: '/course/technical-developer',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'business-careers',
    title: 'AI for Business',
    description: 'Learn to leverage AI for business strategy and career advancement.',
    tier: 'Tier 1',
    duration: '4-6 weeks',
    lessonCount: 24,
    href: '/course/business-careers',
    gradient: 'from-amber-500/20 to-orange-500/20'
  }
];

export const RelatedPaths = ({ currentPathId, paths = defaultPaths }: RelatedPathsProps) => {
  const filteredPaths = paths.filter(path => path.id !== currentPathId);

  if (filteredPaths.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Continue Your Journey</h2>
        <Button variant="ghost" asChild className="hidden sm:flex">
          <Link to="/learning-paths">
            View All Paths
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPaths.slice(0, 3).map((path) => (
          <Link key={path.id} to={path.href}>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${path.gradient}`} />
              
              <CardContent className="p-5">
                <Badge variant="outline" className="mb-3 text-xs">
                  {path.tier}
                </Badge>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {path.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {path.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {path.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {path.lessonCount} lessons
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Button variant="outline" asChild className="w-full sm:hidden">
        <Link to="/learning-paths">
          View All Learning Paths
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
};
