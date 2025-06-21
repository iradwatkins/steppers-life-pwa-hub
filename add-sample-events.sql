-- Sample events and ticket types for debugging ticket purchase flow
-- Run this in your Supabase SQL editor or via psql

-- Insert a test organizer (if it doesn't exist)
DO $$
DECLARE
    test_organizer_id UUID;
    test_venue_id UUID;
    event1_id UUID;
    event2_id UUID;
    event3_id UUID;
BEGIN
    -- Create test organizer
    INSERT INTO public.organizers (
        organization_name, 
        description, 
        contact_email, 
        contact_phone, 
        verified
    ) VALUES (
        'SteppersLife Test Events',
        'Test organizer for debugging ticket purchase flow',
        'test@stepperslife.com',
        '(555) 123-4567',
        true
    ) 
    ON CONFLICT (organization_name) DO NOTHING
    RETURNING id INTO test_organizer_id;

    -- Get the organizer ID if it already existed
    IF test_organizer_id IS NULL THEN
        SELECT id INTO test_organizer_id 
        FROM public.organizers 
        WHERE organization_name = 'SteppersLife Test Events' 
        LIMIT 1;
    END IF;

    -- Create test venue
    INSERT INTO public.venues (
        name,
        address,
        city,
        state,
        zip_code,
        capacity
    ) VALUES (
        'Chicago Stepping Center',
        '123 Dance Street',
        'Chicago',
        'IL',
        '60601',
        200
    ) RETURNING id INTO test_venue_id;

    -- Create Event 1: Chicago Stepping Championship
    INSERT INTO public.events (
        organizer_id,
        venue_id,
        title,
        description,
        short_description,
        category,
        tags,
        start_date,
        end_date,
        timezone,
        is_online,
        status,
        max_attendees
    ) VALUES (
        test_organizer_id,
        test_venue_id,
        'Chicago Stepping Championship 2024',
        'Annual championship featuring the best steppers from around the world. Competition categories include beginner, intermediate, and advanced levels. Join us for an exciting day of competitive stepping with cash prizes and trophies for winners.',
        'Annual stepping championship with multiple competition levels',
        'Competition',
        ARRAY['competition', 'championship', 'advanced'],
        NOW() + INTERVAL '30 days',
        NOW() + INTERVAL '31 days',
        'America/Chicago',
        false,
        'published',
        500
    ) RETURNING id INTO event1_id;

    -- Create Event 2: Beginner Workshop
    INSERT INTO public.events (
        organizer_id,
        venue_id,
        title,
        description,
        short_description,
        category,
        tags,
        start_date,
        end_date,
        timezone,
        is_online,
        status,
        max_attendees
    ) VALUES (
        test_organizer_id,
        test_venue_id,
        'Beginner Stepping Workshop',
        'Learn the fundamentals of Chicago stepping in this comprehensive workshop. Perfect for those who have never stepped before or want to improve their basic technique. Includes basic steps, timing, and partner work.',
        'Learn Chicago stepping fundamentals',
        'Workshop',
        ARRAY['beginner', 'workshop', 'learning'],
        NOW() + INTERVAL '14 days',
        NOW() + INTERVAL '14 days' + INTERVAL '3 hours',
        'America/Chicago',
        false,
        'published',
        50
    ) RETURNING id INTO event2_id;

    -- Create Event 3: Virtual Masterclass
    INSERT INTO public.events (
        organizer_id,
        title,
        description,
        short_description,
        category,
        tags,
        start_date,
        end_date,
        timezone,
        is_online,
        online_link,
        status,
        max_attendees
    ) VALUES (
        test_organizer_id,
        'Virtual Stepping Masterclass',
        'Join us online for an advanced stepping masterclass with world-renowned instructors. Interactive session with live feedback and Q&A. Perfect for intermediate to advanced steppers.',
        'Advanced online stepping masterclass',
        'Workshop',
        ARRAY['online', 'advanced', 'masterclass'],
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '7 days' + INTERVAL '2 hours',
        'America/Chicago',
        true,
        'https://zoom.us/test-meeting',
        'published',
        100
    ) RETURNING id INTO event3_id;

    -- Create ticket types for Event 1 (Championship)
    INSERT INTO public.ticket_types (
        event_id,
        name,
        description,
        price,
        quantity_available,
        quantity_sold,
        max_per_order,
        is_active
    ) VALUES 
    (
        event1_id,
        'General Admission',
        'Regular entry to the championship with general seating',
        35.00,
        300,
        0,
        6,
        true
    ),
    (
        event1_id,
        'VIP Package',
        'VIP seating, complimentary drinks, and meet & greet with champions',
        75.00,
        50,
        0,
        4,
        true
    ),
    (
        event1_id,
        'Competitor Pass',
        'Entry pass for competition participants (includes warm-up area access)',
        15.00,
        100,
        0,
        2,
        true
    );

    -- Create ticket types for Event 2 (Workshop)
    INSERT INTO public.ticket_types (
        event_id,
        name,
        description,
        price,
        quantity_available,
        quantity_sold,
        max_per_order,
        is_active
    ) VALUES 
    (
        event2_id,
        'Single Workshop',
        'Access to one workshop session',
        25.00,
        40,
        0,
        2,
        true
    ),
    (
        event2_id,
        'Workshop + Practice Session',
        'Workshop plus extra practice time and personalized feedback',
        40.00,
        10,
        0,
        2,
        true
    );

    -- Create ticket types for Event 3 (Virtual)
    INSERT INTO public.ticket_types (
        event_id,
        name,
        description,
        price,
        quantity_available,
        quantity_sold,
        max_per_order,
        is_active
    ) VALUES 
    (
        event3_id,
        'Live Session',
        'Live participation in the masterclass with interactive Q&A',
        20.00,
        75,
        0,
        3,
        true
    ),
    (
        event3_id,
        'Live + Recording',
        'Live session plus 30-day access to recording and bonus materials',
        30.00,
        25,
        0,
        3,
        true
    );

    RAISE NOTICE 'Successfully created test organizer, venue, 3 events, and 7 ticket types!';
    RAISE NOTICE 'Event IDs: %, %, %', event1_id, event2_id, event3_id;
    
END $$;