import { useTier } from '@/contexts/TierContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, Users, Store, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProgressItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number | string;
  color?: string;
}

const ProgressItem = ({ icon, label, value, max, color = 'primary' }: ProgressItemProps) => {
  const percentage = typeof max === 'number' ? (value / max) * 100 : 100;
  const displayMax = typeof max === 'number' ? max : max;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-muted-foreground">
          {value} / {displayMax}
        </span>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className="h-2"
      />
    </div>
  );
};

interface StarterProgressProps {
  toolsUsed?: number;
  coursesStarted?: number;
  communityPosts?: number;
  listingsCreated?: number;
}

export const StarterProgress = ({ 
  toolsUsed = 0, 
  coursesStarted = 0, 
  communityPosts = 0,
  listingsCreated = 0
}: StarterProgressProps) => {
  const { maxToolsAccess, maxListings, tierName } = useTier();
  const navigate = useNavigate();

  // Calculate overall engagement score
  const toolProgress = (toolsUsed / maxToolsAccess) * 100;
  const courseProgress = Math.min((coursesStarted / 2) * 100, 100); // 2 paths for starter
  const overallProgress = (toolProgress + courseProgress) / 2;

  const isNearingLimits = toolsUsed >= maxToolsAccess - 1 || listingsCreated >= maxListings;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </div>
          {tierName === 'starter' && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              Starter
            </span>
          )}
        </div>
        <CardDescription>
          Track your learning journey and engagement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressItem
          icon={<Brain className="h-4 w-4 text-primary" />}
          label="AI Tools Used"
          value={toolsUsed}
          max={maxToolsAccess}
        />
        
        <ProgressItem
          icon={<BookOpen className="h-4 w-4 text-primary" />}
          label="Courses Started"
          value={coursesStarted}
          max={2}
        />
        
        <ProgressItem
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Community Posts"
          value={communityPosts}
          max="∞"
        />
        
        <ProgressItem
          icon={<Store className="h-4 w-4 text-primary" />}
          label="Listings Created"
          value={listingsCreated}
          max={maxListings}
        />

        {/* Upgrade prompt when nearing limits */}
        {isNearingLimits && tierName === 'starter' && (
          <div className="pt-2 border-t">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="text-sm">
                <p className="font-medium">You're making great progress! 🎉</p>
                <p className="text-muted-foreground">
                  Unlock more tools and features with an upgrade.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/subscription')}
                className="shrink-0 gap-1"
              >
                Upgrade
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Overall progress indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Engagement</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );
};