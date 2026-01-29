import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ProgramHeroProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  children?: ReactNode;
}

export const ProgramHero = ({ icon: Icon, title, description, badge, children }: ProgramHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 p-8 md:p-12 mb-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-br from-primary to-primary/60 p-4 rounded-2xl shadow-lg">
              <Icon className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            {badge && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-3">
                {badge}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {description}
            </p>
          </div>
        </div>
        
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
