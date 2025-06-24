// RSVP Types for Free Events

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id?: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  status: 'confirmed' | 'cancelled' | 'waitlist' | 'checked_in';
  rsvp_notes?: string;
  dietary_restrictions?: string;
  accessibility_needs?: string;
  plus_one_count: number;
  plus_one_names?: string[];
  verification_token: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface CreateRSVPRequest {
  event_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  rsvp_notes?: string;
  dietary_restrictions?: string;
  accessibility_needs?: string;
  plus_one_count?: number;
  plus_one_names?: string[];
  custom_fields?: Record<string, any>;
}

export interface UpdateRSVPRequest {
  attendee_name?: string;
  attendee_phone?: string;
  rsvp_notes?: string;
  dietary_restrictions?: string;
  accessibility_needs?: string;
  plus_one_count?: number;
  plus_one_names?: string[];
  custom_fields?: Record<string, any>;
}

export interface RSVPFormData {
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  rsvp_notes?: string;
  dietary_restrictions?: string;
  accessibility_needs?: string;
  plus_one_count: number;
  plus_one_names: string[];
}

export interface RSVPStats {
  confirmed_count: number;
  waitlist_count: number;
  cancelled_count: number;
  checked_in_count: number;
  total_count: number;
  capacity_remaining?: number;
  waitlist_enabled: boolean;
}

export interface EventRSVPSettings {
  rsvp_enabled: boolean;
  max_rsvps?: number;
  rsvp_deadline?: string;
  allow_waitlist: boolean;
  requires_approval: boolean;
  allow_plus_ones: boolean;
  max_plus_ones: number;
  collect_dietary_restrictions: boolean;
  collect_accessibility_needs: boolean;
  custom_fields: RSVPCustomField[];
}

export interface RSVPCustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio fields
  order: number;
}

// Extended Event interface with RSVP fields
export interface EventWithRSVP extends Event {
  requires_tickets: boolean;
  rsvp_enabled: boolean;
  max_rsvps?: number;
  rsvp_deadline?: string;
  allow_waitlist: boolean;
  rsvp_stats?: RSVPStats;
}

// Service Response Types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RSVPService {
  // Core RSVP operations
  createRSVP(data: CreateRSVPRequest): Promise<ServiceResponse<EventRSVP>>;
  updateRSVP(id: string, data: UpdateRSVPRequest): Promise<ServiceResponse<EventRSVP>>;
  cancelRSVP(id: string): Promise<ServiceResponse<EventRSVP>>;
  getRSVP(id: string): Promise<ServiceResponse<EventRSVP>>;
  getRSVPByToken(token: string): Promise<ServiceResponse<EventRSVP>>;
  
  // Event RSVP management
  getEventRSVPs(eventId: string): Promise<ServiceResponse<EventRSVP[]>>;
  getEventRSVPStats(eventId: string): Promise<ServiceResponse<RSVPStats>>;
  
  // Check-in operations
  checkInRSVP(id: string): Promise<ServiceResponse<EventRSVP>>;
  bulkCheckIn(ids: string[]): Promise<ServiceResponse<EventRSVP[]>>;
  
  // Waitlist operations
  promoteFromWaitlist(eventId: string): Promise<ServiceResponse<EventRSVP[]>>;
  getWaitlistPosition(id: string): Promise<ServiceResponse<number>>;
  
  // Export and reporting
  exportEventRSVPs(eventId: string, format: 'csv' | 'xlsx'): Promise<ServiceResponse<Blob>>;
  sendRSVPReminders(eventId: string): Promise<ServiceResponse<{ sent: number; failed: number }>>;
  
  // User operations
  getUserRSVPs(userId: string): Promise<ServiceResponse<EventRSVP[]>>;
  getUserEventRSVP(userId: string, eventId: string): Promise<ServiceResponse<EventRSVP | null>>;
}

// Email notification types
export interface RSVPEmailNotification {
  type: 'confirmation' | 'waitlist' | 'promoted' | 'reminder' | 'cancelled' | 'updated';
  rsvp: EventRSVP;
  event: EventWithRSVP;
  additional_data?: Record<string, any>;
}

// Analytics types
export interface RSVPAnalytics {
  event_id: string;
  total_rsvps: number;
  confirmed_rsvps: number;
  waitlist_count: number;
  no_show_rate: number;
  conversion_rate: number; // confirmed / total views
  peak_rsvp_time: string;
  average_plus_ones: number;
  dietary_restrictions_summary: Record<string, number>;
  accessibility_needs_summary: Record<string, number>;
  rsvp_timeline: {
    date: string;
    confirmed: number;
    waitlist: number;
    cancelled: number;
  }[];
}

// Event capacity checking
export interface CapacityCheck {
  has_capacity: boolean;
  current_count: number;
  max_capacity?: number;
  waitlist_available: boolean;
  estimated_wait_time?: number; // in minutes
}

// Import from existing Event type (assuming it exists)
interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  venue?: string;
  location?: string;
  organizer_id: string;
  status: string;
  max_attendees?: number;
}