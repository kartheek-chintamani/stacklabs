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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          affiliate_url: string
          category: Database["public"]["Enums"]["deal_category"] | null
          click_count: number | null
          commission_rate: number | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          original_url: string
          short_code: string | null
          status: Database["public"]["Enums"]["link_status"]
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_url: string
          category?: Database["public"]["Enums"]["deal_category"] | null
          click_count?: number | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          original_url: string
          short_code?: string | null
          status?: Database["public"]["Enums"]["link_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_url?: string
          category?: Database["public"]["Enums"]["deal_category"] | null
          click_count?: number | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          original_url?: string
          short_code?: string | null
          status?: Database["public"]["Enums"]["link_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_programs: {
        Row: {
          affiliate_id: string | null
          api_key: string | null
          api_secret: string | null
          base_url: string | null
          commission_rate: number | null
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          program_type: string
          tracking_param: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_id?: string | null
          api_key?: string | null
          api_secret?: string | null
          base_url?: string | null
          commission_rate?: number | null
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          program_type: string
          tracking_param?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_id?: string | null
          api_key?: string | null
          api_secret?: string | null
          base_url?: string | null
          commission_rate?: number | null
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          program_type?: string
          tracking_param?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_request_at: string | null
          last_used_at: string | null
          metadata: Json | null
          name: string
          rate_limit: number | null
          requests_count: number | null
          scopes: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_request_at?: string | null
          last_used_at?: string | null
          metadata?: Json | null
          name: string
          rate_limit?: number | null
          requests_count?: number | null
          scopes?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_request_at?: string | null
          last_used_at?: string | null
          metadata?: Json | null
          name?: string
          rate_limit?: number | null
          requests_count?: number | null
          scopes?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      click_analytics: {
        Row: {
          browser: string | null
          city: string | null
          clicked_at: string
          country: string | null
          device_type: string | null
          id: string
          link_id: string
          platform: Database["public"]["Enums"]["platform_type"] | null
          referrer: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          device_type?: string | null
          id?: string
          link_id: string
          platform?: Database["public"]["Enums"]["platform_type"] | null
          referrer?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          device_type?: string | null
          id?: string
          link_id?: string
          platform?: Database["public"]["Enums"]["platform_type"] | null
          referrer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "click_analytics_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      click_events: {
        Row: {
          browser: string | null
          city: string | null
          clicked_at: string
          conversion_currency: string | null
          conversion_value: number | null
          country: string | null
          deal_id: string | null
          device_type: string | null
          id: string
          ip_address: unknown
          is_conversion: boolean | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          os: string | null
          referrer: string | null
          referrer_domain: string | null
          region: string | null
          short_link_id: string | null
          user_agent: string | null
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          clicked_at?: string
          conversion_currency?: string | null
          conversion_value?: number | null
          country?: string | null
          deal_id?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown
          is_conversion?: boolean | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          os?: string | null
          referrer?: string | null
          referrer_domain?: string | null
          region?: string | null
          short_link_id?: string | null
          user_agent?: string | null
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          clicked_at?: string
          conversion_currency?: string | null
          conversion_value?: number | null
          country?: string | null
          deal_id?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown
          is_conversion?: boolean | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          os?: string | null
          referrer?: string | null
          referrer_domain?: string | null
          region?: string | null
          short_link_id?: string | null
          user_agent?: string | null
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "click_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_events_short_link_id_fkey"
            columns: ["short_link_id"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["id"]
          },
        ]
      }
      conversions: {
        Row: {
          category: string | null
          click_event_id: string | null
          commission: number | null
          commission_rate: number | null
          converted_at: string
          created_at: string
          currency: string | null
          deal_id: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          product_name: string | null
          revenue: number
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          click_event_id?: string | null
          commission?: number | null
          commission_rate?: number | null
          converted_at?: string
          created_at?: string
          currency?: string | null
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          product_name?: string | null
          revenue: number
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          click_event_id?: string | null
          commission?: number | null
          commission_rate?: number | null
          converted_at?: string
          created_at?: string
          currency?: string | null
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          product_name?: string | null
          revenue?: number
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversions_click_event_id_fkey"
            columns: ["click_event_id"]
            isOneToOne: false
            referencedRelation: "click_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          affiliate_url: string | null
          category: Database["public"]["Enums"]["deal_category"] | null
          commission_rate: number | null
          created_at: string
          description: string | null
          discount_percent: number | null
          discounted_price: number | null
          expires_at: string | null
          external_id: string | null
          id: string
          image_url: string | null
          is_favorite: boolean | null
          merchant_name: string | null
          original_price: number | null
          original_url: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_url?: string | null
          category?: Database["public"]["Enums"]["deal_category"] | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          discounted_price?: number | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          merchant_name?: string | null
          original_price?: number | null
          original_url: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_url?: string | null
          category?: Database["public"]["Enums"]["deal_category"] | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          discounted_price?: number | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          merchant_name?: string | null
          original_price?: number | null
          original_url?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      earnings: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          earned_at: string
          id: string
          link_id: string | null
          network_name: string
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          earned_at?: string
          id?: string
          link_id?: string | null
          network_name: string
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          earned_at?: string
          id?: string
          link_id?: string | null
          network_name?: string
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          content: Json
          conversion_count: number | null
          created_at: string
          css_content: string | null
          custom_domain: string | null
          description: string | null
          html_content: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          metadata: Json | null
          og_image: string | null
          published_at: string | null
          slug: string
          tags: string[] | null
          template: string | null
          title: string
          updated_at: string
          user_id: string
          variant_of: string | null
          view_count: number | null
        }
        Insert: {
          content: Json
          conversion_count?: number | null
          created_at?: string
          css_content?: string | null
          custom_domain?: string | null
          description?: string | null
          html_content?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          metadata?: Json | null
          og_image?: string | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          template?: string | null
          title: string
          updated_at?: string
          user_id: string
          variant_of?: string | null
          view_count?: number | null
        }
        Update: {
          content?: Json
          conversion_count?: number | null
          created_at?: string
          css_content?: string | null
          custom_domain?: string | null
          description?: string | null
          html_content?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          metadata?: Json | null
          og_image?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          template?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          variant_of?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_variant_of_fkey"
            columns: ["variant_of"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_connections: {
        Row: {
          connection_name: string | null
          created_at: string
          credentials: Json | null
          id: string
          is_active: boolean | null
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_name?: string | null
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_name?: string | null
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          platform?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_templates: {
        Row: {
          category: Database["public"]["Enums"]["deal_category"] | null
          content: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          platforms: Database["public"]["Enums"]["platform_type"][] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["deal_category"] | null
          content: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          platforms?: Database["public"]["Enums"]["platform_type"][] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["deal_category"] | null
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          platforms?: Database["public"]["Enums"]["platform_type"][] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          auto_share: boolean | null
          created_at: string
          current_price: number | null
          deal_id: string | null
          id: string
          is_triggered: boolean | null
          target_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_share?: boolean | null
          created_at?: string
          current_price?: number | null
          deal_id?: string | null
          id?: string
          is_triggered?: boolean | null
          target_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_share?: boolean | null
          created_at?: string
          current_price?: number | null
          deal_id?: string | null
          id?: string
          is_triggered?: boolean | null
          target_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          currency: string | null
          deal_id: string
          id: string
          in_stock: boolean | null
          original_price: number | null
          price: number
          recorded_at: string
        }
        Insert: {
          currency?: string | null
          deal_id: string
          id?: string
          in_stock?: boolean | null
          original_price?: number | null
          price: number
          recorded_at?: string
        }
        Update: {
          currency?: string | null
          deal_id?: string
          id?: string
          in_stock?: boolean | null
          original_price?: number | null
          price?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_recurring: boolean | null
          link_id: string | null
          platforms: Database["public"]["Enums"]["platform_type"][]
          posted_at: string | null
          recurrence_pattern: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["link_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_recurring?: boolean | null
          link_id?: string | null
          platforms: Database["public"]["Enums"]["platform_type"][]
          posted_at?: string | null
          recurrence_pattern?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["link_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_recurring?: boolean | null
          link_id?: string | null
          platforms?: Database["public"]["Enums"]["platform_type"][]
          posted_at?: string | null
          recurrence_pattern?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["link_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      short_links: {
        Row: {
          click_count: number | null
          created_at: string
          custom_domain: string | null
          description: string | null
          device_targeting: Json | null
          expires_at: string | null
          geo_targeting: Json | null
          id: string
          is_active: boolean | null
          last_clicked_at: string | null
          metadata: Json | null
          original_url: string
          password: string | null
          qr_code_url: string | null
          short_code: string
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          device_targeting?: Json | null
          expires_at?: string | null
          geo_targeting?: Json | null
          id?: string
          is_active?: boolean | null
          last_clicked_at?: string | null
          metadata?: Json | null
          original_url: string
          password?: string | null
          qr_code_url?: string | null
          short_code: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          click_count?: number | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          device_targeting?: Json | null
          expires_at?: string | null
          geo_targeting?: Json | null
          id?: string
          is_active?: boolean | null
          last_clicked_at?: string | null
          metadata?: Json | null
          original_url?: string
          password?: string | null
          qr_code_url?: string | null
          short_code?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      telegram_bots: {
        Row: {
          bot_name: string | null
          bot_token: string
          bot_username: string
          created_at: string
          default_parse_mode: string | null
          disable_web_page_preview: boolean | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          message_count: number | null
          metadata: Json | null
          subscriber_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_name?: string | null
          bot_token: string
          bot_username: string
          created_at?: string
          default_parse_mode?: string | null
          disable_web_page_preview?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          message_count?: number | null
          metadata?: Json | null
          subscriber_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_name?: string | null
          bot_token?: string
          bot_username?: string
          created_at?: string
          default_parse_mode?: string | null
          disable_web_page_preview?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          message_count?: number | null
          metadata?: Json | null
          subscriber_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      telegram_messages: {
        Row: {
          bot_id: string | null
          chat_id: string
          created_at: string
          deal_id: string | null
          error_message: string | null
          id: string
          media_type: string | null
          media_url: string | null
          message_id: string | null
          metadata: Json | null
          parse_mode: string | null
          reply_markup: Json | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_id?: string | null
          chat_id: string
          created_at?: string
          deal_id?: string | null
          error_message?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_id?: string | null
          metadata?: Json | null
          parse_mode?: string | null
          reply_markup?: Json | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string | null
          chat_id?: string
          created_at?: string
          deal_id?: string | null
          error_message?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_id?: string | null
          metadata?: Json | null
          parse_mode?: string | null
          reply_markup?: Json | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          cuelinks_api_key: string | null
          default_affiliate_code: string | null
          id: string
          notification_preferences: Json | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cuelinks_api_key?: string | null
          default_affiliate_code?: string | null
          id?: string
          notification_preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cuelinks_api_key?: string | null
          default_affiliate_code?: string | null
          id?: string
          notification_preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_time_ms: number | null
          retry_attempt: number | null
          status_code: number | null
          success: boolean
          triggered_at: string
          webhook_id: string
        }
        Insert: {
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_time_ms?: number | null
          retry_attempt?: number | null
          status_code?: number | null
          success: boolean
          triggered_at?: string
          webhook_id: string
        }
        Update: {
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_time_ms?: number | null
          retry_attempt?: number | null
          status_code?: number | null
          success?: boolean
          triggered_at?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          description: string | null
          events: string[]
          failure_count: number | null
          headers: Json | null
          id: string
          is_active: boolean | null
          last_failure_at: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          metadata: Json | null
          name: string
          retry_count: number | null
          retry_delay: number | null
          secret_key: string | null
          success_count: number | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          events: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          metadata?: Json | null
          name: string
          retry_count?: number | null
          retry_delay?: number | null
          secret_key?: string | null
          success_count?: number | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          events?: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          metadata?: Json | null
          name?: string
          retry_count?: number | null
          retry_delay?: number | null
          secret_key?: string | null
          success_count?: number | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      deal_category:
        | "electronics"
        | "fashion"
        | "home"
        | "travel"
        | "food"
        | "gaming"
        | "beauty"
        | "other"
      link_status: "draft" | "scheduled" | "posted" | "expired" | "archived"
      platform_type: "telegram" | "whatsapp" | "twitter" | "discord" | "email"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      deal_category: [
        "electronics",
        "fashion",
        "home",
        "travel",
        "food",
        "gaming",
        "beauty",
        "other",
      ],
      link_status: ["draft", "scheduled", "posted", "expired", "archived"],
      platform_type: ["telegram", "whatsapp", "twitter", "discord", "email"],
    },
  },
} as const
