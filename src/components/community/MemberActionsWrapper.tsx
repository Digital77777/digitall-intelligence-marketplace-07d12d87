import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useConnectionStatus, useSendConnectionRequest, useAcceptConnectionRequest, useIgnoreConnectionRequest } from "@/hooks/useConnections";
import { useFollowStatus, useFollowUser, useUnfollowUser, useIsFollowedBy } from "@/hooks/useFollows";
import { SocialActions } from "./SocialActionButton";

interface MemberActionsWrapperProps {
  userId: string;
  layout?: "horizontal" | "vertical" | "stacked";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const MemberActionsWrapper: React.FC<MemberActionsWrapperProps> = ({
  userId,
  layout = "horizontal",
  size = "sm",
  className,
}) => {
  const { user } = useAuth();

  // Hooks for connection and follow status
  const { data: connectionStatus } = useConnectionStatus(userId);
  const { data: followStatus } = useFollowStatus(userId);
  const { data: isFollowedBy = false } = useIsFollowedBy(userId);

  // Mutations
  const sendConnectionRequest = useSendConnectionRequest();
  const acceptConnection = useAcceptConnectionRequest();
  const ignoreConnection = useIgnoreConnectionRequest();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // Don't show anything for the current user's own actions on themselves
  if (!user || user.id === userId) return null;

  const isFollowing = !!followStatus;

  const getConnectionStatusString = (): 'none' | 'pending' | 'pending_received' | 'accepted' => {
    if (!connectionStatus) return 'none';
    if (connectionStatus.status === 'accepted') return 'accepted';
    if (connectionStatus.status === 'pending') {
      if (connectionStatus.requester_id === user?.id) return 'pending';
      return 'pending_received';
    }
    return 'none';
  };

  return (
    <SocialActions
      userId={userId}
      isFollowing={isFollowing}
      isFollowedBy={isFollowedBy}
      connectionStatus={getConnectionStatusString()}
      onFollow={() => followUser.mutate(userId)}
      onUnfollow={() => unfollowUser.mutate(userId)}
      onConnect={() => sendConnectionRequest.mutate(userId)}
      onAcceptConnection={connectionStatus?.id ? () => acceptConnection.mutate(connectionStatus.id) : undefined}
      onIgnoreConnection={connectionStatus?.id ? () => ignoreConnection.mutate(connectionStatus.id) : undefined}
      isFollowPending={followUser.isPending || unfollowUser.isPending}
      isConnectPending={sendConnectionRequest.isPending || acceptConnection.isPending || ignoreConnection.isPending}
      layout={layout}
      size={size}
      className={className}
    />
  );
};

export default MemberActionsWrapper;
