import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
type TicketUpdate = Database['public']['Tables']['tickets']['Update'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

export interface TicketWithDetails extends Ticket {
  ticket_type: {
    id: string;
    name: string;
    price: number;
    event_id: string;
  };
  order_item?: OrderItem;
  event?: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    venue?: {
      name: string;
      address: string;
      city: string;
      state: string;
    };
  };
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class TicketService {
  /**
   * Get ticket by ID with full details
   */
  static async getTicket(ticketId: string): Promise<ServiceResponse<TicketWithDetails>> {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_type:ticket_types (
            id,
            name,
            price,
            event_id
          ),
          order_item:order_items (
            *,
            order:orders (
              id,
              order_number,
              user_id,
              created_at
            )
          )
        `)
        .eq('id', ticketId)
        .single();

      if (error) {
        console.error('Error fetching ticket:', error);
        return { success: false, error: error.message };
      }

      if (!ticket) {
        return { success: false, error: 'Ticket not found' };
      }

      // Fetch event details if needed
      let eventDetails = null;
      if (ticket.ticket_type?.event_id) {
        const { data: event } = await supabase
          .from('events')
          .select(`
            id,
            title,
            start_date,
            end_date,
            venue:venues (
              name,
              address,
              city,
              state
            )
          `)
          .eq('id', ticket.ticket_type.event_id)
          .single();
        
        eventDetails = event;
      }

      const ticketWithDetails: TicketWithDetails = {
        ...ticket,
        event: eventDetails
      };

      return { success: true, data: ticketWithDetails };
    } catch (error) {
      console.error('Error in getTicket:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get all tickets for a specific event
   */
  static async getEventTickets(eventId: string): Promise<ServiceResponse<TicketWithDetails[]>> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_type:ticket_types!inner (
            id,
            name,
            price,
            event_id
          ),
          order_item:order_items (
            *,
            order:orders (
              id,
              order_number,
              user_id,
              created_at
            )
          )
        `)
        .eq('ticket_type.event_id', eventId);

      if (error) {
        console.error('Error fetching event tickets:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: tickets as TicketWithDetails[] };
    } catch (error) {
      console.error('Error in getEventTickets:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get all tickets for a user
   */
  static async getUserTickets(userId: string): Promise<ServiceResponse<TicketWithDetails[]>> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_type:ticket_types (
            id,
            name,
            price,
            event_id,
            event:events (
              id,
              title,
              start_date,
              end_date,
              venue:venues (
                name,
                address,
                city,
                state
              )
            )
          ),
          order_item:order_items!inner (
            *,
            order:orders!inner (
              id,
              order_number,
              user_id,
              created_at
            )
          )
        `)
        .eq('order_item.order.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user tickets:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: tickets as TicketWithDetails[] };
    } catch (error) {
      console.error('Error in getUserTickets:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Check in a ticket
   */
  static async checkInTicket(ticketId: string): Promise<ServiceResponse<Ticket>> {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .update({ 
          status: 'used',
          check_in_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .eq('status', 'active') // Only allow check-in for active tickets
        .select()
        .single();

      if (error) {
        console.error('Error checking in ticket:', error);
        return { success: false, error: error.message };
      }

      if (!ticket) {
        return { success: false, error: 'Ticket not found or already used' };
      }

      return { success: true, data: ticket };
    } catch (error) {
      console.error('Error in checkInTicket:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Verify a ticket using QR code or ticket ID
   */
  static async verifyTicket(token: string): Promise<ServiceResponse<TicketWithDetails>> {
    try {
      // Try to parse the token as QR code data or use as ticket ID
      let ticketId = token;
      
      try {
        const qrData = JSON.parse(token);
        if (qrData.ticketId) {
          ticketId = qrData.ticketId;
        }
      } catch {
        // Token is not JSON, use as direct ticket ID
      }

      const ticketResult = await this.getTicket(ticketId);
      if (!ticketResult.success || !ticketResult.data) {
        return { success: false, error: 'Invalid ticket' };
      }

      return { success: true, data: ticketResult.data };
    } catch (error) {
      console.error('Error in verifyTicket:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Refund a ticket
   */
  static async refundTicket(ticketId: string): Promise<ServiceResponse<Ticket>> {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .update({ 
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .neq('status', 'refunded') // Only allow refund for non-refunded tickets
        .select()
        .single();

      if (error) {
        console.error('Error refunding ticket:', error);
        return { success: false, error: error.message };
      }

      if (!ticket) {
        return { success: false, error: 'Ticket not found or already refunded' };
      }

      return { success: true, data: ticket };
    } catch (error) {
      console.error('Error in refundTicket:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Transfer a ticket to a new attendee
   */
  static async transferTicket(
    ticketId: string,
    newAttendee: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<ServiceResponse<Ticket>> {
    try {
      // Update the order item with new attendee information
      const { data: orderItem, error: orderItemError } = await supabase
        .from('order_items')
        .update({
          attendee_name: newAttendee.name,
          attendee_email: newAttendee.email,
          updated_at: new Date().toISOString()
        })
        .eq('ticket_id', ticketId)
        .select()
        .single();

      if (orderItemError) {
        console.error('Error updating order item for transfer:', orderItemError);
        return { success: false, error: orderItemError.message };
      }

      // Generate new QR code for the transferred ticket
      const qrCodeData = this.generateQRCodeData({
        id: ticketId,
        ticket_type_id: '',
        order_item_id: orderItem?.id || null,
        status: 'active',
        qr_code: null,
        check_in_time: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const { data: ticket, error } = await supabase
        .from('tickets')
        .update({ 
          qr_code: qrCodeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .eq('status', 'active') // Only allow transfer for active tickets
        .select()
        .single();

      if (error) {
        console.error('Error transferring ticket:', error);
        return { success: false, error: error.message };
      }

      if (!ticket) {
        return { success: false, error: 'Ticket not found or cannot be transferred' };
      }

      return { success: true, data: ticket };
    } catch (error) {
      console.error('Error in transferTicket:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Generate QR code data for a ticket
   */
  static generateQRCodeData(ticket: Ticket): string {
    return JSON.stringify({
      ticketId: ticket.id,
      ticketTypeId: ticket.ticket_type_id,
      verification: ticket.created_at // Using created_at as verification
    });
  }

  /**
   * Create a new ticket (usually called from order processing)
   */
  static async createTicket(
    ticketData: TicketInsert,
    orderItemId?: string
  ): Promise<ServiceResponse<Ticket>> {
    try {
      const newTicketData: TicketInsert = {
        ...ticketData,
        order_item_id: orderItemId || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert(newTicketData)
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        return { success: false, error: error.message };
      }

      // Generate QR code
      const qrCodeData = this.generateQRCodeData(ticket);
      
      const { data: updatedTicket, error: updateError } = await supabase
        .from('tickets')
        .update({ qr_code: qrCodeData })
        .eq('id', ticket.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating ticket with QR code:', updateError);
        // Don't fail the creation, just log the error
      }

      return { success: true, data: updatedTicket || ticket };
    } catch (error) {
      console.error('Error in createTicket:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get ticket statistics for an event
   */
  static async getTicketStats(eventId: string): Promise<ServiceResponse<{
    total: number;
    active: number;
    used: number;
    refunded: number;
    cancelled: number;
  }>> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          status,
          ticket_type:ticket_types!inner(event_id)
        `)
        .eq('ticket_type.event_id', eventId);

      if (error) {
        console.error('Error fetching ticket stats:', error);
        return { success: false, error: error.message };
      }

      const stats = {
        total: tickets.length,
        active: tickets.filter(t => t.status === 'active').length,
        used: tickets.filter(t => t.status === 'used').length,
        refunded: tickets.filter(t => t.status === 'refunded').length,
        cancelled: tickets.filter(t => t.status === 'cancelled').length,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error in getTicketStats:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}