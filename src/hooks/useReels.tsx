import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback, useEffect, useMemo } from "react";

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

interface UseReelsOptions {
  initialReelId?: string;
  initialVideoUrl?: string;
  initialInsightId?: string;
}

export const useReels = (options?: UseReelsOptions | string) => {
  // Support legacy string param (initialReelId) or new options object
  const opts: UseReelsOptions = typeof options === 'string' 
    ? { initialReelId: options } 
    : options || {};
  
  const { initialReelId, initialVideoUrl, initialInsightId } = opts;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initializedForReel, setInitializedForReel] = useState<string | null>(null);

  // Fetch from community_reels table
  const { data: reels = [], isLoading: reelsLoading, error: reelsError } = useQuery({
    queryKey: ["community-reels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_reels")
        .select("*")
        .order("created_at", { ascending: false, nullsFirst: false });

      if (error) {
        console.error("Error fetching reels:", error);
        throw error;
      }
      
      // Map and ensure required fields have defaults
      return (data || []).map(reel => ({
        ...reel,
        created_at: reel.created_at || new Date().toISOString(),
        likes_count: reel.likes_count || 0,
        views_count: reel.views_count || 0,
      })) as Reel[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch videos from insights that aren't already in reels
  const { data: insightVideos = [], isLoading: insightsLoading } = useQuery({
    queryKey: ["insight-videos-for-reels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_insights")
        .select("id, user_id, title, videos, video_thumbnails, likes_count, views_count, created_at")
        .not("videos", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform to reel format
      return (data || []).flatMap((insight) => 
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
    },
    staleTime: 1000 * 60 * 5,
  });

  // Merge and deduplicate reels (prefer community_reels entries)
  const allReels = useMemo(() => {
    const reelUrls = new Set(reels.map(r => r.video_url));
    const uniqueInsightVideos = insightVideos.filter(v => !reelUrls.has(v.video_url));
    return [...reels, ...uniqueInsightVideos];
  }, [reels, insightVideos]);

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

  // Find initial index if initialReelId is provided (legacy support)
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

  const nextReel = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
      return true;
    }
    return false;
  }, [hasNext]);

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

  // Find reel by video URL (useful for matching videos in insights)
  const findReelByVideoUrl = useCallback((videoUrl: string) => {
    return allReels.find((r) => r.video_url === videoUrl);
  }, [allReels]);

  return {
    reels: allReels,
    currentReel,
    currentIndex,
    initialIndex,
    isLoading: reelsLoading || insightsLoading,
    error: reelsError,
    hasNext,
    hasPrev,
    nextReel,
    prevReel,
    goToReel,
    findReelByVideoUrl,
    totalReels: allReels.length,
  };
};
