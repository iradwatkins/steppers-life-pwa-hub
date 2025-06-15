import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import apiService from './apiService';

// Types
export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];
export type Venue = Database['public']['Tables']['venues']['Row'];
export type VenueInsert = Database['public']['Tables']['venues']['Insert'];
export type VenueUpdate = Database['public']['Tables']['venues']['Update'];

// Helper types
export type EventWithVenue = Event & { venue?: Venue | null };
export type EventFilterOptions = {
  category?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: string;
  search?: string;
  organizer_id?: string;
  page?: number;
  limit?: number;
};

/**
 * Event Management Service
 * Provides methods to manage events and venues through Supabase
 */
const eventService = {
  /**
   * Get all events with optional filtering
   */
  getEvents: async (filters?: EventFilterOptions): Promise<EventWithVenue[]> => {
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

        // Pagination
        if (filters.page !== undefined && filters.limit !== undefined) {
          const offset = (filters.page - 1) * filters.limit;
          query = query.range(offset, offset + filters.limit - 1);
        }
      }

      // Order by start_date descending (newest first)
      query = query.order('start_date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEvents:', error);
      throw error;
    }
  },

  /**
   * Get event by ID
   */
  getEventById: async (eventId: string): Promise<EventWithVenue | null> => {
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
        console.error('Error fetching event by ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getEventById:', error);
      throw error;
    }
  },

  /**
   * Create a new event
   */
  createEvent: async (event: EventInsert): Promise<Event> => {
    try {
      // Add timestamps
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
        console.error('Error creating event:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createEvent:', error);
      throw error;
    }
  },

  /**
   * Update an event
   */
  updateEvent: async (eventId: string, updates: EventUpdate): Promise<Event> => {
    try {
      // Add updated timestamp
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
        console.error('Error updating event:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  },

  /**
   * Delete an event
   */
  deleteEvent: async (eventId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  },

  /**
   * Get all venues
   */
  getVenues: async (): Promise<Venue[]> => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching venues:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getVenues:', error);
      throw error;
    }
  },

  /**
   * Get venue by ID
   */
  getVenueById: async (venueId: string): Promise<Venue | null> => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (error) {
        console.error('Error fetching venue by ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getVenueById:', error);
      throw error;
    }
  },

  /**
   * Create a new venue
   */
  createVenue: async (venue: VenueInsert): Promise<Venue> => {
    try {
      // Add timestamps
      const now = new Date().toISOString();
      const venueWithTimestamps = {
        ...venue,
        created_at: now,
        updated_at: now,
        is_active: venue.is_active !== undefined ? venue.is_active : true,
      };

      const { data, error } = await supabase
        .from('venues')
        .insert(venueWithTimestamps)
        .select()
        .single();

      if (error) {
        console.error('Error creating venue:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createVenue:', error);
      throw error;
    }
  },

  /**
   * Update a venue
   */
  updateVenue: async (venueId: string, updates: VenueUpdate): Promise<Venue> => {
    try {
      // Add updated timestamp
      const updatedVenue = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('venues')
        .update(updatedVenue)
        .eq('id', venueId)
        .select()
        .single();

      if (error) {
        console.error('Error updating venue:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateVenue:', error);
      throw error;
    }
  },

  /**
   * Delete a venue
   */
  deleteVenue: async (venueId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId);

      if (error) {
        console.error('Error deleting venue:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteVenue:', error);
      throw error;
    }
  },

  /**
   * Upload an image for an event
   */
  uploadEventImage: async (file: File, eventId: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}_${Date.now()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading event image:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from('events').getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadEventImage:', error);
      throw error;
    }
  },
};

export default eventService; 