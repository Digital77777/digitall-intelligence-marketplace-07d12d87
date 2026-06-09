import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  UserCheck, 
  Handshake,
  Bell,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { 
  useFollowStatus, 
  useFollowUser, 
  useUnfollowUser,
  useIsFollowedBy 
} from "@/hooks/useFollows";
import { 
  usePendingRequests, 
  useAcceptedConnections,
  useAcceptConnectionRequest,
  useIgnoreConnectionRequest,
  useSendConnectionRequest,
  useRemoveConnection
} from "@/hooks/useConnections";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import MemberCard from "@/components/community/MemberCard";

interface NetworkUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
}

// Wrapper component for member card with hooks
const NetworkMemberCard = ({ 
  user,
  showFollowBack = false,
  connectionStatus = "none" as const,
  connectionId,
  variant = "list" as const,
}: { 
  user: NetworkUser;
  showFollowBack?: boolean;
  connectionStatus?: "none" | "pending" | "pending_received" | "accepted";
  connectionId?: string;
  variant?: "list" | "compact" | "card";
}) => {
  const { user: currentUser } = useAuth();
  const { data: followStatus } = useFollowStatus(user.user_id);
  const { data: isFollowedBy = false } = useIsFollowedBy(user.user_id);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const sendConnectionRequest = useSendConnectionRequest();
  const acceptConnection = useAcceptConnectionRequest();
  const removeConnection = useRemoveConnection();

  const isFollowing = !!followStatus;
  const isOwnProfile = currentUser?.id === user.user_id;

  return (
    <MemberCard
      member={{
        user_id: user.user_id,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        headline: user.headline,
      }}
      isFollowing={isFollowing}
      isFollowedBy={isFollowedBy}
      connectionStatus={connectionStatus}
      isOwnProfile={isOwnProfile}
      onFollow={() => followUser.mutate(user.user_id)}
      onUnfollow={() => unfollowUser.mutate(user.user_id)}
      onConnect={() => sendConnectionRequest.mutate(user.user_id)}
      onAcceptConnection={connectionId ? () => acceptConnection.mutate(connectionId) : undefined}
      onDisconnect={connectionId ? () => removeConnection.mutate(connectionId) : undefined}
      isFollowPending={followUser.isPending}
      isConnectPending={sendConnectionRequest.isPending}
      variant={variant}
    />
  );
};

// Pending request card with accept/ignore actions
const PendingRequestCard = ({ 
  connection 
}: { 
  connection: any;
}) => {
  const acceptConnection = useAcceptConnectionRequest();
  const ignoreConnection = useIgnoreConnectionRequest();
  const followUser = useFollowUser();
  const { data: followStatus } = useFollowStatus(connection.requester?.user_id || connection.requester_id);

  const user = connection.requester || { 
    user_id: connection.requester_id,
    full_name: null,
    avatar_url: null,
    headline: null
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <MemberCard
            member={{
              user_id: user.user_id || connection.requester_id,
              full_name: user.full_name,
              avatar_url: user.avatar_url,
              headline: user.headline,
            }}
            isFollowing={!!followStatus}
            connectionStatus="pending_received"
            isOwnProfile={false}
            onFollow={() => followUser.mutate(user.user_id || connection.requester_id)}
            onUnfollow={() => {}}
            onConnect={() => {}}
            onAcceptConnection={() => acceptConnection.mutate(connection.id)}
            isFollowPending={followUser.isPending}
            isConnectPending={acceptConnection.isPending}
            variant="list"
          />
          <div className="flex gap-2 shrink-0 ml-auto">
            <Button
              size="sm"
              onClick={() => acceptConnection.mutate(connection.id)}
              disabled={acceptConnection.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => ignoreConnection.mutate(connection.id)}
              disabled={ignoreConnection.isPending}
            >
              Ignore
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MyNetworkPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const initialTab = searchParams.get("tab") || "followers";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Pending connection requests
  const { data: pendingRequests = [], isLoading: pendingLoading } = usePendingRequests();
  
  // Accepted connections
  const { data: connections = [], isLoading: connectionsLoading } = useAcceptedConnections();

  // Fetch followers
  const { data: followers = [], isLoading: followersLoading } = useQuery({
    queryKey: ["my-followers", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_follows")
        .select(`
          follower_id,
          public_profiles!user_follows_follower_id_fkey (
            user_id,
            full_name,
            avatar_url,
            headline
          )
        `)
        .eq("following_id", user.id);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        user_id: item.follower_id,
        full_name: item.public_profiles?.full_name,
        avatar_url: item.public_profiles?.avatar_url,
        headline: item.public_profiles?.headline,
      })) as NetworkUser[];
    },
    enabled: !!user,
  });

  // Fetch following
  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: ["my-following", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_follows")
        .select(`
          following_id,
          public_profiles!user_follows_following_id_fkey (
            user_id,
            full_name,
            avatar_url,
            headline
          )
        `)
        .eq("follower_id", user.id);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        user_id: item.following_id,
        full_name: item.public_profiles?.full_name,
        avatar_url: item.public_profiles?.avatar_url,
        headline: item.public_profiles?.headline,
      })) as NetworkUser[];
    },
    enabled: !!user,
  });

  // Filter by search
  const filterBySearch = (users: NetworkUser[]) => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(u => 
      u.full_name?.toLowerCase().includes(query) ||
      u.headline?.toLowerCase().includes(query)
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please log in to view your network</p>
            <Button onClick={() => navigate("/auth")} className="mt-4">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = followersLoading || followingLoading || connectionsLoading || pendingLoading;
  const hasPendingRequests = pendingRequests.length > 0;

  return (
    <>
      <SEOHead
        title="My Network - Digital Intelligence Marketplace"
        description="Manage your connections, followers, and following"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/community")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-ai bg-clip-text text-transparent">
                My Network
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your connections and discover new people
              </p>
            </div>
          </div>

          {/* Pending Requests Alert */}
          {hasPendingRequests && (
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      You have {pendingRequests.length} pending connection request{pendingRequests.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Review and accept to grow your network
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("requests")}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your network..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 h-auto">
              <TabsTrigger value="followers" className="gap-1.5 py-2 px-2 text-xs sm:text-sm flex-col sm:flex-row">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Followers</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {followers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="following" className="gap-1.5 py-2 px-2 text-xs sm:text-sm flex-col sm:flex-row">
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Following</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {following.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="connections" className="gap-1.5 py-2 px-2 text-xs sm:text-sm flex-col sm:flex-row">
                <Handshake className="h-4 w-4" />
                <span className="hidden sm:inline">Connected</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {connections.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-1.5 py-2 px-2 text-xs sm:text-sm flex-col sm:flex-row relative">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Requests</span>
                {hasPendingRequests && (
                  <Badge className="ml-1 text-xs bg-primary text-primary-foreground">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Followers Tab */}
            <TabsContent value="followers" className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filterBySearch(followers).length === 0 ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? "No followers match your search" : "No followers yet"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Share insights and engage with the community to gain followers
                    </p>
                    <Button onClick={() => navigate("/community/find-members")}>
                      Find Members
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filterBySearch(followers).map((follower) => (
                  <NetworkMemberCard
                    key={follower.user_id}
                    user={follower}
                    showFollowBack
                    variant="list"
                  />
                ))
              )}
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filterBySearch(following).length === 0 ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? "No following match your search" : "Not following anyone"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Follow community members to stay updated with their content
                    </p>
                    <Button onClick={() => navigate("/community/find-members")}>
                      Find Members to Follow
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filterBySearch(following).map((followed) => (
                  <NetworkMemberCard
                    key={followed.user_id}
                    user={followed}
                    variant="list"
                  />
                ))
              )}
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="space-y-3">
              {connectionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : connections.length === 0 ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Handshake className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect with members to build your professional network
                    </p>
                    <Button onClick={() => navigate("/community/find-members")}>
                      Find People to Connect
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                connections.map((connection: any) => (
                  <NetworkMemberCard
                    key={connection.id}
                    user={{
                      user_id: connection.connected_user?.user_id || "",
                      full_name: connection.connected_user?.full_name || null,
                      avatar_url: connection.connected_user?.avatar_url || null,
                      headline: connection.connected_user?.headline || null,
                    }}
                    connectionStatus="accepted"
                    variant="list"
                  />
                ))
              )}
            </TabsContent>

            {/* Pending Requests Tab */}
            <TabsContent value="requests" className="space-y-3">
              {pendingLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-9 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                    <p className="text-muted-foreground">
                      When someone sends you a connection request, it will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <PendingRequestCard key={request.id} connection={request} />
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Discover CTA */}
          <Card className="mt-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Grow Your Network</h3>
              <p className="text-muted-foreground mb-4">
                Discover and connect with AI enthusiasts, experts, and fellow learners
              </p>
              <Button 
                onClick={() => navigate("/community/find-members")}
                className="bg-gradient-ai hover:opacity-90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find Members
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MyNetworkPage;
