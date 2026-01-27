import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  MessageCircle, 
  Star, 
  Shield,
  ExternalLink
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
  seller,
  userId,
  onContact,
  className
}) => {
  const initials = seller.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className={cn(
      "bg-card rounded-2xl border shadow-sm overflow-hidden",
      className
    )}>
      {/* Header with gradient */}
      <div className="h-16 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
      
      {/* Content */}
      <div className="p-5 -mt-8">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link to={`/profile/${userId}`} className="relative group">
            <Avatar className="w-16 h-16 ring-4 ring-background shadow-lg">
              <AvatarImage src={seller.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-background">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-8">
            <Link
              to={`/profile/${userId}`}
              className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
            >
              {seller.full_name || 'Anonymous Seller'}
            </Link>
            {seller.headline && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {seller.headline}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 py-3 border-y border-border/50">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium">4.9</span>
            <span className="text-muted-foreground text-sm">(128)</span>
          </div>
          {seller.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{seller.location}</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Top Rated
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={onContact}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link to={`/profile/${userId}`}>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
