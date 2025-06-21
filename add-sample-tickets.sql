-- Add sample ticket types to existing events
-- Run this in your Supabase SQL editor

-- First, let's see what events exist
-- SELECT id, title FROM events LIMIT 5;

-- Add ticket types to any existing event (replace 'your-event-id' with actual event ID)
-- Example for a stepping event:

INSERT INTO ticket_types (
  event_id,
  name,
  description,
  price,
  quantity_available,
  quantity_sold,
  is_active,
  max_per_order
) VALUES
-- Replace 'your-event-id' with an actual event ID from your database
('your-event-id', 'General Admission', 'Access to main floor seating and dance area', 45.00, 150, 0, true, 10),
('your-event-id', 'VIP Experience', 'Premium seating, complimentary drinks, and meet & greet', 85.00, 25, 0, true, 8),
('your-event-id', 'Reserved Table (8 seats)', 'Private table for 8 with premium service', 320.00, 10, 0, true, 1);

-- OR create a complete sample event with tickets:
-- First insert an event
INSERT INTO events (
  title,
  description,
  short_description,
  category,
  start_date,
  end_date,
  timezone,
  is_online,
  status,
  max_attendees,
  featured_image_url
) VALUES (
  'Chicago Stepping Championship',
  'Join us for the most prestigious stepping competition in Chicago. Watch the best steppers compete for the championship title while enjoying great music, food, and community.',
  'The most prestigious stepping competition in Chicago',
  'Competition',
  '2024-12-15 19:00:00',
  '2024-12-15 23:00:00',
  'America/Chicago',
  false,
  'published',
  200,
  '/placeholder.svg'
) RETURNING id;

-- Then add ticket types using the event ID from above
-- (You'll need to replace the event_id with the actual ID returned)