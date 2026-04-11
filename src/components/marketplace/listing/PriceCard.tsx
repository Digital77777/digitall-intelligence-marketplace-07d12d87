import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, MessageCircle, Heart, Clock, Zap,
  Shield, CheckCircle2, Crown, Truck, RefreshCw, Award, ShieldCheck
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: number;
  period: string;
  features: string[];
}

interface PriceCardProps {
  price: number | null;
  currency: string;
  deliveryTime?: number | null;
  creationLink?: string | null;
  isFavorited: boolean;
  isPending: boolean;
  onFavorite: () => void;
  onContact: () => void;
  pricingTiers?: PricingTier[] | null;
  className?: string;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  price, currency, deliveryTime, creationLink,
  isFavorited, isPending, onFavorite, onContact,
  pricingTiers, className
}) => {
  const [selectedTier, setSelectedTier] = useState(0);
  const hasTiers = pricingTiers && pricingTiers.length > 0;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);

  const periodLabel = (period: string) => {
    switch (period) {
      case 'monthly': return '/mo';
      case 'yearly': return '/yr';
      case 'one-time': return ' one-time';
      default: return '';
    }
  };

  const formattedPrice = price ? formatPrice(price) : 'Free';
  const displayPrice = hasTiers
    ? pricingTiers![selectedTier].price === 0 ? 'Free' : formatPrice(pricingTiers![selectedTier].price)
    : formattedPrice;

  return (
    <div className={cn("bg-card rounded-lg border overflow-hidden", className)}>
      {/* Price Header — Alibaba orange accent */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-4 border-b">
        {hasTiers ? (
          <>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {pricingTiers!.map((tier, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTier(idx)}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-medium border transition-all",
                    selectedTier === idx
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  {tier.name}
                </button>
              ))}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{displayPrice}</span>
              {pricingTiers![selectedTier].price > 0 && (
                <span className="text-muted-foreground text-sm">{periodLabel(pricingTiers![selectedTier].period)}</span>
              )}
            </div>
            {pricingTiers![selectedTier].features.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {pricingTiers![selectedTier].features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{formattedPrice}</span>
              {price && price > 0 && <span className="text-xs text-muted-foreground">one-time</span>}
            </div>
            {deliveryTime && (
              <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{deliveryTime} day delivery</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2">
        {creationLink && (
          <Button asChild className="w-full h-10 text-sm gap-2 bg-orange-600 hover:bg-orange-700 text-white">
            <a href={creationLink} target="_blank" rel="noopener noreferrer">
              <Zap className="w-4 h-4" />
              Use This Creation
              <ExternalLink className="w-3.5 h-3.5 ml-auto" />
            </a>
          </Button>
        )}
        <Button
          variant={creationLink ? "outline" : "default"}
          className={cn(
            "w-full h-10 text-sm gap-2",
            !creationLink && "bg-orange-600 hover:bg-orange-700 text-white"
          )}
          onClick={onContact}
        >
          <MessageCircle className="w-4 h-4" />
          Contact Seller
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full gap-2 text-xs", isFavorited && "text-red-500")}
          onClick={onFavorite}
          disabled={isPending}
        >
          <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
          {isFavorited ? 'Saved' : 'Add to Favorites'}
        </Button>
      </div>

      <Separator />

      {/* Trade Assurance Badges — Alibaba style */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Buyer Protection</p>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium">Secure Transaction</p>
              <p className="text-[10px] text-muted-foreground">Protected by platform guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium">Refund Policy</p>
              <p className="text-[10px] text-muted-foreground">Money-back if not as described</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium">Quality Verified</p>
              <p className="text-[10px] text-muted-foreground">Reviewed by our team</p>
            </div>
          </div>
          {deliveryTime && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium">On-Time Delivery</p>
                <p className="text-[10px] text-muted-foreground">Guaranteed within {deliveryTime} days</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
