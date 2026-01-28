import { Briefcase, TrendingUp, Users, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JobsHeroProps {
  totalJobs: number;
}

export const JobsHero = ({ totalJobs }: JobsHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border mb-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                <Briefcase className="h-3 w-3 mr-1" />
                Career Hub
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                <TrendingUp className="h-3 w-3 mr-1" />
                Hiring Now
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              AI & Tech
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Job Opportunities
              </span>
            </h1>
            
            <p className="text-muted-foreground max-w-lg text-base md:text-lg">
              Discover your next career move. Browse curated positions from leading companies in AI, machine learning, and emerging technologies.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{totalJobs}+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Open Positions</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">50+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Remote Friendly</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Top Companies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
