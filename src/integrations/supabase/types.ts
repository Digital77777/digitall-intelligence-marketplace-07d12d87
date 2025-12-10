export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string | null
          id: number
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          permissions?: Json | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          is_active: boolean | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          is_active?: boolean | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          is_active?: boolean | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_development_projects: {
        Row: {
          attachments: string[] | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          currency: string | null
          description: string
          id: string
          priority: string | null
          project_name: string
          project_type: string
          requirements: string | null
          status: string
          submitted_at: string | null
          target_industry: string | null
          technologies: string[] | null
          timeline: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          currency?: string | null
          description: string
          id?: string
          priority?: string | null
          project_name: string
          project_type: string
          requirements?: string | null
          status?: string
          submitted_at?: string | null
          target_industry?: string | null
          technologies?: string[] | null
          timeline: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          currency?: string | null
          description?: string
          id?: string
          priority?: string | null
          project_name?: string
          project_type?: string
          requirements?: string | null
          status?: string
          submitted_at?: string | null
          target_industry?: string | null
          technologies?: string[] | null
          timeline?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_tutor_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_tutor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: number
          created_at: string
          id: string
          notes: string | null
          project_url: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: number
          created_at?: string
          id?: string
          notes?: string | null
          project_url: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: number
          created_at?: string
          id?: string
          notes?: string | null
          project_url?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_events: {
        Row: {
          attendees_count: number | null
          cover_image: string | null
          created_at: string
          description: string
          duration_minutes: number | null
          event_date: string
          event_time: string
          event_type: string
          id: string
          is_online: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_link: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees_count?: number | null
          cover_image?: string | null
          created_at?: string
          description: string
          duration_minutes?: number | null
          event_date: string
          event_time: string
          event_type: string
          id?: string
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees_count?: number | null
          cover_image?: string | null
          created_at?: string
          description?: string
          duration_minutes?: number | null
          event_date?: string
          event_time?: string
          event_type?: string
          id?: string
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_insights: {
        Row: {
          category: string
          content: string
          cover_image: string | null
          created_at: string
          id: string
          is_published: boolean | null
          likes_count: number | null
          read_time: string | null
          title: string
          updated_at: string
          user_id: string
          video_thumbnails: string[] | null
          videos: string[] | null
          views_count: number | null
        }
        Insert: {
          category: string
          content: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          read_time?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_thumbnails?: string[] | null
          videos?: string[] | null
          views_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          read_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_thumbnails?: string[] | null
          videos?: string[] | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_topics: {
        Row: {
          content: string
          created_at: string
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_activity_at: string | null
          replies_count: number | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          replies_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          replies_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      error_log: {
        Row: {
          error_context: Json | null
          error_message: string | null
          error_timestamp: string | null
          id: number
        }
        Insert: {
          error_context?: Json | null
          error_message?: string | null
          error_timestamp?: string | null
          id?: number
        }
        Update: {
          error_context?: Json | null
          error_message?: string | null
          error_timestamp?: string | null
          id?: number
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          event_id: string
          id: string
          joined_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      freelancer_profiles: {
        Row: {
          availability: string | null
          bio: string
          created_at: string
          experience: string | null
          hourly_rate: number
          id: string
          is_active: boolean | null
          languages: string[]
          location: string | null
          name: string
          portfolio_items: Json | null
          profile_picture: string | null
          skills: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          bio: string
          created_at?: string
          experience?: string | null
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          languages?: string[]
          location?: string | null
          name: string
          portfolio_items?: Json | null
          profile_picture?: string | null
          skills?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          bio?: string
          created_at?: string
          experience?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          languages?: string[]
          location?: string | null
          name?: string
          portfolio_items?: Json | null
          profile_picture?: string | null
          skills?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      freelancer_proposals: {
        Row: {
          attachments: string[] | null
          budget_amount: number
          budget_type: string
          client_id: string
          client_message: string | null
          created_at: string
          deadline: string | null
          estimated_hours: number | null
          freelancer_profile_id: string
          freelancer_response: string | null
          freelancer_user_id: string
          id: string
          project_description: string
          project_title: string
          responded_at: string | null
          status: string
          timeline: string
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          budget_amount: number
          budget_type: string
          client_id: string
          client_message?: string | null
          created_at?: string
          deadline?: string | null
          estimated_hours?: number | null
          freelancer_profile_id: string
          freelancer_response?: string | null
          freelancer_user_id: string
          id?: string
          project_description: string
          project_title: string
          responded_at?: string | null
          status?: string
          timeline: string
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          budget_amount?: number
          budget_type?: string
          client_id?: string
          client_message?: string | null
          created_at?: string
          deadline?: string | null
          estimated_hours?: number | null
          freelancer_profile_id?: string
          freelancer_response?: string | null
          freelancer_user_id?: string
          id?: string
          project_description?: string
          project_title?: string
          responded_at?: string | null
          status?: string
          timeline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_proposals_freelancer_profile_id_fkey"
            columns: ["freelancer_profile_id"]
            isOneToOne: false
            referencedRelation: "freelancer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_reviews: {
        Row: {
          client_id: string
          created_at: string
          freelancer_profile_id: string
          freelancer_user_id: string
          id: string
          is_verified: boolean | null
          proposal_id: string | null
          rating: number
          review_text: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          freelancer_profile_id: string
          freelancer_user_id: string
          id?: string
          is_verified?: boolean | null
          proposal_id?: string | null
          rating: number
          review_text: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          freelancer_profile_id?: string
          freelancer_user_id?: string
          id?: string
          is_verified?: boolean | null
          proposal_id?: string | null
          rating?: number
          review_text?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_reviews_freelancer_profile_id_fkey"
            columns: ["freelancer_profile_id"]
            isOneToOne: false
            referencedRelation: "freelancer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_reviews_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "freelancer_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      insight_likes: {
        Row: {
          created_at: string | null
          id: string
          insight_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insight_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insight_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_likes_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "community_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insight_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "insight_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_listing_id: string
          resume_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_listing_id: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_listing_id?: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category_id: string | null
          created_at: string
          creation_link: string | null
          currency: string | null
          delivery_time: number | null
          description: string
          id: string
          images: string[] | null
          is_featured: boolean | null
          listing_type: string
          price: number | null
          requirements: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          videos: string[] | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          creation_link?: string | null
          currency?: string | null
          delivery_time?: number | null
          description: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          listing_type: string
          price?: number | null
          requirements?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          videos?: string[] | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          creation_link?: string | null
          currency?: string | null
          delivery_time?: number | null
          description?: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          listing_type?: string
          price?: number | null
          requirements?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          videos?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
          updated_at: string
          voice_note_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
          updated_at?: string
          voice_note_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string
          voice_note_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          message: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          github_url: string | null
          headline: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          skills: string[] | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          admin_notes: string | null
          budget: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          project_description: string
          requirements: string | null
          service_title: string
          status: string
          timeline: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          project_description: string
          requirements?: string | null
          service_title: string
          status?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          project_description?: string
          requirements?: string | null
          service_title?: string
          status?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      referral_contests: {
        Row: {
          contest_entry_date: string | null
          created_at: string
          id: string
          is_eligible: boolean
          prize_amount: number | null
          prize_currency: string | null
          referral_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contest_entry_date?: string | null
          created_at?: string
          id?: string
          is_eligible?: boolean
          prize_amount?: number | null
          prize_currency?: string | null
          referral_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contest_entry_date?: string | null
          created_at?: string
          id?: string
          is_eligible?: boolean
          prize_amount?: number | null
          prize_currency?: string | null
          referral_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          id: number
          ip_address: unknown
          metadata: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: number
          ip_address?: unknown
          metadata?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: number
          ip_address?: unknown
          metadata?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seller_profiles: {
        Row: {
          address: Json | null
          business_name: string
          business_type: string | null
          commission_rate: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: number
          payout_method: Json | null
          payout_method_encrypted: string | null
          status: string | null
          tax_id: string | null
          tax_id_encrypted: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: Json | null
          business_name: string
          business_type?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          payout_method?: Json | null
          payout_method_encrypted?: string | null
          status?: string | null
          tax_id?: string | null
          tax_id_encrypted?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: Json | null
          business_name?: string
          business_type?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          payout_method?: Json | null
          payout_method_encrypted?: string | null
          status?: string | null
          tax_id?: string | null
          tax_id_encrypted?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seller_verification_tasks: {
        Row: {
          created_at: string | null
          document_types_required: Json | null
          id: number
          required_documents: Json | null
          reviewed_by: string | null
          reviewer_notes: string | null
          seller_profile_id: number
          status: string
          submitted_documents: Json | null
          updated_at: string | null
          uploaded_documents: Json | null
        }
        Insert: {
          created_at?: string | null
          document_types_required?: Json | null
          id?: never
          required_documents?: Json | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          seller_profile_id: number
          status?: string
          submitted_documents?: Json | null
          updated_at?: string | null
          uploaded_documents?: Json | null
        }
        Update: {
          created_at?: string | null
          document_types_required?: Json | null
          id?: never
          required_documents?: Json | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          seller_profile_id?: number
          status?: string
          submitted_documents?: Json | null
          updated_at?: string | null
          uploaded_documents?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_verification_tasks_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_sessions: {
        Row: {
          consultant: string | null
          created_at: string
          id: string
          meeting_link: string | null
          notes: string | null
          session_date: string
          session_time: string
          status: string
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consultant?: string | null
          created_at?: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          session_date: string
          session_time: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consultant?: string | null
          created_at?: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          session_date?: string
          session_time?: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string
          currency: string
          display_name: string
          features: Json
          id: string
          is_active: boolean
          max_listings: number | null
          max_tools_access: number | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          display_name: string
          features?: Json
          id?: string
          is_active?: boolean
          max_listings?: number | null
          max_tools_access?: number | null
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          display_name?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_listings?: number | null
          max_tools_access?: number | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
          owner_id: string | null
          price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          name: string
          owner_id?: string | null
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          owner_id?: string | null
          price?: number
        }
        Relationships: []
      }
      topic_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "community_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topic_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_connections: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          status: string
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          github_url: string | null
          headline: string | null
          id: string | null
          linkedin_url: string | null
          location: string | null
          skills: string[] | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string | null
          linkedin_url?: string | null
          location?: string | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string | null
          linkedin_url?: string | null
          location?: string | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_current_user_admin_status: {
        Args: never
        Returns: {
          email: string
          is_admin: boolean
          role: string
          user_id: string
        }[]
      }
      check_user_seller_status: {
        Args: never
        Returns: {
          has_seller_profile: boolean
          profile_status: string
        }[]
      }
      create_notification:
        | { Args: { p_message: string; p_user_id: number }; Returns: number }
        | {
            Args: {
              p_message: string
              p_metadata?: Json
              p_type: string
              p_user_id: string
            }
            Returns: number
          }
      create_seller_verification_task: {
        Args: { p_required_documents?: Json; p_seller_profile_id: number }
        Returns: number
      }
      expire_old_job_listings: { Args: never; Returns: undefined }
      generate_referral_code: { Args: never; Returns: string }
      get_current_user_roles: {
        Args: never
        Returns: {
          role: string
        }[]
      }
      get_freelancer_rating: {
        Args: { p_freelancer_profile_id: string }
        Returns: {
          average_rating: number
          total_reviews: number
        }[]
      }
      get_sellers_for_review: {
        Args: { p_page?: number; p_page_size?: number; p_status?: string }
        Returns: {
          business_name: string
          business_type: string
          created_at: string
          seller_profile_id: number
          status: string
          uploaded_documents: Json
          user_id: string
          verification_task_id: number
        }[]
      }
      get_user_contributions: { Args: { p_user_id: string }; Returns: number }
      get_user_tier: { Args: { user_id_param: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_email: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      log_error: {
        Args: { p_error_context?: Json; p_error_message: string }
        Returns: undefined
      }
      log_sensitive_access: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
      raise_application_error: {
        Args: { p_error_code: number; p_error_message: string }
        Returns: undefined
      }
      refresh_admin_view: { Args: never; Returns: undefined }
      review_seller_profile:
        | {
            Args: {
              p_reviewer_notes?: string
              p_status: string
              p_verification_task_id: number
            }
            Returns: undefined
          }
        | { Args: { review_text: string; seller_id: number }; Returns: boolean }
      safe_user_creation: {
        Args: { p_email: string; p_full_name: string }
        Returns: string
      }
      secure_function_template: { Args: { param1: string }; Returns: string }
      update_required_document_types: {
        Args: { p_document_types: Json; p_seller_profile_id: number }
        Returns: undefined
      }
      upload_seller_documents: {
        Args: { p_documents: Json; p_seller_profile_id: number }
        Returns: Json
      }
      upsert_seller_profile: {
        Args: {
          p_address?: Json
          p_business_name: string
          p_business_type?: string
          p_contact_email?: string
          p_contact_phone?: string
          p_description?: string
          p_tax_id?: string
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
