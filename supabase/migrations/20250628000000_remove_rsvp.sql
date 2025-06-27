-- Migration: Remove all RSVP-related functionality

BEGIN;

-- Drop the event_rsvps table
DROP TABLE IF EXISTS public.event_rsvps CASCADE;

-- Drop related functions
DROP FUNCTION IF EXISTS public.get_event_rsvp_count(uuid);
DROP FUNCTION IF EXISTS public.event_has_rsvp_capacity(uuid);

-- Remove rsvp-related columns from the events table
ALTER TABLE public.events
DROP COLUMN IF EXISTS rsvp_enabled,
DROP COLUMN IF EXISTS max_rsvps,
DROP COLUMN IF EXISTS rsvp_deadline,
DROP COLUMN IF EXISTS allow_waitlist;

-- Drop constraints that depend on the removed columns
ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS check_event_has_tickets_or_rsvp,
DROP CONSTRAINT IF EXISTS check_max_rsvps_positive,
DROP CONSTRAINT IF EXISTS check_rsvp_deadline_before_event;

COMMIT;
