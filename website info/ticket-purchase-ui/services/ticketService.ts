import type {
  TicketService,
  TicketPurchase,
  ServiceResponse,
  Order
} from '../types';

class TicketServiceImpl implements TicketService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async purchaseTicket(data: TicketPurchase): Promise<ServiceResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/tickets/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to purchase ticket'
      };
    }
  }

  async getTicket(ticketId: number): Promise<ServiceResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/tickets/${ticketId}`);
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get ticket'
      };
    }
  }

  async getEventTickets(eventId: number): Promise<ServiceResponse<Order[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/tickets`);
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event tickets'
      };
    }
  }

  async checkInTicket(ticketId: number): Promise<ServiceResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/check-in`, {
        method: 'POST'
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check in ticket'
      };
    }
  }

  async verifyTicket(token: string): Promise<ServiceResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/tickets/verify/${token}`);
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify ticket'
      };
    }
  }

  async refundTicket(ticketId: number): Promise<ServiceResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/refund`, {
        method: 'POST'
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refund ticket'
      };
    }
  }

  async transferTicket(
    ticketId: number,
    newAttendee: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<ServiceResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAttendee)
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer ticket'
      };
    }
  }

  // Helper methods
  generateQRCodeData(ticket: Order): string {
    return JSON.stringify({
      ticketId: ticket.id,
      verificationToken: ticket.verification_token,
      eventId: ticket.event_id
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
      displayType: ticket.ticket_type,
      displayQuantity: ticket.quantity.toString(),
      displayAmount: `$${ticket.total_amount.toFixed(2)}`,
      displayStatus: ticket.payment_status.charAt(0).toUpperCase() + ticket.payment_status.slice(1),
      displayBookingRef: ticket.booking_reference
    };
  }

  isTicketValidForCheckIn(ticket: Order): {
    valid: boolean;
    reason?: string;
  } {
    if (ticket.payment_status !== 'completed') {
      return {
        valid: false,
        reason: 'Ticket payment is not completed'
      };
    }

    if (ticket.is_checked_in) {
      return {
        valid: false,
        reason: 'Ticket has already been checked in'
      };
    }

    return { valid: true };
  }
}

export const ticketService = new TicketServiceImpl(process.env.API_URL || ''); 