import React from "react";
import { X, UserPlus, Clock, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LinkedInMemberCardProps {
  member: {
    user_id: string;
    full_name: string | null;
    avatar_url?: string | null;
    headline?: string | null;
    contributions: number;
    is_top_contributor: boolean;
  };
  onConnect: (userId: string) => void;
  onFollow: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onDismiss?: (userId: string) => void;
  connectionStatus: 'none' | 'pending' | 'accepted';
  isFollowing: boolean;
  isOwnProfile: boolean;
  isConnectPending: boolean;
  isFollowPending: boolean;
}

const LinkedInMemberCard: React.FC<LinkedInMemberCardProps> = ({
  member,
  onConnect,
  onFollow,
  onViewProfile,
  onDismiss,
  connectionStatus,
  isFollowing,
  isOwnProfile,
  isConnectPending,
  isFollowPending,
}) => {
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectionStatus === 'none' && !isFollowing) {
      onConnect(member.user_id);
    } else if (!isFollowing) {
      onFollow(member.user_id);
    }
  };

  const renderButton = () => {
    if (isOwnProfile) {
      return (
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full text-xs font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(member.user_id);
          }}
        >
          View Profile
        </Button>
      );
    }

    if (connectionStatus === 'accepted') {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="w-full rounded-full text-xs font-medium bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
        >
          <Check className="h-3 w-3 mr-1" />
          Connected
        </Button>
      );
    }

    if (connectionStatus === 'pending') {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="w-full rounded-full text-xs font-medium bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
        >
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Button>
      );
    }

    if (isFollowing) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="w-full rounded-full text-xs font-medium bg-primary/10 text-primary border-primary/20"
        >
          <Check className="h-3 w-3 mr-1" />
          Following
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={isConnectPending || isFollowPending}
        className="w-full rounded-full text-xs font-medium border-primary text-primary hover:bg-primary hover:text-primary-foreground"
      >
        <UserPlus className="h-3 w-3 mr-1" />
        Connect
      </Button>
    );
  };

  return (
    <div
      className="relative bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewProfile(member.user_id)}
    >
      {/* Background gradient */}
      <div className="h-14 bg-gradient-to-br from-primary/20 via-primary/10 to-muted" />

      {/* Dismiss button */}
      {onDismiss && !isOwnProfile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(member.user_id);
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Avatar - positioned to overlap background */}
      <div className="flex justify-center -mt-8">
        <div className="relative">
          <div className="p-0.5 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60">
            <Avatar className="h-16 w-16 border-2 border-background">
              <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || "User"} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
          {/* Top contributor badge */}
          {member.is_top_contributor && (
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background">
              TOP
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pt-2 pb-4 text-center">
        {/* Name */}
        <h3 className="font-semibold text-sm text-foreground line-clamp-1">
          {member.full_name || "Anonymous User"}
        </h3>

        {/* Headline or contributions */}
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 min-h-[2rem]">
          {member.headline || `${member.contributions} contribution${member.contributions !== 1 ? 's' : ''}`}
        </p>

        {/* Mutual connections placeholder */}
        <div className="flex items-center justify-center gap-1 mt-2 mb-3">
          <div className="flex -space-x-2">
            <div className="w-5 h-5 rounded-full bg-muted border border-background" />
            <div className="w-5 h-5 rounded-full bg-muted border border-background" />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {member.contributions > 0 ? `${member.contributions} posts` : 'New member'}
          </span>
        </div>

        {/* Action button */}
        {renderButton()}
      </div>
    </div>
  );
};

export default LinkedInMemberCard;
