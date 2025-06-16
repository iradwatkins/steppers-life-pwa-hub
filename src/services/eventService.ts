import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];
type TicketType = Database['public']['Tables']['ticket_types']['Row'];
type TicketTypeInsert = Database['public']['Tables']['ticket_types']['Insert'];
type Venue = Database['public']['Tables']['venues']['Row'];
type VenueInsert = Database['public']['Tables']['venues']['Insert'];

export interface CreateEventData {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  tags?: string[];
  startDate: string;
  endDate: string;
  timezone: string;
  isOnline: boolean;
  onlineLink?: string;
  venue?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    capacity?: number;
  };
  maxAttendees?: number;
  featuredImageUrl?: string;
  galleryImages?: string[];
  ticketTypes: {
    name: string;
    description?: string;
    price: number;
    quantityAvailable: number;
    maxPerOrder?: number;
  }[];
  additionalInfo?: Record<string, any>;
}

export class EventService {
  static async createEvent(eventData: CreateEventData, organizerId: string): Promise<Event> {
    try {
      let venueId: string | null = null;

      // Create venue if it's a physical event
      if (!eventData.isOnline && eventData.venue) {
        const { data: venue, error: venueError } = await supabase
          .from('venues')
          .insert({
            name: eventData.venue.name,
            address: eventData.venue.address,
            city: eventData.venue.city,
            state: eventData.venue.state,
            zip_code: eventData.venue.zipCode,
            capacity: eventData.venue.capacity,
          })
          .select()
          .single();

        if (venueError) throw venueError;
        venueId = venue.id;
      }

      // Create the event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          organizer_id: organizerId,
          venue_id: venueId,
          title: eventData.title,
          description: eventData.description,
          short_description: eventData.shortDescription,
          category: eventData.category,
          tags: eventData.tags,
          start_date: eventData.startDate,
          end_date: eventData.endDate,
          timezone: eventData.timezone,
          is_online: eventData.isOnline,
          online_link: eventData.onlineLink,
          status: 'draft',
          featured_image_url: eventData.featuredImageUrl,
          gallery_images: eventData.galleryImages,
          max_attendees: eventData.maxAttendees,
          additional_info: eventData.additionalInfo,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create ticket types
      if (eventData.ticketTypes.length > 0) {
        const ticketTypesData = eventData.ticketTypes.map(ticket => ({
          event_id: event.id,
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          quantity_available: ticket.quantityAvailable,
          max_per_order: ticket.maxPerOrder || 10,
        }));

        const { error: ticketError } = await supabase
          .from('ticket_types')
          .insert(ticketTypesData);

        if (ticketError) throw ticketError;
      }

      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizers (
            id,
            organization_name,
            user_id,
            profiles (
              full_name,
              email
            )
          ),
          venues (
            id,
            name,
            address,
            city,
            state,
            zip_code,
            capacity
          ),
          ticket_types (
            id,
            name,
            description,
            price,
            quantity_available,
            quantity_sold,
            is_active
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  static async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venues (
            name,
            city,
            state
          ),
          ticket_types (
            id,
            name,
            price,
            quantity_available,
            quantity_sold
          )
        `)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      return [];
    }
  }

  static async getPublishedEvents(limit?: number): Promise<Event[]> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizers (
            organization_name
          ),
          venues (
            name,
            city,
            state
          ),
          ticket_types (
            id,
            name,
            price,
            quantity_available,
            quantity_sold
          )
        `)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching published events:', error);
      return [];
    }
  }

  static async updateEvent(eventId: string, updates: EventUpdate): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }

  static async publishEvent(eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error publishing event:', error);
      return false;
    }
  }

  static async deleteEvent(eventId: string): Promise<boolean> {
    try {
      // Delete ticket types first (cascade)
      await supabase
        .from('ticket_types')
        .delete()
        .eq('event_id', eventId);

      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Organizer management methods
  static async createOrganizer(userId: string, organizationData: {
    organizationName: string;
    description?: string;
    websiteUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .insert({
          user_id: userId,
          organization_name: organizationData.organizationName,
          description: organizationData.description,
          website_url: organizationData.websiteUrl,
          contact_email: organizationData.contactEmail,
          contact_phone: organizationData.contactPhone,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating organizer:', error);
      throw error;
    }
  }

  static async getOrganizerByUserId(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No organizer found
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching organizer:', error);
      return null;
    }
  }

  // Search and filter events
  static async searchEvents(params: {
    query?: string;
    category?: string;
    location?: string;
    dateRange?: 'this-week' | 'next-week' | 'this-month' | 'next-month' | 'all';
    priceRange?: { min?: number; max?: number };
    limit?: number;
    offset?: number;
  }): Promise<{ events: Event[]; total: number }> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizers (
            organization_name
          ),
          venues (
            name,
            city,
            state,
            address
          ),
          ticket_types (
            id,
            name,
            price,
            quantity_available,
            quantity_sold
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString());

      // Text search
      if (params.query) {
        query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,category.ilike.%${params.query}%`);
      }

      // Category filter
      if (params.category && params.category !== 'all') {
        query = query.ilike('category', `%${params.category}%`);
      }

      // Location filter (city/state from venue)
      if (params.location && params.location !== 'all') {
        // This will need to be handled with a join or separate query
        // For now, we'll filter after fetching
      }

      // Date range filter
      if (params.dateRange && params.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (params.dateRange) {
          case 'this-week':
            startDate = new Date(now);
            endDate = new Date(now);
            endDate.setDate(now.getDate() + 7);
            break;
          case 'next-week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() + 7);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
            break;
          case 'this-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case 'next-month':
            startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
            break;
          default:
            startDate = now;
            endDate = new Date(now);
            endDate.setFullYear(now.getFullYear() + 1);
        }

        query = query
          .gte('start_date', startDate.toISOString())
          .lte('start_date', endDate.toISOString());
      }

      // Pagination
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
      } else if (params.limit) {
        query = query.limit(params.limit);
      }

      // Order by start date
      query = query.order('start_date', { ascending: true });

      const { data, error, count } = await query;

      if (error) throw error;

      let events = data || [];

      // Post-process location filtering if needed
      if (params.location && params.location !== 'all') {
        events = events.filter(event => {
          if (!event.venues) return false;
          const venue = event.venues as any;
          const locationLower = params.location!.toLowerCase();
          return (
            venue.city?.toLowerCase().includes(locationLower) ||
            venue.state?.toLowerCase().includes(locationLower)
          );
        });
      }

      // Post-process price filtering if needed
      if (params.priceRange) {
        events = events.filter(event => {
          const ticketTypes = event.ticket_types as any[];
          if (!ticketTypes?.length) return false;
          
          const minPrice = Math.min(...ticketTypes.map(tt => tt.price));
          const maxPrice = Math.max(...ticketTypes.map(tt => tt.price));
          
          const meetsMin = !params.priceRange!.min || minPrice >= params.priceRange!.min;
          const meetsMax = !params.priceRange!.max || maxPrice <= params.priceRange!.max;
          
          return meetsMin && meetsMax;
        });
      }

      return {
        events,
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching events:', error);
      return { events: [], total: 0 };
    }
  }

  // Get featured events
  static async getFeaturedEvents(limit = 6): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizers (
            organization_name
          ),
          venues (
            name,
            city,
            state
          ),
          ticket_types (
            id,
            name,
            price,
            quantity_available,
            quantity_sold
          )
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured events:', error);
      return [];
    }
  }

  // Get events by category
  static async getEventsByCategory(category: string, limit?: number): Promise<Event[]> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizers (
            organization_name
          ),
          venues (
            name,
            city,
            state
          ),
          ticket_types (
            id,
            name,
            price,
            quantity_available,
            quantity_sold
          )
        `)
        .eq('status', 'published')
        .ilike('category', `%${category}%`)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events by category:', error);
      return [];
    }
  }

  // Get upcoming events for a specific location
  static async getEventsByLocation(city: string, state?: string, limit?: number): Promise<Event[]> {
    try {
      // This requires a more complex query with venue joins
      const events = await this.getPublishedEvents();
      
      return events.filter(event => {
        const venue = event.venues as any;
        if (!venue) return false;
        
        const cityMatch = venue.city?.toLowerCase().includes(city.toLowerCase());
        const stateMatch = !state || venue.state?.toLowerCase().includes(state.toLowerCase());
        
        return cityMatch && stateMatch;
      }).slice(0, limit);
    } catch (error) {
      console.error('Error fetching events by location:', error);
      return [];
    }
  }

  // Event categories helper
  static getEventCategories(): string[] {
    return [
      'Chicago Stepping Classes',
      'Chicago Stepping Social',
      'Chicago Stepping Competition',
      'Workshop - Basic Stepping',
      'Workshop - Intermediate Stepping',
      'Workshop - Advanced Stepping',
      'Private Event - Corporate',
      'Private Event - Wedding',
      'Community Event',
      'Fundraiser Event',
      'Youth Stepping Program',
      'Senior Stepping Program'
    ];
  }

  // Get popular search tags
  static getPopularTags(): string[] {
    return [
      'beginner-friendly',
      'advanced',
      'competition',
      'social',
      'workshop',
      'live-music',
      'food-included',
      'youth',
      'senior',
      'couples',
      'singles',
      'free'
    ];
  }
}