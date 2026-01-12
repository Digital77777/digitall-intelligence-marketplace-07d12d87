import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Search } from "lucide-react";
import { useReels } from "@/hooks/useReels";
import { useFeedScroll } from "@/contexts/FeedScrollContext";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { TikTokReelsSkeleton } from "@/components/community/TikTokReelsSkeleton";
import { TikTokReel } from "@/components/community/TikTokReel";
import { CommentsOverlay } from "@/components/community/CommentsOverlay";
import { cn } from "@/lib/utils";

const ReelsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parse query params for video entry
  const initialReelId = searchParams.get("reel") || undefined;
  const initialVideoUrl = searchParams.get("video") ? decodeURIComponent(searchParams.get("video")!) : undefined;
  const initialInsightId = searchParams.get("insight") || undefined;
  const source = searchParams.get("source") || undefined;
  
  // Feed scroll context for returning to Insights
  const { setReturnToFeed } = useFeedScroll();
  
  const { reels, isLoading, error, initialIndex } = useReels({
    initialReelId,
    initialVideoUrl,
    initialInsightId,
  });
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Comments overlay state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [commentsCounts, setCommentsCounts] = useState<Record<string, number>>({});
  
  // Touch gesture state
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  
  // Preloaded video cache
  const preloadedVideos = useRef<Set<string>>(new Set());

  // Set initial index based on matched video
  useEffect(() => {
    if (initialIndex > 0 && containerRef.current) {
      setActiveIndex(initialIndex);
      // Scroll to the matched video
      requestAnimationFrame(() => {
        containerRef.current?.scrollTo(0, initialIndex * window.innerHeight);
      });
    }
  }, [initialIndex]);

  // Preload adjacent videos for smoother transitions
  useEffect(() => {
    if (reels.length === 0) return;
    
    const preloadVideo = (url: string) => {
      if (preloadedVideos.current.has(url)) return;
      
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.src = url;
      video.load();
      preloadedVideos.current.add(url);
    };
    
    // Preload current, next and previous videos
    const indicesToPreload = [
      activeIndex,
      activeIndex + 1,
      activeIndex + 2,
      activeIndex - 1
    ].filter(i => i >= 0 && i < reels.length);
    
    indicesToPreload.forEach(i => {
      if (reels[i]?.video_url) {
        preloadVideo(reels[i].video_url);
      }
    });
  }, [activeIndex, reels]);

  // Fetch comments counts for all reels
  useEffect(() => {
    if (reels.length === 0) return;
    
    const fetchCommentsCounts = async () => {
      const insightIds = reels.map(r => r.insight_id);
      const { data } = await supabase
        .from("insight_comments")
        .select("insight_id")
        .in("insight_id", insightIds);
      
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((c) => {
          counts[c.insight_id] = (counts[c.insight_id] || 0) + 1;
        });
        setCommentsCounts(counts);
      }
    };
    
    fetchCommentsCounts();
  }, [reels]);

  const handleOpenComments = (insightId: string) => {
    setSelectedInsightId(insightId);
    setCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setCommentsOpen(false);
    setSelectedInsightId(null);
  };

  // Custom back handler to restore Insights scroll position
  const handleBack = useCallback(() => {
    if (source === "insights") {
      setReturnToFeed(true);
      navigate("/community");
    } else {
      navigate(-1);
    }
  }, [source, navigate, setReturnToFeed]);

  // Handle scroll snap to detect active reel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const viewportHeight = window.innerHeight;
        const newIndex = Math.round(scrollTop / viewportHeight);
        
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reels.length) {
          setActiveIndex(newIndex);
        }
      }, 50);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [activeIndex, reels.length]);

  // Handle touch gestures for swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    const deltaTime = Date.now() - touchStartTime.current;
    
    // Quick swipe detection
    if (Math.abs(deltaY) > 50 && deltaTime < 300) {
      const container = containerRef.current;
      if (!container) return;
      
      if (deltaY > 0 && activeIndex < reels.length - 1) {
        // Swipe up - next reel
        container.scrollTo({
          top: (activeIndex + 1) * window.innerHeight,
          behavior: 'smooth'
        });
      } else if (deltaY < 0 && activeIndex > 0) {
        // Swipe down - previous reel
        container.scrollTo({
          top: (activeIndex - 1) * window.innerHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex, reels.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (e.key === "ArrowDown" && activeIndex < reels.length - 1) {
        e.preventDefault();
        container.scrollTo({
          top: (activeIndex + 1) * window.innerHeight,
          behavior: 'smooth'
        });
      } else if (e.key === "ArrowUp" && activeIndex > 0) {
        e.preventDefault();
        container.scrollTo({
          top: (activeIndex - 1) * window.innerHeight,
          behavior: 'smooth'
        });
      } else if (e.key === "m") {
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, reels.length]);

  // Prevent body scroll when reels page is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (isLoading) {
    return <TikTokReelsSkeleton />;
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <p className="text-white/70 text-lg mb-4">Failed to load reels</p>
        <button
          onClick={() => window.location.reload()}
          className="text-white border border-white/30 px-6 py-2 rounded-full"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <p className="text-white/70 text-lg mb-2">No reels available</p>
        <p className="text-white/50 text-sm mb-4">Be the first to create one!</p>
        <button
          onClick={() => navigate("/community/create-reel")}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium"
        >
          Create Reel
        </button>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Reels - Watch AI Community Videos"
        description="Watch and discover AI-related short videos from our community members."
      />
      
      <div className="fixed inset-0 bg-black z-50">
        {/* Top Navigation - TikTok style */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-12 pb-4 px-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="p-2 rounded-full text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            {/* Center tabs */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("following")}
                className={cn(
                  "text-base font-semibold transition-colors",
                  activeTab === "following" ? "text-white" : "text-white/60"
                )}
              >
                Following
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => setActiveTab("foryou")}
                className={cn(
                  "text-base font-semibold transition-colors",
                  activeTab === "foryou" ? "text-white" : "text-white/60"
                )}
              >
                For You
              </button>
            </div>
            
            {/* Search button */}
            <button
              onClick={() => navigate("/community")}
              className="p-2 rounded-full text-white"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
          
          {/* Active tab indicator */}
          <div className="flex justify-center mt-2">
            <div 
              className={cn(
                "h-0.5 w-8 bg-white rounded-full transition-transform duration-200",
                activeTab === "foryou" ? "translate-x-8" : "-translate-x-8"
              )} 
            />
          </div>
        </div>

        {/* Mute button - bottom left */}
        <button
          onClick={() => setIsMuted(prev => !prev)}
          className="absolute bottom-8 left-4 z-30 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* Reels container - vertical scroll with snap */}
        <div
          ref={containerRef}
          className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {reels.map((reel, index) => (
            <TikTokReel
              key={reel.id}
              reel={reel}
              isActive={index === activeIndex}
              isMuted={isMuted}
              onOpenComments={() => handleOpenComments(reel.insight_id)}
              commentsCount={commentsCounts[reel.insight_id] || 0}
            />
          ))}
        </div>

        {/* Comments overlay */}
        {selectedInsightId && (
          <CommentsOverlay
            isOpen={commentsOpen}
            onClose={handleCloseComments}
            insightId={selectedInsightId}
          />
        )}
      </div>
    </>
  );
};

export default ReelsPage;
