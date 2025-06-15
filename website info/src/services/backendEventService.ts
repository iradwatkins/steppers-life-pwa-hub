import apiService from './apiService';

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface EventVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  capacity?: number;
  amenities?: string[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  slug: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  category_id?: string;
  venue_id?: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  is_online: boolean;
  online_url?: string;
  max_attendees?: number;
  current_attendees: number;
  price?: number;
  currency: string;
  is_free: boolean;
  image_url?: string;
  tags?: string[];
  created_by: number;
  created_at: string;
  updated_at: string;
  category?: EventCategory;
  venue?: EventVenue;
}

export interface EventCreate {
  title: string;
  description?: string;
  category_id?: string;
  venue_id?: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  is_online: boolean;
  online_url?: string;
  max_attendees?: number;
  price?: number;
  currency?: string;
  is_free?: boolean;
  image_url?: string;
  tags?: string[];
}

export interface EventUpdate extends Partial<EventCreate> {
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
}

export interface EventPublic extends Omit<Event, 'created_by'> {
  // Public version without sensitive data
}

export interface EventListParams {
  skip?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  category_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Backend Event Service
 * Handles event management with the FastAPI backend
 */
class BackendEventService {
  private static instance: BackendEventService;

  static getInstance(): BackendEventService {
    if (!BackendEventService.instance) {
      BackendEventService.instance = new BackendEventService();
    }
    return BackendEventService.instance;
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: EventCreate): Promise<Event> {
    try {
      return await apiService.post<Event>('/events/', eventData);
    } catch (error) {
      console.error('Event creation failed:', error);
      throw error;
    }
  }

  /**
   * Get list of events with optional filters
   */
  async getEvents(params: EventListParams = {}): Promise<EventPublic[]> {
    try {
      const queryParams: Record<string, string> = {};
      
      if (params.skip !== undefined) queryParams.skip = params.skip.toString();
      if (params.limit !== undefined) queryParams.limit = params.limit.toString();
      if (params.status) queryParams.status = params.status;
      if (params.category_id) queryParams.category_id = params.category_id;
      if (params.search) queryParams.search = params.search;
      if (params.start_date) queryParams.start_date = params.start_date;
      if (params.end_date) queryParams.end_date = params.end_date;

      return await apiService.get<EventPublic[]>('/events/', queryParams);
    } catch (error) {
      console.error('Get events failed:', error);
      throw error;
    }
  }

  /**
   * Get a single event by ID
   */
  async getEvent(eventId: string): Promise<Event> {
    try {
      return await apiService.get<Event>(`/events/${eventId}`);
    } catch (error) {
      console.error('Get event failed:', error);
      throw error;
    }
  }

  /**
   * Get a single event by slug
   */
  async getEventBySlug(slug: string): Promise<EventPublic> {
    try {
      return await apiService.get<EventPublic>(`/events/slug/${slug}`);
    } catch (error) {
      console.error('Get event by slug failed:', error);
      throw error;
    }
  }

  /**
   * Update an event
   */
  async updateEvent(eventId: string, updates: EventUpdate): Promise<Event> {
    try {
      return await apiService.put<Event>(`/events/${eventId}`, updates);
    } catch (error) {
      console.error('Event update failed:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<{ message: string }> {
    try {
      return await apiService.delete<{ message: string }>(`/events/${eventId}`);
    } catch (error) {
      console.error('Event deletion failed:', error);
      throw error;
    }
  }

  /**
   * Publish an event
   */
  async publishEvent(eventId: string): Promise<Event> {
    try {
      return await apiService.post<Event>(`/events/${eventId}/publish`);
    } catch (error) {
      console.error('Event publish failed:', error);
      throw error;
    }
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string): Promise<Event> {
    try {
      return await apiService.post<Event>(`/events/${eventId}/cancel`);
    } catch (error) {
      console.error('Event cancel failed:', error);
      throw error;
    }
  }

  /**
   * Get events created by current user
   */
  async getMyEvents(params: EventListParams = {}): Promise<Event[]> {
    try {
      const queryParams: Record<string, string> = {};
      
      if (params.skip !== undefined) queryParams.skip = params.skip.toString();
      if (params.limit !== undefined) queryParams.limit = params.limit.toString();
      if (params.status) queryParams.status = params.status;

      return await apiService.get<Event[]>('/events/my-events', queryParams);
    } catch (error) {
      console.error('Get my events failed:', error);
      throw error;
    }
  }

  /**
   * Get event categories
   */
  async getCategories(): Promise<EventCategory[]> {
    try {
      return await apiService.get<EventCategory[]>('/events/categories');
    } catch (error) {
      console.error('Get categories failed:', error);
      throw error;
    }
  }

  /**
   * Get event venues
   */
  async getVenues(): Promise<EventVenue[]> {
    try {
      return await apiService.get<EventVenue[]>('/events/venues');
    } catch (error) {
      console.error('Get venues failed:', error);
      throw error;
    }
  }

  /**
   * Search events
   */
  async searchEvents(query: string, params: EventListParams = {}): Promise<EventPublic[]> {
    try {
      const searchParams = { ...params, search: query };
      return await this.getEvents(searchParams);
    } catch (error) {
      console.error('Event search failed:', error);
      throw error;
    }
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents(limit: number = 10): Promise<EventPublic[]> {
    try {
      return await apiService.get<EventPublic[]>('/events/featured', { limit: limit.toString() });
    } catch (error) {
      console.error('Get featured events failed:', error);
      throw error;
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10): Promise<EventPublic[]> {
    try {
      return await apiService.get<EventPublic[]>('/events/upcoming', { limit: limit.toString() });
    } catch (error) {
      console.error('Get upcoming events failed:', error);
      throw error;
    }
  }
}

export default BackendEventService.getInstance();