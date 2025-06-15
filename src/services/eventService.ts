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
}