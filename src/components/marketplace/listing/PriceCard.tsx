import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  MessageCircle, 
  Heart,
  Clock,
  Zap,
  Shield,
  CheckCircle2
} from 'lucide-react';

interface PriceCardProps {
  price: number | null;
  currency: string;
  deliveryTime?: number | null;
  creationLink?: string | null;
  isFavorited: boolean;
  isPending: boolean;
  onFavorite: () => void;
  onContact: () => void;
  className?: string;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  price,
  currency,
  deliveryTime,
  creationLink,
  isFavorited,
  isPending,
  onFavorite,
  onContact,
  className
}) => {
  const formattedPrice = price ? `${currency} ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Free';

  return (
    <div className={cn(
      "bg-card rounded-2xl border shadow-sm overflow-hidden",
      className
    )}>
      {/* Price Header */}
      <div className="p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight">{formattedPrice}</span>
          {price && price > 0 && (
            <span className="text-muted-foreground">one-time</span>
          )}
        </div>
        
        {deliveryTime && (
          <div className="flex items-center gap-2 mt-3 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{deliveryTime} day delivery</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="p-6 space-y-3">
        {creationLink && (
          <Button asChild className="w-full h-12 text-base gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20">
            <a
              href={creationLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Zap className="w-5 h-5" />
              Use This Creation
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </Button>
        )}
        
        <Button
          variant={creationLink ? "outline" : "default"}
          className={cn(
            "w-full h-12 text-base gap-2",
            !creationLink && "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
          )}
          onClick={onContact}
        >
          <MessageCircle className="w-5 h-5" />
          Contact Seller
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full gap-2",
            isFavorited && "text-red-500"
          )}
          onClick={onFavorite}
          disabled={isPending}
        >
          <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
          {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
        </Button>
      </div>

      <Separator />

      {/* Trust Badges */}
      <div className="p-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Secure Transaction</p>
            <p className="text-xs text-muted-foreground">Protected by our platform</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Quality Guaranteed</p>
            <p className="text-xs text-muted-foreground">Verified by our team</p>
          </div>
        </div>
      </div>
    </div>
  );
};
