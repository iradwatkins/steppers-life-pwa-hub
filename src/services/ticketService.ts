import type {
  TicketService,
  TicketPurchase,
  ServiceResponse,
  Order
} from '@/types/ticket';
import { apiClient } from './apiClient';

class TicketServiceImpl implements TicketService {
  async purchaseTicket(data: TicketPurchase): Promise<ServiceResponse<Order>> {
    return apiClient.post<Order>('/tickets/purchase', data);
  }

  async getTicket(ticketId: number): Promise<ServiceResponse<Order>> {
    return apiClient.get<Order>(`/tickets/${ticketId}`);
  }

  async getEventTickets(eventId: number): Promise<ServiceResponse<Order[]>> {
    return apiClient.get<Order[]>(`/events/${eventId}/tickets`);
  }

  async checkInTicket(ticketId: number): Promise<ServiceResponse<Order>> {
    return apiClient.post<Order>(`/tickets/${ticketId}/check-in`);
  }

  async verifyTicket(token: string): Promise<ServiceResponse<Order>> {
    return apiClient.get<Order>(`/tickets/verify/${token}`);
  }

  async refundTicket(ticketId: number): Promise<ServiceResponse<Order>> {
    return apiClient.post<Order>(`/tickets/${ticketId}/refund`);
  }

  async transferTicket(
    ticketId: number,
    newAttendee: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<ServiceResponse<Order>> {
    return apiClient.post<Order>(`/tickets/${ticketId}/transfer`, newAttendee);
  }

  // Helper methods
  generateQRCodeData(ticket: Order): string {
    return JSON.stringify({
      ticketId: ticket.id,
      eventId: ticket.event_id,
      bookingReference: ticket.created_at // Using created_at as verification
    });
  }

  formatTicketInfo(ticket: Order): {
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
      displayPhone: ticket.attendee_phone || 'N/A',
      displayType: ticket.ticket_type || 'General',
      displayQuantity: ticket.quantity?.toString() || '1',
      displayAmount: `$${ticket.total_amount.toFixed(2)}`,
      displayStatus: ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1),
      displayBookingRef: ticket.id.toString()
    };
  }

  isTicketValidForCheckIn(ticket: Order): {
    valid: boolean;
    reason?: string;
  } {
    if (ticket.status !== 'completed') {
      return {
        valid: false,
        reason: 'Ticket payment is not completed'
      };
    }

    return { valid: true };
  }
}

export const ticketService = new TicketServiceImpl();