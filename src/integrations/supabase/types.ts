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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'user' | 'admin' | 'organizer' | 'super_admin'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'user' | 'admin' | 'organizer' | 'super_admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'user' | 'admin' | 'organizer' | 'super_admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizers: {
        Row: {
          id: string
          user_id: string | null
          organization_name: string
          description: string | null
          website_url: string | null
          contact_email: string | null
          contact_phone: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_name: string
          description?: string | null
          website_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_name?: string
          description?: string | null
          website_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      venues: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string | null
          country: string
          capacity: number | null
          description: string | null
          amenities: Json | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          zip_code?: string | null
          country?: string
          capacity?: number | null
          description?: string | null
          amenities?: Json | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string | null
          country?: string
          capacity?: number | null
          description?: string | null
          amenities?: Json | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          organizer_id: string | null
          venue_id: string | null
          title: string
          description: string | null
          short_description: string | null
          category: string | null
          tags: string[] | null
          start_date: string
          end_date: string
          timezone: string
          is_online: boolean
          online_link: string | null
          status: 'draft' | 'published' | 'cancelled' | 'completed'
          featured_image_url: string | null
          gallery_images: string[] | null
          max_attendees: number | null
          age_restriction: string | null
          dress_code: string | null
          parking_info: string | null
          additional_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id?: string | null
          venue_id?: string | null
          title: string
          description?: string | null
          short_description?: string | null
          category?: string | null
          tags?: string[] | null
          start_date: string
          end_date: string
          timezone?: string
          is_online?: boolean
          online_link?: string | null
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          featured_image_url?: string | null
          gallery_images?: string[] | null
          max_attendees?: number | null
          age_restriction?: string | null
          dress_code?: string | null
          parking_info?: string | null
          additional_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string | null
          venue_id?: string | null
          title?: string
          description?: string | null
          short_description?: string | null
          category?: string | null
          tags?: string[] | null
          start_date?: string
          end_date?: string
          timezone?: string
          is_online?: boolean
          online_link?: string | null
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          featured_image_url?: string | null
          gallery_images?: string[] | null
          max_attendees?: number | null
          age_restriction?: string | null
          dress_code?: string | null
          parking_info?: string | null
          additional_info?: Json | null
          created_at?: string
          updated_at?: string
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
          }
        ]
      }
      ticket_types: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          price: number
          quantity_available: number
          quantity_sold: number
          is_active: boolean
          sale_start_date: string | null
          sale_end_date: string | null
          max_per_order: number
          includes_perks: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          price: number
          quantity_available: number
          quantity_sold?: number
          is_active?: boolean
          sale_start_date?: string | null
          sale_end_date?: string | null
          max_per_order?: number
          includes_perks?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          price?: number
          quantity_available?: number
          quantity_sold?: number
          is_active?: boolean
          sale_start_date?: string | null
          sale_end_date?: string | null
          max_per_order?: number
          includes_perks?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          event_id: string
          order_number: string
          total_amount: number
          discount_amount: number
          fees_amount: number
          final_amount: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
          payment_intent_id: string | null
          promo_code_used: string | null
          billing_details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          order_number: string
          total_amount: number
          discount_amount?: number
          fees_amount?: number
          final_amount: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
          payment_intent_id?: string | null
          promo_code_used?: string | null
          billing_details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          order_number?: string
          total_amount?: number
          discount_amount?: number
          fees_amount?: number
          final_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
          payment_intent_id?: string | null
          promo_code_used?: string | null
          billing_details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      promo_codes: {
        Row: {
          id: string
          event_id: string | null
          code: string
          description: string | null
          discount_type: string | null
          discount_value: number
          max_uses: number | null
          used_count: number
          valid_from: string | null
          valid_until: string | null
          is_active: boolean
          minimum_order_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null
          code: string
          description?: string | null
          discount_type?: string | null
          discount_value: number
          max_uses?: number | null
          used_count?: number
          valid_from?: string | null
          valid_until?: string | null
          is_active?: boolean
          minimum_order_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string | null
          code?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          max_uses?: number | null
          used_count?: number
          valid_from?: string | null
          valid_until?: string | null
          is_active?: boolean
          minimum_order_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
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
      content_pages: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          meta_description: string | null
          meta_keywords: string[] | null
          type: 'page' | 'post' | 'faq_item'
          status: 'draft' | 'published' | 'archived'
          featured_image_url: string | null
          sort_order: number
          is_system_page: boolean
          created_by: string | null
          updated_by: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          type?: 'page' | 'post' | 'faq_item'
          status?: 'draft' | 'published' | 'archived'
          featured_image_url?: string | null
          sort_order?: number
          is_system_page?: boolean
          created_by?: string | null
          updated_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          type?: 'page' | 'post' | 'faq_item'
          status?: 'draft' | 'published' | 'archived'
          featured_image_url?: string | null
          sort_order?: number
          is_system_page?: boolean
          created_by?: string | null
          updated_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_pages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      content_page_versions: {
        Row: {
          id: string
          page_id: string
          version_number: number
          title: string
          content: string
          meta_description: string | null
          meta_keywords: string[] | null
          status: 'draft' | 'published' | 'archived'
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          version_number?: number
          title: string
          content: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          status: 'draft' | 'published' | 'archived'
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          version_number?: number
          title?: string
          content?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          status?: 'draft' | 'published' | 'archived'
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_page_versions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "content_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_page_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'admin' | 'organizer' | 'super_admin'
      event_status: 'draft' | 'published' | 'cancelled' | 'completed'
      order_status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
      content_status: 'draft' | 'published' | 'archived'
      content_type: 'page' | 'post' | 'faq_item'
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
    Enums: {},
  },
} as const
