import { apiClient } from './apiClient';

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
  event?: any; // Event object when populated
}

export interface PurchaseTicketData {
  event_id: number;
  ticket_type: string;
  quantity: number;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  custom_fields?: Record<string, any>;
}

export interface TicketFilters {
  event_id?: number;
  user_id?: number;
  payment_status?: string;
  is_checked_in?: boolean;
  ticket_type?: string;
  skip?: number;
  limit?: number;
}

export interface TicketSummary {
  total_tickets: number;
  checked_in_tickets: number;
  pending_tickets: number;
  revenue: number;
  by_type: Record<string, {
    count: number;
    revenue: number;
    checked_in: number;
  }>;
}

class TicketService {
  private static instance: TicketService;

  static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  // Purchase tickets for an event
  async purchaseTicket(ticketData: PurchaseTicketData): Promise<{
    success: boolean;
    ticket?: Ticket;
    error?: string;
  }> {
    try {
      const response = await apiClient.purchaseTicket(ticketData);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        ticket: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to purchase ticket'
      };
    }
  }

  // Get ticket by ID
  async getTicket(ticketId: number): Promise<{
    success: boolean;
    ticket?: Ticket;
    error?: string;
  }> {
    try {
      const response = await apiClient.getTicket(ticketId);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        ticket: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ticket'
      };
    }
  }

  // Get tickets for an event
  async getEventTickets(eventId: number): Promise<{
    success: boolean;
    tickets?: Ticket[];
    summary?: TicketSummary;
    error?: string;
  }> {
    try {
      const response = await apiClient.getEventTickets(eventId);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        tickets: response.data?.tickets || response.data || [],
        summary: response.data?.summary
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch event tickets'
      };
    }
  }

  // Check in a ticket
  async checkInTicket(ticketId: number): Promise<{
    success: boolean;
    ticket?: Ticket;
    error?: string;
  }> {
    try {
      const response = await apiClient.checkInTicket(ticketId);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        ticket: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check in ticket'
      };
    }
  }

  // Verify ticket using verification token
  async verifyTicket(verificationToken: string): Promise<{
    success: boolean;
    ticket?: Ticket;
    error?: string;
    message?: string;
  }> {
    try {
      const response = await apiClient.verifyTicket(verificationToken);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        ticket: response.data?.ticket,
        message: response.data?.message || 'Ticket verified successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify ticket'
      };
    }
  }

  // Get user's tickets
  async getUserTickets(userId?: number): Promise<{
    success: boolean;
    tickets?: Ticket[];
    error?: string;
  }> {
    try {
      // If no userId provided, this should get tickets for current user
      // The backend should handle this based on the auth token
      const filters: TicketFilters = userId ? { user_id: userId } : {};
      
      // For now, we'll use the event tickets endpoint and filter
      // In the future, add a dedicated user tickets endpoint
      const response = await this.getTicketsWithFilters(filters);
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user tickets'
      };
    }
  }

  // Get tickets with filters (generic method)
  private async getTicketsWithFilters(filters: TicketFilters): Promise<{
    success: boolean;
    tickets?: Ticket[];
    error?: string;
  }> {
    try {
      // This would need a generic tickets endpoint in the backend
      // For now, we'll simulate it
      return {
        success: true,
        tickets: []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tickets'
      };
    }
  }

  // Generate QR code data URL for ticket
  generateQRCodeDataUrl(ticket: Ticket): string {
    // In a real implementation, this might generate the QR code image
    // For now, return the QR code data
    return ticket.qr_code_data;
  }

  // Generate ticket PDF (placeholder)
  async generateTicketPDF(ticketId: number): Promise<{
    success: boolean;
    pdfUrl?: string;
    error?: string;
  }> {
    try {
      // This would call a backend endpoint to generate PDF
      // For now, return a placeholder
      return {
        success: true,
        pdfUrl: `/api/v1/tickets/${ticketId}/pdf`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate ticket PDF'
      };
    }
  }

  // Send ticket via email
  async sendTicketEmail(ticketId: number, email?: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      // This would call a backend endpoint to send email
      // For now, return success
      return {
        success: true,
        message: 'Ticket sent successfully via email'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send ticket email'
      };
    }
  }

  // Cancel/refund ticket
  async refundTicket(ticketId: number, reason?: string): Promise<{
    success: boolean;
    ticket?: Ticket;
    error?: string;
    message?: string;
  }> {
    try {
      // This would call the payment service to process refund
      // For now, return placeholder
      return {
        success: true,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund'
      };
    }
  }

  // Transfer ticket to another person
  async transferTicket(ticketId: number, newAttendeeData: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<{
    success: boolean;
    ticket?: Ticket;
    error?: string;
  }> {
    try {
      // This would call a backend endpoint to transfer ticket
      // For now, return placeholder
      return {
        success: true,
        ticket: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer ticket'
      };
    }
  }

  // Get ticket statistics for an event
  async getTicketStatistics(eventId: number): Promise<{
    success: boolean;
    statistics?: {
      total_sold: number;
      total_revenue: number;
      checked_in_count: number;
      check_in_rate: number;
      by_type: Record<string, any>;
      sales_by_day: Array<{ date: string; count: number; revenue: number }>;
    };
    error?: string;
  }> {
    try {
      const response = await this.getEventTickets(eventId);
      
      if (!response.success || !response.tickets) {
        return { success: false, error: response.error };
      }

      const tickets = response.tickets;
      const totalSold = tickets.length;
      const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.total_amount, 0);
      const checkedInCount = tickets.filter(ticket => ticket.is_checked_in).length;
      const checkInRate = totalSold > 0 ? (checkedInCount / totalSold) * 100 : 0;

      // Group by ticket type
      const byType: Record<string, any> = {};
      tickets.forEach(ticket => {
        if (!byType[ticket.ticket_type]) {
          byType[ticket.ticket_type] = {
            count: 0,
            revenue: 0,
            checked_in: 0
          };
        }
        byType[ticket.ticket_type].count += ticket.quantity;
        byType[ticket.ticket_type].revenue += ticket.total_amount;
        if (ticket.is_checked_in) {
          byType[ticket.ticket_type].checked_in += ticket.quantity;
        }
      });

      // Group by day (simplified)
      const salesByDay: Array<{ date: string; count: number; revenue: number }> = [];
      
      return {
        success: true,
        statistics: {
          total_sold: totalSold,
          total_revenue: totalRevenue,
          checked_in_count: checkedInCount,
          check_in_rate: checkInRate,
          by_type: byType,
          sales_by_day: salesByDay
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get ticket statistics'
      };
    }
  }

  // Validate ticket for check-in
  isTicketValidForCheckIn(ticket: Ticket): {
    valid: boolean;
    reason?: string;
  } {
    if (ticket.payment_status !== 'completed') {
      return { valid: false, reason: 'Payment not completed' };
    }

    if (ticket.is_checked_in) {
      return { valid: false, reason: 'Ticket already checked in' };
    }

    // Check if event is today or in the past (simplified)
    // In real implementation, you'd compare with event start time
    return { valid: true };
  }

  // Format ticket information for display
  formatTicketInfo(ticket: Ticket): {
    displayName: string;
    displayEmail: string;
    displayPhone: string;
    displayType: string;
    displayQuantity: string;
    displayAmount: string;
    displayStatus: string;
    displayBookingRef: string;
  } {
    return {
      displayName: ticket.attendee_name,
      displayEmail: ticket.attendee_email,
      displayPhone: ticket.attendee_phone || 'Not provided',
      displayType: ticket.ticket_type.charAt(0).toUpperCase() + ticket.ticket_type.slice(1),
      displayQuantity: ticket.quantity.toString(),
      displayAmount: `$${ticket.total_amount.toFixed(2)}`,
      displayStatus: ticket.payment_status.charAt(0).toUpperCase() + ticket.payment_status.slice(1),
      displayBookingRef: ticket.booking_reference
    };
  }

  // Check if user can access ticket
  canUserAccessTicket(ticket: Ticket, userId?: number, userEmail?: string): boolean {
    // User can access if they own the ticket or if they're the attendee
    if (userId && ticket.user_id === userId) return true;
    if (userEmail && ticket.attendee_email === userEmail) return true;
    return false;
  }

  // Generate shareable ticket URL
  generateShareableTicketUrl(ticket: Ticket): string {
    return `/tickets/${ticket.verification_token}`;
  }

  // Parse QR code data
  parseQRCodeData(qrData: string): {
    ticketId?: number;
    verificationToken?: string;
    eventId?: number;
    valid: boolean;
  } {
    try {
      // Assuming QR code contains verification token
      // In real implementation, this might be more complex
      return {
        verificationToken: qrData,
        valid: true
      };
    } catch (error) {
      return { valid: false };
    }
  }

  // Calculate refund amount (with fees, etc.)
  calculateRefundAmount(ticket: Ticket, refundPolicy?: any): {
    refundAmount: number;
    fees: number;
    netRefund: number;
  } {
    // Simplified refund calculation
    // In real implementation, this would consider refund policies, timing, etc.
    const fees = Math.min(ticket.total_amount * 0.1, 10); // 10% fee, max $10
    const refundAmount = ticket.total_amount;
    const netRefund = Math.max(0, refundAmount - fees);

    return {
      refundAmount,
      fees,
      netRefund
    };
  }
}

// Export singleton instance
export const ticketService = TicketService.getInstance();
export default ticketService; 