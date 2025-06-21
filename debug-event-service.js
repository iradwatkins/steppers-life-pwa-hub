// Debug script to test EventService.getEventById locally
// Run with: node debug-event-service.js

// First, let's try to understand what the service is returning
// This simulates the same query that EventService.getEventById uses

const { createClient } = require('@supabase/supabase-js');

// You'll need to update these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.log('❌ Please update the SUPABASE_URL and SUPABASE_ANON_KEY in this file');
  console.log('You can find these in your .env files or Supabase dashboard');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugEventService() {
  console.log('🔍 Testing EventService.getEventById query...\n');

  try {
    // First get any event ID to test with
    console.log('1. Finding a test event ID...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, status')
      .limit(5);

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError);
      return;
    }

    if (!events || events.length === 0) {
      console.log('❌ No events found in database');
      console.log('💡 Run the add-sample-events.sql script first to create test data');
      return;
    }

    console.log(`✅ Found ${events.length} events:`);
    events.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title} (${event.id}) - Status: ${event.status}`);
    });

    // Test with the first event
    const testEventId = events[0].id;
    console.log(`\n2. Testing getEventById with ID: ${testEventId}`);

    // This is the exact same query used in EventService.getEventById
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizers (
          id,
          organization_name,
          user_id,
          profiles (
            full_name,
            email
          )
        ),
        venues (
          id,
          name,
          address,
          city,
          state,
          zip_code,
          capacity
        ),
        ticket_types (
          id,
          name,
          description,
          price,
          quantity_available,
          quantity_sold,
          is_active
        )
      `)
      .eq('id', testEventId)
      .single();

    if (error) {
      console.error('❌ Error in getEventById query:', error);
      return;
    }

    // Analyze the returned data structure
    console.log('\n3. Analyzing returned data structure...');
    console.log('✅ Query successful!');
    console.log(`📊 Event: "${data.title}"`);
    console.log(`📊 Status: ${data.status}`);
    console.log(`📊 Organizer: ${data.organizers ? data.organizers.organization_name : 'None'}`);
    console.log(`📊 Venue: ${data.venues ? data.venues.name : 'None'}`);
    console.log(`📊 Ticket Types: ${data.ticket_types ? data.ticket_types.length : 0}`);

    if (!data.ticket_types || data.ticket_types.length === 0) {
      console.log('\n⚠️  PROBLEM IDENTIFIED: This event has NO ticket_types!');
      console.log('🔍 This is why the EventDetail component shows "Tickets will be available soon"');
      console.log('\n📝 SOLUTIONS:');
      console.log('1. Run add-sample-events.sql to create new events with tickets');
      console.log('2. Run add-tickets-to-existing-events.sql to add tickets to existing events');
      console.log('3. Use the admin interface to add ticket types to this event');
    } else {
      console.log('\n✅ GOOD: This event has ticket types!');
      console.log('📋 Ticket Types:');
      data.ticket_types.forEach((ticket, index) => {
        console.log(`  ${index + 1}. ${ticket.name} - $${ticket.price}`);
        console.log(`     Available: ${ticket.quantity_available}, Sold: ${ticket.quantity_sold}`);
        console.log(`     Active: ${ticket.is_active}`);
      });
    }

    // Test the EventDetail component logic
    console.log('\n4. Testing EventDetail component logic...');
    const ticketTypes = data.ticket_types;
    
    // This is the condition from EventDetail.tsx line 472
    const hasTickets = Array.isArray(ticketTypes) && ticketTypes.length > 0;
    console.log(`Array.isArray(ticket_types): ${Array.isArray(ticketTypes)}`);
    console.log(`ticket_types.length > 0: ${ticketTypes ? ticketTypes.length > 0 : false}`);
    console.log(`Final condition result: ${hasTickets}`);
    
    if (!hasTickets) {
      console.log('🎯 CONFIRMED: EventDetail will show "Tickets will be available soon"');
    } else {
      console.log('🎯 EventDetail should show ticket purchase options');
    }

    // Test all events to see the overall situation
    console.log('\n5. Checking all events for ticket types...');
    const { data: allEvents, error: allError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        status,
        ticket_types (id)
      `)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all events:', allError);
    } else {
      console.log(`\n📊 SUMMARY OF ALL EVENTS (${allEvents.length} total):`);
      console.log('=====================================');
      
      let eventsWithTickets = 0;
      let eventsWithoutTickets = 0;
      let publishedWithTickets = 0;
      let publishedWithoutTickets = 0;
      
      allEvents.forEach(event => {
        const hasTickets = event.ticket_types && event.ticket_types.length > 0;
        const ticketCount = hasTickets ? event.ticket_types.length : 0;
        
        console.log(`${hasTickets ? '✅' : '❌'} ${event.title} (${event.status}) - ${ticketCount} tickets`);
        
        if (hasTickets) {
          eventsWithTickets++;
          if (event.status === 'published') publishedWithTickets++;
        } else {
          eventsWithoutTickets++;
          if (event.status === 'published') publishedWithoutTickets++;
        }
      });
      
      console.log('\n📈 STATISTICS:');
      console.log(`Total events: ${allEvents.length}`);
      console.log(`Events with tickets: ${eventsWithTickets}`);
      console.log(`Events without tickets: ${eventsWithoutTickets}`);
      console.log(`Published events with tickets: ${publishedWithTickets}`);
      console.log(`Published events without tickets: ${publishedWithoutTickets}`);
      
      if (publishedWithTickets === 0) {
        console.log('\n🚨 ROOT CAUSE: No published events have ticket types!');
        console.log('📝 ACTION NEEDED: Add ticket types to published events or publish events that have tickets');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugEventService().then(() => {
  console.log('\n🏁 Debug complete!');
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});