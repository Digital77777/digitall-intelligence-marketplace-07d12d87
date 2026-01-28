import { useTier } from '@/contexts/TierContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ToolAccessBanner = () => {
  const { tierName, maxToolsAccess } = useTier();
  const navigate = useNavigate();

  if (tierName === 'career') {
    return null; // Career tier has unlimited access
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4">
      <Alert className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Lock className="h-4 w-4 shrink-0 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <AlertTitle className="text-sm sm:text-base">
              {tierName === 'starter' && 'Starter Tier'}
              {tierName === 'creator' && 'Creator Tier'}
            </AlertTitle>
            <AlertDescription className="text-xs sm:text-sm mt-1">
              {/* Shorter text for mobile */}
              <span className="sm:hidden">
                {maxToolsAccess} tools available. Upgrade for more.
              </span>
              <span className="hidden sm:inline">
                You can access up to <strong>{maxToolsAccess} AI tools</strong>.
                {tierName === 'starter' && ' Upgrade to Creator for 10 tools or Career for unlimited access.'}
                {tierName === 'creator' && ' Upgrade to Career for unlimited access to all tools.'}
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
