import React from 'react';
import { DollarSign, ExternalLink, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommissionBannerProps {
  commission?: string;
  creationLink?: string | null;
  title: string;
}

export const CommissionBanner: React.FC<CommissionBannerProps> = ({
  commission,
  creationLink,
  title,
}) => {
  if (!commission) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1">Earning Opportunity</h3>
          <p className="text-primary font-bold text-xl mb-2">{commission}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Promote {title} and earn commissions on every successful referral.
          </p>
          {creationLink && (
            <Button asChild size="sm" className="gap-2">
              <a href={creationLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Apply to Program
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
