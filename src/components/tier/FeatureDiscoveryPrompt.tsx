import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useTier } from '@/contexts/TierContext';

interface FeatureDiscoveryPromptProps {
  feature: string;
  featureDisplayName: string;
  requiredTier?: 'creator' | 'career';
  description?: string;
  compact?: boolean;
}

const TIER_BENEFITS = {
  creator: {
    name: 'Creator',
    price: 'R95/mo',
    highlights: ['10 AI Tools', '10 Marketplace Listings', 'Referral Earnings']
  },
  career: {
    name: 'Career',
    price: 'R250/mo',
    highlights: ['Unlimited Tools', 'Personal AI Tutor', 'Career Certification']
  }
};

export const FeatureDiscoveryPrompt = ({ 
  feature, 
  featureDisplayName,
  requiredTier = 'creator',
  description,
  compact = false
}: FeatureDiscoveryPromptProps) => {
  const navigate = useNavigate();
  const { tierName } = useTier();

  const tierInfo = TIER_BENEFITS[requiredTier];

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary/60" />
          <div>
            <p className="font-medium text-sm">{featureDisplayName}</p>
            <p className="text-xs text-muted-foreground">
              Available on {tierInfo.name} tier
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/subscription')}
          className="shrink-0"
        >
          Unlock
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary/70" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              Unlock {featureDisplayName}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {description || `This premium feature is available on the ${tierInfo.name} tier. Upgrade to access ${featureDisplayName.toLowerCase()} and more.`}
            </p>
          </div>

          {/* Tier highlights */}
          <div className="flex flex-wrap justify-center gap-2">
            {tierInfo.highlights.map((highlight) => (
              <span 
                key={highlight}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
              >
                {highlight}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button 
              onClick={() => navigate('/subscription')}
              className="gap-2 min-w-[160px]"
            >
              View {tierInfo.name} Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Starting at {tierInfo.price}
            </span>
          </div>

          {/* Current tier indicator */}
          {tierName && (
            <p className="text-xs text-muted-foreground">
              You're currently on the <span className="font-medium capitalize">{tierName}</span> tier
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};