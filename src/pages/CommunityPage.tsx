import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Calendar, MessageCircle, TrendingUp, Search, Filter, X, Play } from "lucide-react";
import { QuickActionsRow } from "@/components/community/QuickActionsRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { InsightDetailModal } from "@/components/community/InsightDetailModal";
import { EventDetailModal } from "@/components/community/EventDetailModal";
import { TopicCard } from "@/components/community/TopicCard";
import { EventCard } from "@/components/community/EventCard";
import { EventSkeletonGrid } from "@/components/community/EventCardSkeleton";
import { InstagramFeed } from "@/components/community/InstagramFeed";
import { useCommunity } from "@/hooks/useCommunity";
import { useFeedScroll } from "@/contexts/FeedScrollContext";
import { formatDistanceToNow } from "date-fns";
import { EnhancedImage } from "@/components/media/EnhancedImage";
import type { CommunityInsight, CommunityEvent } from "@/types/community";
import { SEOHead } from "@/components/SEOHead";
const CommunityPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("insights");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [eventType, setEventType] = useState("all");
  const [insightCategory, setInsightCategory] = useState("all");
  const [selectedInsight, setSelectedInsight] = useState<CommunityInsight | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  
  // Track new content availability for scroll-up refresh
  const [hasNewContent, setHasNewContent] = useState(false);
  const [newContentCount, setNewContentCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());
  
  // Feed scroll context for restoring position when returning from Reels
  const { insightsFeedScroll, setInsightsFeedScroll, returnToFeed, setReturnToFeed } = useFeedScroll();
  
  const {
    user
  } = useAuth();
  const {
    useTopics,
    useEvents,
    useInfiniteInsights,
    useStats,
    registerForEvent,
    toggleInsightLike,
    trackContentView
  } = useCommunity();
  const {
    data: topics,
    isLoading: topicsLoading
  } = useTopics(searchQuery);
  const {
    data: events,
    isLoading: eventsLoading
  } = useEvents(searchQuery);
  
  // Use infinite query for insights with Facebook-style scrolling
  const {
    data: insightsData,
    isLoading: insightsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchInsights,
  } = useInfiniteInsights(searchQuery);
  
  // Flatten all pages of insights into a single array
  const insights = useMemo(() => {
    return insightsData?.pages.flatMap(page => page.insights) || [];
  }, [insightsData]);
  
  const {
    data: stats
  } = useStats();

  // Restore scroll position when returning from Reels
  useEffect(() => {
    if (returnToFeed && insightsFeedScroll > 0) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, insightsFeedScroll);
        setReturnToFeed(false);
      });
    }
  }, [returnToFeed, insightsFeedScroll, setReturnToFeed]);

  // Handler functions for button interactions - wrapped in useCallback for performance
  const handleStartTopic = useCallback(() => {
    navigate("/community/start-topic");
  }, [navigate]);
  const handleBrowseEvents = useCallback(() => {
    navigate("/community/browse-events");
  }, [navigate]);
  const handleResetFilters = useCallback(() => {
    setSortBy("recent");
    setEventType("all");
    setInsightCategory("all");
  }, []);
  const handleHostEvent = useCallback(() => {
    navigate("/community/host-event");
  }, [navigate]);
  const handleShareInsight = useCallback(() => {
    navigate("/community/share-insight");
  }, [navigate]);
  const handleFindMembers = useCallback(() => {
    navigate("/community/find-members");
  }, [navigate]);
  const handleStartDiscussion = useCallback(() => {
    navigate("/community/start-topic");
  }, [navigate]);
  const handleCreateEvent = useCallback(() => {
    navigate("/community/host-event");
  }, [navigate]);
  const handleJoinEventClick = useCallback(async (eventId: string, isRegistered: boolean) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isRegistered) {
      await registerForEvent.mutateAsync(eventId);
    }
  }, [user, navigate, registerForEvent]);
  const handleLikeInsight = useCallback(async (insightId: string, isLiked: boolean, category?: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    await toggleInsightLike.mutateAsync({
      insightId,
      isLiked
    });

    // Track interaction for recommendation algorithm
    if (!isLiked) {
      trackContentView(insightId, 'insight', category);
    }
  }, [user, navigate, toggleInsightLike, trackContentView]);
  const handleTopicClick = useCallback((topicId: string, tags?: string[]) => {
    trackContentView(topicId, 'topic', undefined, tags);
    navigate(`/community/topic/${topicId}`);
  }, [trackContentView, navigate]);
  const handleInsightView = useCallback((insight: CommunityInsight) => {
    setSelectedInsight(insight);
    trackContentView(insight.id, 'insight', insight.category);
  }, [trackContentView]);
  const getInitials = useCallback((name: string | undefined, email: string | undefined) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  }, []);

  // Handle video tap - navigate to Reels with video context
  const handleVideoTap = useCallback((videoUrl: string, insightId: string, videoIndex: number) => {
    // Save current scroll position before navigating
    setInsightsFeedScroll(window.scrollY);
    
    // Navigate to Reels with video URL for matching
    navigate(`/community/reels?video=${encodeURIComponent(videoUrl)}&insight=${insightId}&source=insights`);
  }, [navigate, setInsightsFeedScroll]);

  // Memoize expensive computations
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const matchesCategory = insightCategory === "all" || insight.category === insightCategory;
      return matchesCategory;
    });
  }, [insights, insightCategory]);
  
  // Load more handler for infinite scroll
  const handleLoadMoreInsights = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Pull-to-refresh handler
  const handleRefreshInsights = useCallback(async () => {
    await refetchInsights();
    setHasNewContent(false);
    setNewContentCount(0);
    setLastFetchTime(Date.now());
  }, [refetchInsights]);

  // Check for new content periodically (every 30 seconds when tab is active)
  useEffect(() => {
    if (activeTab !== "insights") return;
    
    const checkForNewContent = async () => {
      // Only check if user has been viewing for at least 30 seconds
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      if (timeSinceLastFetch < 30000) return;
      
      try {
        // Quick check for new insights since last fetch
        const { count } = await import("@/integrations/supabase/client").then(m => 
          m.supabase
            .from("community_insights")
            .select("id", { count: "exact", head: true })
            .eq("is_published", true)
            .gt("created_at", new Date(lastFetchTime).toISOString())
        );
        
        if (count && count > 0) {
          setHasNewContent(true);
          setNewContentCount(count);
        }
      } catch (error) {
        console.error("Error checking for new content:", error);
      }
    };
    
    const intervalId = setInterval(checkForNewContent, 30000);
    
    return () => clearInterval(intervalId);
  }, [activeTab, lastFetchTime]);
  
  return <div className="min-h-screen bg-background">
      <SEOHead title="AI Community - Connect, Learn & Collaborate" description="Join our AI community to connect with enthusiasts, share insights, participate in live events, and grow together in the world of artificial intelligence." keywords={["AI community", "AI networking", "AI events", "AI discussions", "AI learning", "AI collaboration", "tech community"]} />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-ai bg-clip-text text-transparent">
               Welcome To Our AI Community
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Connect with AI enthusiasts, share insights, participate in live events, and grow together in the world of artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-gradient-ai text-white" onClick={handleStartTopic}>
                <Plus className="mr-2 h-5 w-5" />
                Start a Topic
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/community/reels')}>
                <Play className="mr-2 h-5 w-5" />
                Watch Reels
              </Button>
              <Button variant="outline" size="lg" onClick={handleBrowseEvents}>
                <Calendar className="mr-2 h-5 w-5" />
                Browse Events
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/community/inbox')}>
                <MessageCircle className="mr-2 h-5 w-5" />
                My Inbox
              </Button>
            </div>
            
            {/* Quick Actions - Icon Row */}
            <QuickActionsRow isLoggedIn={!!user} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 max-w-4xl">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search topics, events, or insights..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter {activeTab === "topics" ? "Topics" : activeTab === "events" ? "Events" : "Insights"}</SheetTitle>
                    <SheetDescription>
                      Refine your search to find exactly what you're looking for
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* Sort By - Available for all tabs */}
                    <div className="space-y-3">
                      <Label htmlFor="sort">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger id="sort">
                          <SelectValue placeholder="Select sorting" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          {activeTab === "topics" && <SelectItem value="replies">Most Replies</SelectItem>}
                          {activeTab === "insights" && <SelectItem value="likes">Most Liked</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Event Type Filter - Only for events tab */}
                    {activeTab === "events" && <div className="space-y-3">
                        <Label htmlFor="event-type">Event Type</Label>
                        <Select value={eventType} onValueChange={setEventType}>
                          <SelectTrigger id="event-type">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="Workshop">Workshops</SelectItem>
                            <SelectItem value="Webinar">Webinars</SelectItem>
                            <SelectItem value="Meetup">Meetups</SelectItem>
                            <SelectItem value="Conference">Conferences</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>}

                    {/* Category Filter - Only for insights tab */}
                    {activeTab === "insights" && <div className="space-y-3">
                        <Label htmlFor="category">Category</Label>
                        <Select value={insightCategory} onValueChange={setInsightCategory}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Tutorial">Tutorials</SelectItem>
                            <SelectItem value="News">News</SelectItem>
                            <SelectItem value="Research">Research</SelectItem>
                            <SelectItem value="Best Practice">Best Practices</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>}

                    <Separator />

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={handleResetFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button className="flex-1" onClick={() => setFilterOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="insights" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="insights" className="flex items-center justify-center gap-1.5 data-[state=active]:bg-primary/10">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Insights</span>
                  <span className="sm:hidden text-xs">Insights</span>
                </TabsTrigger>
                <TabsTrigger value="topics" className="flex items-center justify-center gap-1.5 data-[state=active]:bg-primary/10">
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Discussion</span>
                  <span className="sm:hidden text-xs">Topics</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center justify-center gap-1.5 data-[state=active]:bg-primary/10">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Live Events</span>
                  <span className="sm:hidden text-xs">Events</span>
                </TabsTrigger>
              </TabsList>

              {/* Topics Tab */}
              <TabsContent value="topics" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Recent Discussions</h2>
              <Button onClick={handleStartTopic} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Topic
              </Button>
            </div>
            
            <InstagramFeed
              items={topics || []}
              isLoading={topicsLoading}
              type="topic"
              onTopicClick={handleTopicClick}
              getInitials={getInitials}
              emptyState={
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "Try adjusting your search." : "Be the first to start a conversation!"}
                    </p>
                    <Button onClick={handleStartTopic}>
                      <Plus className="mr-2 h-4 w-4" />
                      Start a Topic
                    </Button>
                  </CardContent>
                </Card>
              }
            />
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold">Upcoming Events</h2>
                <Button onClick={handleHostEvent} className="w-full sm:w-auto bg-gradient-ai text-white">
                  <Calendar className="mr-2 h-4 w-4" />
                  Host Event
                </Button>
              </div>

              {eventsLoading ? <EventSkeletonGrid count={3} /> : <div className="grid gap-3 sm:gap-4">
                  {events && events.length > 0 ? events.map(event => <EventCard key={event.id} event={event} onJoinEvent={handleJoinEventClick} onViewDetails={event => setSelectedEvent(event)} />) : <Card className="shadow-sm">
                      <CardContent className="p-8 sm:p-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-3 bg-primary/10 rounded-full mb-4">
                            <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold mb-2">No upcoming events</h3>
                          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                            Host an event to bring the community together!
                          </p>
                          <Button onClick={handleHostEvent} className="w-full sm:w-auto bg-gradient-ai text-white">
                            <Calendar className="mr-2 h-4 w-4" />
                            Host an Event
                          </Button>
                        </div>
                      </CardContent>
                    </Card>}
                </div>}
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold">Community Insights</h2>
                <Button onClick={handleShareInsight} className="w-full sm:w-auto bg-gradient-ai text-white">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Share Insight
                </Button>
              </div>

              <InstagramFeed
                items={filteredInsights}
                isLoading={insightsLoading}
                isFetchingMore={isFetchingNextPage}
                hasMore={!!hasNextPage}
                onLoadMore={handleLoadMoreInsights}
                onRefresh={handleRefreshInsights}
                hasNewContent={hasNewContent}
                newContentCount={newContentCount}
                type="insight"
                onLikeClick={handleLikeInsight}
                onViewClick={handleInsightView}
                onVideoTap={handleVideoTap}
                getInitials={getInitials}
                emptyState={
                  <Card className="mx-0 sm:mx-0">
                    <CardContent className="p-8 sm:p-12 text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
                      <p className="text-muted-foreground mb-4">Share your knowledge with the community!</p>
                      <Button onClick={handleShareInsight}>
                        <Plus className="mr-2 h-4 w-4" />
                        Share an Insight
                      </Button>
                    </CardContent>
                  </Card>
                }
              />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Active Members</span>
                  </div>
                  <span className="font-bold text-lg">{stats?.activeMembers || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Topics</span>
                  </div>
                  <span className="font-bold text-lg">{stats?.topicsToday || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Events</span>
                  </div>
                  <span className="font-bold text-lg">{stats?.eventsThisWeek || 0}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && <InsightDetailModal insight={selectedInsight} open={!!selectedInsight} onOpenChange={open => !open && setSelectedInsight(null)} />}

      {selectedEvent && <EventDetailModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} onJoinEvent={handleJoinEventClick} />}
    </div>;
};
export default CommunityPage;