import { supabase } from '@/integrations/supabase/client';
import { apiClient } from './apiClient';
import apiService from './apiService';
import type { Database } from '@/integrations/supabase/types';

// Types for Supabase
export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];
export type Venue = Database['public']['Tables']['venues']['Row'];

// Types for Backend API
export interface BackendEvent {
  id: number;
  title: string;
  slug: string;
  description?: string;
  event_type: 'workshop' | 'class' | 'social' | 'competition' | 'performance' | 'other';
  status: 'draft' | 'published' | 'cancelled' | 'completed' | 'postponed';
  category_id?: string;
  venue_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  start_time: string;
  end_time: string;
  capacity?: number;
  price?: number;
  currency: string;
  cover_image?: string;
  gallery_images?: any;
  video_url?: string;
  is_featured: boolean;
  is_private: boolean;
  requires_approval: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface EventFilterOptions {
  category?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: string;
  search?: string;
  organizer_id?: string;
  page?: number;
  limit?: number;
}

/**
 * Hybrid Event Service
 * Tries backend API first, falls back to Supabase for compatibility
 */
class HybridEventService {
  private useBackend: boolean = true;

  /**
   * Check if backend API is available
   */
  private async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await apiClient.healthCheck();
      return response.status === 200;
    } catch (error) {
      console.log('Backend API unavailable, falling back to Supabase');
      return false;
    }
  }

  /**
   * Get all events with optional filtering
   */
  async getEvents(filters?: EventFilterOptions): Promise<Event[]> {
    // Try backend API first
    if (this.useBackend) {
      try {
        const isHealthy = await this.checkBackendHealth();
        if (isHealthy) {
          const response = await apiClient.getEvents({
            category_id: filters?.category ? parseInt(filters.category) : undefined,
            skip: filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : undefined,
            limit: filters?.limit,
            status: filters?.status,
          });

          if (response.data) {
            // Convert backend events to frontend format
            return this.convertBackendEventsToFrontend(response.data);
          }
        }
      } catch (error) {
        console.warn('Backend API failed, falling back to Supabase:', error);
      }
    }

    // Fallback to Supabase
    return this.getEventsFromSupabase(filters);
  }

  /**
   * Get events from Supabase (fallback)
   */
  private async getEventsFromSupabase(filters?: EventFilterOptions): Promise<Event[]> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          venue:venues(*)
        `);

      // Apply filters
      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.organizer_id) {
          query = query.eq('organizer_id', filters.organizer_id);
        }
        if (filters.startDate) {
          query = query.gte('start_date', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('end_date', filters.endDate);
        }
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
          );
        }
        if (filters.page !== undefined && filters.limit !== undefined) {
          const offset = (filters.page - 1) * filters.limit;
          query = query.range(offset, offset + filters.limit - 1);
        }
      }

      query = query.order('start_date', { ascending: false });
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching events from Supabase:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEventsFromSupabase:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<Event | null> {
    // Try backend API first
    if (this.useBackend) {
      try {
        const isHealthy = await this.checkBackendHealth();
        if (isHealthy) {
          const response = await apiClient.getEvent(parseInt(eventId));
          if (response.data) {
            return this.convertBackendEventToFrontend(response.data);
          }
        }
      } catch (error) {
        console.warn('Backend API failed, falling back to Supabase:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(*)
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event by ID from Supabase:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getEventById:', error);
      throw error;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(event: EventInsert): Promise<Event> {
    // Try backend API first
    if (this.useBackend) {
      try {
        const isHealthy = await this.checkBackendHealth();
        if (isHealthy) {
          // Convert frontend event to backend format
          const backendEvent = this.convertFrontendEventToBackend(event);
          const response = await apiClient.createEvent(backendEvent);
          
          if (response.data) {
            return this.convertBackendEventToFrontend(response.data);
          }
        }
      } catch (error) {
        console.warn('Backend API failed, falling back to Supabase:', error);
      }
    }

    // Fallback to Supabase
    try {
      const now = new Date().toISOString();
      const eventWithTimestamps = {
        ...event,
        created_at: now,
        updated_at: now,
        status: event.status || 'draft',
      };

      const { data, error } = await supabase
        .from('events')
        .insert(eventWithTimestamps)
        .select()
        .single();

      if (error) {
        console.error('Error creating event in Supabase:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createEvent:', error);
      throw error;
    }
  }

  /**
   * Update an event
   */
  async updateEvent(eventId: string, updates: EventUpdate): Promise<Event> {
    // Try backend API first
    if (this.useBackend) {
      try {
        const isHealthy = await this.checkBackendHealth();
        if (isHealthy) {
          const backendUpdates = this.convertFrontendEventToBackend(updates);
          const response = await apiClient.updateEvent(parseInt(eventId), backendUpdates);
          
          if (response.data) {
            return this.convertBackendEventToFrontend(response.data);
          }
        }
      } catch (error) {
        console.warn('Backend API failed, falling back to Supabase:', error);
      }
    }

    // Fallback to Supabase
    try {
      const updatedEvent = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('events')
        .update(updatedEvent)
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        console.error('Error updating event in Supabase:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    // Try backend API first
    if (this.useBackend) {
      try {
        const isHealthy = await this.checkBackendHealth();
        if (isHealthy) {
          const response = await apiClient.deleteEvent(parseInt(eventId));
          if (response.status === 200) {
            return;
          }
        }
      } catch (error) {
        console.warn('Backend API failed, falling back to Supabase:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event from Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  }

  /**
   * Convert backend events to frontend format
   */
  private convertBackendEventsToFrontend(backendEvents: BackendEvent[]): Event[] {
    return backendEvents.map(event => this.convertBackendEventToFrontend(event));
  }

  /**
   * Convert single backend event to frontend format
   */
  private convertBackendEventToFrontend(backendEvent: BackendEvent): Event {
    return {
      id: backendEvent.id.toString(),
      title: backendEvent.title,
      description: backendEvent.description || null,
      start_date: backendEvent.start_time,
      end_date: backendEvent.end_time,
      location: backendEvent.venue_name || null,
      address: backendEvent.address || null,
      city: backendEvent.city || null,
      state: backendEvent.state || null,
      country: backendEvent.country || null,
      postal_code: backendEvent.zip_code || null,
      capacity: backendEvent.capacity || null,
      price: backendEvent.price || null,
      currency: backendEvent.currency,
      status: backendEvent.status as any,
      category: backendEvent.event_type,
      featured_image: backendEvent.cover_image || null,
      images: backendEvent.gallery_images || null,
      organizer_id: backendEvent.created_by.toString(),
      is_featured: backendEvent.is_featured,
      is_private: backendEvent.is_private,
      created_at: backendEvent.created_at,
      updated_at: backendEvent.updated_at,
      venue_id: null, // Backend doesn't have separate venue ID yet
    } as Event;
  }

  /**
   * Convert frontend event to backend format
   */
  private convertFrontendEventToBackend(frontendEvent: any): Partial<BackendEvent> {
    return {
      title: frontendEvent.title,
      description: frontendEvent.description,
      event_type: frontendEvent.category || 'other',
      status: frontendEvent.status || 'draft',
      venue_name: frontendEvent.location,
      address: frontendEvent.address,
      city: frontendEvent.city,
      state: frontendEvent.state,
      zip_code: frontendEvent.postal_code,
      country: frontendEvent.country,
      start_time: frontendEvent.start_date,
      end_time: frontendEvent.end_date,
      capacity: frontendEvent.capacity,
      price: frontendEvent.price,
      currency: frontendEvent.currency || 'USD',
      cover_image: frontendEvent.featured_image,
      gallery_images: frontendEvent.images,
      is_featured: frontendEvent.is_featured || false,
      is_private: frontendEvent.is_private || false,
      requires_approval: frontendEvent.requires_approval || false,
    };
  }

  /**
   * Set whether to use backend API or Supabase only
   */
  setBackendMode(enabled: boolean): void {
    this.useBackend = enabled;
  }

  /**
   * Get current mode
   */
  getMode(): string {
    return this.useBackend ? 'Backend API with Supabase fallback' : 'Supabase only';
  }
}

// Export singleton instance
export const hybridEventService = new HybridEventService();
export default hybridEventService;