import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, MessageCircle, Star, Shield, ExternalLink, Clock, CheckCircle2
} from 'lucide-react';

interface SellerCardProps {
  seller: {
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
    headline: string | null;
  };
  userId: string;
  onContact: () => void;
  className?: string;
}

export const SellerCard: React.FC<SellerCardProps> = ({
  seller, userId, onContact, className
}) => {
  const initials = seller.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className={cn("bg-card rounded-lg border overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seller Information</p>
      </div>

      <div className="p-4">
        {/* Profile row */}
        <div className="flex items-center gap-3">
          <Link to={`/profile/${userId}`} className="relative">
            <Avatar className="w-12 h-12 border">
              <AvatarImage src={seller.avatar_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-background">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${userId}`}
              className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
              {seller.full_name || 'Anonymous Seller'}
            </Link>
            {seller.headline && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{seller.headline}</p>
            )}
          </div>
        </div>

        {/* Stats grid — compact Alibaba style */}
        <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold">4.9</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Rating</p>
          </div>
          <div className="text-center border-x border-border/50">
            <span className="text-sm font-bold">128</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Reviews</p>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold">98%</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Response</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline" className="text-[10px] py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
            <Shield className="w-2.5 h-2.5 mr-1" />
            Verified
          </Badge>
          {seller.location && (
            <Badge variant="outline" className="text-[10px] py-0.5">
              <MapPin className="w-2.5 h-2.5 mr-1" />
              {seller.location}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] py-0.5 bg-primary/10 text-primary border-primary/20">
            <Clock className="w-2.5 h-2.5 mr-1" />
            Fast Responder
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs h-8" onClick={onContact}>
            <MessageCircle className="w-3.5 h-3.5" />
            Contact
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
            <Link to={`/profile/${userId}`}>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
