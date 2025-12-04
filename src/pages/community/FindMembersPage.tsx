import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MessageCircle, UserPlus, Award, Loader2, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useActiveMembers, type ActiveMember } from "@/hooks/useActiveMembers";
import { useConnections } from "@/hooks/useConnections";
import { useAuth } from "@/hooks/useAuth";

const FindMembersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: members = [], isLoading } = useActiveMembers(searchQuery);
  const { sendConnectionRequest } = useConnections();

  const topContributors = useMemo(() => {
    return members.filter((m) => m.is_top_contributor);
  }, [members]);

  const handleConnect = (memberId: string) => {
    sendConnectionRequest.mutate(memberId);
  };

  const handleMessage = (memberId: string) => {
    navigate(`/community/inbox?userId=${memberId}`);
  };

  const handleViewProfile = (memberId: string) => {
    navigate(`/profile/${memberId}`);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getJoinedYear = (date: string) => {
    return new Date(date).getFullYear().toString();
  };

  const MemberCard = ({ member }: { member: ActiveMember }) => {
    const { useConnectionStatus } = useConnections();
    const { data: connectionStatus } = useConnectionStatus(member.user_id);
    const isOwnProfile = user?.id === member.user_id;

    const getConnectionButton = () => {
      if (isOwnProfile) return null;

      if (connectionStatus) {
        if (connectionStatus.status === "accepted") {
          return (
            <Button size="sm" variant="outline" disabled className="bg-green-50 text-green-700 border-green-200">
              <Check className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Connected</span>
            </Button>
          );
        }
        if (connectionStatus.status === "pending") {
          const isPendingRequest = connectionStatus.requester_id === user?.id;
          return (
            <Button size="sm" variant="outline" disabled className="bg-amber-50 text-amber-700 border-amber-200">
              <Clock className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{isPendingRequest ? "Pending" : "Request Received"}</span>
            </Button>
          );
        }
      }

      return (
        <Button
          size="sm"
          onClick={() => handleConnect(member.user_id)}
          className="bg-gradient-ai text-white flex-1 sm:flex-initial"
          disabled={sendConnectionRequest.isPending}
        >
          <UserPlus className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Connect</span>
        </Button>
      );
    };

    return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarFallback className="text-sm sm:text-lg font-semibold bg-gradient-ai text-white">
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <h3 
                  className="text-base sm:text-lg font-semibold truncate hover:text-primary cursor-pointer transition-colors"
                  onClick={() => handleViewProfile(member.user_id)}
                >
                  {member.full_name || "Anonymous User"}
                </h3>
                {member.is_top_contributor && (
                  <Badge className="bg-amber-500 text-white flex-shrink-0 gap-1 px-2 py-0.5">
                    <Award className="h-3 w-3" />
                    <span className="text-xs">Top</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                <span className="font-medium">{member.contributions} contributions</span>
                <span>•</span>
                <span>Joined {getJoinedYear(member.joined_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            {getConnectionButton()}
            {!isOwnProfile && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMessage(member.user_id)}
                className="flex-1 sm:flex-initial"
              >
                <MessageCircle className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Message</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

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
              <span className="hidden sm:inline">All Members ({members.length})</span>
              <span className="sm:hidden text-xs">All ({members.length})</span>
            </TabsTrigger>
            <TabsTrigger value="top" className="gap-1.5 data-[state=active]:bg-primary/10">
              <Award className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Top Contributors ({topContributors.length})</span>
              <span className="sm:hidden text-xs">Top ({topContributors.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 sm:space-y-4 mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No members found</p>
                </CardContent>
              </Card>
            ) : (
              members.map((member) => (
                <MemberCard key={member.user_id} member={member} />
              ))
            )}
          </TabsContent>

          <TabsContent value="top" className="space-y-3 sm:space-y-4 mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
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
              topContributors.map((member) => (
                <MemberCard key={member.user_id} member={member} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FindMembersPage;
