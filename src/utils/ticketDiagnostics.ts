import { supabase } from '@/integrations/supabase/client';

export interface TicketDiagnosticResult {
  eventId: string;
  eventTitle: string;
  eventStatus: string;
  ticketTypesCount: number;
  ticketTypes: any[];
  issues: string[];
}

export class TicketDiagnostics {
  /**
   * Diagnose ticket data for a specific event
   */
  static async diagnoseEvent(eventId: string): Promise<TicketDiagnosticResult> {
    const issues: string[] = [];
    
    try {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, title, status, organizer_id')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        throw new Error(`Event not found: ${eventError?.message || 'Unknown error'}`);
      }

      // Get ticket types for this event
      const { data: ticketTypes, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (ticketError) {
        issues.push(`Error fetching ticket types: ${ticketError.message}`);
      }

      const ticketTypesArray = ticketTypes || [];

      // Check for common issues
      if (ticketTypesArray.length === 0) {
        issues.push('No ticket types found for this event');
      }

      ticketTypesArray.forEach((ticket, index) => {
        if (!ticket.name) {
          issues.push(`Ticket type ${index + 1}: Missing name`);
        }
        if (ticket.price === null || ticket.price === undefined) {
          issues.push(`Ticket type ${index + 1}: Missing price`);
        }
        if (ticket.quantity_available === null || ticket.quantity_available === undefined) {
          issues.push(`Ticket type ${index + 1}: Missing quantity_available`);
        }
        if (!ticket.is_active) {
          issues.push(`Ticket type ${index + 1}: Not active`);
        }
      });

      return {
        eventId: event.id,
        eventTitle: event.title,
        eventStatus: event.status,
        ticketTypesCount: ticketTypesArray.length,
        ticketTypes: ticketTypesArray,
        issues
      };

    } catch (error: any) {
      return {
        eventId,
        eventTitle: 'Unknown',
        eventStatus: 'Unknown',
        ticketTypesCount: 0,
        ticketTypes: [],
        issues: [`Failed to diagnose event: ${error.message}`]
      };
    }
  }

  /**
   * Diagnose all events for an organizer
   */
  static async diagnoseOrganizerEvents(organizerId: string): Promise<TicketDiagnosticResult[]> {
    try {
      // Get all events for organizer
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, status')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (eventsError) {
        throw new Error(`Error fetching events: ${eventsError.message}`);
      }

      const results: TicketDiagnosticResult[] = [];
      
      for (const event of events || []) {
        const diagnosis = await this.diagnoseEvent(event.id);
        results.push(diagnosis);
      }

      return results;

    } catch (error: any) {
      console.error('Error diagnosing organizer events:', error);
      return [];
    }
  }

  /**
   * Fix events that don't have ticket types
   */
  static async fixEventsWithoutTickets(organizerId: string): Promise<{
    fixed: number;
    failed: string[];
    results: TicketDiagnosticResult[];
  }> {
    const failed: string[] = [];
    let fixed = 0;

    try {
      // Diagnose all events first
      const diagnostics = await this.diagnoseOrganizerEvents(organizerId);
      
      // Find events without ticket types
      const eventsWithoutTickets = diagnostics.filter(d => d.ticketTypesCount === 0);

      for (const eventDiag of eventsWithoutTickets) {
        try {
          // Create a default ticket type
          const { error: insertError } = await supabase
            .from('ticket_types')
            .insert({
              event_id: eventDiag.eventId,
              name: 'General Admission',
              description: 'Standard event ticket',
              price: 0, // Default free ticket
              quantity_available: 100, // Default capacity
              quantity_sold: 0,
              is_active: true,
              max_per_order: 10
            });

          if (insertError) {
            failed.push(`${eventDiag.eventTitle}: ${insertError.message}`);
          } else {
            fixed++;
          }
        } catch (error: any) {
          failed.push(`${eventDiag.eventTitle}: ${error.message}`);
        }
      }

      // Re-run diagnostics to get updated results
      const updatedResults = await this.diagnoseOrganizerEvents(organizerId);

      return {
        fixed,
        failed,
        results: updatedResults
      };

    } catch (error: any) {
      console.error('Error fixing events without tickets:', error);
      return {
        fixed: 0,
        failed: [`System error: ${error.message}`],
        results: []
      };
    }
  }
} 