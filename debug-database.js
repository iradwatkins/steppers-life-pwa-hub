#!/usr/bin/env node

// Debug script to check database events and ticket_types
// Run this with: node debug-database.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to update these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.log('❌ Please update the SUPABASE_URL and SUPABASE_ANON_KEY in this file with your actual credentials');
  console.log('You can find these in your .env files or Supabase dashboard');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugDatabase() {
  console.log('🔍 Starting database debug...\n');

  try {
    // 1. Check if we can connect to the database
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('events')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // 2. Check total number of events
    console.log('2. Checking total events count...');
    const { count: eventsCount, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting events:', countError.message);
    } else {
      console.log(`📊 Total events in database: ${eventsCount}\n`);
    }

    // 3. Check published events
    console.log('3. Checking published events...');
    const { data: publishedEvents, error: publishedError } = await supabase
      .from('events')
      .select('id, title, status, created_at')
      .eq('status', 'published')
      .limit(10);
    
    if (publishedError) {
      console.error('❌ Error fetching published events:', publishedError.message);
    } else {
      console.log(`📊 Published events: ${publishedEvents?.length || 0}`);
      if (publishedEvents && publishedEvents.length > 0) {
        publishedEvents.forEach(event => {
          console.log(`  - ${event.title} (ID: ${event.id}, Status: ${event.status})`);
        });
      }
      console.log();
    }

    // 4. Check all events with their status
    console.log('4. Checking all events with status...');
    const { data: allEvents, error: allEventsError } = await supabase
      .from('events')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allEventsError) {
      console.error('❌ Error fetching all events:', allEventsError.message);
    } else {
      console.log(`📊 Recent events (${allEvents?.length || 0}):`);
      if (allEvents && allEvents.length > 0) {
        allEvents.forEach(event => {
          console.log(`  - ${event.title} (ID: ${event.id}, Status: ${event.status})`);
        });
      } else {
        console.log('  No events found in database');
      }
      console.log();
    }

    // 5. Check ticket_types for each event
    console.log('5. Checking ticket_types for events...');
    if (allEvents && allEvents.length > 0) {
      for (const event of allEvents) {
        const { data: ticketTypes, error: ticketError } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', event.id);
        
        if (ticketError) {
          console.error(`❌ Error fetching tickets for event ${event.id}:`, ticketError.message);
        } else {
          console.log(`🎫 Event "${event.title}" has ${ticketTypes?.length || 0} ticket types`);
          if (ticketTypes && ticketTypes.length > 0) {
            ticketTypes.forEach(ticket => {
              console.log(`    - ${ticket.name}: $${ticket.price} (${ticket.quantity_available - ticket.quantity_sold} available)`);
            });
          }
        }
      }
      console.log();
    }

    // 6. Check event with full details (like EventService.getEventById)
    if (allEvents && allEvents.length > 0) {
      const firstEvent = allEvents[0];
      console.log(`6. Checking full event details for "${firstEvent.title}" (${firstEvent.id})...`);
      
      const { data: fullEvent, error: fullEventError } = await supabase
        .from('events')
        .select(`
          *,
          organizers (
            id,
            organization_name,
            user_id
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
        .eq('id', firstEvent.id)
        .single();

      if (fullEventError) {
        console.error('❌ Error fetching full event details:', fullEventError.message);
      } else {
        console.log('✅ Full event data structure:');
        console.log(`  - Event: ${fullEvent.title}`);
        console.log(`  - Status: ${fullEvent.status}`);
        console.log(`  - Organizer: ${fullEvent.organizers?.organization_name || 'None'}`);
        console.log(`  - Venue: ${fullEvent.venues?.name || 'None'}`);
        console.log(`  - Ticket Types: ${fullEvent.ticket_types?.length || 0}`);
        
        if (fullEvent.ticket_types && fullEvent.ticket_types.length > 0) {
          console.log('  📋 Ticket Types Details:');
          fullEvent.ticket_types.forEach((ticket, index) => {
            console.log(`    ${index + 1}. ${ticket.name}`);
            console.log(`       Price: $${ticket.price}`);
            console.log(`       Available: ${ticket.quantity_available}`);
            console.log(`       Sold: ${ticket.quantity_sold}`);
            console.log(`       Active: ${ticket.is_active}`);
          });
        } else {
          console.log('  ⚠️  No ticket types found - this is why users see "Tickets will be available soon"');
        }
      }
    }

    // 7. Summary and recommendations
    console.log('\n📋 SUMMARY AND RECOMMENDATIONS:');
    console.log('=====================================');
    
    if (!allEvents || allEvents.length === 0) {
      console.log('❌ ISSUE: No events found in database');
      console.log('📝 SOLUTION: Create some test events with ticket types');
    } else {
      const eventsWithTickets = [];
      const eventsWithoutTickets = [];
      
      for (const event of allEvents) {
        const { data: ticketTypes } = await supabase
          .from('ticket_types')
          .select('id')
          .eq('event_id', event.id);
        
        if (ticketTypes && ticketTypes.length > 0) {
          eventsWithTickets.push(event);
        } else {
          eventsWithoutTickets.push(event);
        }
      }
      
      if (eventsWithoutTickets.length > 0) {
        console.log(`⚠️  ISSUE: ${eventsWithoutTickets.length} events have NO ticket types:`);
        eventsWithoutTickets.forEach(event => {
          console.log(`    - "${event.title}" (${event.id})`);
        });
        console.log('📝 SOLUTION: Add ticket_types to these events or create new events with tickets');
      }
      
      if (eventsWithTickets.length > 0) {
        console.log(`✅ GOOD: ${eventsWithTickets.length} events have ticket types:`);
        eventsWithTickets.forEach(event => {
          console.log(`    - "${event.title}" (${event.id})`);
        });
      }
      
      const publishedWithTickets = eventsWithTickets.filter(e => e.status === 'published');
      if (publishedWithTickets.length === 0) {
        console.log('⚠️  ISSUE: No published events with ticket types');
        console.log('📝 SOLUTION: Either publish events that have tickets, or add tickets to published events');
      } else {
        console.log(`✅ GOOD: ${publishedWithTickets.length} published events have tickets`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug
debugDatabase().then(() => {
  console.log('\n🏁 Debug complete!');
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});