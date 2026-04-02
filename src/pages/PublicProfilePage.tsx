import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, MapPin, Link as LinkIcon, Linkedin, Github, Twitter, MessageCircle, Lightbulb, Calendar, Users } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SEOHead } from "@/components/SEOHead";
import { InsightDetailModal } from "@/components/community/InsightDetailModal";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useConnectionStatus, useSendConnectionRequest, useAcceptConnectionRequest } from "@/hooks/useConnections";
import { useFollowStatus, useFollowersCount, useFollowingCount, useFollowUser, useUnfollowUser, useIsFollowedBy } from "@/hooks/useFollows";
import { OfficialBadge } from "@/components/ui/official-badge";
import { useIsOfficialAccount } from "@/hooks/useOfficialAccounts";
import { SocialActions } from "@/components/community/SocialActionButton";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  
  // Connection hooks
  const { data: connectionStatus, isLoading: connectionLoading } = useConnectionStatus(userId || "");
  const sendConnectionRequest = useSendConnectionRequest();
  const acceptConnection = useAcceptConnectionRequest();
  
  // Follow hooks
  const { data: followStatus } = useFollowStatus(userId || "");
  const { data: followersCount = 0 } = useFollowersCount(userId || "");
  const { data: followingCount = 0 } = useFollowingCount(userId || "");
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const isFollowing = !!followStatus;
  
  const { isOfficial, badgeLabel } = useIsOfficialAccount(userId);

  const { data: selectedInsight } = useQuery({
    queryKey: ["insight-detail", selectedInsightId],
    queryFn: async () => {
      if (!selectedInsightId) return null;
      
      const { data, error } = await supabase
        .from("community_insights")
        .select(`
          *,
          public_profiles:user_id (
            user_id,
            full_name,
            avatar_url
          ),
          insight_likes (
            id,
            user_id
          )
        `)
        .eq("id", selectedInsightId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedInsightId,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: activity } = useQuery({
    queryKey: ["user-activity", userId],
    queryFn: async () => {
      const [topicsRes, insightsRes, eventsRes] = await Promise.all([
        supabase
          .from("community_topics")
          .select("id, title, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("community_insights")
          .select("id, title, created_at, likes_count")
          .eq("user_id", userId)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("community_events")
          .select(`
            id, 
            title, 
            event_date, 
            created_at,
            event_attendees(user_id)
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      return {
        topics: topicsRes.data || [],
        insights: insightsRes.data || [],
        events: eventsRes.data || [],
      };
    },
    enabled: !!userId,
  });

  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Profile not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${profile.full_name || "User Profile"} - Digital Intelligence Marketplace`}
        description={profile.bio || "View user profile and community contributions"}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-start">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto md:mx-0">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xl sm:text-2xl md:text-3xl">
                    {getInitials(profile.full_name || undefined, undefined)}
                  </AvatarFallback>
                </Avatar>
              <div className="flex-1 space-y-3 md:space-y-4 w-full">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap mb-1">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                        {profile.full_name || "Community Member"}
                      </h1>
                      {isOfficial && <OfficialBadge label={badgeLabel} variant="inline" className="text-xs" />}
                    </div>
                    {profile.headline && (
                      <p className="text-base sm:text-lg text-muted-foreground flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">{profile.headline}</span>
                      </p>
                    )}
                  </div>

                  {profile.location && (
                    <p className="text-sm sm:text-base text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">{profile.location}</span>
                    </p>
                  )}

                  {profile.bio && (
                    <div className="pt-2">
                      <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words text-center md:text-left">{profile.bio}</p>
                    </div>
                  )}

                  {/* Follower/Following Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                    <div 
                      className={`flex items-center gap-1 ${user?.id === userId ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                      onClick={() => user?.id === userId && navigate('/community/followers')}
                    >
                      <Users className="w-4 h-4" />
                      <span className="font-semibold text-foreground">{followersCount}</span>
                      <span>followers</span>
                    </div>
                    <div 
                      className={`flex items-center gap-1 ${user?.id === userId ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                      onClick={() => user?.id === userId && navigate('/community/followers?tab=following')}
                    >
                      <span className="font-semibold text-foreground">{followingCount}</span>
                      <span>following</span>
                    </div>
                  </div>

                  {/* Action Buttons - Only show if viewing another user's profile */}
                  {user && user.id !== userId && (
                    <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center md:justify-start items-center">
                      <SocialActions
                        userId={userId!}
                        isFollowing={isFollowing}
                        connectionStatus={
                          !connectionStatus 
                            ? "none" 
                            : connectionStatus.status === "accepted" 
                              ? "accepted" 
                              : connectionStatus.status === "pending"
                                ? connectionStatus.requester_id === user.id 
                                  ? "pending" 
                                  : "pending_received"
                                : "none"
                        }
                        onFollow={() => followUser.mutate(userId!)}
                        onUnfollow={() => unfollowUser.mutate(userId!)}
                        onConnect={() => sendConnectionRequest.mutate(userId!)}
                        onAcceptConnection={connectionStatus?.id ? () => acceptConnection.mutate(connectionStatus.id) : undefined}
                        isFollowPending={followUser.isPending || unfollowUser.isPending}
                        isConnectPending={sendConnectionRequest.isPending || acceptConnection.isPending}
                        layout="stacked"
                        size="default"
                      />
                      
                      {/* Message Button */}
                      <Button
                        onClick={() => navigate(`/community/inbox?userId=${userId}`)}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Expertise */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {(profile.website || profile.linkedin_url || profile.github_url || profile.twitter_url) && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <LinkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                  Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors break-all"
                  >
                    <LinkIcon className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                    <span className="break-all">{profile.website}</span>
                  </a>
                )}

                {profile.linkedin_url && (
                  <>
                    <Separator />
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                      <span>LinkedIn Profile</span>
                    </a>
                  </>
                )}

                {profile.github_url && (
                  <>
                    <Separator />
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                      <span>GitHub Profile</span>
                    </a>
                  </>
                )}

                {profile.twitter_url && (
                  <>
                    <Separator />
                    <a
                      href={profile.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Twitter className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                      <span>Twitter / X Profile</span>
                    </a>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Community Activity */}
          {activity && (activity.topics.length > 0 || activity.insights.length > 0 || activity.events.length > 0) && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Community Contributions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
                {/* Topics */}
                {activity.topics.length > 0 && (
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      Recent Topics
                    </h4>
                    <div className="space-y-2">
                      {activity.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => navigate(`/community/topic/${topic.id}`)}
                        >
                          <span className="text-sm break-words">{topic.title}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(topic.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {activity.insights.length > 0 && (
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0" />
                      Recent Insights
                    </h4>
                    <div className="space-y-2">
                      {activity.insights.map((insight) => (
                        <div
                          key={insight.id}
                          className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => setSelectedInsightId(insight.id)}
                        >
                          <span className="text-sm break-words">{insight.title}</span>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="whitespace-nowrap">{insight.likes_count} likes</span>
                            <span>•</span>
                            <span className="whitespace-nowrap">{new Date(insight.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {activity.events.length > 0 && (
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      Hosted Events
                    </h4>
                    <div className="space-y-2">
                      {activity.events.map((event) => {
                        const isRegistered = user && event.event_attendees?.some(
                          (attendee: any) => attendee.user_id === user.id
                        );
                        
                        return (
                          <div
                            key={event.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => navigate(`/community/browse-events?eventId=${event.id}`)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm break-words">{event.title}</span>
                              {isRegistered && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  Registered
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(event.event_date).toLocaleDateString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedInsight && (
        <InsightDetailModal
          insight={selectedInsight}
          open={!!selectedInsightId}
          onOpenChange={(open) => !open && setSelectedInsightId(null)}
        />
      )}
    </>
  );
};

export default PublicProfilePage;
