export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          bio: string | null
          category: string | null
          created_at: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          name: string
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          category?: string | null
          created_at?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          category?: string | null
          created_at?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string | null
          id: string
          last_message: Json | null
          participants: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: Json | null
          participants: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: Json | null
          participants?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      content: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credits_campaigns: {
        Row: {
          active: boolean | null
          amount: number
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          target_user_type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          amount: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          target_user_type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          amount?: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          target_user_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_likes: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_likes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_shares: {
        Row: {
          event_id: string | null
          id: string
          shared_at: string | null
          user_id: string
        }
        Insert: {
          event_id?: string | null
          id?: string
          shared_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: string | null
          id?: string
          shared_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_shares_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          agora_channel: string | null
          agora_token: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          id: string
          image_url: string | null
          is_virtual: boolean | null
          likes_count: number | null
          location: string | null
          location_lat: number | null
          location_lng: number | null
          location_radius: number | null
          published: boolean | null
          recording_url: string | null
          shares_count: number | null
          stream_ended_at: string | null
          stream_started_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agora_channel?: string | null
          agora_token?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_virtual?: boolean | null
          likes_count?: number | null
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_radius?: number | null
          published?: boolean | null
          recording_url?: string | null
          shares_count?: number | null
          stream_ended_at?: string | null
          stream_started_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agora_channel?: string | null
          agora_token?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_virtual?: boolean | null
          likes_count?: number | null
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_radius?: number | null
          published?: boolean | null
          recording_url?: string | null
          shares_count?: number | null
          stream_ended_at?: string | null
          stream_started_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          id: string
          image_url: string | null
          read: boolean | null
          recipient_id: string | null
          sender_id: string | null
          text: string | null
          timestamp: string | null
          voice_url: string | null
        }
        Insert: {
          chat_id: string
          id?: string
          image_url?: string | null
          read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          text?: string | null
          timestamp?: string | null
          voice_url?: string | null
        }
        Update: {
          chat_id?: string
          id?: string
          image_url?: string | null
          read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          text?: string | null
          timestamp?: string | null
          voice_url?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          email_notifications: boolean | null
          in_app_notifications: boolean | null
          marketing_emails: boolean | null
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string | null
          id: string
          image_url: string | null
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          buyer_id: string | null
          created_at: string | null
          event_id: string | null
          id: string
          metadata: Json | null
          platform_fee: number
          status: string
          stripe_fee: number
          stripe_payment_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          platform_fee: number
          status: string
          stripe_fee: number
          stripe_payment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          platform_fee?: number
          status?: string
          stripe_fee?: number
          stripe_payment_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          organizer_id: string | null
          status: string
          stripe_payout_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          organizer_id?: string | null
          status: string
          stripe_payout_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          organizer_id?: string | null
          status?: string
          stripe_payout_id?: string | null
        }
        Relationships: []
      }
      podcast_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      podcast_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          podcast_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          podcast_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          podcast_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_comments_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          audio_url: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          featured: boolean | null
          id: string
          image_url: string | null
          like_count: number | null
          published: boolean | null
          share_count: number | null
          title: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          audio_url?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          like_count?: number | null
          published?: boolean | null
          share_count?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          audio_url?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          like_count?: number | null
          published?: boolean | null
          share_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_podcast_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "podcast_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      presale_campaigns: {
        Row: {
          created_at: string | null
          current_amount: number
          event_id: string
          goal_amount: number
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number
          event_id: string
          goal_amount: number
          id?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number
          event_id?: string
          goal_amount?: number
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          digital_file_url: string | null
          id: string
          image_url: string | null
          inventory_count: number | null
          is_digital: boolean | null
          merchant_id: string | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          digital_file_url?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_digital?: boolean | null
          merchant_id?: string | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          digital_file_url?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_digital?: boolean | null
          merchant_id?: string | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string
          order_id: string | null
          payment_method_id: string | null
          referral_id: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          order_id?: string | null
          payment_method_id?: string | null
          referral_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          order_id?: string | null
          payment_method_id?: string | null
          referral_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          featured_podcasts: string[] | null
          follower_count: number | null
          followers: string[] | null
          following: string[] | null
          following_count: number | null
          has_two_factor_enabled: boolean | null
          id: string
          is_admin: boolean | null
          is_merchant: boolean | null
          is_podcaster: boolean | null
          is_private: boolean | null
          is_pro: boolean | null
          merchant_store_id: string | null
          photo_url: string | null
          podcast_channel_name: string | null
          recent_login: boolean | null
          stripe_connect_id: string | null
          updated_at: string | null
          wallet: Json | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          featured_podcasts?: string[] | null
          follower_count?: number | null
          followers?: string[] | null
          following?: string[] | null
          following_count?: number | null
          has_two_factor_enabled?: boolean | null
          id?: string
          is_admin?: boolean | null
          is_merchant?: boolean | null
          is_podcaster?: boolean | null
          is_private?: boolean | null
          is_pro?: boolean | null
          merchant_store_id?: string | null
          photo_url?: string | null
          podcast_channel_name?: string | null
          recent_login?: boolean | null
          stripe_connect_id?: string | null
          updated_at?: string | null
          wallet?: Json | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          featured_podcasts?: string[] | null
          follower_count?: number | null
          followers?: string[] | null
          following?: string[] | null
          following_count?: number | null
          has_two_factor_enabled?: boolean | null
          id?: string
          is_admin?: boolean | null
          is_merchant?: boolean | null
          is_podcaster?: boolean | null
          is_private?: boolean | null
          is_pro?: boolean | null
          merchant_store_id?: string | null
          photo_url?: string | null
          podcast_channel_name?: string | null
          recent_login?: boolean | null
          stripe_connect_id?: string | null
          updated_at?: string | null
          wallet?: Json | null
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_verified: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number | null
          created_at: string | null
          has_payout_method: boolean | null
          pending_balance: number | null
          platform_credits: number | null
          stripe_connect_id: string | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_balance?: number | null
          created_at?: string | null
          has_payout_method?: boolean | null
          pending_balance?: number | null
          platform_credits?: number | null
          stripe_connect_id?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_balance?: number | null
          created_at?: string | null
          has_payout_method?: boolean | null
          pending_balance?: number | null
          platform_credits?: number | null
          stripe_connect_id?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_event_likes: {
        Args: { event_id_param: string }
        Returns: undefined
      }
      global_search: {
        Args: { search_query: string; limit_count?: number }
        Returns: {
          id: string
          title: string
          description: string
          image_url: string
          type: string
          created_at: string
        }[]
      }
      increment_event_likes: {
        Args: { event_id_param: string }
        Returns: undefined
      }
      increment_event_shares: {
        Args: { event_id_param: string }
        Returns: undefined
      }
      search_events_by_location: {
        Args: {
          lat: number
          lng: number
          radius?: number
          limit_count?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          image_url: string
          date: string
          location: string
          location_lat: number
          location_lng: number
          distance_km: number
        }[]
      }
    }
    Enums: {
      notification_type:
        | "message"
        | "like"
        | "follow"
        | "comment"
        | "podcast"
        | "event"
        | "system"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: [
        "message",
        "like",
        "follow",
        "comment",
        "podcast",
        "event",
        "system",
      ],
    },
  },
} as const
