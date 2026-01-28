import { ReactNode } from 'react';
import { useTier } from '@/contexts/TierContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TierGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const TierGate = ({ feature, children, fallback }: TierGateProps) => {
  const { canAccessFeature, loading, tierName } = useTier();
  const navigate = useNavigate();

  // Show proper loading skeleton instead of flash of content
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!canAccessFeature(feature)) {
    // Determine which tier is required for this feature
    const requiredTier = feature.includes('career') || feature.includes('unlimited') || 
                         feature.includes('personal_ai_tutor') || feature.includes('analytics') 
                         ? 'Career' : 'Creator';

    return fallback || (
      <Card className="border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">
            Unlock This Feature
          </CardTitle>
          <CardDescription className="text-sm">
            This feature is available on the <span className="font-medium text-primary">{requiredTier}</span> tier.
            {tierName === 'starter' && ' Upgrade to access more powerful tools and features.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => navigate('/subscription')}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            View Upgrade Options
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
