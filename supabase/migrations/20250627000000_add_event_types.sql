-- Migration: Add 3-tier event system with Simple Events
-- Date: 2025-06-27
-- Description: Add event_type enum and simple event fields for 3-tier system

BEGIN;

-- Create event type enum
CREATE TYPE event_type AS ENUM ('simple', 'ticketed', 'premium');

-- Add event_type column to events table
ALTER TABLE public.events 
ADD COLUMN event_type event_type DEFAULT 'ticketed' NOT NULL;

-- Add simple event specific fields
ALTER TABLE public.events 
ADD COLUMN free_entry_condition TEXT,
ADD COLUMN door_price DECIMAL(10,2),
ADD COLUMN door_price_currency TEXT DEFAULT 'USD';

-- Add comments for documentation
COMMENT ON COLUMN public.events.event_type IS 'Event tier: simple (free with conditions), ticketed (standard), premium (seating)';
COMMENT ON COLUMN public.events.free_entry_condition IS 'Free entry condition (e.g., "Free for women before 10pm")';
COMMENT ON COLUMN public.events.door_price IS 'Price at the door for simple events';
COMMENT ON COLUMN public.events.door_price_currency IS 'Currency for door price';

-- Update existing events based on current requires_tickets field
UPDATE public.events 
SET event_type = CASE 
    WHEN requires_tickets = true THEN 'ticketed'
    WHEN requires_tickets = false THEN 'simple'
    ELSE 'ticketed'
END;

-- Create index for event type filtering
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);

-- Add constraint to ensure simple events have door pricing info
ALTER TABLE public.events 
ADD CONSTRAINT check_simple_event_pricing 
CHECK (
    event_type != 'simple' OR 
    (door_price IS NOT NULL AND door_price >= 0)
);

COMMIT;