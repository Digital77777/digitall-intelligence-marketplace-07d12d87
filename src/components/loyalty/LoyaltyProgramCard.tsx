import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LoyaltyProgramCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  action?: ReactNode;
}

export const LoyaltyProgramCard = ({ 
  icon, 
  title, 
  description, 
  badge,
  action 
}: LoyaltyProgramCardProps) => {
  return (
    <Card className="hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-3">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      {action && (
        <CardContent className="pt-0">
          {action}
        </CardContent>
      )}
    </Card>
  );
};
