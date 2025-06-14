// Ticket Types
export interface Ticket {
  id: number;
  event_id: number;
  user_id?: number;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  ticket_type: string;
  quantity: number;
  price_per_ticket: number;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_intent_id?: string;
  verification_token: string;
  qr_code_data: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  checked_in_by?: number;
  booking_reference: string;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface TicketType {
  id: number;
  name: string;
  price: number;
  description: string;
  available: number;
  max_per_order?: number;
}

// Table Types
export interface Table {
  id: number;
  number: string;
  capacity: number;
  price: number;
  available: boolean;
  reserved_by?: string;
}

export interface Section {
  id: number;
  name: string;
  description?: string;
  tables: Table[];
}

// Event Types
export interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  description: string;
  ticket_types: TicketType[];
  sections?: Section[];
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  amenities: string[];
  custom_fields?: Record<string, any>;
}

// Purchase Types
export interface TicketPurchase {
  event_id: number;
  ticket_type: string;
  quantity: number;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
}

export interface TableReservation {
  event_id: number;
  table_id: number;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
}

// Payment Types
export interface PaymentIntent {
  id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  client_secret?: string;
}

// Order Types
export interface Order {
  id: number;
  event_id: number;
  type: 'ticket' | 'table';
  ticket_type?: string;
  quantity?: number;
  table_id?: number;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Form Types
export interface TicketFormData {
  ticketType: string;
  quantity: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
}

export interface TableFormData {
  tableId: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
}

// API Response Types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Service Types
export interface TicketService {
  purchaseTicket(data: TicketPurchase): Promise<ServiceResponse<Order>>;
  getTicket(ticketId: number): Promise<ServiceResponse<Order>>;
  getEventTickets(eventId: number): Promise<ServiceResponse<Order[]>>;
  checkInTicket(ticketId: number): Promise<ServiceResponse<Order>>;
  verifyTicket(token: string): Promise<ServiceResponse<Order>>;
  refundTicket(ticketId: number): Promise<ServiceResponse<Order>>;
  transferTicket(ticketId: number, newAttendee: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<ServiceResponse<Order>>;
}

export interface TableService {
  getTables(eventId: number): Promise<ServiceResponse<Table[]>>;
  getSections(eventId: number): Promise<ServiceResponse<Section[]>>;
  reserveTable(data: TableReservation): Promise<ServiceResponse<Order>>;
  cancelReservation(tableId: number): Promise<ServiceResponse<Order>>;
  checkInTable(tableId: number): Promise<ServiceResponse<Order>>;
}

export interface PaymentService {
  createPaymentIntent(amount: number): Promise<ServiceResponse<PaymentIntent>>;
  confirmPayment(paymentIntentId: string): Promise<ServiceResponse<PaymentIntent>>;
  refundPayment(paymentIntentId: string): Promise<ServiceResponse<PaymentIntent>>;
  calculateFees(amount: number): {
    processingFee: number;
    totalAmount: number;
  };
}