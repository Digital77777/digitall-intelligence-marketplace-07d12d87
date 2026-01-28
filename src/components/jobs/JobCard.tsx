import { MapPin, Briefcase, DollarSign, Clock, Users, Building2, ExternalLink, Bookmark, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarketplaceListing } from '@/hooks/useMarketplace';

interface JobCardProps {
  job: MarketplaceListing;
  details: Record<string, string>;
  isOwnJob: boolean;
  onApply: (job: MarketplaceListing) => void;
  onViewDetails?: (job: MarketplaceListing) => void;
}

export const JobCard = ({ job, details, isOwnJob, onApply, onViewDetails }: JobCardProps) => {
  const getEmploymentBadgeColor = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('full')) return 'bg-primary/10 text-primary border-primary/20';
    if (lowerType.includes('part')) return 'bg-accent/10 text-accent-foreground border-accent/20';
    if (lowerType.includes('contract')) return 'bg-secondary text-secondary-foreground border-secondary';
    if (lowerType.includes('freelance')) return 'bg-muted text-muted-foreground border-muted';
    if (lowerType.includes('intern')) return 'bg-primary/5 text-primary border-primary/10';
    return 'bg-muted text-muted-foreground';
  };

  const isRemote = details.remote?.toLowerCase() === 'yes' || details.remote?.toLowerCase().includes('remote');

  return (
    <Card className="group relative overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-l-4 border-l-primary/60 hover:border-l-primary">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Company Logo Placeholder */}
          <div className="hidden lg:flex h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 items-center justify-center shrink-0">
            <Building2 className="h-7 w-7 text-primary" />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-semibold group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {details.company && (
                    <span className="font-medium text-foreground">{details.company}</span>
                  )}
                  {details.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {details.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-primary"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onApply(job)}
                  disabled={isOwnJob}
                >
                  {isOwnJob ? 'Your Listing' : 'Apply Now'}
                </Button>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 mb-4">
              {details.employment && (
                <Badge variant="outline" className={getEmploymentBadgeColor(details.employment)}>
                  <Briefcase className="h-3 w-3 mr-1" />
                  {details.employment}
                </Badge>
              )}
              {isRemote && (
                <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
                  <Globe className="h-3 w-3 mr-1" />
                  Remote
                </Badge>
              )}
              {details.experience && (
                <Badge variant="outline" className="bg-muted">
                  <Users className="h-3 w-3 mr-1" />
                  {details.experience}
                </Badge>
              )}
              {details.salary && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {details.salary}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {job.description}
            </p>

            {/* Skills Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.tags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 text-xs font-medium bg-secondary/50 text-secondary-foreground rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {job.tags.length > 5 && (
                  <span className="px-2.5 py-1 text-xs font-medium bg-secondary/30 text-muted-foreground rounded-full">
                    +{job.tags.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-dashed">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Posted {new Date(job.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Mobile Action Button */}
              <Button
                onClick={() => onApply(job)}
                disabled={isOwnJob}
                size="sm"
                className="sm:hidden"
              >
                {isOwnJob ? 'Your Listing' : 'Apply Now'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
