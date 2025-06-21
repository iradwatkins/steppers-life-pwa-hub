import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface TicketData {
  id: string;
  order_number: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_time: string;
  venue: string;
  ticket_type: string;
  seat_info: string;
  price: number;
  qr_code?: string;
  status: 'upcoming' | 'past' | 'cancelled' | 'pending_payment';
  purchase_date: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  special_requests?: string;
  payment_status: 'completed' | 'pending' | 'failed' | 'refunded';
  verification_code?: string;
  quantity: number;
  total_amount: number;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'paypal' | 'cash_app';
  last_four?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  email?: string;
  username?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PendingPayment {
  id: string;
  order_number: string;
  event_title: string;
  amount: number;
  due_date: string;
  verification_code: string;
  instructions: string;
  status: 'pending' | 'completed' | 'expired';
}

export interface AccountSummary {
  total_tickets: number;
  upcoming_events: number;
  pending_payments: number;
  total_spent: number;
  events_attended: number;
}

class BuyerAccountService {
  /**
   * Get user's ticket data with filtering and sorting options
   */
  async getUserTickets(
    userId: string,
    options: {
      status?: string;
      search?: string;
      sortBy?: 'event_date' | 'purchase_date';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: TicketData[] | null; error: Error | null }> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          events (
            title,
            event_date,
            event_time,
            venue_name
          )
        `)
        .eq('user_id', userId);

      // Apply status filter
      if (options.status && options.status !== 'all') {
        if (options.status === 'upcoming') {
          query = query.gte('events.event_date', new Date().toISOString().split('T')[0]);
        } else if (options.status === 'past') {
          query = query.lt('events.event_date', new Date().toISOString().split('T')[0]);
        } else {
          query = query.eq('status', options.status);
        }
      }

      // Apply search filter
      if (options.search) {
        query = query.or(`events.title.ilike.%${options.search}%,events.venue_name.ilike.%${options.search}%`);
      }

      // Apply sorting
      const sortBy = options.sortBy || 'event_date';
      const sortOrder = options.sortOrder || 'desc';
      query = query.order(sortBy === 'event_date' ? 'events.event_date' : sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      // Transform data to match TicketData interface
      const tickets: TicketData[] = orders?.map(order => ({
        id: order.id,
        order_number: order.id, // Using order ID as order number for now
        event_id: order.event_id,
        event_title: order.events?.title || 'Unknown Event',
        event_date: order.events?.event_date || '',
        event_time: order.events?.event_time || '',
        venue: order.events?.venue_name || 'TBA',
        ticket_type: order.ticket_type || 'General Admission',
        seat_info: order.seat_selection || 'General Admission',
        price: order.total_amount,
        qr_code: order.status === 'completed' ? `QR_${order.id}` : undefined,
        status: this.determineTicketStatus(order.events?.event_date, order.status),
        purchase_date: order.created_at,
        attendee_name: order.attendee_name,
        attendee_email: order.attendee_email,
        attendee_phone: order.attendee_phone,
        special_requests: order.special_requests,
        payment_status: order.status,
        verification_code: order.verification_code,
        quantity: order.quantity || 1,
        total_amount: order.total_amount
      })) || [];

      return { data: tickets, error: null };
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get user's account summary statistics
   */
  async getAccountSummary(userId: string): Promise<{ data: AccountSummary | null; error: Error | null }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          events (event_date)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const summary: AccountSummary = {
        total_tickets: orders?.length || 0,
        upcoming_events: orders?.filter(order => 
          order.events?.event_date >= today && order.status === 'completed'
        ).length || 0,
        pending_payments: orders?.filter(order => 
          order.status === 'pending'
        ).length || 0,
        total_spent: orders?.reduce((sum, order) => 
          order.status === 'completed' ? sum + order.total_amount : sum, 0
        ) || 0,
        events_attended: orders?.filter(order => 
          order.events?.event_date < today && order.status === 'completed'
        ).length || 0
      };

      return { data: summary, error: null };
    } catch (error) {
      console.error('Error fetching account summary:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get user's saved payment methods
   */
  async getPaymentMethods(userId: string): Promise<{ data: PaymentMethod[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get pending payments requiring verification
   */
  async getPendingPayments(userId: string): Promise<{ data: PendingPayment[] | null; error: Error | null }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          events (title)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pendingPayments: PendingPayment[] = orders?.map(order => ({
        id: order.id,
        order_number: order.id,
        event_title: order.events?.title || 'Unknown Event',
        amount: order.total_amount,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        verification_code: order.verification_code || this.generateVerificationCode(),
        instructions: this.getPaymentInstructions(order.payment_method),
        status: 'pending'
      })) || [];

      return { data: pendingPayments, error: null };
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Verify payment with verification code
   */
  async verifyPayment(
    orderId: string, 
    verificationCode: string, 
    userId: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      // First, check if the order exists and belongs to the user
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.verification_code !== verificationCode) {
        throw new Error('Invalid verification code');
      }

      // Update order status to completed
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(
    userId: string, 
    paymentMethod: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: PaymentMethod | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          ...paymentMethod
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error adding payment method:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update a payment method
   */
  async updatePaymentMethod(
    paymentMethodId: string,
    userId: string,
    updates: Partial<PaymentMethod>
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating payment method:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(
    paymentMethodId: string, 
    userId: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Generate QR code data for a ticket
   */
  generateQRCodeData(ticket: TicketData): string {
    return JSON.stringify({
      ticketId: ticket.id,
      eventId: ticket.event_id,
      attendeeName: ticket.attendee_name,
      eventDate: ticket.event_date,
      verificationHash: this.generateVerificationHash(ticket)
    });
  }

  /**
   * Download ticket receipt
   */
  async downloadReceipt(orderId: string, userId: string): Promise<{ data: Blob | null; error: Error | null }> {
    try {
      // In a real implementation, this would generate a PDF receipt
      // For now, we'll return a mock response
      const mockReceiptData = `Receipt for Order #${orderId}`;
      const blob = new Blob([mockReceiptData], { type: 'text/plain' });
      
      return { data: blob, error: null };
    } catch (error) {
      console.error('Error downloading receipt:', error);
      return { data: null, error: error as Error };
    }
  }

  // Private helper methods
  private determineTicketStatus(eventDate: string | null, orderStatus: string): TicketData['status'] {
    if (!eventDate) return 'upcoming';
    
    const event = new Date(eventDate);
    const now = new Date();
    
    if (orderStatus === 'pending') return 'pending_payment';
    if (orderStatus === 'cancelled') return 'cancelled';
    if (event < now) return 'past';
    
    return 'upcoming';
  }

  private generateVerificationCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  private getPaymentInstructions(paymentMethod: string): string {
    switch (paymentMethod) {
      case 'cash_app':
        return 'Complete payment via Cash App to $SteppersLife, then enter the 5-digit verification code below.';
      case 'paypal':
        return 'Complete payment via PayPal to payments@stepperslife.com, then enter the 5-digit verification code below.';
      case 'venmo':
        return 'Complete payment via Venmo to @SteppersLife, then enter the 5-digit verification code below.';
      default:
        return 'Complete payment using your selected method, then enter the 5-digit verification code below.';
    }
  }

  private generateVerificationHash(ticket: TicketData): string {
    // Simple hash generation for demo purposes
    const data = `${ticket.id}-${ticket.event_id}-${ticket.attendee_email}`;
    return btoa(data).slice(0, 8);
  }
}

export const buyerAccountService = new BuyerAccountService();