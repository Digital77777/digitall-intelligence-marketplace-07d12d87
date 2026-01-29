import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, Check, Lock } from 'lucide-react';

interface RewardTierCardProps {
  icon: LucideIcon;
  name: string;
  description: string;
  requirements: string;
  perks: string[];
  isUnlocked: boolean;
  isCurrent: boolean;
  progress?: number;
  color: string;
}

export const RewardTierCard = ({
  icon: Icon,
  name,
  description,
  requirements,
  perks,
  isUnlocked,
  isCurrent,
  progress = 0,
  color
}: RewardTierCardProps) => {
  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
      isCurrent ? 'ring-2 ring-primary shadow-lg' : ''
    } ${!isUnlocked ? 'opacity-75' : ''}`}>
      {isCurrent && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
          Current
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {name}
              {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Requirements */}
        <div className="text-sm">
          <span className="text-muted-foreground">Requirement: </span>
          <span className="font-medium">{requirements}</span>
        </div>
        
        {/* Progress to next tier */}
        {isCurrent && progress < 100 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress to next tier</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {/* Perks */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Perks:</p>
          <ul className="space-y-1.5">
            {perks.map((perk, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isUnlocked ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={isUnlocked ? '' : 'text-muted-foreground'}>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
