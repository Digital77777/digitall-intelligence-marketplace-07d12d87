import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback } from "react";

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

export const useReels = (initialReelId?: string) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: reels = [], isLoading, error } = useQuery({
    queryKey: ["community-reels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_reels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Reel[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Find initial index if initialReelId is provided
  const findReelIndex = useCallback((reelId: string) => {
    return reels.findIndex((r) => r.id === reelId);
  }, [reels]);

  // Set initial index when reels load and initialReelId is provided
  if (initialReelId && reels.length > 0 && currentIndex === 0) {
    const idx = findReelIndex(initialReelId);
    if (idx !== -1 && idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }

  const currentReel = reels[currentIndex] || null;
  const hasNext = currentIndex < reels.length - 1;
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
    return reels.find((r) => r.video_url === videoUrl);
  }, [reels]);

  return {
    reels,
    currentReel,
    currentIndex,
    isLoading,
    error,
    hasNext,
    hasPrev,
    nextReel,
    prevReel,
    goToReel,
    findReelByVideoUrl,
    totalReels: reels.length,
  };
};
