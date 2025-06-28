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
          allow_waitlist: boolean
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
          max_rsvps: number | null
          online_link: string | null
          organizer_id: string | null
          parking_info: string | null
          requires_tickets: boolean
          rsvp_deadline: string | null
          rsvp_enabled: boolean
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
          allow_waitlist?: boolean
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
          max_rsvps?: number | null
          online_link?: string | null
          organizer_id?: string | null
          parking_info?: string | null
          requires_tickets?: boolean
          rsvp_deadline?: string | null
          rsvp_enabled?: boolean
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
          allow_waitlist?: boolean
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
          max_rsvps?: number | null
          online_link?: string | null
          organizer_id?: string | null
          parking_info?: string | null
          requires_tickets?: boolean
          rsvp_deadline?: string | null
          rsvp_enabled?: boolean
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
          cancellations: number | null
          category: string
          class_id: string | null
          class_name: string
          created_at: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          instructor_id: string | null
          no_shows: number | null
          revenue: number | null
          total_bookings: number | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          cancellations?: number | null
          category: string
          class_id?: string | null
          class_name: string
          created_at?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          no_shows?: number | null
          revenue?: number | null
          total_bookings?: number | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          cancellations?: number | null
          category?: string
          class_id?: string | null
          class_name?: string
          created_at?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          no_shows?: number | null
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
          classes_taught: number | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          date: string
          id: string
          instructor_id: string | null
          net_revenue: number | null
          students_served: number | null
          total_revenue: number | null
        }
        Insert: {
          classes_taught?: number | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          instructor_id?: string | null
          net_revenue?: number | null
          students_served?: number | null
          total_revenue?: number | null
        }
        Update: {
          classes_taught?: number | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          instructor_id?: string | null
          net_revenue?: number | null
          students_served?: number | null
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
          class_id: string | null
          comment: string | null
          created_at: string | null
          feedback_date: string | null
          id: string
          instructor_id: string | null
          is_anonymous: boolean | null
          rating: number | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          comment?: string | null
          created_at?: string | null
          feedback_date?: string | null
          id?: string
          instructor_id?: string | null
          is_anonymous?: boolean | null
          rating?: number | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          comment?: string | null
          created_at?: string | null
          feedback_date?: string | null
          id?: string
          instructor_id?: string | null
          is_anonymous?: boolean | null
          rating?: number | null
          student_id?: string | null
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
          created_at: string | null
          created_by: string | null
          id: string
          new_quantity: number | null
          previous_quantity: number | null
          quantity_change: number | null
          reason: string | null
          ticket_type_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_quantity?: number | null
          previous_quantity?: number | null
          quantity_change?: number | null
          reason?: string | null
          ticket_type_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_quantity?: number | null
          previous_quantity?: number | null
          quantity_change?: number | null
          reason?: string | null
          ticket_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_audit_logs_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_holds: {
        Row: {
          created_at: string | null
          expires_at: string
          held_by: string | null
          id: string
          quantity: number
          ticket_type_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          held_by?: string | null
          id?: string
          quantity: number
          ticket_type_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          held_by?: string | null
          id?: string
          quantity?: number
          ticket_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_holds_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
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
          alert_message: string
          alert_type: string
          created_at: string | null
          id: string
          instructor_id: string | null
          is_read: boolean | null
          severity: string | null
        }
        Insert: {
          alert_message: string
          alert_type: string
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          is_read?: boolean | null
          severity?: string | null
        }
        Update: {
          alert_message?: string
          alert_type?: string
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          is_read?: boolean | null
          severity?: string | null
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
          category_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_event_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "platform_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_events: {
        Row: {
          event_id: string | null
          id: string
          saved_at: string | null
          user_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          saved_at?: string | null
          user_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          saved_at?: string | null
          user_id?: string | null
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
          brand: string | null
          created_at: string | null
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean | null
          last_four: string | null
          payment_type: string
          stripe_payment_method_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          payment_type: string
          stripe_payment_method_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          payment_type?: string
          stripe_payment_method_id?: string
          updated_at?: string | null
          user_id?: string | null
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
          activity_type_id: string | null
          additional_data: Json | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          risk_score: number | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type_id?: string | null
          additional_data?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          risk_score?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type_id?: string | null
          additional_data?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          risk_score?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_activity_log_activity_type_id_fkey"
            columns: ["activity_type_id"]
            isOneToOne: false
            referencedRelation: "security_activity_types"
            referencedColumns: ["id"]
          },
        ]
      }
      security_activity_types: {
        Row: {
          created_at: string | null
          default_risk_score: number | null
          description: string | null
          id: string
          is_high_risk: boolean | null
          type_name: string
        }
        Insert: {
          created_at?: string | null
          default_risk_score?: number | null
          description?: string | null
          id?: string
          is_high_risk?: boolean | null
          type_name: string
        }
        Update: {
          created_at?: string | null
          default_risk_score?: number | null
          description?: string | null
          id?: string
          is_high_risk?: boolean | null
          type_name?: string
        }
        Relationships: []
      }
      ticket_purchases: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          metadata: Json | null
          order_id: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          purchase_date: string | null
          purchaser_email: string | null
          purchaser_name: string | null
          quantity: number
          ticket_type_id: string | null
          total_price: number
          unit_price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          purchase_date?: string | null
          purchaser_email?: string | null
          purchaser_name?: string | null
          quantity?: number
          ticket_type_id?: string | null
          total_price: number
          unit_price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          purchase_date?: string | null
          purchaser_email?: string | null
          purchaser_name?: string | null
          quantity?: number
          ticket_type_id?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_purchases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_purchases_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_purchases_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
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
      [_ in never]: never
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
      user_role: "user" | "organizer" | "admin"
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
      user_role: ["user", "organizer", "admin"],
    },
  },
} as const
