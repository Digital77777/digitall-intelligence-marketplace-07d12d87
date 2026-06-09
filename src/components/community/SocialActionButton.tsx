import React from "react";
import { UserPlus, UserCheck, Clock, Check, UserMinus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActionType = "follow" | "connect";
export type ActionState = 
  | "none"           // No relationship - can initiate
  | "pending"        // Request sent, waiting for response
  | "pending_received" // Someone sent us a request
  | "active"         // Following or Connected
  | "loading"        // Loading state
  | "ignored";       // Request ignored (can still follow)

interface SocialActionButtonProps {
  actionType: ActionType;
  state: ActionState;
  onAction: () => void;
  onSecondaryAction?: () => void; // For unfollow or accept
  onTertiaryAction?: () => void; // For ignore
  isFollowedBy?: boolean;        // For "Follow Back" label
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  fullWidth?: boolean;
}

export const SocialActionButton: React.FC<SocialActionButtonProps> = ({
  actionType,
  state,
  onAction,
  onSecondaryAction,
  onTertiaryAction,
  isFollowedBy = false,
  disabled = false,
  size = "sm",
  className,
  fullWidth = false,
}) => {
  const isFollow = actionType === "follow";
  
  // Loading state
  if (state === "loading") {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn(fullWidth && "w-full", className)}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  // No relationship - show primary action
  if (state === "none") {
    return (
      <Button
        size={size}
        onClick={onAction}
        disabled={disabled}
        className={cn(
          isFollow 
            ? "bg-gradient-ai hover:opacity-90 text-white" 
            : "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
          fullWidth && "w-full",
          className
        )}
        variant={isFollow ? "default" : "outline"}
      >
        <UserPlus className="h-4 w-4 mr-1.5" />
        {isFollow ? "Follow" : "Connect"}
      </Button>
    );
  }

  // Pending - user sent a request
  if (state === "pending") {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn(
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
          fullWidth && "w-full",
          className
        )}
      >
        <Clock className="h-4 w-4 mr-1.5" />
        Pending
      </Button>
    );
  }

  // Pending received - someone wants to connect/follow us
  if (state === "pending_received") {
    return (
      <div className={cn("flex gap-1.5", fullWidth && "w-full")}>
        <Button
          size={size}
          onClick={isFollow ? onAction : (onSecondaryAction || onAction)}
          disabled={disabled}
          className={cn(
            "bg-emerald-600 hover:bg-emerald-700 text-white flex-1",
            className
          )}
        >
          {isFollow ? <UserPlus className="h-4 w-4 mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
          {isFollow ? (isFollowedBy ? "Follow Back" : "Follow") : "Accept"}
        </Button>
        {!isFollow && onTertiaryAction && (
          <Button
            variant="outline"
            size={size}
            onClick={onTertiaryAction}
            disabled={disabled}
            className="px-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            title="Ignore Request"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Active relationship - show "Following" or "Connected" with hover to unfollow/disconnect
  if (state === "active") {
    if (isFollow) {
      return (
        <Button
          variant="outline"
          size={size}
          onClick={onSecondaryAction || onAction}
          disabled={disabled}
          className={cn(
            "group bg-primary/10 text-primary border-primary/20 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all",
            fullWidth && "w-full",
            className
          )}
        >
          <UserCheck className="h-4 w-4 mr-1.5 group-hover:hidden" />
          <UserMinus className="h-4 w-4 mr-1.5 hidden group-hover:inline" />
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline">Unfollow</span>
        </Button>
      );
    }
    
    // Connected state
    return (
      <Button
        variant="outline"
        size={size}
        onClick={onSecondaryAction || onAction}
        disabled={disabled}
        className={cn(
          "group bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all",
          fullWidth && "w-full",
          className
        )}
      >
        <Check className="h-4 w-4 mr-1.5 group-hover:hidden" />
        <UserMinus className="h-4 w-4 mr-1.5 hidden group-hover:inline" />
        <span className="group-hover:hidden">Connected</span>
        <span className="hidden group-hover:inline">Disconnect</span>
      </Button>
    );
  }

  return null;
};

// Compound component for both actions together
interface SocialActionsProps {
  userId: string;
  isFollowing: boolean;
  isFollowedBy?: boolean; // Whether the other user follows the current user
  connectionStatus: "none" | "pending" | "pending_received" | "accepted";
  onFollow: () => void;
  onUnfollow: () => void;
  onConnect: () => void;
  onAcceptConnection?: () => void;
  onIgnoreConnection?: () => void;
  onDisconnect?: () => void;
  isFollowPending?: boolean;
  isConnectPending?: boolean;
  showMessage?: boolean;
  onMessage?: () => void;
  layout?: "horizontal" | "vertical" | "stacked";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const SocialActions: React.FC<SocialActionsProps> = ({
  isFollowing,
  isFollowedBy = false,
  connectionStatus,
  onFollow,
  onUnfollow,
  onConnect,
  onAcceptConnection,
  onIgnoreConnection,
  onDisconnect,
  isFollowPending = false,
  isConnectPending = false,
  layout = "horizontal",
  size = "sm",
  className,
}) => {
  const getFollowState = (): ActionState => {
    if (isFollowPending) return "loading";
    if (isFollowing) return "active";
    // If the other user follows us but we don't follow them, show "Follow Back"
    if (isFollowedBy) return "pending_received";
    return "none";
  };

  const getConnectionState = (): ActionState => {
    if (isConnectPending) return "loading";
    if (connectionStatus === "accepted") return "active";
    if (connectionStatus === "pending") return "pending";
    if (connectionStatus === "pending_received") return "pending_received";
    return "none";
  };

  const layoutClasses = {
    horizontal: "flex flex-row gap-2",
    vertical: "flex flex-col gap-2",
    stacked: "flex flex-col sm:flex-row gap-2",
  };

  return (
    <div className={cn(layoutClasses[layout], className)}>
      {/* Follow Button - Primary action */}
      <SocialActionButton
        actionType="follow"
        state={getFollowState()}
        onAction={onFollow}
        onSecondaryAction={onUnfollow}
        isFollowedBy={isFollowedBy}
        disabled={isFollowPending}
        size={size}
        fullWidth={layout === "vertical"}
      />

      {/* Connect Button - Secondary action */}
      <SocialActionButton
        actionType="connect"
        state={getConnectionState()}
        onAction={onConnect}
        onSecondaryAction={
          getConnectionState() === "active" ? onDisconnect : onAcceptConnection
        }
        onTertiaryAction={onIgnoreConnection}
        disabled={isConnectPending}
        size={size}
        fullWidth={layout === "vertical"}
      />
    </div>
  );
};

export default SocialActions;
