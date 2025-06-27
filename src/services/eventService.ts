import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { calculateDistance, geocodeAddress } from '@/utils/geolocation';
import { EventType, SimpleEventConfig } from '@/types/eventTypes';

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
  // Event type configuration
  eventType?: EventType;
  requiresTickets?: boolean;
  
  // Simple event configuration
  freeEntryCondition?: string;
  doorPrice?: string;
  doorPriceCurrency?: string;
  
  ticketTypes?: {
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
    console.log('🔧 EventService.createEvent called with:', { eventData, organizerId });
    
    // Validate organizer ID
    if (!organizerId) {
      throw new Error('Organizer ID is required to create an event');
    }

    try {
      // Verify organizer exists
      console.log('👤 Verifying organizer exists...');
      const { data: organizer, error: organizerError } = await supabase
        .from('organizers')
        .select('id, organization_name')
        .eq('id', organizerId)
        .single();

      if (organizerError || !organizer) {
        console.error('❌ Organizer verification failed:', organizerError);
        throw new Error('Invalid organizer profile. Please set up your organizer profile first.');
      }
      
      console.log('✅ Organizer verified:', organizer);
      let venueId: string | null = null;

      // Create venue if it's a physical event
      if (!eventData.isOnline && eventData.venue) {
        console.log('🏢 Creating venue for physical event...');
        console.log('🏢 Venue data:', eventData.venue);
        
        try {
          // Automatically geocode the venue address to get coordinates
          console.log('🗺️ Attempting to geocode venue address...');
          let coordinates = null;
          try {
            coordinates = await geocodeAddress({
              street: eventData.venue.address,
              city: eventData.venue.city,
              state: eventData.venue.state,
              zipCode: eventData.venue.zipCode
            });
            console.log('🗺️ Geocoding result:', coordinates);
          } catch (geocodingError) {
            console.warn('⚠️ Geocoding failed, continuing without coordinates:', geocodingError);
            // Don't fail the entire event creation if geocoding fails
          }

          const venueInsertData = {
            name: eventData.venue.name,
            address: eventData.venue.address,
            city: eventData.venue.city,
            state: eventData.venue.state,
            zip_code: eventData.venue.zipCode,
            capacity: eventData.venue.capacity,
            latitude: coordinates?.latitude || null,
            longitude: coordinates?.longitude || null,
          };
          console.log('🏢 Inserting venue with data:', venueInsertData);

          const { data: venue, error: venueError } = await supabase
            .from('venues')
            .insert(venueInsertData)
            .select()
            .single();

          if (venueError) {
            console.error('❌ Venue creation error:', venueError);
            throw venueError;
          }
          
          venueId = venue.id;
          console.log('✅ Venue created successfully:', venue);

          // Log geocoding result for debugging
          if (coordinates) {
            console.log(`🗺️ Venue "${eventData.venue.name}" geocoded to:`, coordinates);
          } else {
            console.warn(`⚠️ Could not geocode venue "${eventData.venue.name}" - distance sorting will not work for this event`);
          }
        } catch (venueError) {
          console.error('❌ Error in venue creation process:', venueError);
          throw new Error(`Venue creation failed: ${venueError.message || venueError}`);
        }
      } else {
        console.log('💻 Online event - no venue needed');
      }

      // Create the event
      console.log('📅 Creating event record...');
      const eventInsertData = {
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
        status: 'draft' as const,
        featured_image_url: eventData.featuredImageUrl,
        gallery_images: eventData.galleryImages,
        max_attendees: eventData.maxAttendees,
        // Event type and ticket configuration
        event_type: eventData.eventType ?? 'ticketed',
        requires_tickets: eventData.requiresTickets ?? true,
        // Simple event configuration
        free_entry_condition: eventData.freeEntryCondition,
        door_price: eventData.doorPrice ? parseFloat(eventData.doorPrice) : null,
        door_price_currency: eventData.doorPriceCurrency ?? 'USD',
        additional_info: eventData.additionalInfo,
        // Multi-day event support
        is_multi_day: eventData.is_multi_day || false,
        total_days: eventData.total_days || 1,
      };
      console.log('📅 Event insert data:', eventInsertData);

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert(eventInsertData)
        .select()
        .single();

      if (eventError) {
        console.error('❌ Event creation error:', eventError);
        throw eventError;
      }
      
      console.log('✅ Event created successfully:', event);

      // Create ticket types only if tickets are required
      const requiresTickets = eventData.requiresTickets ?? true;
      if (requiresTickets) {
        if (eventData.ticketTypes && eventData.ticketTypes.length > 0) {
          console.log('🎫 Creating ticket types...');
          const ticketTypesData = eventData.ticketTypes.map(ticket => ({
            event_id: event.id,
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            quantity_available: ticket.quantityAvailable,
            max_per_order: ticket.maxPerOrder || 10,
          }));
          console.log('🎫 Ticket types data:', ticketTypesData);

          const { error: ticketError } = await supabase
            .from('ticket_types')
            .insert(ticketTypesData);

          if (ticketError) {
            console.error('❌ Ticket types creation error:', ticketError);
            // CRITICAL: Delete the event if ticket creation fails
            console.log('🔄 Rolling back event creation due to ticket type failure...');
            await supabase.from('events').delete().eq('id', event.id);
            if (venueId) {
              await supabase.from('venues').delete().eq('id', venueId);
            }
            throw new Error(`Ticket type creation failed: ${ticketError.message}`);
          }
          
          console.log('✅ Ticket types created successfully');
        } else {
          console.log('ℹ️ No ticket types provided for ticketed event, creating default...');
          // If no ticket types provided for a ticketed event, create a default one
          console.log('🎫 Creating default ticket type...');
          const defaultTicketType = {
            event_id: event.id,
            name: 'General Admission',
            description: 'Standard event ticket',
            price: 0,
            quantity_available: eventData.maxAttendees || 100,
            max_per_order: 10,
          };

          const { error: defaultTicketError } = await supabase
            .from('ticket_types')
            .insert([defaultTicketType]);

          if (defaultTicketError) {
            console.error('❌ Default ticket type creation error:', defaultTicketError);
            // CRITICAL: Delete the event if default ticket creation fails
            console.log('🔄 Rolling back event creation due to default ticket type failure...');
            await supabase.from('events').delete().eq('id', event.id);
            if (venueId) {
              await supabase.from('venues').delete().eq('id', venueId);
            }
            throw new Error(`Default ticket type creation failed: ${defaultTicketError.message}`);
          }
          
          console.log('✅ Default ticket type created successfully');
        }
      } else {
        console.log('🆓 Free event - no ticket types needed');
      }

      // Handle additional dates for multi-day events
      if (eventData.additional_dates && eventData.additional_dates.length > 0) {
        console.log('📅 Creating additional dates for multi-day event...');
        
        const additionalDatesData = eventData.additional_dates.map(dateInfo => ({
          event_id: event.id,
          date: dateInfo.date,
          start_time: dateInfo.start_time,
          end_time: dateInfo.end_time,
          is_main_date: dateInfo.is_main_date || false,
          created_at: new Date().toISOString()
        }));

        const { error: datesError } = await supabase
          .from('event_dates')
          .insert(additionalDatesData);

        if (datesError) {
          console.error('❌ Additional dates creation error:', datesError);
          // Don't rollback - event can exist without additional dates
          console.warn('⚠️ Multi-day event created but additional dates failed to save');
        } else {
          console.log('✅ Additional dates created successfully');
        }
      }

      console.log('🎉 Event creation completed successfully:', event);
      return event;
    } catch (error) {
      console.error('❌ EventService.createEvent failed:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }

  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      console.log('🔍 EventService.getEventById called with ID:', eventId);
      
      // Guard against null or undefined eventId
      if (!eventId || eventId === 'null' || eventId === 'undefined') {
        console.error('❌ EventService.getEventById: Invalid eventId provided:', eventId);
        return null;
      }
      
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

      console.log('📊 Supabase query result:', { data, error });
      
      if (error) {
        console.error('❌ Supabase error in getEventById:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('⚠️ No event data returned for ID:', eventId);
        return null;
      }
      
      console.log('✅ Event successfully fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching event:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return null;
    }
  }

  static async getEventsByOrganizerBasic(organizerId: string): Promise<Event[]> {
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

  static async updateEventBasic(eventId: string, updates: EventUpdate): Promise<Event | null> {
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

  static async deleteEventBasic(eventId: string): Promise<boolean> {
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
    profilePicturePath?: string;
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

  // Search and filter events with optional distance sorting
  static async searchEvents(params: {
    query?: string;
    category?: string;
    location?: string;
    state?: string;
    city?: string;
    dateRange?: 'this-week' | 'next-week' | 'this-month' | 'next-month' | 'all';
    priceRange?: { min?: number; max?: number };
    userLat?: number;
    userLon?: number;
    sortByDistance?: boolean;
    maxDistance?: number; // in miles
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

      // Enhanced text search (event name, promoter name, venue name)
      if (params.query) {
        query = query.or(`
          title.ilike.%${params.query}%,
          description.ilike.%${params.query}%,
          category.ilike.%${params.query}%,
          organizers.organization_name.ilike.%${params.query}%,
          venues.name.ilike.%${params.query}%
        `);
      }

      // Category filter
      if (params.category && params.category !== 'all') {
        query = query.ilike('category', `%${params.category}%`);
      }

      // State filter
      if (params.state && params.state !== 'all') {
        query = query.eq('venues.state', params.state);
      }

      // City filter
      if (params.city && params.city !== 'all') {
        query = query.eq('venues.city', params.city);
      }

      // Legacy location filter (for backwards compatibility)
      if (params.location && params.location !== 'all' && !params.state && !params.city) {
        query = query.or(`venues.city.ilike.%${params.location}%,venues.state.ilike.%${params.location}%`);
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
          
          const minPrice = Math.min(...(ticketTypes || []).map(tt => tt.price));
          const maxPrice = Math.max(...(ticketTypes || []).map(tt => tt.price));
          
          const meetsMin = !params.priceRange!.min || minPrice >= params.priceRange!.min;
          const meetsMax = !params.priceRange!.max || maxPrice <= params.priceRange!.max;
          
          return meetsMin && meetsMax;
        });
      }

      // Distance-based sorting and filtering
      if (params.userLat && params.userLon && params.sortByDistance) {
        // Add distance to each event
        events = (events || []).map(event => {
          const venue = event.venues as any;
          let distance = Infinity;
          
          if (venue?.latitude && venue?.longitude) {
            distance = calculateDistance(
              params.userLat!,
              params.userLon!,
              venue.latitude,
              venue.longitude
            );
          }
          
          return {
            ...event,
            distance
          };
        });

        // Filter by max distance if specified
        if (params.maxDistance) {
          events = events.filter(event => (event as any).distance <= params.maxDistance!);
        }

        // Sort by distance (closest first)
        events.sort((a, b) => {
          const distanceA = (a as any).distance || Infinity;
          const distanceB = (b as any).distance || Infinity;
          return distanceA - distanceB;
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
      'Workshops',
      'Sets',
      'In the park',
      'Trips',
      'Cruises',
      'Holiday',
      'Competitions'
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

  // Get states that have events
  static async getStatesWithEvents(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('venues(state)')
        .eq('status', 'published')
        .not('venues.state', 'is', null);

      if (error) throw error;

      const states = [...new Set(
        (data || [])
          .map(event => event.venues?.state)
          .filter(Boolean)
      )].sort();

      return states;
    } catch (error) {
      console.error('Error fetching states with events:', error);
      return [];
    }
  }

  // Get cities in a specific state that have events
  static async getCitiesInStateWithEvents(state: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('venues(city)')
        .eq('status', 'published')
        .eq('venues.state', state)
        .not('venues.city', 'is', null);

      if (error) throw error;

      const cities = [...new Set(
        (data || [])
          .map(event => event.venues?.city)
          .filter(Boolean)
      )].sort();

      return cities;
    } catch (error) {
      console.error('Error fetching cities with events:', error);
      return [];
    }
  }

  // Get all locations with event counts for smart dropdown
  static async getLocationHierarchy(): Promise<{
    state: string;
    cities: string[];
    eventCount: number;
  }[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('venues(city, state)')
        .eq('status', 'published')
        .not('venues.state', 'is', null)
        .not('venues.city', 'is', null);

      if (error) throw error;

      // Group by state and count cities
      const stateMap = new Map<string, Set<string>>();
      
      (data || []).forEach(event => {
        const venue = event.venues;
        if (venue?.state && venue?.city) {
          if (!stateMap.has(venue.state)) {
            stateMap.set(venue.state, new Set());
          }
          stateMap.get(venue.state)!.add(venue.city);
        }
      });

      // Convert to array format
      const hierarchy = Array.from(stateMap.entries()).map(([state, citySet]) => ({
        state,
        cities: Array.from(citySet).sort(),
        eventCount: (data || []).filter(event => event.venues?.state === state).length
      })).sort((a, b) => a.state.localeCompare(b.state));

      return hierarchy;
    } catch (error) {
      console.error('Error fetching location hierarchy:', error);
      return [];
    }
  }

  // ============= CRUD OPERATIONS =============

  // Update event
  static async updateEvent(eventId: string, eventData: Partial<CreateEventData>, organizerId: string): Promise<Event> {
    console.log('🔧 EventService.updateEvent called with:', { eventId, eventData, organizerId });
    
    try {
      // First verify ownership
      const { data: existingEvent, error: fetchError } = await supabase
        .from('events')
        .select('organizer_id')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;
      if (existingEvent.organizer_id !== organizerId) {
        throw new Error('Unauthorized: You can only update your own events');
      }

      // Prepare update data
      const updateData: EventUpdate = {
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
        max_attendees: eventData.maxAttendees,
        featured_image_url: eventData.featuredImageUrl,
        gallery_images: eventData.galleryImages,
        additional_info: eventData.additionalInfo,
        updated_at: new Date().toISOString()
      };

      // Update the event
      const { data: updatedEvent, error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update venue if provided
      if (eventData.venue && !eventData.isOnline) {
        const { error: venueError } = await supabase
          .from('venues')
          .update({
            name: eventData.venue.name,
            address: eventData.venue.address,
            city: eventData.venue.city,
            state: eventData.venue.state,
            zip_code: eventData.venue.zipCode,
            capacity: eventData.venue.capacity
          })
          .eq('id', updatedEvent.venue_id);

        if (venueError) console.error('Error updating venue:', venueError);
      }

      console.log('✅ Event updated successfully:', updatedEvent);
      return updatedEvent;

    } catch (error) {
      console.error('❌ Error updating event:', error);
      throw error;
    }
  }

  // Delete event
  static async deleteEvent(eventId: string, organizerId: string): Promise<boolean> {
    console.log('🔧 EventService.deleteEvent called with:', { eventId, organizerId });
    
    try {
      // First verify ownership
      const { data: existingEvent, error: fetchError } = await supabase
        .from('events')
        .select('organizer_id, venue_id')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;
      if (existingEvent.organizer_id !== organizerId) {
        throw new Error('Unauthorized: You can only delete your own events');
      }

      // Check if event has any orders/tickets sold
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('event_id', eventId)
        .limit(1);

      if (ordersError) throw ordersError;
      
      if (orders && orders.length > 0) {
        throw new Error('Cannot delete event: Orders exist for this event. Please cancel the event instead.');
      }

      // Delete related records first (foreign key constraints)
      // Only delete from tables that exist in our schema
      await Promise.all([
        // Delete ticket types
        supabase.from('ticket_types').delete().eq('event_id', eventId),
        // Delete any orders
        supabase.from('orders').delete().eq('event_id', eventId)
      ]);

      // Delete the event
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      // Optionally delete the venue if it's not used by other events
      if (existingEvent.venue_id) {
        const { data: otherEvents } = await supabase
          .from('events')
          .select('id')
          .eq('venue_id', existingEvent.venue_id)
          .limit(1);

        if (!otherEvents || otherEvents.length === 0) {
          await supabase.from('venues').delete().eq('id', existingEvent.venue_id);
        }
      }

      console.log('✅ Event deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ Error deleting event:', error);
      throw error;
    }
  }

  // Cancel event (soft delete - keeps data but marks as cancelled)
  static async cancelEvent(eventId: string, organizerId: string, reason?: string): Promise<Event> {
    console.log('🔧 EventService.cancelEvent called with:', { eventId, organizerId, reason });
    
    try {
      // First verify ownership and get current data
      const { data: existingEvent, error: fetchError } = await supabase
        .from('events')
        .select('organizer_id, additional_info')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;
      if (existingEvent.organizer_id !== organizerId) {
        throw new Error('Unauthorized: You can only cancel your own events');
      }

      // Update event status to cancelled
      const { data: cancelledEvent, error: updateError } = await supabase
        .from('events')
        .update({
          status: 'cancelled',
          additional_info: {
            ...(existingEvent.additional_info || {}),
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Send cancellation notifications to ticket holders
      try {
        const { NotificationService } = await import('./notificationService');
        
        const cancellationData = {
          eventId,
          eventTitle: cancelledEvent.title,
          eventDate: new Date(cancelledEvent.start_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          reason: cancellationReason,
          organizerName: cancelledEvent.organizers?.organization_name || 'Event Organizer'
        };

        console.log('📧 Sending cancellation notifications...');
        const notificationResults = await NotificationService.sendEventCancellationNotifications(
          eventId, 
          cancellationData
        );
        
        console.log(`✅ Notifications sent: ${notificationResults.success} success, ${notificationResults.failed} failed`);

        // Process refunds for ticket holders
        console.log('💰 Processing refunds...');
        const refundResults = await NotificationService.processEventCancellationRefunds(eventId);
        
        console.log(`✅ Refunds processed: ${refundResults.success} success, ${refundResults.failed} failed, $${refundResults.totalRefunded.toFixed(2)} total`);

        // Log cancellation activity
        await this.logEventActivity(eventId, organizerId, 'cancelled', {
          reason: cancellationReason,
          notifications_sent: notificationResults.success,
          notifications_failed: notificationResults.failed,
          refunds_processed: refundResults.success,
          refunds_failed: refundResults.failed,
          total_refunded: refundResults.totalRefunded
        });

      } catch (notificationError) {
        console.error('❌ Error in cancellation notifications/refunds:', notificationError);
        // Don't throw error here - event is still cancelled even if notifications fail
        
        // Log the error but continue
        await this.logEventActivity(eventId, organizerId, 'cancelled', {
          reason: cancellationReason,
          notification_error: notificationError instanceof Error ? notificationError.message : 'Unknown error'
        });
      }

      console.log('✅ Event cancelled successfully:', cancelledEvent);
      return cancelledEvent;

    } catch (error) {
      console.error('❌ Error cancelling event:', error);
      throw error;
    }
  }

  // Admin delete (for admin users only)
  static async adminDeleteEvent(eventId: string): Promise<boolean> {
    console.log('🔧 EventService.adminDeleteEvent called with:', { eventId });
    
    try {
      // Delete all related records first (only from existing tables)
      await Promise.all([
        supabase.from('ticket_types').delete().eq('event_id', eventId),
        supabase.from('orders').delete().eq('event_id', eventId)
      ]);

      // Delete the event
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      console.log('✅ Admin event deletion successful');
      return true;

    } catch (error) {
      console.error('❌ Error in admin event deletion:', error);
      throw error;
    }
  }

  // Bulk operations for admin
  static async bulkDeleteEvents(eventIds: string[]): Promise<{success: string[], failed: string[]}> {
    console.log('🔧 EventService.bulkDeleteEvents called with:', { eventIds });
    
    const results = {
      success: [] as string[],
      failed: [] as string[]
    };

    for (const eventId of eventIds) {
      try {
        await this.adminDeleteEvent(eventId);
        results.success.push(eventId);
      } catch (error) {
        console.error(`Failed to delete event ${eventId}:`, error);
        results.failed.push(eventId);
      }
    }

    return results;
  }

  // Get events by organizer (for organizer dashboard)
  static async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venues(*),
          ticket_types(*),
          organizers(organization_name)
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

  // Get all events for admin management
  static async getAllEventsForAdmin(filters?: {
    status?: string;
    organizer?: string;
    dateRange?: { start: string; end: string };
    search?: string;
  }): Promise<Event[]> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          venues(*),
          ticket_types(*),
          organizers(organization_name, user_id, profiles(full_name))
        `);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.organizer) {
        query = query.eq('organizer_id', filters.organizer);
      }
      if (filters?.dateRange) {
        query = query.gte('start_date', filters.dateRange.start)
                     .lte('start_date', filters.dateRange.end);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error fetching admin events:', error);
      return [];
    }
  }

  /**
   * Add ticket types to an existing event that doesn't have any
   */
  static async addTicketTypesToEvent(
    eventId: string, 
    ticketTypes: CreateEventData['ticketTypes'], 
    organizerId: string
  ): Promise<boolean> {
    try {
      console.log('🎫 Adding ticket types to existing event:', eventId);
      
      // Verify the event exists and belongs to the organizer
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, organizer_id, title')
        .eq('id', eventId)
        .eq('organizer_id', organizerId)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found or access denied');
      }

      // Check if event already has ticket types
      const { data: existingTickets, error: checkError } = await supabase
        .from('ticket_types')
        .select('id')
        .eq('event_id', eventId);

      if (checkError) {
        throw checkError;
      }

      if (existingTickets && existingTickets.length > 0) {
        console.log('ℹ️ Event already has ticket types');
        return true;
      }

      // Create ticket types
      const ticketTypesData = ticketTypes.map(ticket => ({
        event_id: eventId,
        name: ticket.name,
        description: ticket.description,
        price: ticket.price,
        quantity_available: ticket.quantityAvailable,
        max_per_order: ticket.maxPerOrder || 10,
      }));

      const { error: insertError } = await supabase
        .from('ticket_types')
        .insert(ticketTypesData);

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Ticket types added successfully to event:', event.title);
      return true;
    } catch (error) {
      console.error('❌ Error adding ticket types to event:', error);
      return false;
    }
  }

  /**
   * Fix events that don't have ticket types by adding default ones
   */
  static async fixEventsWithoutTicketTypes(): Promise<{fixed: number, failed: string[]}> {
    try {
      console.log('🔧 Finding events without ticket types...');
      
      // Get all events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, organizer_id, max_attendees');

      if (eventsError) {
        throw eventsError;
      }

      const eventsWithoutTickets = [];
      
      // Check each event for ticket types
      for (const event of events || []) {
        const { data: ticketTypes, error: ticketError } = await supabase
          .from('ticket_types')
          .select('id')
          .eq('event_id', event.id);

        if (!ticketError && (!ticketTypes || ticketTypes.length === 0)) {
          eventsWithoutTickets.push(event);
        }
      }

      console.log(`🎫 Found ${eventsWithoutTickets.length} events without ticket types`);
      
      let fixed = 0;
      const failed = [];

      // Add default ticket types to events that don't have them
      for (const event of eventsWithoutTickets) {
        try {
          const defaultTicketType = {
            event_id: event.id,
            name: 'General Admission',
            description: 'Standard event ticket',
            price: 0,
            quantity_available: event.max_attendees || 100,
            max_per_order: 10,
          };

          const { error: insertError } = await supabase
            .from('ticket_types')
            .insert([defaultTicketType]);

          if (insertError) {
            throw insertError;
          }

          console.log(`✅ Fixed event: ${event.title}`);
          fixed++;
        } catch (error) {
          console.error(`❌ Failed to fix event ${event.title}:`, error);
          failed.push(event.title);
        }
      }

      return { fixed, failed };
    } catch (error) {
      console.error('❌ Error fixing events without ticket types:', error);
      return { fixed: 0, failed: ['Database error'] };
    }
  }
}