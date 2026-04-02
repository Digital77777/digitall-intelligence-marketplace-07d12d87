import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Award, Users, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useActiveMembers, type ActiveMember } from "@/hooks/useActiveMembers";
import { useConnectionStatus, useSendConnectionRequest, useAcceptConnectionRequest } from "@/hooks/useConnections";
import { useFollowStatus, useFollowUser, useUnfollowUser, useIsFollowedBy } from "@/hooks/useFollows";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import MemberCard from "@/components/community/MemberCard";
import { Skeleton } from "@/components/ui/skeleton";

// Wrapper component for member card with hooks
const MemberCardWithHooks = ({ 
  member, 
  variant = "compact" as const,
}: { 
  member: ActiveMember; 
  variant?: "compact" | "card" | "list";
}) => {
  const { user } = useAuth();
  const { data: connectionStatus } = useConnectionStatus(member.user_id);
  const { data: followStatus } = useFollowStatus(member.user_id);
  const { data: isFollowedBy = false } = useIsFollowedBy(member.user_id);
  const sendConnectionRequest = useSendConnectionRequest();
  const acceptConnection = useAcceptConnectionRequest();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  
  const isOwnProfile = user?.id === member.user_id;
  const isFollowing = !!followStatus;

  const getConnectionStatusString = (): 'none' | 'pending' | 'pending_received' | 'accepted' => {
    if (!connectionStatus) return 'none';
    if (connectionStatus.status === 'accepted') return 'accepted';
    if (connectionStatus.status === 'pending') {
      // Check if we sent the request or received it
      if (connectionStatus.requester_id === user?.id) return 'pending';
      return 'pending_received';
    }
    return 'none';
  };

  return (
    <MemberCard
      member={{
        user_id: member.user_id,
        full_name: member.full_name,
        avatar_url: member.avatar_url,
        headline: member.headline,
        contributions: member.contributions,
        is_top_contributor: member.is_top_contributor,
      }}
      isFollowing={isFollowing}
      connectionStatus={getConnectionStatusString()}
      isOwnProfile={isOwnProfile}
      onFollow={() => followUser.mutate(member.user_id)}
      onUnfollow={() => unfollowUser.mutate(member.user_id)}
      onConnect={() => sendConnectionRequest.mutate(member.user_id)}
      onAcceptConnection={connectionStatus?.id ? () => acceptConnection.mutate(connectionStatus.id) : undefined}
      isFollowPending={followUser.isPending}
      isConnectPending={sendConnectionRequest.isPending}
      variant={variant}
    />
  );
};

// Skeleton components
const MemberCardSkeleton = ({ variant = "compact" }: { variant?: "compact" | "list" }) => {
  if (variant === "list") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-12 w-full" />
      <CardContent className="p-3 pt-8 text-center">
        <Skeleton className="h-14 w-14 rounded-full mx-auto -mt-10 mb-2" />
        <Skeleton className="h-5 w-24 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto mb-3" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
};

const FindMembersPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data: members = [], isLoading } = useActiveMembers(searchQuery);

  const topContributors = useMemo(() => {
    return members.filter((m) => m.is_top_contributor);
  }, [members]);

  const renderMembers = (memberList: ActiveMember[], loading: boolean) => {
    if (loading) {
      return viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MemberCardSkeleton key={i} variant="compact" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <MemberCardSkeleton key={i} variant="list" />
          ))}
        </div>
      );
    }

    if (memberList.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No members found</p>
            {searchQuery && (
              <Button 
                variant="link" 
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return viewMode === "grid" ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {memberList.map((member) => (
          <MemberCardWithHooks 
            key={member.user_id} 
            member={member}
            variant="compact"
          />
        ))}
      </div>
    ) : (
      <div className="space-y-3">
        {memberList.map((member) => (
          <MemberCardWithHooks 
            key={member.user_id} 
            member={member}
            variant="list"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={isMobile ? "px-4 py-4" : "container mx-auto px-6 py-8"}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/community")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
              Find Members
            </h1>
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                {members.length} {members.length === 1 ? "member" : "members"} to connect with
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/community/my-network")}
            className="shrink-0"
          >
            <Users className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">My Network</span>
          </Button>
        </div>

        {/* Search & View Toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          {!isMobile && (
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(v) => v && setViewMode(v as "grid" | "list")}
              className="border rounded-md"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
                <Grid3X3 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view" className="px-3">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-4 ${isMobile ? '' : 'max-w-md'}`}>
            <TabsTrigger value="all" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              All Members
              <Badge variant="secondary" className="ml-1 text-xs">
                {members.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="top" className="gap-1.5 text-xs sm:text-sm">
              <Award className="h-4 w-4" />
              Top Contributors
              <Badge variant="secondary" className="ml-1 text-xs">
                {topContributors.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderMembers(members, isLoading)}
          </TabsContent>

          <TabsContent value="top" className="mt-0">
            {isLoading ? (
              renderMembers([], true)
            ) : topContributors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                  <h3 className="text-lg font-semibold mb-2">No top contributors yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Make 10+ posts to earn this badge and appear here!
                  </p>
                </CardContent>
              </Card>
            ) : (
              renderMembers(topContributors, false)
            )}
          </TabsContent>
        </Tabs>

        {/* Network CTA */}
        <Card className="mt-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold mb-1">Manage Your Network</h3>
              <p className="text-sm text-muted-foreground">
                View followers, following, connections, and pending requests
              </p>
            </div>
            <Button 
              onClick={() => navigate("/community/my-network")}
              className="bg-gradient-ai hover:opacity-90 w-full sm:w-auto"
            >
              <Users className="h-4 w-4 mr-2" />
              My Network
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FindMembersPage;
