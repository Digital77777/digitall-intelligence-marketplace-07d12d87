import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";
import { SocialActions } from "./SocialActionButton";

export interface MemberCardProps {
  member: {
    user_id: string;
    full_name: string | null;
    avatar_url?: string | null;
    headline?: string | null;
    contributions?: number;
    is_top_contributor?: boolean;
  };
  isFollowing: boolean;
  isFollowedBy?: boolean;
  connectionStatus: "none" | "pending" | "pending_received" | "accepted";
  isOwnProfile: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  onConnect: () => void;
  onAcceptConnection?: () => void;
  isFollowPending?: boolean;
  isConnectPending?: boolean;
  variant?: "card" | "compact" | "list";
  className?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isFollowing,
  isFollowedBy = false,
  connectionStatus,
  isOwnProfile,
  onFollow,
  onUnfollow,
  onConnect,
  onAcceptConnection,
  isFollowPending = false,
  isConnectPending = false,
  variant = "card",
  className,
}) => {
  const navigate = useNavigate();
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

  const handleViewProfile = () => {
    navigate(`/profile/${member.user_id}`);
  };

  const handleMessage = () => {
    navigate(`/community/inbox?userId=${member.user_id}`);
  };

  // Compact variant - for grids
  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
          className
        )}
        onClick={handleViewProfile}
      >
        {/* Background gradient header */}
        <div className="h-12 bg-gradient-to-br from-primary/20 via-primary/10 to-muted relative">
          {member.is_top_contributor && (
            <Badge 
              className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 border-0"
            >
              TOP
            </Badge>
          )}
        </div>

        {/* Avatar overlapping header */}
        <div className="flex justify-center -mt-7 relative z-10">
          <div className="p-0.5 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60">
            <Avatar className="h-14 w-14 border-2 border-background">
              <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || "User"} />
              <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="p-3 pt-2 text-center">
          {/* Name & Badge */}
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {member.full_name || "Anonymous User"}
            </h3>
            {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
          </div>

          {/* Headline */}
          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem] mb-3">
            {member.headline || (member.contributions ? `${member.contributions} contributions` : "Community member")}
          </p>

          {/* Action Buttons */}
          <div onClick={(e) => e.stopPropagation()}>
            {isOwnProfile ? (
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleViewProfile}>
                View Profile
              </Button>
            ) : (
              <div className="space-y-2">
                <SocialActions
                  userId={member.user_id}
                  isFollowing={isFollowing}
                  isFollowedBy={isFollowedBy}
                  connectionStatus={connectionStatus}
                  onFollow={onFollow}
                  onUnfollow={onUnfollow}
                  onConnect={onConnect}
                  onAcceptConnection={onAcceptConnection}
                  isFollowPending={isFollowPending}
                  isConnectPending={isConnectPending}
                  layout="vertical"
                  size="sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant - horizontal layout
  if (variant === "list") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div 
              className="cursor-pointer shrink-0" 
              onClick={handleViewProfile}
            >
              <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-ai text-white font-semibold">
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div 
              className="flex-1 min-w-0 cursor-pointer" 
              onClick={handleViewProfile}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                  {member.full_name || "Anonymous User"}
                </h3>
                {isOfficial && <OfficialBadge label={badgeLabel} variant="compact" />}
                {member.is_top_contributor && (
                  <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 border-0 shrink-0">
                    TOP
                  </Badge>
                )}
              </div>
              {member.headline && (
                <p className="text-sm text-muted-foreground truncate">
                  {member.headline}
                </p>
              )}
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="flex items-center gap-2 shrink-0">
                <SocialActions
                  userId={member.user_id}
                  isFollowing={isFollowing}
                  connectionStatus={connectionStatus}
                  onFollow={onFollow}
                  onUnfollow={onUnfollow}
                  onConnect={onConnect}
                  onAcceptConnection={onAcceptConnection}
                  isFollowPending={isFollowPending}
                  isConnectPending={isConnectPending}
                  layout="horizontal"
                  size="sm"
                />
                <Button variant="ghost" size="icon" onClick={handleMessage}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default card variant - full featured
  return (
    <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-lg", className)}>
      {/* Header with gradient */}
      <div className="h-16 bg-gradient-to-br from-primary/20 via-primary/10 to-muted relative">
        {member.is_top_contributor && (
          <Badge className="absolute top-3 right-3 bg-amber-500 text-white text-xs border-0">
            Top Contributor
          </Badge>
        )}
      </div>

      <CardContent className="p-4 -mt-10 relative">
        {/* Avatar */}
        <div 
          className="flex justify-center mb-3 cursor-pointer" 
          onClick={handleViewProfile}
        >
          <div className="p-1 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60">
            <Avatar className="h-20 w-20 border-3 border-background">
              <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || "User"} />
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Name & Badge */}
        <div 
          className="text-center mb-2 cursor-pointer" 
          onClick={handleViewProfile}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors">
              {member.full_name || "Anonymous User"}
            </h3>
            {isOfficial && <OfficialBadge label={badgeLabel} variant="inline" />}
          </div>
          {member.headline && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {member.headline}
            </p>
          )}
        </div>

        {/* Stats */}
        {member.contributions !== undefined && member.contributions > 0 && (
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="text-xs">
              {member.contributions} contributions
            </Badge>
          </div>
        )}

        {/* Actions */}
        {isOwnProfile ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleViewProfile}
          >
            View My Profile
          </Button>
        ) : (
          <div className="space-y-2">
            <SocialActions
              userId={member.user_id}
              isFollowing={isFollowing}
              connectionStatus={connectionStatus}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
              onConnect={onConnect}
              onAcceptConnection={onAcceptConnection}
              isFollowPending={isFollowPending}
              isConnectPending={isConnectPending}
              layout="stacked"
              size="default"
            />
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={handleMessage}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberCard;
