/**
 * Event Collections Service
 * Manages collections of events for organizers (promotional bundles, series, etc.)
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type EventCollection = Database['public']['Tables']['event_collections']['Row'];
type EventCollectionEvent = Database['public']['Tables']['event_collection_events']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

export interface CreateEventCollectionData {
  name: string;
  description?: string;
  collection_type: 'series' | 'bundle' | 'festival' | 'tour' | 'custom';
  featured_image_url?: string;
  is_public: boolean;
  starts_at?: string;
  ends_at?: string;
  discount_percentage?: number;
  max_attendees?: number;
  event_ids: string[];
}

export interface UpdateEventCollectionData extends Partial<CreateEventCollectionData> {
  id: string;
}

export interface EventCollectionWithEvents extends EventCollection {
  events?: (Event & { order_index?: number })[];
  total_events?: number;
  total_attendees?: number;
  total_revenue?: number;
}

export interface EventCollectionStats {
  total_collections: number;
  total_events_in_collections: number;
  total_revenue: number;
  avg_collection_size: number;
  most_popular_type: string;
}

export class EventCollectionsService {
  /**
   * Create a new event collection
   */
  static async createCollection(
    organizerId: string, 
    data: CreateEventCollectionData
  ): Promise<EventCollection | null> {
    try {
      // First create the collection
      const { data: collection, error: collectionError } = await supabase
        .from('event_collections')
        .insert({
          organizer_id: organizerId,
          name: data.name,
          description: data.description,
          collection_type: data.collection_type,
          featured_image_url: data.featured_image_url,
          is_public: data.is_public,
          starts_at: data.starts_at,
          ends_at: data.ends_at,
          discount_percentage: data.discount_percentage,
          max_attendees: data.max_attendees,
          status: 'active'
        })
        .select()
        .single();

      if (collectionError) {
        console.error('Error creating collection:', collectionError);
        return null;
      }

      // Add events to the collection
      if (data.event_ids.length > 0) {
        const eventCollectionEvents = data.event_ids.map((eventId, index) => ({
          collection_id: collection.id,
          event_id: eventId,
          order_index: index
        }));

        const { error: eventsError } = await supabase
          .from('event_collection_events')
          .insert(eventCollectionEvents);

        if (eventsError) {
          console.error('Error adding events to collection:', eventsError);
          // Don't fail the entire operation, just log the error
        }
      }

      return collection;
    } catch (error) {
      console.error('Error in createCollection:', error);
      return null;
    }
  }

  /**
   * Get all collections for an organizer
   */
  static async getOrganizerCollections(organizerId: string): Promise<EventCollectionWithEvents[]> {
    try {
      const { data, error } = await supabase
        .from('event_collections')
        .select(`
          *,
          event_collection_events!inner(
            order_index,
            events(*)
          )
        `)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching collections:', error);
        return [];
      }

      // Transform the data to include events properly
      return (data || []).map(collection => {
        const events = collection.event_collection_events?.map(ece => ({
          ...ece.events,
          order_index: ece.order_index
        })) || [];

        return {
          ...collection,
          events,
          total_events: events.length,
          total_attendees: this.calculateTotalAttendees(events),
          total_revenue: this.calculateTotalRevenue(events)
        };
      });
    } catch (error) {
      console.error('Error in getOrganizerCollections:', error);
      return [];
    }
  }

  /**
   * Get a specific collection with all its events
   */
  static async getCollectionById(collectionId: string): Promise<EventCollectionWithEvents | null> {
    try {
      const { data, error } = await supabase
        .from('event_collections')
        .select(`
          *,
          event_collection_events(
            order_index,
            events(*)
          )
        `)
        .eq('id', collectionId)
        .single();

      if (error) {
        console.error('Error fetching collection:', error);
        return null;
      }

      const events = data.event_collection_events?.map(ece => ({
        ...ece.events,
        order_index: ece.order_index
      })).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || [];

      return {
        ...data,
        events,
        total_events: events.length,
        total_attendees: this.calculateTotalAttendees(events),
        total_revenue: this.calculateTotalRevenue(events)
      };
    } catch (error) {
      console.error('Error in getCollectionById:', error);
      return null;
    }
  }

  /**
   * Update an existing collection
   */
  static async updateCollection(data: UpdateEventCollectionData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_collections')
        .update({
          name: data.name,
          description: data.description,
          collection_type: data.collection_type,
          featured_image_url: data.featured_image_url,
          is_public: data.is_public,
          starts_at: data.starts_at,
          ends_at: data.ends_at,
          discount_percentage: data.discount_percentage,
          max_attendees: data.max_attendees,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (error) {
        console.error('Error updating collection:', error);
        return false;
      }

      // Update events if provided
      if (data.event_ids) {
        // Remove existing events
        await supabase
          .from('event_collection_events')
          .delete()
          .eq('collection_id', data.id);

        // Add new events
        if (data.event_ids.length > 0) {
          const eventCollectionEvents = data.event_ids.map((eventId, index) => ({
            collection_id: data.id,
            event_id: eventId,
            order_index: index
          }));

          await supabase
            .from('event_collection_events')
            .insert(eventCollectionEvents);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in updateCollection:', error);
      return false;
    }
  }

  /**
   * Delete a collection
   */
  static async deleteCollection(collectionId: string): Promise<boolean> {
    try {
      // First delete all event associations
      await supabase
        .from('event_collection_events')
        .delete()
        .eq('collection_id', collectionId);

      // Then delete the collection
      const { error } = await supabase
        .from('event_collections')
        .delete()
        .eq('id', collectionId);

      if (error) {
        console.error('Error deleting collection:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCollection:', error);
      return false;
    }
  }

  /**
   * Add events to a collection
   */
  static async addEventsToCollection(
    collectionId: string, 
    eventIds: string[]
  ): Promise<boolean> {
    try {
      // Get current max order index
      const { data: existingEvents } = await supabase
        .from('event_collection_events')
        .select('order_index')
        .eq('collection_id', collectionId)
        .order('order_index', { ascending: false })
        .limit(1);

      const maxIndex = existingEvents?.[0]?.order_index || -1;

      // Insert new events
      const eventCollectionEvents = eventIds.map((eventId, index) => ({
        collection_id: collectionId,
        event_id: eventId,
        order_index: maxIndex + 1 + index
      }));

      const { error } = await supabase
        .from('event_collection_events')
        .insert(eventCollectionEvents);

      if (error) {
        console.error('Error adding events to collection:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addEventsToCollection:', error);
      return false;
    }
  }

  /**
   * Remove events from a collection
   */
  static async removeEventsFromCollection(
    collectionId: string, 
    eventIds: string[]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_collection_events')
        .delete()
        .eq('collection_id', collectionId)
        .in('event_id', eventIds);

      if (error) {
        console.error('Error removing events from collection:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeEventsFromCollection:', error);
      return false;
    }
  }

  /**
   * Reorder events in a collection
   */
  static async reorderEventsInCollection(
    collectionId: string, 
    eventOrders: { eventId: string; orderIndex: number }[]
  ): Promise<boolean> {
    try {
      // Update each event's order index
      const updates = eventOrders.map(({ eventId, orderIndex }) =>
        supabase
          .from('event_collection_events')
          .update({ order_index: orderIndex })
          .eq('collection_id', collectionId)
          .eq('event_id', eventId)
      );

      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error in reorderEventsInCollection:', error);
      return false;
    }
  }

  /**
   * Get public collections for browsing
   */
  static async getPublicCollections(
    limit: number = 20, 
    offset: number = 0
  ): Promise<EventCollectionWithEvents[]> {
    try {
      const { data, error } = await supabase
        .from('event_collections')
        .select(`
          *,
          event_collection_events(
            order_index,
            events(*)
          )
        `)
        .eq('is_public', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching public collections:', error);
        return [];
      }

      return (data || []).map(collection => {
        const events = collection.event_collection_events?.map(ece => ({
          ...ece.events,
          order_index: ece.order_index
        })).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || [];

        return {
          ...collection,
          events,
          total_events: events.length,
          total_attendees: this.calculateTotalAttendees(events),
          total_revenue: this.calculateTotalRevenue(events)
        };
      });
    } catch (error) {
      console.error('Error in getPublicCollections:', error);
      return [];
    }
  }

  /**
   * Get collection statistics for an organizer
   */
  static async getCollectionStats(organizerId: string): Promise<EventCollectionStats | null> {
    try {
      const collections = await this.getOrganizerCollections(organizerId);
      
      if (collections.length === 0) {
        return {
          total_collections: 0,
          total_events_in_collections: 0,
          total_revenue: 0,
          avg_collection_size: 0,
          most_popular_type: 'series'
        };
      }

      const totalEvents = collections.reduce((sum, c) => sum + (c.total_events || 0), 0);
      const totalRevenue = collections.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
      
      // Find most popular collection type
      const typeCounts: Record<string, number> = {};
      collections.forEach(c => {
        typeCounts[c.collection_type] = (typeCounts[c.collection_type] || 0) + 1;
      });
      
      const mostPopularType = Object.entries(typeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'series';

      return {
        total_collections: collections.length,
        total_events_in_collections: totalEvents,
        total_revenue: totalRevenue,
        avg_collection_size: totalEvents / collections.length,
        most_popular_type: mostPopularType
      };
    } catch (error) {
      console.error('Error in getCollectionStats:', error);
      return null;
    }
  }

  /**
   * Calculate total attendees for events
   */
  private static calculateTotalAttendees(events: any[]): number {
    return events.reduce((total, event) => {
      const attendees = event.ticket_types?.reduce((sum: number, tt: any) => 
        sum + (tt.quantity_sold || 0), 0) || 0;
      return total + attendees;
    }, 0);
  }

  /**
   * Calculate total revenue for events
   */
  private static calculateTotalRevenue(events: any[]): number {
    return events.reduce((total, event) => {
      const revenue = event.ticket_types?.reduce((sum: number, tt: any) => 
        sum + ((tt.quantity_sold || 0) * (tt.price || 0)), 0) || 0;
      return total + revenue;
    }, 0);
  }

  /**
   * Search collections by name
   */
  static async searchCollections(
    query: string, 
    organizerId?: string,
    limit: number = 20
  ): Promise<EventCollectionWithEvents[]> {
    try {
      let queryBuilder = supabase
        .from('event_collections')
        .select(`
          *,
          event_collection_events(
            order_index,
            events(*)
          )
        `)
        .ilike('name', `%${query}%`)
        .eq('status', 'active')
        .limit(limit);

      if (organizerId) {
        queryBuilder = queryBuilder.eq('organizer_id', organizerId);
      } else {
        queryBuilder = queryBuilder.eq('is_public', true);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Error searching collections:', error);
        return [];
      }

      return (data || []).map(collection => {
        const events = collection.event_collection_events?.map(ece => ({
          ...ece.events,
          order_index: ece.order_index
        })).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || [];

        return {
          ...collection,
          events,
          total_events: events.length,
          total_attendees: this.calculateTotalAttendees(events),
          total_revenue: this.calculateTotalRevenue(events)
        };
      });
    } catch (error) {
      console.error('Error in searchCollections:', error);
      return [];
    }
  }
}

export default EventCollectionsService;