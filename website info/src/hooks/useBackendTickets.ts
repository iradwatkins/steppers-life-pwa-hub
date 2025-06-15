import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import backendTicketService, { 
  Ticket, 
  TicketCreate, 
  TicketUpdate, 
  TicketPayment,
  TicketCheckIn,
  TicketSummary
} from '@/services/backendTicketService';

export interface UseTicketsState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

export interface UseTicketState {
  ticket: Ticket | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing user's tickets
 */
export const useMyTickets = () => {
  const [state, setState] = useState<UseTicketsState>({
    tickets: [],
    loading: true,
    error: null,
  });

  const fetchTickets = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const tickets = await backendTicketService.getMyTickets();
      setState({ tickets, loading: false, error: null });
    } catch (error: any) {
      console.error('Failed to fetch tickets:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to fetch tickets'
      }));
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const refreshTickets = () => {
    fetchTickets();
  };

  return {
    ...state,
    refreshTickets,
  };
};

/**
 * Hook for managing event tickets (organizer view)
 */
export const useEventTickets = (eventId: string | null) => {
  const [state, setState] = useState<UseTicketsState>({
    tickets: [],
    loading: true,
    error: null,
  });

  const fetchEventTickets = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const tickets = await backendTicketService.getEventTickets(id);
      setState({ tickets, loading: false, error: null });
    } catch (error: any) {
      console.error('Failed to fetch event tickets:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to fetch event tickets'
      }));
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventTickets(eventId);
    } else {
      setState({ tickets: [], loading: false, error: null });
    }
  }, [eventId]);

  const refreshEventTickets = () => {
    if (eventId) {
      fetchEventTickets(eventId);
    }
  };

  return {
    ...state,
    refreshEventTickets,
  };
};

/**
 * Hook for managing a single ticket
 */
export const useTicket = (ticketId: string | null) => {
  const [state, setState] = useState<UseTicketState>({
    ticket: null,
    loading: true,
    error: null,
  });

  const fetchTicket = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const ticket = await backendTicketService.getTicket(id);
      setState({ ticket, loading: false, error: null });
    } catch (error: any) {
      console.error('Failed to fetch ticket:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to fetch ticket'
      }));
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId);
    } else {
      setState({ ticket: null, loading: false, error: null });
    }
  }, [ticketId]);

  const refreshTicket = () => {
    if (ticketId) {
      fetchTicket(ticketId);
    }
  };

  return {
    ...state,
    refreshTicket,
  };
};

/**
 * Hook for ticket management operations
 */
export const useTicketManagement = () => {
  const [loading, setLoading] = useState(false);

  const createTicket = async (ticketData: TicketCreate): Promise<Ticket | null> => {
    try {
      setLoading(true);
      const newTicket = await backendTicketService.createTicket(ticketData);
      toast.success('Ticket purchased successfully');
      return newTicket;
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      toast.error(error.message || 'Failed to purchase ticket');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, updates: TicketUpdate): Promise<Ticket | null> => {
    try {
      setLoading(true);
      const updatedTicket = await backendTicketService.updateTicket(ticketId, updates);
      toast.success('Ticket updated successfully');
      return updatedTicket;
    } catch (error: any) {
      console.error('Failed to update ticket:', error);
      toast.error(error.message || 'Failed to update ticket');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (paymentData: TicketPayment): Promise<boolean> => {
    try {
      setLoading(true);
      await backendTicketService.processPayment(paymentData);
      toast.success('Payment processed successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to process payment:', error);
      toast.error(error.message || 'Payment failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkInTicket = async (checkInData: TicketCheckIn): Promise<boolean> => {
    try {
      setLoading(true);
      await backendTicketService.checkInTicket(checkInData);
      toast.success('Ticket checked in successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to check in ticket:', error);
      toast.error(error.message || 'Check-in failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelTicket = async (ticketId: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await backendTicketService.cancelTicket(ticketId, reason);
      toast.success('Ticket cancelled successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to cancel ticket:', error);
      toast.error(error.message || 'Cancellation failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestRefund = async (ticketId: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await backendTicketService.requestRefund(ticketId, reason);
      toast.success('Refund requested successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to request refund:', error);
      toast.error(error.message || 'Refund request failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const transferTicket = async (ticketId: string, recipientEmail: string): Promise<boolean> => {
    try {
      setLoading(true);
      await backendTicketService.transferTicket(ticketId, recipientEmail);
      toast.success('Ticket transferred successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to transfer ticket:', error);
      toast.error(error.message || 'Transfer failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createTicket,
    updateTicket,
    processPayment,
    checkInTicket,
    cancelTicket,
    requestRefund,
    transferTicket,
  };
};

/**
 * Hook for getting ticket summary for an event
 */
export const useTicketSummary = (eventId: string | null) => {
  const [summary, setSummary] = useState<TicketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const summary = await backendTicketService.getTicketSummary(id);
      setSummary(summary);
    } catch (error: any) {
      console.error('Failed to fetch ticket summary:', error);
      setError(error.message || 'Failed to fetch ticket summary');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchSummary(eventId);
    } else {
      setSummary(null);
      setLoading(false);
      setError(null);
    }
  }, [eventId]);

  const refreshSummary = () => {
    if (eventId) {
      fetchSummary(eventId);
    }
  };

  return {
    summary,
    loading,
    error,
    refreshSummary,
  };
};