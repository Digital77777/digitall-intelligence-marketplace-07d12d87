import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface FeedScrollContextType {
  insightsFeedScroll: number;
  setInsightsFeedScroll: (position: number) => void;
  returnToFeed: boolean;
  setReturnToFeed: (value: boolean) => void;
  lastVideoEntry: {
    videoUrl: string;
    insightId: string;
    videoIndex: number;
  } | null;
  setLastVideoEntry: (entry: { videoUrl: string; insightId: string; videoIndex: number } | null) => void;
}

const FeedScrollContext = createContext<FeedScrollContextType | undefined>(undefined);

export const FeedScrollProvider = ({ children }: { children: ReactNode }) => {
  const [insightsFeedScroll, setInsightsFeedScrollState] = useState(0);
  const [returnToFeed, setReturnToFeedState] = useState(false);
  const [lastVideoEntry, setLastVideoEntryState] = useState<{
    videoUrl: string;
    insightId: string;
    videoIndex: number;
  } | null>(null);

  const setInsightsFeedScroll = useCallback((position: number) => {
    setInsightsFeedScrollState(position);
  }, []);

  const setReturnToFeed = useCallback((value: boolean) => {
    setReturnToFeedState(value);
  }, []);

  const setLastVideoEntry = useCallback((entry: { videoUrl: string; insightId: string; videoIndex: number } | null) => {
    setLastVideoEntryState(entry);
  }, []);

  return (
    <FeedScrollContext.Provider
      value={{
        insightsFeedScroll,
        setInsightsFeedScroll,
        returnToFeed,
        setReturnToFeed,
        lastVideoEntry,
        setLastVideoEntry,
      }}
    >
      {children}
    </FeedScrollContext.Provider>
  );
};

export const useFeedScroll = () => {
  const context = useContext(FeedScrollContext);
  if (context === undefined) {
    throw new Error("useFeedScroll must be used within a FeedScrollProvider");
  }
  return context;
};
