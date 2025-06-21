#!/usr/bin/env node

// Script to create test events with ticket types
// Run this with: node create-test-events.js

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

async function createTestEvents() {
  console.log('🎭 Creating test events with ticket types...\n');

  try {
    // First, we need to create a test organizer
    console.log('1. Creating test organizer...');
    
    // Check if test organizer already exists
    const { data: existingOrganizer } = await supabase
      .from('organizers')
      .select('id')
      .eq('organization_name', 'SteppersLife Test Events')
      .single();

    let organizerId;
    if (existingOrganizer) {
      organizerId = existingOrganizer.id;
      console.log('✅ Using existing test organizer:', organizerId);
    } else {
      const { data: newOrganizer, error: organizerError } = await supabase
        .from('organizers')
        .insert({
          organization_name: 'SteppersLife Test Events',
          description: 'Test organizer for debugging ticket purchase flow',
          contact_email: 'test@stepperslife.com',
          contact_phone: '(555) 123-4567',
          verified: true
        })
        .select()
        .single();

      if (organizerError) {
        console.error('❌ Error creating organizer:', organizerError);
        return;
      }
      
      organizerId = newOrganizer.id;
      console.log('✅ Created test organizer:', organizerId);
    }

    // Create test venue
    console.log('2. Creating test venue...');
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .insert({
        name: 'Chicago Stepping Center',
        address: '123 Dance Street',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        capacity: 200
      })
      .select()
      .single();

    if (venueError) {
      console.error('❌ Error creating venue:', venueError);
      return;
    }
    console.log('✅ Created test venue:', venue.id);

    // Define test events
    const testEvents = [
      {
        title: 'Chicago Stepping Championship 2024',
        description: 'Annual championship featuring the best steppers from around the world. Competition categories include beginner, intermediate, and advanced levels.',
        short_description: 'Annual stepping championship with multiple competition levels',
        category: 'Competition',
        tags: ['competition', 'championship', 'advanced'],
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        end_date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),   // 31 days from now
        timezone: 'America/Chicago',
        is_online: false,
        status: 'published',
        max_attendees: 500,
        venue_id: venue.id,
        organizer_id: organizerId,
        ticketTypes: [
          {
            name: 'General Admission',
            description: 'Regular entry to the championship',
            price: 35.00,
            quantity_available: 300,
            max_per_order: 6
          },
          {
            name: 'VIP Package',
            description: 'VIP seating, complimentary drinks, and meet & greet',
            price: 75.00,
            quantity_available: 50,
            max_per_order: 4
          },
          {
            name: 'Competitor Pass',
            description: 'Entry pass for competition participants',
            price: 15.00,
            quantity_available: 100,
            max_per_order: 2
          }
        ]
      },
      {
        title: 'Beginner Stepping Workshop',
        description: 'Learn the fundamentals of Chicago stepping in this comprehensive workshop. Perfect for those who have never stepped before or want to improve their basic technique.',
        short_description: 'Learn Chicago stepping fundamentals',
        category: 'Workshop',
        tags: ['beginner', 'workshop', 'learning'],
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
        timezone: 'America/Chicago',
        is_online: false,
        status: 'published',
        max_attendees: 50,
        venue_id: venue.id,
        organizer_id: organizerId,
        ticketTypes: [
          {
            name: 'Single Workshop',
            description: 'Access to one workshop session',
            price: 25.00,
            quantity_available: 40,
            max_per_order: 2
          },
          {
            name: 'Workshop + Practice Session',
            description: 'Workshop plus extra practice time',
            price: 40.00,
            quantity_available: 10,
            max_per_order: 2
          }
        ]
      },
      {
        title: 'Virtual Stepping Masterclass',
        description: 'Join us online for an advanced stepping masterclass with world-renowned instructors. Interactive session with live feedback.',
        short_description: 'Advanced online stepping masterclass',
        category: 'Workshop',
        tags: ['online', 'advanced', 'masterclass'],
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        timezone: 'America/Chicago',
        is_online: true,
        online_link: 'https://zoom.us/test-meeting',
        status: 'published',
        max_attendees: 100,
        organizer_id: organizerId,
        ticketTypes: [
          {
            name: 'Live Session',
            description: 'Live participation in the masterclass',
            price: 20.00,
            quantity_available: 75,
            max_per_order: 3
          },
          {
            name: 'Live + Recording',
            description: 'Live session plus 30-day access to recording',
            price: 30.00,
            quantity_available: 25,
            max_per_order: 3
          }
        ]
      }
    ];

    // Create events with ticket types
    for (let i = 0; i < testEvents.length; i++) {
      const eventData = testEvents[i];
      console.log(`\n3.${i + 1}. Creating event: "${eventData.title}"...`);

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          short_description: eventData.short_description,
          category: eventData.category,
          tags: eventData.tags,
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          timezone: eventData.timezone,
          is_online: eventData.is_online,
          online_link: eventData.online_link,
          status: eventData.status,
          max_attendees: eventData.max_attendees,
          venue_id: eventData.venue_id,
          organizer_id: eventData.organizer_id
        })
        .select()
        .single();

      if (eventError) {
        console.error(`❌ Error creating event "${eventData.title}":`, eventError);
        continue;
      }

      console.log(`✅ Created event: ${event.id}`);

      // Create ticket types for this event
      const ticketTypesData = eventData.ticketTypes.map(ticket => ({
        event_id: event.id,
        name: ticket.name,
        description: ticket.description,
        price: ticket.price,
        quantity_available: ticket.quantity_available,
        quantity_sold: 0,
        max_per_order: ticket.max_per_order,
        is_active: true
      }));

      const { error: ticketError } = await supabase
        .from('ticket_types')
        .insert(ticketTypesData);

      if (ticketError) {
        console.error(`❌ Error creating ticket types for "${eventData.title}":`, ticketError);
      } else {
        console.log(`✅ Created ${ticketTypesData.length} ticket types for "${eventData.title}"`);
      }
    }

    console.log('\n🎉 Test events created successfully!');
    console.log('\n📋 WHAT WAS CREATED:');
    console.log('=====================================');
    console.log('✅ 1 Test organizer: "SteppersLife Test Events"');
    console.log('✅ 1 Test venue: "Chicago Stepping Center"');
    console.log('✅ 3 Test events with ticket types:');
    console.log('   1. Chicago Stepping Championship 2024 (3 ticket types)');
    console.log('   2. Beginner Stepping Workshop (2 ticket types)');
    console.log('   3. Virtual Stepping Masterclass (2 ticket types)');
    console.log('\n💡 Now users should be able to purchase tickets!');
    console.log('🔍 Visit any event detail page to test the ticket purchase flow.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createTestEvents().then(() => {
  console.log('\n🏁 Script complete!');
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});