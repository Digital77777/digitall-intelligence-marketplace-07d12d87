import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useFollowStatus, useFollowUser, useUnfollowUser, useIsFollowedBy } from "@/hooks/useFollows";
import { useConnectionStatus, useSendConnectionRequest, useAcceptConnectionRequest, useIgnoreConnectionRequest } from "@/hooks/useConnections";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SEOHead } from "@/components/SEOHead";
import MemberCard from "@/components/community/MemberCard";

interface FollowUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
}

// Separate component to properly use hooks
const MemberCardWithHooks = ({
  userData,
}: { 
  userData: FollowUser;
}) => {
  const { user } = useAuth();
  const { data: followStatus } = useFollowStatus(userData.user_id);
  const { data: isFollowedBy = false } = useIsFollowedBy(userData.user_id);
  const { data: connectionStatus } = useConnectionStatus(userData.user_id);

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const sendConnectionRequest = useSendConnectionRequest();
  const acceptConnection = useAcceptConnectionRequest();
  const ignoreConnection = useIgnoreConnectionRequest();

  const isFollowing = !!followStatus;
  const isOwnProfile = user?.id === userData.user_id;

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
    <MemberCard
      member={{
        user_id: userData.user_id,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        headline: userData.headline,
      }}
      isFollowing={isFollowing}
      isFollowedBy={isFollowedBy}
      connectionStatus={getConnectionStatusString()}
      isOwnProfile={isOwnProfile}
      onFollow={() => followUser.mutate(userData.user_id)}
      onUnfollow={() => unfollowUser.mutate(userData.user_id)}
      onConnect={() => sendConnectionRequest.mutate(userData.user_id)}
      onAcceptConnection={connectionStatus?.id ? () => acceptConnection.mutate(connectionStatus.id) : undefined}
      onIgnoreConnection={connectionStatus?.id ? () => ignoreConnection.mutate(connectionStatus.id) : undefined}
      isFollowPending={followUser.isPending || unfollowUser.isPending}
      isConnectPending={sendConnectionRequest.isPending || acceptConnection.isPending || ignoreConnection.isPending}
      variant="list"
    />
  );
};

const FollowersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const initialTab = searchParams.get("tab") === "following" ? "following" : "followers";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Fetch followers (users who follow the current user)
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
      })) as FollowUser[];
    },
    enabled: !!user,
  });

  // Fetch following (users the current user follows)
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
      })) as FollowUser[];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please log in to view your followers</p>
            <Button onClick={() => navigate("/auth")} className="mt-4">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = followersLoading || followingLoading;

  return (
    <>
      <SEOHead
        title="Followers & Following - Digital Intelligence Marketplace"
        description="View and manage your followers and the people you follow"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/community")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Button>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-ai bg-clip-text text-transparent mb-2">
              Followers & Following
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Manage your connections and discover new people
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="followers" className="gap-2 data-[state=active]:bg-primary/10">
                <Users className="h-4 w-4" />
                <span>Followers ({followers.length})</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="gap-2 data-[state=active]:bg-primary/10">
                <UserCheck className="h-4 w-4" />
                <span>Following ({following.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="followers" className="space-y-3 sm:space-y-4">
              {isLoading ? (
                <LoadingScreen />
              ) : followers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No followers yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Share your insights and engage with the community to gain followers
                    </p>
                    <Button onClick={() => navigate("/community/find-members")}>
                      Find Members
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                followers.map((follower) => (
                  <MemberCardWithHooks key={follower.user_id} userData={follower} />
                ))
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-3 sm:space-y-4">
              {isLoading ? (
                <LoadingScreen />
              ) : following.length === 0 ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Not following anyone</h3>
                    <p className="text-muted-foreground mb-4">
                      Follow community members to stay updated with their content
                    </p>
                    <Button onClick={() => navigate("/community/find-members")}>
                      Find Members to Follow
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                following.map((followed) => (
                  <MemberCardWithHooks key={followed.user_id} userData={followed} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default FollowersPage;
