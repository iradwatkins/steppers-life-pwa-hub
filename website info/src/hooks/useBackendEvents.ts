import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import backendEventService, { 
  Event, 
  EventCreate, 
  EventUpdate, 
  EventPublic, 
  EventListParams,
  EventCategory,
  EventVenue
} from '@/services/backendEventService';

export interface UseEventsState {
  events: EventPublic[];
  loading: boolean;
  error: string | null;
}

export interface UseEventState {
  event: Event | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing events list
 */
export const useBackendEvents = (params: EventListParams = {}) => {
  const [state, setState] = useState<UseEventsState>({
    events: [],
    loading: true,
    error: null,
  });

  const fetchEvents = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const events = await backendEventService.getEvents(params);
      setState({ events, loading: false, error: null });
    } catch (error: any) {
      console.error('Failed to fetch events:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to fetch events'
      }));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [JSON.stringify(params)]);

  const refreshEvents = () => {
    fetchEvents();
  };

  return {
    ...state,
    refreshEvents,
  };
};

/**
 * Hook for managing a single event
 */
export const useBackendEvent = (eventId: string | null) => {
  const [state, setState] = useState<UseEventState>({
    event: null,
    loading: true,
    error: null,
  });

  const fetchEvent = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const event = await backendEventService.getEvent(id);
      setState({ event, loading: false, error: null });
    } catch (error: any) {
      console.error('Failed to fetch event:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to fetch event'
      }));
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    } else {
      setState({ event: null, loading: false, error: null });
    }
  }, [eventId]);

  const refreshEvent = () => {
    if (eventId) {
      fetchEvent(eventId);
    }
  };

  return {
    ...state,
    refreshEvent,
  };
};

/**
 * Hook for event management operations
 */
export const useEventManagement = () => {
  const [loading, setLoading] = useState(false);

  const createEvent = async (eventData: EventCreate): Promise<Event | null> => {
    try {
      setLoading(true);
      const newEvent = await backendEventService.createEvent(eventData);
      toast.success('Event created successfully');
      return newEvent;
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast.error(error.message || 'Failed to create event');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: string, updates: EventUpdate): Promise<Event | null> => {
    try {
      setLoading(true);
      const updatedEvent = await backendEventService.updateEvent(eventId, updates);
      toast.success('Event updated successfully');
      return updatedEvent;
    } catch (error: any) {
      console.error('Failed to update event:', error);
      toast.error(error.message || 'Failed to update event');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await backendEventService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      toast.error(error.message || 'Failed to delete event');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const publishEvent = async (eventId: string): Promise<Event | null> => {
    try {
      setLoading(true);
      const publishedEvent = await backendEventService.publishEvent(eventId);
      toast.success('Event published successfully');
      return publishedEvent;
    } catch (error: any) {
      console.error('Failed to publish event:', error);
      toast.error(error.message || 'Failed to publish event');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelEvent = async (eventId: string): Promise<Event | null> => {
    try {
      setLoading(true);
      const cancelledEvent = await backendEventService.cancelEvent(eventId);
      toast.success('Event cancelled successfully');
      return cancelledEvent;
    } catch (error: any) {
      console.error('Failed to cancel event:', error);
      toast.error(error.message || 'Failed to cancel event');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    publishEvent,
    cancelEvent,
  };
};

/**
 * Hook for event categories
 */
export const useEventCategories = () => {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const cats = await backendEventService.getCategories();
      setCategories(cats);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      setError(error.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refreshCategories: fetchCategories };
};

/**
 * Hook for event venues
 */
export const useEventVenues = () => {
  const [venues, setVenues] = useState<EventVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      const venueList = await backendEventService.getVenues();
      setVenues(venueList);
    } catch (error: any) {
      console.error('Failed to fetch venues:', error);
      setError(error.message || 'Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  return { venues, loading, error, refreshVenues: fetchVenues };
};

/**
 * Hook for searching events
 */
export const useEventSearch = () => {
  const [results, setResults] = useState<EventPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEvents = async (query: string, params: EventListParams = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await backendEventService.searchEvents(query, params);
      setResults(searchResults);
    } catch (error: any) {
      console.error('Failed to search events:', error);
      setError(error.message || 'Failed to search events');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setResults([]);
    setError(null);
  };

  return { 
    results, 
    loading, 
    error, 
    searchEvents, 
    clearSearch 
  };
};