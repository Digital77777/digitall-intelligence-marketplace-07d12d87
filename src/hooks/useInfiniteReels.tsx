import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback, useEffect, useMemo } from "react";

const REELS_PAGE_SIZE = 10;

interface Reel {
  id: string;
  insight_id: string;
  user_id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  created_at: string;
  likes_count: number;
  views_count: number;
}

interface UseInfiniteReelsOptions {
  initialReelId?: string;
  initialVideoUrl?: string;
  initialInsightId?: string;
}

export const useInfiniteReels = (options?: UseInfiniteReelsOptions | string) => {
  // Support legacy string param (initialReelId) or new options object
  const opts: UseInfiniteReelsOptions = typeof options === 'string' 
    ? { initialReelId: options } 
    : options || {};
  
  const { initialReelId, initialVideoUrl, initialInsightId } = opts;
  const queryClient = useQueryClient();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initializedForReel, setInitializedForReel] = useState<string | null>(null);

  // Fetch from community_reels table with infinite scroll
  const {
    data: reelsData,
    isLoading: reelsLoading,
    error: reelsError,
    hasNextPage: hasNextReelsPage,
    fetchNextPage: fetchNextReelsPage,
    isFetchingNextPage: isFetchingNextReels,
  } = useInfiniteQuery({
    queryKey: ["community-reels-infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("community_reels")
        .select("*")
        .order("created_at", { ascending: false, nullsFirst: false })
        .range(pageParam * REELS_PAGE_SIZE, (pageParam + 1) * REELS_PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching reels:", error);
        throw error;
      }
      
      const reels = (data || []).map(reel => ({
        ...reel,
        created_at: reel.created_at || new Date().toISOString(),
        likes_count: reel.likes_count || 0,
        views_count: reel.views_count || 0,
      })) as Reel[];

      return {
        reels,
        nextPage: data && data.length === REELS_PAGE_SIZE ? pageParam + 1 : undefined
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // Fetch videos from insights that aren't already in reels
  const {
    data: insightsData,
    isLoading: insightsLoading,
    hasNextPage: hasNextInsightsPage,
    fetchNextPage: fetchNextInsightsPage,
    isFetchingNextPage: isFetchingNextInsights,
  } = useInfiniteQuery({
    queryKey: ["insight-videos-for-reels-infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("community_insights")
        .select("id, user_id, title, videos, video_thumbnails, likes_count, views_count, created_at")
        .not("videos", "is", null)
        .order("created_at", { ascending: false })
        .range(pageParam * REELS_PAGE_SIZE, (pageParam + 1) * REELS_PAGE_SIZE - 1);

      if (error) throw error;
      
      // Transform to reel format
      const reels = (data || []).flatMap((insight) => 
        (insight.videos || []).map((url: string, i: number) => ({
          id: `insight-video-${insight.id}-${i}`,
          insight_id: insight.id,
          user_id: insight.user_id,
          video_url: url,
          thumbnail_url: insight.video_thumbnails?.[i] || null,
          title: insight.title,
          created_at: insight.created_at,
          likes_count: insight.likes_count || 0,
          views_count: insight.views_count || 0,
        }))
      ) as Reel[];

      return {
        reels,
        nextPage: data && data.length === REELS_PAGE_SIZE ? pageParam + 1 : undefined
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // Fetch YouTube videos shared into the videos table
  const { data: youtubeVideos } = useQuery({
    queryKey: ["youtube-videos-for-reels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((v: any) => ({
        id: `yt-${v.id}`,
        insight_id: v.id,
        user_id: v.user_id || v.id,
        video_url: v.url,
        thumbnail_url: v.thumbnail,
        title: v.title || v.author || "YouTube video",
        created_at: v.created_at,
        likes_count: v.like_count || 0,
        views_count: 0,
      })) as Reel[];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Flatten and merge reels
  const allReels = useMemo(() => {
    const reels = reelsData?.pages.flatMap(page => page.reels) || [];
    const insightReels = insightsData?.pages.flatMap(page => page.reels) || [];
    const ytReels = youtubeVideos || [];

    // Deduplicate - prefer community_reels entries
    const reelUrls = new Set(reels.map(r => r.video_url));
    const uniqueInsightVideos = insightReels.filter(v => !reelUrls.has(v.video_url));

    // YouTube videos go to the top (newest uploads first)
    return [...ytReels, ...reels, ...uniqueInsightVideos];
  }, [reelsData, insightsData, youtubeVideos]);

  // Find initial index based on video URL or reel ID
  const initialIndex = useMemo(() => {
    if (initialVideoUrl) {
      const idx = allReels.findIndex(r => r.video_url === initialVideoUrl);
      if (idx !== -1) return idx;
    }
    if (initialInsightId) {
      const idx = allReels.findIndex(r => r.insight_id === initialInsightId);
      if (idx !== -1) return idx;
    }
    if (initialReelId) {
      const idx = allReels.findIndex(r => r.id === initialReelId);
      if (idx !== -1) return idx;
    }
    return 0;
  }, [allReels, initialVideoUrl, initialInsightId, initialReelId]);

  // Find reel by id
  const findReelIndex = useCallback((reelId: string) => {
    return allReels.findIndex((r) => r.id === reelId);
  }, [allReels]);

  // Set initial index when reels load and initialReelId is provided
  useEffect(() => {
    if (initialReelId && allReels.length > 0 && initializedForReel !== initialReelId) {
      const idx = findReelIndex(initialReelId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setInitializedForReel(initialReelId);
      }
    }
  }, [initialReelId, allReels, findReelIndex, initializedForReel]);

  const currentReel = allReels[currentIndex] || null;
  const hasNext = currentIndex < allReels.length - 1;
  const hasPrev = currentIndex > 0;

  // Load more when approaching end of list
  const loadMoreIfNeeded = useCallback(() => {
    const remainingReels = allReels.length - currentIndex;
    if (remainingReels <= 3) {
      if (hasNextReelsPage && !isFetchingNextReels) {
        fetchNextReelsPage();
      }
      if (hasNextInsightsPage && !isFetchingNextInsights) {
        fetchNextInsightsPage();
      }
    }
  }, [currentIndex, allReels.length, hasNextReelsPage, hasNextInsightsPage, isFetchingNextReels, isFetchingNextInsights, fetchNextReelsPage, fetchNextInsightsPage]);

  const nextReel = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
      loadMoreIfNeeded();
      return true;
    }
    return false;
  }, [hasNext, loadMoreIfNeeded]);

  const prevReel = useCallback(() => {
    if (hasPrev) {
      setCurrentIndex((prev) => prev - 1);
      return true;
    }
    return false;
  }, [hasPrev]);

  const goToReel = useCallback((reelId: string) => {
    const idx = findReelIndex(reelId);
    if (idx !== -1) {
      setCurrentIndex(idx);
      return true;
    }
    return false;
  }, [findReelIndex]);

  // Find reel by video URL
  const findReelByVideoUrl = useCallback((videoUrl: string) => {
    return allReels.find((r) => r.video_url === videoUrl);
  }, [allReels]);

  // Check if more content is available
  const hasMore = hasNextReelsPage || hasNextInsightsPage;
  const isFetchingMore = isFetchingNextReels || isFetchingNextInsights;

  return {
    reels: allReels,
    currentReel,
    currentIndex,
    initialIndex,
    isLoading: reelsLoading || insightsLoading,
    error: reelsError,
    hasNext,
    hasPrev,
    hasMore,
    isFetchingMore,
    nextReel,
    prevReel,
    goToReel,
    findReelByVideoUrl,
    totalReels: allReels.length,
    loadMoreIfNeeded,
    fetchNextPage: () => {
      if (hasNextReelsPage) fetchNextReelsPage();
      if (hasNextInsightsPage) fetchNextInsightsPage();
    },
    refetch: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["community-reels-infinite"] }),
        queryClient.invalidateQueries({ queryKey: ["insight-videos-for-reels-infinite"] }),
        queryClient.invalidateQueries({ queryKey: ["youtube-videos-for-reels"] }),
      ]);
    },
  };
};
