// Community data types
export interface CommunityTopic {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  created_at: string;
  replies_count: number;
  tags?: string[];
  is_pinned?: boolean;
  is_locked?: boolean;
  views?: number;
  updated_at?: string;
  last_activity_at?: string;
  topic_replies?: TopicReply[];
  profiles?: UserProfile;
  recommendationScore?: number;
}

export interface TopicReply {
  id: string;
  topic_id?: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: UserProfile;
}

export interface CommunityEvent {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  event_type: string;
  event_date: string;
  event_time: string;
  duration_minutes?: number;
  max_attendees?: number | null;
  cover_image?: string | null;
  meeting_link?: string | null;
  location?: string | null;
  is_online: boolean;
  status: string;
  attendees_count: number;
  created_at?: string;
  updated_at?: string;
  event_attendees?: EventAttendee[];
  profiles?: UserProfile;
  is_registered?: boolean;
}

export interface EventAttendee {
  id: string;
  event_id?: string;
  user_id: string;
  joined_at?: string;
  profiles?: UserProfile;
}

export interface CommunityInsight {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  likes_count: number;
  views_count: number;
  cover_image?: string | null;
  videos?: string[] | null;
  video_thumbnails?: string[] | null;
  read_time?: string | null;
  is_published?: boolean;
  updated_at?: string;
  insight_likes?: InsightLike[];
  profiles?: UserProfile;
  is_liked?: boolean;
  recommendationScore?: number;
}

export interface InsightLike {
  id: string;
  insight_id?: string;
  user_id: string;
  created_at?: string;
}

export interface UserProfile {
  user_id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  headline?: string;
}
