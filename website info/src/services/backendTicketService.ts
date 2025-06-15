import apiService from './apiService';

export interface Ticket {
  id: string;
  event_id: string;
  user_id: number;
  ticket_number: string;
  quantity: number;
  price: number;
  currency: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'checked_in';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_id?: string;
  verification_token?: string;
  qr_code?: string;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketCreate {
  event_id: string;
  quantity: number;
  price: number;
  currency?: string;
  ticket_type?: string;
}

export interface TicketUpdate {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'checked_in';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface TicketPayment {
  ticket_id: string;
  payment_method: string;
  payment_data: Record<string, any>;
}

export interface TicketCheckIn {
  verification_token: string;
}

export interface TicketPublic extends Omit<Ticket, 'user_id'> {
  // Public version without sensitive data
}

export interface TicketSummary {
  event_id: string;
  total_tickets: number;
  total_amount: number;
  confirmed_tickets: number;
  pending_tickets: number;
  checked_in_tickets: number;
}

/**
 * Backend Ticket Service
 * Handles ticket management with the FastAPI backend
 */
class BackendTicketService {
  private static instance: BackendTicketService;

  static getInstance(): BackendTicketService {
    if (!BackendTicketService.instance) {
      BackendTicketService.instance = new BackendTicketService();
    }
    return BackendTicketService.instance;
  }

  /**
   * Create a new ticket (purchase)
   */
  async createTicket(ticketData: TicketCreate): Promise<Ticket> {
    try {
      return await apiService.post<Ticket>('/tickets/', ticketData);
    } catch (error) {
      console.error('Ticket creation failed:', error);
      throw error;
    }
  }

  /**
   * Get user's tickets
   */
  async getMyTickets(): Promise<Ticket[]> {
    try {
      return await apiService.get<Ticket[]>('/tickets/my-tickets');
    } catch (error) {
      console.error('Get my tickets failed:', error);
      throw error;
    }
  }

  /**
   * Get tickets for specific event (for organizers)
   */
  async getEventTickets(eventId: string): Promise<TicketPublic[]> {
    try {
      return await apiService.get<TicketPublic[]>(`/tickets/event/${eventId}`);
    } catch (error) {
      console.error('Get event tickets failed:', error);
      throw error;
    }
  }

  /**
   * Get a single ticket by ID
   */
  async getTicket(ticketId: string): Promise<Ticket> {
    try {
      return await apiService.get<Ticket>(`/tickets/${ticketId}`);
    } catch (error) {
      console.error('Get ticket failed:', error);
      throw error;
    }
  }

  /**
   * Update a ticket
   */
  async updateTicket(ticketId: string, updates: TicketUpdate): Promise<Ticket> {
    try {
      return await apiService.put<Ticket>(`/tickets/${ticketId}`, updates);
    } catch (error) {
      console.error('Ticket update failed:', error);
      throw error;
    }
  }

  /**
   * Cancel a ticket
   */
  async cancelTicket(ticketId: string): Promise<Ticket> {
    try {
      return await apiService.post<Ticket>(`/tickets/${ticketId}/cancel`);
    } catch (error) {
      console.error('Ticket cancellation failed:', error);
      throw error;
    }
  }

  /**
   * Check in a ticket using verification token
   */
  async checkInTicket(checkInData: TicketCheckIn): Promise<Ticket> {
    try {
      return await apiService.post<Ticket>('/tickets/check-in', checkInData);
    } catch (error) {
      console.error('Ticket check-in failed:', error);
      throw error;
    }
  }

  /**
   * Get ticket by verification token (for check-in)
   */
  async getTicketByToken(token: string): Promise<TicketPublic> {
    try {
      return await apiService.get<TicketPublic>(`/tickets/verify/${token}`);
    } catch (error) {
      console.error('Get ticket by token failed:', error);
      throw error;
    }
  }

  /**
   * Get ticket summary for event
   */
  async getTicketSummary(eventId: string): Promise<TicketSummary> {
    try {
      return await apiService.get<TicketSummary>(`/tickets/summary/${eventId}`);
    } catch (error) {
      console.error('Get ticket summary failed:', error);
      throw error;
    }
  }

  /**
   * Download ticket as PDF
   */
  async downloadTicket(ticketId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/v1/tickets/${ticketId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download ticket');
      }

      return await response.blob();
    } catch (error) {
      console.error('Ticket download failed:', error);
      throw error;
    }
  }

  /**
   * Send ticket via email
   */
  async sendTicket(ticketId: string, email?: string): Promise<{ message: string }> {
    try {
      const data = email ? { email } : {};
      return await apiService.post<{ message: string }>(`/tickets/${ticketId}/send`, data);
    } catch (error) {
      console.error('Send ticket failed:', error);
      throw error;
    }
  }

  /**
   * Request ticket refund
   */
  async requestRefund(ticketId: string, reason?: string): Promise<{ message: string }> {
    try {
      const data = { reason: reason || 'User requested refund' };
      return await apiService.post<{ message: string }>(`/tickets/${ticketId}/refund`, data);
    } catch (error) {
      console.error('Refund request failed:', error);
      throw error;
    }
  }

  /**
   * Transfer ticket to another user
   */
  async transferTicket(ticketId: string, newOwnerEmail: string): Promise<Ticket> {
    try {
      return await apiService.post<Ticket>(`/tickets/${ticketId}/transfer`, {
        new_owner_email: newOwnerEmail,
      });
    } catch (error) {
      console.error('Ticket transfer failed:', error);
      throw error;
    }
  }

  /**
   * Get auth token for API calls
   */
  private async getAuthToken(): Promise<string> {
    // This would get the token from your auth context
    // For now, we'll assume it's handled by the apiService
    return '';
  }
}

export default BackendTicketService.getInstance();