-- IMMEDIATE HOTFIX: Add requires_tickets column to events table
-- Run this NOW in your Supabase SQL Editor

-- Add the missing column
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS requires_tickets BOOLEAN DEFAULT true NOT NULL;

-- Add related RSVP columns from the migration
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rsvp_enabled BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_rsvps INTEGER;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rsvp_deadline TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS allow_waitlist BOOLEAN DEFAULT false NOT NULL;

-- Add constraint: events must have either tickets OR rsvp enabled
ALTER TABLE public.events 
ADD CONSTRAINT IF NOT EXISTS check_event_has_tickets_or_rsvp 
CHECK (requires_tickets = true OR rsvp_enabled = true);

-- Add constraint: max_rsvps must be positive if set
ALTER TABLE public.events 
ADD CONSTRAINT IF NOT EXISTS check_max_rsvps_positive 
CHECK (max_rsvps IS NULL OR max_rsvps > 0);

-- Update existing events to have requires_tickets = true (maintain current behavior)
UPDATE public.events SET requires_tickets = true WHERE requires_tickets IS NULL;
UPDATE public.events SET rsvp_enabled = false WHERE rsvp_enabled IS NULL;

-- Add comments
COMMENT ON COLUMN public.events.requires_tickets IS 'Whether this event requires paid tickets (default: true)';
COMMENT ON COLUMN public.events.rsvp_enabled IS 'Whether RSVP is enabled for free events (default: false)';
COMMENT ON COLUMN public.events.max_rsvps IS 'Maximum number of RSVPs allowed (null = unlimited)';
COMMENT ON COLUMN public.events.rsvp_deadline IS 'Deadline for RSVPs (null = until event start)';
COMMENT ON COLUMN public.events.allow_waitlist IS 'Whether to allow waitlist when max_rsvps is reached';

-- Verification
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('requires_tickets', 'rsvp_enabled', 'max_rsvps', 'rsvp_deadline', 'allow_waitlist')
ORDER BY column_name;