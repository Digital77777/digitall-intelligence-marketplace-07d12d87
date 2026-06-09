import React from "react";
import { X, UserPlus, Clock, Check, UserCheck, UserMinus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";
import { SocialActions } from "./SocialActionButton";

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
  onUnfollow: (userId: string) => void;
  onAcceptConnection?: (userId: string) => void;
  onIgnoreConnection?: (userId: string) => void;
  onDisconnect?: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onDismiss?: (userId: string) => void;
  connectionStatus: 'none' | 'pending' | 'pending_received' | 'accepted';
  isFollowing: boolean;
  isFollowedBy?: boolean;
  isOwnProfile: boolean;
  isConnectPending: boolean;
  isFollowPending: boolean;
}

const LinkedInMemberCard: React.FC<LinkedInMemberCardProps> = ({
  member,
  onConnect,
  onFollow,
  onUnfollow,
  onAcceptConnection,
  onIgnoreConnection,
  onDisconnect,
  onViewProfile,
  onDismiss,
  connectionStatus,
  isFollowing,
  isFollowedBy = false,
  isOwnProfile,
  isConnectPending,
  isFollowPending,
}) => {
  const { isOfficial, badgeLabel } = useIsOfficialAccount(member.user_id);
  
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="font-semibold text-sm text-foreground line-clamp-1">
            {member.full_name || "Anonymous User"}
          </h3>
          {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
        </div>

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
        <div onClick={(e) => e.stopPropagation()}>
          {isOwnProfile ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full text-xs font-medium"
              onClick={() => onViewProfile(member.user_id)}
            >
              View Profile
            </Button>
          ) : (
            <SocialActions
              userId={member.user_id}
              isFollowing={isFollowing}
              isFollowedBy={isFollowedBy}
              connectionStatus={connectionStatus}
              onFollow={() => onFollow(member.user_id)}
              onUnfollow={() => onUnfollow(member.user_id)}
              onConnect={() => onConnect(member.user_id)}
              onAcceptConnection={onAcceptConnection ? () => onAcceptConnection(member.user_id) : undefined}
              onIgnoreConnection={onIgnoreConnection ? () => onIgnoreConnection(member.user_id) : undefined}
              onDisconnect={onDisconnect ? () => onDisconnect(member.user_id) : undefined}
              isFollowPending={isFollowPending}
              isConnectPending={isConnectPending}
              layout="vertical"
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInMemberCard;
