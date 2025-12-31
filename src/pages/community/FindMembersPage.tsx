import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveMembers, type ActiveMember } from "@/hooks/useActiveMembers";
import { useConnections } from "@/hooks/useConnections";
import { useFollows } from "@/hooks/useFollows";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import LinkedInMemberCard from "@/components/community/LinkedInMemberCard";
import { LinkedInMemberCardSkeletonGrid } from "@/components/community/LinkedInMemberCardSkeleton";
import { MemberSkeletonGrid } from "@/components/community/MemberCardSkeleton";

const FindMembersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: members = [], isLoading } = useActiveMembers(searchQuery);
  const { sendConnectionRequest, useConnectionStatus } = useConnections();
  const { followUser, unfollowUser, useFollowStatus } = useFollows();

  const topContributors = useMemo(() => {
    return members.filter((m) => m.is_top_contributor);
  }, [members]);

  const handleConnect = (memberId: string) => {
    sendConnectionRequest.mutate(memberId);
  };

  const handleFollow = (memberId: string) => {
    followUser.mutate(memberId);
  };

  const handleUnfollow = (memberId: string) => {
    unfollowUser.mutate(memberId);
  };

  const handleViewProfile = (memberId: string) => {
    navigate(`/profile/${memberId}`);
  };

  // Member card wrapper for mobile that fetches connection/follow status
  const MobileMemberCard = ({ member }: { member: ActiveMember }) => {
    const { data: connectionStatus } = useConnectionStatus(member.user_id);
    const { data: followStatus } = useFollowStatus(member.user_id);
    const isOwnProfile = user?.id === member.user_id;
    const isFollowing = !!followStatus;

    const getConnectionStatusString = (): 'none' | 'pending' | 'accepted' => {
      if (!connectionStatus) return 'none';
      if (connectionStatus.status === 'accepted') return 'accepted';
      if (connectionStatus.status === 'pending') return 'pending';
      return 'none';
    };

    return (
      <LinkedInMemberCard
        member={member}
        onConnect={handleConnect}
        onFollow={handleFollow}
        onViewProfile={handleViewProfile}
        connectionStatus={getConnectionStatusString()}
        isFollowing={isFollowing}
        isOwnProfile={isOwnProfile}
        isConnectPending={sendConnectionRequest.isPending}
        isFollowPending={followUser.isPending}
      />
    );
  };

  // Mobile Layout - LinkedIn-style grid
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-4">
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
              <h1 className="text-xl font-bold text-foreground">
                Find Members
              </h1>
              {!isLoading && (
                <p className="text-xs text-muted-foreground">
                  {members.length} {members.length === 1 ? "member" : "members"} to connect with
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="all" className="text-xs">
                All ({members.length})
              </TabsTrigger>
              <TabsTrigger value="top" className="text-xs gap-1">
                <Award className="h-3 w-3" />
                Top ({topContributors.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <LinkedInMemberCardSkeletonGrid count={6} />
              ) : members.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground text-sm">No members found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {members.map((member) => (
                    <MobileMemberCard key={member.user_id} member={member} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="top" className="mt-0">
              {isLoading ? (
                <LinkedInMemberCardSkeletonGrid count={4} />
              ) : topContributors.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Award className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      No top contributors yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Make 10+ posts to earn this badge!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {topContributors.map((member) => (
                    <MobileMemberCard key={member.user_id} member={member} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Desktop Layout - Original design
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/community")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-ai bg-clip-text text-transparent">
              Find Active Members
            </h1>
            {!isLoading && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {members.length} {members.length === 1 ? "member" : "members"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-base sm:text-lg">
            Connect with AI enthusiasts, experts, and fellow learners
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/10">
              <Search className="h-4 w-4 mr-1.5 shrink-0" />
              All Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="top" className="gap-1.5 data-[state=active]:bg-primary/10">
              <Award className="h-4 w-4 shrink-0" />
              Top Contributors ({topContributors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <MemberSkeletonGrid count={5} />
            ) : members.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No members found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <MobileMemberCard key={member.user_id} member={member} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="top" className="mt-6">
            {isLoading ? (
              <MemberSkeletonGrid count={3} />
            ) : topContributors.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No top contributors yet. Make 10+ posts to earn this badge!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topContributors.map((member) => (
                  <MobileMemberCard key={member.user_id} member={member} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FindMembersPage;
