import type { CommunityTopic, CommunityInsight } from "@/types/community";

// ============= INTERFACES =============

interface UserPreferences {
  categories: Record<string, number>;
  tags: Record<string, number>;
  lastInteractions: string[];
  dwellTimes: Record<string, number>; // contentId -> seconds spent
  videoCompletions: Record<string, number>; // contentId -> completion rate (0-1)
}

interface ContentInteraction {
  contentId: string;
  viewStartTime: number;
  category?: string;
  tags?: string[];
}

// Track active views for dwell time calculation
let activeViews: Map<string, ContentInteraction> = new Map();

// ============= STORAGE FUNCTIONS =============

const getUserPreferences = (): UserPreferences => {
  const stored = localStorage.getItem("community_preferences_v2");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { categories: {}, tags: {}, lastInteractions: [], dwellTimes: {}, videoCompletions: {} };
    }
  }
  return { categories: {}, tags: {}, lastInteractions: [], dwellTimes: {}, videoCompletions: {} };
};

export const saveUserPreferences = (preferences: UserPreferences) => {
  localStorage.setItem("community_preferences_v2", JSON.stringify(preferences));
};

// ============= TRACKING FUNCTIONS (TikTok-style) =============

// Start tracking when user begins viewing content
export const trackViewStart = (contentId: string, category?: string, tags?: string[]) => {
  activeViews.set(contentId, {
    contentId,
    viewStartTime: Date.now(),
    category,
    tags
  });
};

// End tracking and record dwell time + video completion
export const trackViewEnd = (contentId: string, videoCompletionRate?: number) => {
  const view = activeViews.get(contentId);
  if (!view) return;
  
  const prefs = getUserPreferences();
  const dwellTimeSeconds = (Date.now() - view.viewStartTime) / 1000;
  
  // Store dwell time (keep rolling average for last 100 items)
  prefs.dwellTimes[contentId] = dwellTimeSeconds;
  const dwellKeys = Object.keys(prefs.dwellTimes);
  if (dwellKeys.length > 100) {
    delete prefs.dwellTimes[dwellKeys[0]];
  }
  
  // Store video completion if provided
  if (videoCompletionRate !== undefined) {
    prefs.videoCompletions[contentId] = videoCompletionRate;
    const completionKeys = Object.keys(prefs.videoCompletions);
    if (completionKeys.length > 100) {
      delete prefs.videoCompletions[completionKeys[0]];
    }
  }
  
  // Track category and tag preferences based on engagement
  // Weight by dwell time - longer viewing = stronger signal
  const engagementWeight = Math.min(dwellTimeSeconds / 30, 3); // Cap at 3x for 90+ seconds
  
  if (view.category) {
    prefs.categories[view.category] = (prefs.categories[view.category] || 0) + engagementWeight;
  }
  
  if (view.tags) {
    view.tags.forEach(tag => {
      prefs.tags[tag] = (prefs.tags[tag] || 0) + engagementWeight;
    });
  }
  
  // Add to recent interactions
  prefs.lastInteractions = [contentId, ...prefs.lastInteractions.filter(id => id !== contentId)].slice(0, 100);
  
  saveUserPreferences(prefs);
  activeViews.delete(contentId);
};

// Track simple interaction (like, share)
export const trackInteraction = (
  contentId: string,
  category?: string,
  tags?: string[],
  interactionType: 'view' | 'like' | 'share' = 'view'
) => {
  const prefs = getUserPreferences();
  
  // Weight different interactions
  const weights = { view: 1, like: 3, share: 5 };
  const weight = weights[interactionType];
  
  if (category) {
    prefs.categories[category] = (prefs.categories[category] || 0) + weight;
  }
  
  if (tags) {
    tags.forEach(tag => {
      prefs.tags[tag] = (prefs.tags[tag] || 0) + weight;
    });
  }
  
  prefs.lastInteractions = [contentId, ...prefs.lastInteractions.filter(id => id !== contentId)].slice(0, 100);
  
  saveUserPreferences(prefs);
};

// ============= SCORING FUNCTIONS (TikTok Algorithm) =============

// Calculate engagement velocity - how fast content is gaining engagement
// This is TikTok's KEY differentiator: viral content detection
const calculateEngagementVelocity = (
  likes: number,
  replies: number,
  views: number,
  createdAt: string
): number => {
  const hoursSinceCreation = Math.max((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60), 0.1);
  
  // Total engagements (weighted)
  const totalEngagement = likes + (replies * 2);
  
  // Engagements per hour - the core velocity metric
  const velocityPerHour = totalEngagement / hoursSinceCreation;
  
  // Normalize with logarithm (handles viral spikes gracefully)
  // A post with 100 engagements/hour gets ~1.0, 1000/hour gets ~1.5
  return Math.min(1, Math.log10(velocityPerHour + 1) / 2);
};

// Calculate time decay (recency factor)
const calculateTimeFactor = (createdAt: string): number => {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const hoursSinceCreation = (now - created) / (1000 * 60 * 60);
  
  // Faster decay for TikTok-style freshness
  // Fresh content (< 1 hour): 1.0
  // 4 hours old: ~0.5
  // 12 hours old: ~0.2
  return Math.exp(-hoursSinceCreation / 8);
};

// Calculate engagement rate score
const calculateEngagementScore = (
  likes: number,
  replies: number,
  views: number
): number => {
  const totalViews = Math.max(views, 1);
  const engagementRate = (likes + replies * 2) / totalViews;
  return Math.min(1, Math.log10(engagementRate * 100 + 1) / 2);
};

// Calculate user preference match (personalization)
const calculatePreferenceScore = (
  category?: string,
  tags?: string[]
): number => {
  const prefs = getUserPreferences();
  let score = 0;
  let maxPossible = 0;
  
  // Calculate total preference weight to normalize
  const totalCategoryWeight = Object.values(prefs.categories).reduce((a, b) => a + b, 0);
  const totalTagWeight = Object.values(prefs.tags).reduce((a, b) => a + b, 0);
  const totalWeight = totalCategoryWeight + totalTagWeight;
  
  if (totalWeight === 0) return 0.5; // Neutral for new users
  
  // Score category match
  if (category && prefs.categories[category]) {
    score += prefs.categories[category];
    maxPossible += Math.max(...Object.values(prefs.categories));
  }
  
  // Score tag matches
  if (tags && tags.length > 0) {
    const tagMaxWeight = prefs.tags ? Math.max(...Object.values(prefs.tags), 1) : 1;
    tags.forEach(tag => {
      if (prefs.tags[tag]) {
        score += prefs.tags[tag];
        maxPossible += tagMaxWeight;
      }
    });
  }
  
  if (maxPossible === 0) return 0.5;
  return Math.min(1, score / maxPossible);
};

// Calculate diversity score (avoid showing same content)
const calculateDiversityScore = (contentId: string): number => {
  const prefs = getUserPreferences();
  const recentIndex = prefs.lastInteractions.indexOf(contentId);
  
  if (recentIndex === -1) return 1.0;
  return Math.max(0.1, 1 - (recentIndex / 100));
};

// Calculate creator reputation (based on their historical engagement)
// In a real implementation, this would query creator's stats from DB
const calculateCreatorScore = (
  authorLikesAvg: number = 0,
  authorViewsAvg: number = 0
): number => {
  if (authorViewsAvg === 0) return 0.5; // Neutral for unknown creators
  
  const authorEngagementRate = authorLikesAvg / authorViewsAvg;
  return Math.min(1, authorEngagementRate * 10);
};

// Calculate video completion rate score (for video content)
const getCompletionScore = (contentId: string): number => {
  const prefs = getUserPreferences();
  return prefs.videoCompletions[contentId] || 0.5;
};

// Calculate dwell time score
const getDwellTimeScore = (contentId: string, avgDwellTime: number = 15): number => {
  const prefs = getUserPreferences();
  const dwellTime = prefs.dwellTimes[contentId];
  
  if (!dwellTime) return 0.5;
  
  // Normalize by average dwell time
  return Math.min(1, dwellTime / (avgDwellTime * 2));
};

// ============= MAIN SCORING FUNCTIONS =============

// Score insights with TikTok-style algorithm
export const scoreInsights = (insights: CommunityInsight[]): CommunityInsight[] => {
  const scoredInsights = insights.map(insight => {
    // TikTok-weighted factors
    const engagementVelocity = calculateEngagementVelocity(
      insight.likes_count || 0,
      0, // Insights don't have replies
      insight.views_count || 1,
      insight.created_at
    );
    
    const timeFactor = calculateTimeFactor(insight.created_at);
    
    const engagementScore = calculateEngagementScore(
      insight.likes_count || 0,
      0,
      insight.views_count || 1
    );
    
    const preferenceScore = calculatePreferenceScore(insight.category, undefined);
    const diversityScore = calculateDiversityScore(insight.id);
    const completionScore = getCompletionScore(insight.id);
    
    // TikTok-style weighted scoring
    // Engagement velocity is the most important factor
    const finalScore = (
      engagementVelocity * 0.30 +  // Viral potential (TikTok's key)
      completionScore * 0.20 +     // Video/content completion
      preferenceScore * 0.20 +     // Personalization
      timeFactor * 0.15 +          // Recency
      diversityScore * 0.10 +      // Content variety
      engagementScore * 0.05       // Overall engagement rate
    );
    
    return { ...insight, recommendationScore: finalScore };
  });
  
  return scoredInsights.sort((a, b) => 
    (b.recommendationScore || 0) - (a.recommendationScore || 0)
  );
};

// Score topics with TikTok-style algorithm
export const scoreTopics = (topics: CommunityTopic[]): CommunityTopic[] => {
  const scoredTopics = topics.map(topic => {
    const engagementVelocity = calculateEngagementVelocity(
      0, // Topics don't have likes
      topic.replies_count || 0,
      topic.views || 1,
      topic.created_at
    );
    
    const timeFactor = calculateTimeFactor(topic.created_at);
    
    const engagementScore = calculateEngagementScore(
      0,
      topic.replies_count || 0,
      topic.views || 1
    );
    
    const preferenceScore = calculatePreferenceScore(undefined, topic.tags);
    const diversityScore = calculateDiversityScore(topic.id);
    const dwellScore = getDwellTimeScore(topic.id);
    
    // Weighted scoring optimized for discussion content
    const finalScore = (
      engagementVelocity * 0.25 +
      dwellScore * 0.20 +
      preferenceScore * 0.20 +
      timeFactor * 0.15 +
      diversityScore * 0.10 +
      engagementScore * 0.10
    );
    
    return { ...topic, recommendationScore: finalScore };
  });
  
  return scoredTopics.sort((a, b) => 
    (b.recommendationScore || 0) - (a.recommendationScore || 0)
  );
};

// Track content view (legacy support + new tracking)
export const trackContentView = async (
  contentId: string,
  contentType: 'topic' | 'insight',
  category?: string,
  tags?: string[]
) => {
  // Start tracking dwell time
  trackViewStart(contentId, category, tags);
  
  // Also track as simple interaction for backward compatibility
  trackInteraction(contentId, category, tags, 'view');
};

// Export for external use
export { getUserPreferences };
