import { supabase } from '@/integrations/supabase/client';

export interface TicketFlowTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class TicketFlowTester {
  /**
   * Test creating a simple event with ticket types
   */
  static async testCreateEventWithTickets(organizerId: string): Promise<TicketFlowTestResult> {
    try {
      // Create a test event
      const testEvent = {
        organizer_id: organizerId,
        title: 'Test Event - Ticket Flow',
        description: 'This is a test event to verify ticket creation',
        start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        end_date: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
        timezone: 'America/Chicago',
        is_online: true,
        status: 'draft' as const,
        max_attendees: 50
      };

      console.log('Creating test event:', testEvent);

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert(testEvent)
        .select()
        .single();

      if (eventError) {
        return {
          success: false,
          message: 'Failed to create test event',
          error: eventError.message
        };
      }

      console.log('Test event created:', event);

      // Create test ticket types
      const testTicketTypes = [
        {
          event_id: event.id,
          name: 'Early Bird',
          description: 'Early bird discount ticket',
          price: 15.00,
          quantity_available: 25,
          quantity_sold: 0,
          is_active: true,
          max_per_order: 5
        },
        {
          event_id: event.id,
          name: 'General Admission',
          description: 'Standard event ticket',
          price: 25.00,
          quantity_available: 25,
          quantity_sold: 0,
          is_active: true,
          max_per_order: 10
        }
      ];

      console.log('Creating test ticket types:', testTicketTypes);

      const { data: ticketTypes, error: ticketError } = await supabase
        .from('ticket_types')
        .insert(testTicketTypes)
        .select();

      if (ticketError) {
        // Clean up the event if ticket creation fails
        await supabase.from('events').delete().eq('id', event.id);
        return {
          success: false,
          message: 'Failed to create test ticket types',
          error: ticketError.message
        };
      }

      console.log('Test ticket types created:', ticketTypes);

      // Verify the data can be retrieved
      const { data: retrievedEvent, error: retrieveError } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types(*)
        `)
        .eq('id', event.id)
        .single();

      if (retrieveError) {
        return {
          success: false,
          message: 'Failed to retrieve test event with ticket types',
          error: retrieveError.message
        };
      }

      console.log('Retrieved event with ticket types:', retrievedEvent);

      // Clean up test data
      await supabase.from('ticket_types').delete().eq('event_id', event.id);
      await supabase.from('events').delete().eq('id', event.id);

      return {
        success: true,
        message: 'Ticket flow test completed successfully',
        data: {
          event: retrievedEvent,
          ticketTypesCount: retrievedEvent.ticket_types?.length || 0
        }
      };

    } catch (error: any) {
      return {
        success: false,
        message: 'Ticket flow test failed with exception',
        error: error.message
      };
    }
  }

  /**
   * Test retrieving events with ticket types for an organizer
   */
  static async testOrganizerEventRetrieval(organizerId: string): Promise<TicketFlowTestResult> {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          *,
          venues(*),
          ticket_types(*),
          organizers(organization_name)
        `)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          message: 'Failed to retrieve organizer events',
          error: error.message
        };
      }

      const eventsWithTickets = events?.filter(e => e.ticket_types && e.ticket_types.length > 0) || [];
      const eventsWithoutTickets = events?.filter(e => !e.ticket_types || e.ticket_types.length === 0) || [];

      return {
        success: true,
        message: 'Event retrieval test completed',
        data: {
          totalEvents: events?.length || 0,
          eventsWithTickets: eventsWithTickets.length,
          eventsWithoutTickets: eventsWithoutTickets.length,
          events: events?.map(e => ({
            id: e.id,
            title: e.title,
            ticketTypesCount: e.ticket_types?.length || 0
          }))
        }
      };

    } catch (error: any) {
      return {
        success: false,
        message: 'Event retrieval test failed',
        error: error.message
      };
    }
  }

  /**
   * Test the complete flow: create event, add tickets, retrieve, display
   */
  static async testCompleteFlow(organizerId: string): Promise<TicketFlowTestResult[]> {
    const results: TicketFlowTestResult[] = [];

    // Test 1: Create event with tickets
    const createTest = await this.testCreateEventWithTickets(organizerId);
    results.push({
      ...createTest,
      message: `Create Event Test: ${createTest.message}`
    });

    // Test 2: Retrieve organizer events
    const retrieveTest = await this.testOrganizerEventRetrieval(organizerId);
    results.push({
      ...retrieveTest,
      message: `Retrieve Events Test: ${retrieveTest.message}`
    });

    return results;
  }
} 