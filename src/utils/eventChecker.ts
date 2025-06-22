import { supabase } from '@/integrations/supabase/client';

export const checkEventExists = async (eventId: string) => {
  try {
    console.log(`🔍 Checking event: ${eventId}`);
    
    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, status, organizer_id')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('❌ Event not found:', eventError);
      return { exists: false, error: eventError.message };
    }

    console.log('✅ Event found:', event);

    // Check for ticket types
    const { data: ticketTypes, error: ticketError } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', eventId);

    if (ticketError) {
      console.error('❌ Error fetching ticket types:', ticketError);
      return { 
        exists: true, 
        event, 
        ticketTypes: [], 
        ticketError: ticketError.message 
      };
    }

    console.log('🎫 Ticket types found:', ticketTypes);

    return {
      exists: true,
      event,
      ticketTypes: ticketTypes || [],
      ticketCount: ticketTypes?.length || 0
    };

  } catch (error: any) {
    console.error('❌ Error checking event:', error);
    return { exists: false, error: error.message };
  }
};

// Add this to window for console testing
if (typeof window !== 'undefined') {
  (window as any).checkEventExists = checkEventExists;
} 