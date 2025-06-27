// Event Types for 3-Tier System

export type EventType = 'simple' | 'ticketed' | 'premium';

export interface SimpleEventConfig {
  freeEntryCondition?: string; // e.g., "Free for women before 10pm"
  doorPrice: number;
  doorPriceCurrency: string;
}

export interface EventTypeConfig {
  eventType: EventType;
  simpleConfig?: SimpleEventConfig;
}

// Extended Event interface with event types
export interface ExtendedEvent {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  requires_tickets: boolean;
  
  // Simple event fields
  free_entry_condition?: string;
  door_price?: number;
  door_price_currency?: string;
  
  // Existing fields...
  start_date: string;
  end_date: string;
  venue_id?: string;
  organizer_id: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  featured_image_url?: string;
  max_attendees?: number;
  category?: string;
  tags?: string[];
  
  // Relations
  venues?: any;
  ticket_types?: any[];
  organizers?: any;
}

// Event type display helpers
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  simple: 'Simple Event',
  ticketed: 'Ticketed Event', 
  premium: 'Premium Event'
};

export const EVENT_TYPE_DESCRIPTIONS: Record<EventType, string> = {
  simple: 'Quick setup with promotional highlights and special offers for attendees',
  ticketed: 'Standard paid events with ticket sales',
  premium: 'Large venues with custom seating charts'
};

// Event type validation
export const isSimpleEvent = (event: ExtendedEvent): boolean => 
  event.event_type === 'simple';

export const isTicketedEvent = (event: ExtendedEvent): boolean => 
  event.event_type === 'ticketed';

export const isPremiumEvent = (event: ExtendedEvent): boolean => 
  event.event_type === 'premium';

// Helper to get event pricing display
export const getEventPricing = (event: ExtendedEvent): string => {
  switch (event.event_type) {
    case 'simple':
      const condition = event.free_entry_condition ? ` (${event.free_entry_condition})` : '';
      const doorPrice = event.door_price ? `$${event.door_price} at door` : 'See venue for pricing';
      return `Free${condition} • ${doorPrice}`;
    
    case 'ticketed':
      if (event.ticket_types && event.ticket_types.length > 0) {
        const minPrice = Math.min(...event.ticket_types.map(t => t.price));
        const maxPrice = Math.max(...event.ticket_types.map(t => t.price));
        return minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;
      }
      return 'Tickets Required';
    
    case 'premium':
      return 'Reserved Seating';
    
    default:
      return 'See Event Details';
  }
};