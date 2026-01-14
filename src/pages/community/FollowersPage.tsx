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
import { useFollowStatus, useFollowUser, useUnfollowUser } from "@/hooks/useFollows";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SEOHead } from "@/components/SEOHead";

interface FollowUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
}

// Separate component to properly use hooks
const UserCard = ({ 
  userData, 
  showFollowBack = false 
}: { 
  userData: FollowUser; 
  showFollowBack?: boolean 
}) => {
  const navigate = useNavigate();
  const { data: followStatus } = useFollowStatus(userData.user_id);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const isFollowing = !!followStatus;

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
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div 
            className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 cursor-pointer"
            onClick={() => navigate(`/profile/${userData.user_id}`)}
          >
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
              <AvatarImage src={userData.avatar_url || undefined} />
              <AvatarFallback className="text-sm sm:text-lg font-semibold bg-gradient-ai text-white">
                {getInitials(userData.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold truncate hover:text-primary transition-colors">
                {userData.full_name || "Anonymous User"}
              </h3>
              {userData.headline && (
                <p className="text-sm text-muted-foreground truncate">
                  {userData.headline}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {showFollowBack && !isFollowing ? (
              <Button
                size="sm"
                onClick={() => followUser.mutate(userData.user_id)}
                disabled={followUser.isPending}
                className="bg-gradient-ai text-white flex-1 sm:flex-initial"
              >
                <UserPlus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Follow Back</span>
              </Button>
            ) : isFollowing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => unfollowUser.mutate(userData.user_id)}
                disabled={unfollowUser.isPending}
                className="bg-primary/10 text-primary border-primary/20 flex-1 sm:flex-initial"
              >
                <UserCheck className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Following</span>
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/community/inbox?userId=${userData.user_id}`)}
              className="flex-1 sm:flex-initial"
            >
              <MessageCircle className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Message</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
                  <UserCard key={follower.user_id} userData={follower} showFollowBack />
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
                  <UserCard key={followed.user_id} userData={followed} />
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
