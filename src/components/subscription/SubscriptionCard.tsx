import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { SubscriptionTier } from '@/hooks/useSubscription';

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  isCurrentTier?: boolean;
  isAdminEmail?: boolean;
  onSelect: () => void;
  loading?: boolean;
}

const getTierIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'starter':
      return <Sparkles className="h-6 w-6" />;
    case 'creator':
      return <Zap className="h-6 w-6" />;
    case 'career':
      return <Crown className="h-6 w-6" />;
    default:
      return null;
  }
};

const getTierGradient = (name: string) => {
  switch (name.toLowerCase()) {
    case 'starter':
      return 'from-blue-500 to-cyan-500';
    case 'creator':
      return 'from-purple-500 to-pink-500';
    case 'career':
      return 'from-orange-500 to-red-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  tier,
  isCurrentTier,
  isAdminEmail,
  onSelect,
  loading
}) => {
  const navigate = useNavigate();
  const features = Array.isArray(tier.features) ? tier.features : [];
  const isPopular = tier.name === 'creator';

  return (
    <Card className={`relative ${isCurrentTier ? 'border-primary shadow-lg' : ''} ${isPopular ? 'border-2' : ''}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTierGradient(tier.name)} flex items-center justify-center text-white mb-4`}>
          {getTierIcon(tier.name)}
        </div>
        
        <CardTitle className="text-2xl flex items-center gap-2">
          {tier.display_name}
          {isCurrentTier && (
            <Badge variant="secondary" className="text-xs">Current</Badge>
          )}
        </CardTitle>
        
        <CardDescription>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-foreground">
              {tier.currency} {tier.price}
            </span>
            {tier.price > 0 && <span className="text-muted-foreground">/month</span>}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={() => {
            const tierName = tier.name.toLowerCase();
            if (!isCurrentTier && !isAdminEmail) {
              if (tierName === 'creator') {
                window.open('https://paystack.shop/pay/ts0e31g1c2', '_blank');
                navigate('/payment-success?tier=creator');
                return;
              }
              if (tierName === 'career') {
                window.open('https://paystack.shop/pay/zilqdln6c9', '_blank');
                navigate('/payment-success?tier=career');
                return;
              }
            }
            onSelect();
          }}
          disabled={isCurrentTier || loading}
          className={`w-full ${isPopular ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90' : ''}`}
          variant={isCurrentTier ? 'outline' : 'default'}
        >
          {isCurrentTier ? 'Current Plan' : isAdminEmail ? 'Switch to This Plan' : tier.price > 0 ? 'Upgrade' : 'Get Started'}
        </Button>
      </CardFooter>
      
      {isAdminEmail && !isCurrentTier && (
        <div className="px-6 pb-4">
          <Badge variant="outline" className="w-full justify-center">
            Admin - No payment required
          </Badge>
        </div>
      )}
    </Card>
  );
};
