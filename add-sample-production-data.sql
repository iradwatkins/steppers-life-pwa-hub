-- SAMPLE PRODUCTION DATA
-- Run this AFTER deploying the schema to add some basic sample data

-- =====================================================
-- STEP 1: ADD SAMPLE VENUES
-- =====================================================

INSERT INTO public.venues (id, name, address, city, state, zip_code, capacity, description, latitude, longitude)
VALUES 
    (
        uuid_generate_v4(),
        'Downtown Event Center',
        '123 Main Street',
        'Atlanta',
        'GA',
        '30309',
        500,
        'Modern event space in the heart of downtown Atlanta',
        33.7490,
        -84.3880
    ),
    (
        uuid_generate_v4(),
        'Riverside Community Hall',
        '456 River Road',
        'Atlanta',
        'GA',
        '30342',
        200,
        'Intimate community space perfect for workshops and classes',
        33.8486,
        -84.3733
    ),
    (
        uuid_generate_v4(),
        'Virtual Event Space',
        'Online',
        'Online',
        'Online',
        '00000',
        1000,
        'Virtual venue for online events and workshops',
        NULL,
        NULL
    )
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 2: ADD SAMPLE ORGANIZERS
-- =====================================================

-- Note: This assumes you have user profiles. If not, organizers will be created without user links.
INSERT INTO public.organizers (id, organization_name, description, contact_email, verified)
VALUES 
    (
        uuid_generate_v4(),
        'SteppersLife Events',
        'Premier steppers dance events and workshops in Atlanta',
        'events@stepperslife.com',
        true
    ),
    (
        uuid_generate_v4(),
        'Atlanta Dance Academy',
        'Professional dance instruction and community events',
        'info@atlantadanceacademy.com',
        true
    ),
    (
        uuid_generate_v4(),
        'Community Wellness Collective',
        'Health and wellness workshops for the community',
        'wellness@community.org',
        false
    )
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 3: ADD SAMPLE EVENTS
-- =====================================================

WITH venue_ids AS (
    SELECT id as venue_id, ROW_NUMBER() OVER (ORDER BY name) as rn 
    FROM public.venues LIMIT 3
),
organizer_ids AS (
    SELECT id as organizer_id, ROW_NUMBER() OVER (ORDER BY organization_name) as rn 
    FROM public.organizers LIMIT 3
)
INSERT INTO public.events (
    id, organizer_id, venue_id, title, description, short_description, 
    category, start_date, end_date, status, max_attendees
)
SELECT 
    uuid_generate_v4(),
    o.organizer_id,
    v.venue_id,
    event_data.title,
    event_data.description,
    event_data.short_description,
    event_data.category,
    event_data.start_date,
    event_data.end_date,
    'published'::event_status,
    event_data.max_attendees
FROM (
    VALUES 
        (
            'Beginner Steppers Workshop',
            'Learn the fundamentals of steppers dancing in a welcoming environment. Perfect for absolute beginners!',
            'Learn steppers basics in a fun, supportive environment',
            'Dance & Fitness',
            NOW() + INTERVAL '7 days',
            NOW() + INTERVAL '7 days' + INTERVAL '2 hours',
            50,
            1
        ),
        (
            'Advanced Steppers Masterclass',
            'Take your steppers skills to the next level with advanced techniques and choreography.',
            'Advanced steppers techniques and choreography',
            'Dance & Fitness', 
            NOW() + INTERVAL '14 days',
            NOW() + INTERVAL '14 days' + INTERVAL '3 hours',
            30,
            2
        ),
        (
            'Community Wellness Workshop',
            'Join us for a holistic wellness workshop focusing on mind, body, and spirit.',
            'Holistic wellness for mind, body, and spirit',
            'Health & Wellness',
            NOW() + INTERVAL '21 days', 
            NOW() + INTERVAL '21 days' + INTERVAL '4 hours',
            100,
            3
        )
) AS event_data(title, description, short_description, category, start_date, end_date, max_attendees, row_num)
CROSS JOIN venue_ids v
CROSS JOIN organizer_ids o
WHERE v.rn = event_data.row_num AND o.rn = event_data.row_num;

-- =====================================================
-- STEP 4: ADD SAMPLE TICKET TYPES
-- =====================================================

INSERT INTO public.ticket_types (id, event_id, name, description, price, quantity_available)
SELECT 
    uuid_generate_v4(),
    e.id,
    ticket_data.name,
    ticket_data.description,
    ticket_data.price,
    ticket_data.quantity
FROM public.events e
CROSS JOIN (
    VALUES 
        ('General Admission', 'Standard event access', 25.00, 40),
        ('VIP Access', 'Premium experience with early access and refreshments', 45.00, 10)
) AS ticket_data(name, description, price, quantity)
WHERE e.status = 'published';

-- =====================================================
-- STEP 5: ADD BLOG CATEGORIES
-- =====================================================

INSERT INTO public.blog_categories (id, name, slug, description, color)
VALUES 
    (uuid_generate_v4(), 'Dance Tips', 'dance-tips', 'Tips and techniques for better dancing', '#FF6B6B'),
    (uuid_generate_v4(), 'Event Highlights', 'event-highlights', 'Recaps and highlights from our events', '#4ECDC4'),
    (uuid_generate_v4(), 'Community Stories', 'community-stories', 'Stories from our amazing community', '#45B7D1'),
    (uuid_generate_v4(), 'Health & Wellness', 'health-wellness', 'Wellness tips for dancers and fitness enthusiasts', '#96CEB4')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STEP 6: ADD SAMPLE BLOG POST
-- =====================================================

INSERT INTO public.blog_posts (
    id, title, slug, excerpt, content, status, published_at, 
    category_id, tags, view_count
)
SELECT 
    uuid_generate_v4(),
    'Welcome to SteppersLife!',
    'welcome-to-stepperslife',
    'Join our vibrant community of steppers dancers and fitness enthusiasts in Atlanta.',
    '# Welcome to SteppersLife!

We''re excited to launch our new platform connecting the steppers dance community in Atlanta. Whether you''re a beginner looking to learn the basics or an experienced dancer wanting to perfect your technique, you''ll find events and workshops perfect for your skill level.

## What We Offer

- **Beginner-Friendly Classes**: Start your steppers journey with supportive instruction
- **Advanced Workshops**: Challenge yourself with complex choreography and techniques  
- **Community Events**: Connect with fellow dancers and fitness enthusiasts
- **Wellness Programs**: Holistic health and wellness workshops

## Getting Started

Browse our upcoming events and find the perfect class for you. Our experienced instructors create a welcoming environment where everyone can learn and grow.

Ready to step into the community? Check out our upcoming events!',
    'published',
    NOW(),
    bc.id,
    ARRAY['steppers', 'dance', 'community', 'atlanta'],
    0
FROM public.blog_categories bc
WHERE bc.slug = 'community-stories'
LIMIT 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify sample data was added
SELECT 
    '🎪 SAMPLE DATA SUMMARY' as category,
    'Events' as item_type,
    COUNT(*) as count
FROM public.events
UNION ALL
SELECT 
    '🎪 SAMPLE DATA SUMMARY',
    'Venues',
    COUNT(*)
FROM public.venues
UNION ALL
SELECT 
    '🎪 SAMPLE DATA SUMMARY', 
    'Organizers',
    COUNT(*)
FROM public.organizers
UNION ALL
SELECT 
    '🎪 SAMPLE DATA SUMMARY',
    'Ticket Types', 
    COUNT(*)
FROM public.ticket_types
UNION ALL
SELECT 
    '🎪 SAMPLE DATA SUMMARY',
    'Blog Posts',
    COUNT(*)
FROM public.blog_posts;

-- Show upcoming events
SELECT 
    '📅 UPCOMING EVENTS' as category,
    e.title,
    e.start_date,
    v.name as venue,
    o.organization_name as organizer
FROM public.events e
JOIN public.venues v ON e.venue_id = v.id
JOIN public.organizers o ON e.organizer_id = o.id
WHERE e.start_date > NOW()
ORDER BY e.start_date;

SELECT '✅ SAMPLE DATA DEPLOYMENT COMPLETE!' as result; 