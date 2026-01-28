import { useTier } from '@/contexts/TierContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Store, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ListingLimitBanner = () => {
  const { tierName, maxListings } = useTier();
  const navigate = useNavigate();

  if (tierName === 'career') {
    return null; // Career tier has unlimited listings
  }

  return (
    <div className="mb-6">
      <Alert className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Store className="h-4 w-4 shrink-0 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <AlertTitle className="text-sm sm:text-base">
              {tierName === 'starter' && 'Starter Tier'}
              {tierName === 'creator' && 'Creator Tier'}
            </AlertTitle>
            <AlertDescription className="text-xs sm:text-sm mt-1">
              {/* Shorter text for mobile */}
              <span className="sm:hidden">
                {maxListings} listing{maxListings !== 1 ? 's' : ''} available. Upgrade for more.
              </span>
              <span className="hidden sm:inline">
                You can create up to <strong>{maxListings} marketplace listing{maxListings !== 1 ? 's' : ''}</strong>.
                {tierName === 'starter' && ' Upgrade to Creator for 10 listings or Career for unlimited listings.'}
                {tierName === 'creator' && ' Upgrade to Career for unlimited listings.'}
              </span>
            </AlertDescription>
          </div>
          {tierName !== 'career' && (
            <Button
              size="sm"
              variant="default"
              className="w-full sm:w-auto min-h-[44px] shrink-0"
              onClick={() => navigate('/subscription')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
};
