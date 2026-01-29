import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar_url?: string;
  score: number;
  rank: number;
}

interface LeaderboardCardProps {
  users: LeaderboardUser[];
  title?: string;
  currentUserId?: string;
  scoreLabel?: string;
}

export const LeaderboardCard = ({ 
  users, 
  title = 'Leaderboard', 
  currentUserId,
  scoreLabel = 'points' 
}: LeaderboardCardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-200 dark:border-yellow-800';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/20 dark:to-gray-700/10 border-gray-200 dark:border-gray-700';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-card border-border';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      
      <div className="space-y-2">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          
          return (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${getRankStyle(user.rank)} ${
                isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              {/* Rank */}
              <div className="w-8 flex justify-center">
                {getRankIcon(user.rank) || (
                  <span className="text-lg font-bold text-muted-foreground">
                    {user.rank}
                  </span>
                )}
              </div>
              
              {/* Avatar */}
              <Avatar className="w-10 h-10 border-2 border-background">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.name}
                  {isCurrentUser && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      You
                    </Badge>
                  )}
                </p>
              </div>
              
              {/* Score */}
              <div className="text-right">
                <p className="font-bold text-primary">{user.score.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{scoreLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
