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
      check_ins: {
        Row: {
          checked_in_at: string | null
          checked_in_by: string | null
          id: string
          notes: string | null
          order_item_id: string | null
        }
        Insert: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          id?: string
          notes?: string | null
          order_item_id?: string | null
        }
        Update: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          id?: string
          notes?: string | null
          order_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      configuration_audit_log: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      content_page_versions: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          page_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          page_id?: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          version_number: number
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          page_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_page_versions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "content_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pages: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          featured_image_url: string | null
          id: string
          is_system_page: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          published_at: string | null
          slug: string
          sort_order: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          type: Database["public"]["Enums"]["content_type"] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          featured_image_url?: string | null
          id?: string
          is_system_page?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          slug: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          type?: Database["public"]["Enums"]["content_type"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          featured_image_url?: string | null
          id?: string
          is_system_page?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          slug?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["content_type"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      event_analytics: {
        Row: {
          event_id: string | null
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number | null
          recorded_at: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_analytics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          additional_info: Json | null
          age_restriction: string | null
          category: string | null
          created_at: string | null
          description: string | null
          dress_code: string | null
          end_date: string
          featured_image_url: string | null
          gallery_images: string[] | null
          id: string
          is_online: boolean | null
          max_attendees: number | null
          online_link: string | null
          organizer_id: string | null
          parking_info: string | null
          short_description: string | null
          start_date: string
          status: Database["public"]["Enums"]["event_status"] | null
          tags: string[] | null
          timezone: string | null
          title: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          additional_info?: Json | null
          age_restriction?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dress_code?: string | null
          end_date: string
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_online?: boolean | null
          max_attendees?: number | null
          online_link?: string | null
          organizer_id?: string | null
          parking_info?: string | null
          short_description?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          additional_info?: Json | null
          age_restriction?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dress_code?: string | null
          end_date?: string
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_online?: boolean | null
          max_attendees?: number | null
          online_link?: string | null
          organizer_id?: string | null
          parking_info?: string | null
          short_description?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_class_performance: {
        Row: {
          average_rating: number | null
          category: string
          class_id: string | null
          class_name: string
          completion_rate: number | null
          created_at: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          instructor_id: string | null
          last_offered: string | null
          popularity_trend: string | null
          profit_margin: number | null
          repeated_bookings: number | null
          revenue: number | null
          total_bookings: number | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          category: string
          class_id?: string | null
          class_name: string
          completion_rate?: number | null
          created_at?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          last_offered?: string | null
          popularity_trend?: string | null
          profit_margin?: number | null
          repeated_bookings?: number | null
          revenue?: number | null
          total_bookings?: number | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          category?: string
          class_id?: string | null
          class_name?: string
          completion_rate?: number | null
          created_at?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          last_offered?: string | null
          popularity_trend?: string | null
          profit_margin?: number | null
          repeated_bookings?: number | null
          revenue?: number | null
          total_bookings?: number | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_class_performance_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_performance_metrics: {
        Row: {
          average_class_size: number | null
          average_rating: number | null
          cancellation_rate: number | null
          classes_count: number | null
          created_at: string | null
          engagement_score: number | null
          id: string
          instructor_id: string | null
          no_show_rate: number | null
          period_end: string
          period_start: string
          popularity_score: number | null
          retention_rate: number | null
          total_ratings: number | null
          total_revenue: number | null
          total_students: number | null
          unique_students: number | null
        }
        Insert: {
          average_class_size?: number | null
          average_rating?: number | null
          cancellation_rate?: number | null
          classes_count?: number | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          instructor_id?: string | null
          no_show_rate?: number | null
          period_end: string
          period_start: string
          popularity_score?: number | null
          retention_rate?: number | null
          total_ratings?: number | null
          total_revenue?: number | null
          total_students?: number | null
          unique_students?: number | null
        }
        Update: {
          average_class_size?: number | null
          average_rating?: number | null
          cancellation_rate?: number | null
          classes_count?: number | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          instructor_id?: string | null
          no_show_rate?: number | null
          period_end?: string
          period_start?: string
          popularity_score?: number | null
          retention_rate?: number | null
          total_ratings?: number | null
          total_revenue?: number | null
          total_students?: number | null
          unique_students?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_performance_metrics_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_profiles: {
        Row: {
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          email: string
          id: string
          join_date: string | null
          name: string
          profile_image_url: string | null
          specialties: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email: string
          id?: string
          join_date?: string | null
          name: string
          profile_image_url?: string | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email?: string
          id?: string
          join_date?: string | null
          name?: string
          profile_image_url?: string | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      instructor_revenue_analytics: {
        Row: {
          average_revenue_per_class: number | null
          commission_earned: number | null
          commission_rate: number | null
          created_at: string | null
          id: string
          instructor_id: string | null
          net_revenue: number | null
          period_end: string
          period_start: string
          revenue_growth: number | null
          total_revenue: number | null
        }
        Insert: {
          average_revenue_per_class?: number | null
          commission_earned?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          net_revenue?: number | null
          period_end: string
          period_start: string
          revenue_growth?: number | null
          total_revenue?: number | null
        }
        Update: {
          average_revenue_per_class?: number | null
          commission_earned?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          net_revenue?: number | null
          period_end?: string
          period_start?: string
          revenue_growth?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_revenue_analytics_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_student_feedback: {
        Row: {
          aspects: Json | null
          class_id: string | null
          id: string
          instructor_id: string | null
          rating: number | null
          review: string | null
          student_id: string | null
          submitted_at: string | null
          verified: boolean | null
        }
        Insert: {
          aspects?: Json | null
          class_id?: string | null
          id?: string
          instructor_id?: string | null
          rating?: number | null
          review?: string | null
          student_id?: string | null
          submitted_at?: string | null
          verified?: boolean | null
        }
        Update: {
          aspects?: Json | null
          class_id?: string | null
          id?: string
          instructor_id?: string | null
          rating?: number | null
          review?: string | null
          student_id?: string | null
          submitted_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_student_feedback_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_audit_logs: {
        Row: {
          action: string
          channel: string | null
          event_id: string | null
          id: string
          metadata: Json | null
          new_quantity: number | null
          previous_quantity: number | null
          quantity_change: number | null
          reason: string | null
          session_id: string | null
          ticket_type_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          channel?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          new_quantity?: number | null
          previous_quantity?: number | null
          quantity_change?: number | null
          reason?: string | null
          session_id?: string | null
          ticket_type_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          channel?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          new_quantity?: number | null
          previous_quantity?: number | null
          quantity_change?: number | null
          reason?: string | null
          session_id?: string | null
          ticket_type_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_audit_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_holds: {
        Row: {
          channel: string | null
          created_at: string | null
          event_id: string | null
          expires_at: string
          id: string
          metadata: Json | null
          quantity: number
          session_id: string
          status: string | null
          ticket_type_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          event_id?: string | null
          expires_at: string
          id?: string
          metadata?: Json | null
          quantity: number
          session_id: string
          status?: string | null
          ticket_type_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          event_id?: string | null
          expires_at?: string
          id?: string
          metadata?: Json | null
          quantity?: number
          session_id?: string
          status?: string | null
          ticket_type_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_holds_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          created_at: string
          id: number
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          title?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          attendee_email: string | null
          attendee_name: string | null
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          special_requests: string | null
          ticket_id: string | null
          ticket_type_id: string | null
        }
        Insert: {
          attendee_email?: string | null
          attendee_name?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          special_requests?: string | null
          ticket_id?: string | null
          ticket_type_id?: string | null
        }
        Update: {
          attendee_email?: string | null
          attendee_name?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          special_requests?: string | null
          ticket_id?: string | null
          ticket_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_details: Json | null
          created_at: string | null
          discount_amount: number | null
          event_id: string | null
          fees_amount: number | null
          final_amount: number
          id: string
          order_number: string
          payment_intent_id: string | null
          promo_code_used: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_details?: Json | null
          created_at?: string | null
          discount_amount?: number | null
          event_id?: string | null
          fees_amount?: number | null
          final_amount: number
          id?: string
          order_number: string
          payment_intent_id?: string | null
          promo_code_used?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_details?: Json | null
          created_at?: string | null
          discount_amount?: number | null
          event_id?: string | null
          fees_amount?: number | null
          final_amount?: number
          id?: string
          order_number?: string
          payment_intent_id?: string | null
          promo_code_used?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizers: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          organization_name: string
          profile_picture_url: string | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          organization_name: string
          profile_picture_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          organization_name?: string
          profile_picture_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          net_amount: number | null
          order_id: string | null
          payment_details: Json | null
          payment_intent_id: string | null
          payment_method: string | null
          processor_fee: number | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          net_amount?: number | null
          order_id?: string | null
          payment_details?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          processor_fee?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          net_amount?: number | null
          order_id?: string | null
          payment_details?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          processor_fee?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          actions: string[] | null
          alert_type: string
          class_id: string | null
          current_value: number | null
          id: string
          instructor_id: string | null
          message: string
          severity: string
          threshold_value: number | null
          triggered_at: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          actions?: string[] | null
          alert_type: string
          class_id?: string | null
          current_value?: number | null
          id?: string
          instructor_id?: string | null
          message: string
          severity: string
          threshold_value?: number | null
          triggered_at?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          actions?: string[] | null
          alert_type?: string
          class_id?: string | null
          current_value?: number | null
          id?: string
          instructor_id?: string | null
          message?: string
          severity?: string
          threshold_value?: number | null
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_alerts_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_locations: {
        Row: {
          address: string
          city: string
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          hours_of_operation: Json | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          special_instructions: string | null
          state: string
          updated_at: string | null
          updated_by: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          city: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          hours_of_operation?: Json | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          special_instructions?: string | null
          state: string
          updated_at?: string | null
          updated_by?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          city?: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          hours_of_operation?: Json | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          special_instructions?: string | null
          state?: string
          updated_at?: string | null
          updated_by?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      platform_categories: {
        Row: {
          color_hex: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          type: Database["public"]["Enums"]["category_type"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          type: Database["public"]["Enums"]["category_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          type?: Database["public"]["Enums"]["category_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "platform_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          type: Database["public"]["Enums"]["setting_type"] | null
          updated_at: string | null
          updated_by: string | null
          validation_rules: Json | null
          value: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          type?: Database["public"]["Enums"]["setting_type"] | null
          updated_at?: string | null
          updated_by?: string | null
          validation_rules?: Json | null
          value: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          type?: Database["public"]["Enums"]["setting_type"] | null
          updated_at?: string | null
          updated_by?: string | null
          validation_rules?: Json | null
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          event_id: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          minimum_order_amount: number | null
          updated_at: string | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_order_amount?: number | null
          updated_at?: string | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_order_amount?: number | null
          updated_at?: string | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_event_categories: {
        Row: {
          color_code: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      saved_events: {
        Row: {
          event_id: string
          id: string
          last_viewed_at: string | null
          metadata: Json | null
          notes: string | null
          notifications_enabled: boolean | null
          priority: number | null
          saved_at: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          last_viewed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          notifications_enabled?: boolean | null
          priority?: number | null
          saved_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          last_viewed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          notifications_enabled?: boolean | null
          priority?: number | null
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_payment_methods: {
        Row: {
          card_brand: string
          cardholder_name: string | null
          created_at: string | null
          expiry_month: number
          expiry_year: number
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_four: string
          last_used_at: string | null
          metadata: Json | null
          payment_processor_token: string | null
          processor_customer_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand: string
          cardholder_name?: string | null
          created_at?: string | null
          expiry_month: number
          expiry_year: number
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four: string
          last_used_at?: string | null
          metadata?: Json | null
          payment_processor_token?: string | null
          processor_customer_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string
          cardholder_name?: string | null
          created_at?: string | null
          expiry_month?: number
          expiry_year?: number
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four?: string
          last_used_at?: string | null
          metadata?: Json | null
          payment_processor_token?: string | null
          processor_customer_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seating_sections: {
        Row: {
          capacity: number
          created_at: string | null
          event_id: string | null
          id: string
          name: string
          price_modifier: number | null
          section_type: string | null
          venue_id: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          event_id?: string | null
          id?: string
          name: string
          price_modifier?: number | null
          section_type?: string | null
          venue_id?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          event_id?: string | null
          id?: string
          name?: string
          price_modifier?: number | null
          section_type?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seating_sections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seating_sections_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      security_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          device_type: string | null
          id: string
          ip_address: unknown | null
          is_suspicious: boolean | null
          location: string | null
          metadata: Json | null
          risk_score: number | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          location?: string | null
          metadata?: Json | null
          risk_score?: number | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          location?: string | null
          metadata?: Json | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_activity_types: {
        Row: {
          default_risk_score: number | null
          description: string
          is_high_risk: boolean | null
          type_name: string
        }
        Insert: {
          default_risk_score?: number | null
          description: string
          is_high_risk?: boolean | null
          type_name: string
        }
        Update: {
          default_risk_score?: number | null
          description?: string
          is_high_risk?: boolean | null
          type_name?: string
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string
          includes_perks: Json | null
          is_active: boolean | null
          max_per_order: number | null
          name: string
          price: number
          quantity_available: number
          quantity_sold: number | null
          sale_end_date: string | null
          sale_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          includes_perks?: Json | null
          is_active?: boolean | null
          max_per_order?: number | null
          name: string
          price: number
          quantity_available: number
          quantity_sold?: number | null
          sale_end_date?: string | null
          sale_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          includes_perks?: Json | null
          is_active?: boolean | null
          max_per_order?: number | null
          name?: string
          price?: number
          quantity_available?: number
          quantity_sold?: number | null
          sale_end_date?: string | null
          sale_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string | null
          id: string
          reserved_until: string | null
          row_number: string | null
          seat_number: string | null
          seating_section_id: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          table_number: string | null
          ticket_type_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reserved_until?: string | null
          row_number?: string | null
          seat_number?: string | null
          seating_section_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          table_number?: string | null
          ticket_type_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reserved_until?: string | null
          row_number?: string | null
          seat_number?: string | null
          seating_section_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          table_number?: string | null
          ticket_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_seating_section_id_fkey"
            columns: ["seating_section_id"]
            isOneToOne: false
            referencedRelation: "seating_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          amenities: Json | null
          capacity: number | null
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          state: string
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          amenities?: Json | null
          capacity?: number | null
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          state: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          amenities?: Json | null
          capacity?: number | null
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          state?: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      vod_configuration: {
        Row: {
          created_at: string | null
          hosting_fee_amount: number
          hosting_fee_currency: string | null
          id: string
          introductory_offer_amount: number | null
          introductory_offer_description: string | null
          introductory_offer_enabled: boolean | null
          introductory_offer_expires_at: string | null
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          hosting_fee_amount?: number
          hosting_fee_currency?: string | null
          id?: string
          introductory_offer_amount?: number | null
          introductory_offer_description?: string | null
          introductory_offer_enabled?: boolean | null
          introductory_offer_expires_at?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          hosting_fee_amount?: number
          hosting_fee_currency?: string | null
          id?: string
          introductory_offer_amount?: number | null
          introductory_offer_description?: string | null
          introductory_offer_enabled?: boolean | null
          introductory_offer_expires_at?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      web_analytics_conversions: {
        Row: {
          conversion_type: string
          conversion_value: number | null
          event_id: string | null
          id: string
          session_id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          conversion_type: string
          conversion_value?: number | null
          event_id?: string | null
          id?: string
          session_id: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          conversion_type?: string
          conversion_value?: number | null
          event_id?: string | null
          id?: string
          session_id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web_analytics_conversions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      web_analytics_events: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          page_url: string | null
          session_id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          page_url?: string | null
          session_id: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          page_url?: string | null
          session_id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      web_analytics_page_views: {
        Row: {
          duration_seconds: number | null
          id: string
          page_title: string | null
          page_url: string
          referrer: string | null
          session_id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          duration_seconds?: number | null
          id?: string
          page_title?: string | null
          page_url: string
          referrer?: string | null
          session_id: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          duration_seconds?: number | null
          id?: string
          page_title?: string | null
          page_url?: string
          referrer?: string | null
          session_id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      web_analytics_sessions: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          events_count: number | null
          id: string
          ip_address: unknown | null
          landing_page: string | null
          page_views: number | null
          referrer: string | null
          session_id: string
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          events_count?: number | null
          id?: string
          ip_address?: unknown | null
          landing_page?: string | null
          page_views?: number | null
          referrer?: string | null
          session_id: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          events_count?: number | null
          id?: string
          ip_address?: unknown | null
          landing_page?: string | null
          page_views?: number | null
          referrer?: string | null
          session_id?: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_security_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      detect_suspicious_login: {
        Args: { p_user_id: string; p_ip_address: string; p_location: string }
        Returns: boolean
      }
      get_user_saved_events: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          saved_event_id: string
          event_id: string
          event_title: string
          event_description: string
          event_category: string
          event_start_date: string
          event_end_date: string
          event_is_online: boolean
          venue_name: string
          venue_city: string
          venue_state: string
          min_price: number
          max_price: number
          notes: string
          priority: number
          saved_at: string
          last_viewed_at: string
        }[]
      }
      get_user_saved_events_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      is_event_saved_by_user: {
        Args: { p_user_id: string; p_event_id: string }
        Returns: boolean
      }
      log_security_activity: {
        Args: {
          p_user_id: string
          p_activity_type: string
          p_description: string
          p_ip_address?: string
          p_user_agent?: string
          p_location?: string
          p_device_type?: string
          p_is_suspicious?: boolean
          p_metadata?: Json
        }
        Returns: string
      }
      reorder_categories: {
        Args: { category_ids: string[] }
        Returns: undefined
      }
      update_saved_event_viewed: {
        Args: { p_user_id: string; p_event_id: string }
        Returns: undefined
      }
    }
    Enums: {
      category_type: "event" | "class" | "content"
      content_status: "draft" | "published" | "archived"
      content_type: "page" | "post" | "faq_item"
      event_status: "draft" | "published" | "cancelled" | "completed"
      order_status: "pending" | "confirmed" | "cancelled" | "refunded"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      setting_type: "string" | "number" | "boolean" | "json" | "array"
      ticket_status: "active" | "sold" | "reserved" | "cancelled"
      user_role: "user" | "admin" | "organizer" | "super_admin"
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
      category_type: ["event", "class", "content"],
      content_status: ["draft", "published", "archived"],
      content_type: ["page", "post", "faq_item"],
      event_status: ["draft", "published", "cancelled", "completed"],
      order_status: ["pending", "confirmed", "cancelled", "refunded"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      setting_type: ["string", "number", "boolean", "json", "array"],
      ticket_status: ["active", "sold", "reserved", "cancelled"],
      user_role: ["user", "admin", "organizer", "super_admin"],
    },
  },
} as const
