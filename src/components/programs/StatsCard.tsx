import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
}

export const StatsCard = ({ icon: Icon, label, value, trend, iconColor = 'text-primary' }: StatsCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg bg-primary/10 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};
