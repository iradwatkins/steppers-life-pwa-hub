-- Migration: Add optional tickets and RSVP functionality
-- Date: 2025-06-24
-- Description: Allow events to be free/RSVP-only instead of requiring tickets

-- ===============================================
-- EXTEND EVENTS TABLE FOR OPTIONAL TICKETS
-- ===============================================

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS requires_tickets BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rsvp_enabled BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_rsvps INTEGER;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rsvp_deadline TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS allow_waitlist BOOLEAN DEFAULT false NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.events.requires_tickets IS 'Whether this event requires paid tickets';
COMMENT ON COLUMN public.events.rsvp_enabled IS 'Whether RSVP is enabled for free events';
COMMENT ON COLUMN public.events.max_rsvps IS 'Maximum number of RSVPs allowed (null = unlimited)';
COMMENT ON COLUMN public.events.rsvp_deadline IS 'Deadline for RSVPs (null = until event start)';
COMMENT ON COLUMN public.events.allow_waitlist IS 'Whether to allow waitlist when max_rsvps is reached';

-- ===============================================
-- CREATE RSVP TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    attendee_phone TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist', 'checked_in')),
    rsvp_notes TEXT,
    dietary_restrictions TEXT,
    accessibility_needs TEXT,
    plus_one_count INTEGER DEFAULT 0 CHECK (plus_one_count >= 0),
    plus_one_names TEXT[], -- Array of plus-one names
    verification_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    is_checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    custom_fields JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(event_id, attendee_email)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON public.event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_email ON public.event_rsvps(attendee_email);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON public.event_rsvps(status);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_verification_token ON public.event_rsvps(verification_token);

-- Add comments
COMMENT ON TABLE public.event_rsvps IS 'RSVPs for free/non-ticketed events';
COMMENT ON COLUMN public.event_rsvps.status IS 'RSVP status: confirmed, cancelled, waitlist, checked_in';
COMMENT ON COLUMN public.event_rsvps.plus_one_count IS 'Number of additional attendees (plus ones)';
COMMENT ON COLUMN public.event_rsvps.verification_token IS 'Unique token for RSVP verification and updates';

-- ===============================================
-- UPDATE TRIGGER FOR TIMESTAMPS
-- ===============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_event_rsvps_updated_at ON public.event_rsvps;
CREATE TRIGGER update_event_rsvps_updated_at
    BEFORE UPDATE ON public.event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- RLS POLICIES FOR RSVP TABLE
-- ===============================================

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view RSVPs for published events
CREATE POLICY "Users can view RSVPs for published events" ON public.event_rsvps
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_rsvps.event_id 
            AND events.status = 'published'
        )
    );

-- Policy: Users can create RSVPs for published events
CREATE POLICY "Users can create RSVPs for published events" ON public.event_rsvps
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_rsvps.event_id 
            AND events.status = 'published'
            AND events.rsvp_enabled = true
        )
    );

-- Policy: Users can update their own RSVPs
CREATE POLICY "Users can update their own RSVPs" ON public.event_rsvps
    FOR UPDATE
    USING (user_id = auth.uid() OR attendee_email = auth.email());

-- Policy: Event organizers can manage RSVPs for their events
CREATE POLICY "Organizers can manage RSVPs for their events" ON public.event_rsvps
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_rsvps.event_id 
            AND events.organizer_id IN (
                SELECT id FROM public.organizers 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: Admins can manage all RSVPs
CREATE POLICY "Admins can manage all RSVPs" ON public.event_rsvps
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ===============================================
-- HELPER FUNCTIONS
-- ===============================================

-- Function to get RSVP count for an event
CREATE OR REPLACE FUNCTION get_event_rsvp_count(event_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM public.event_rsvps 
        WHERE event_id = event_uuid 
        AND status IN ('confirmed', 'checked_in')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get waitlist count for an event
CREATE OR REPLACE FUNCTION get_event_waitlist_count(event_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM public.event_rsvps 
        WHERE event_id = event_uuid 
        AND status = 'waitlist'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if event has capacity for more RSVPs
CREATE OR REPLACE FUNCTION event_has_rsvp_capacity(event_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    max_capacity INTEGER;
    current_count INTEGER;
BEGIN
    SELECT max_rsvps INTO max_capacity
    FROM public.events 
    WHERE id = event_uuid;
    
    -- If no limit set, always has capacity
    IF max_capacity IS NULL THEN
        RETURN TRUE;
    END IF;
    
    SELECT get_event_rsvp_count(event_uuid) INTO current_count;
    
    RETURN current_count < max_capacity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- UPDATE EXISTING DATA
-- ===============================================

-- Set requires_tickets=true for all existing events (maintain current behavior)
UPDATE public.events 
SET requires_tickets = true, 
    rsvp_enabled = false 
WHERE requires_tickets IS NULL OR rsvp_enabled IS NULL;

-- ===============================================
-- VALIDATION CONSTRAINTS
-- ===============================================

-- Add constraint: events must have either tickets OR rsvp enabled
ALTER TABLE public.events 
ADD CONSTRAINT check_event_has_tickets_or_rsvp 
CHECK (requires_tickets = true OR rsvp_enabled = true);

-- Add constraint: max_rsvps must be positive if set
ALTER TABLE public.events 
ADD CONSTRAINT check_max_rsvps_positive 
CHECK (max_rsvps IS NULL OR max_rsvps > 0);

-- Add constraint: RSVP deadline must be before event start
ALTER TABLE public.events 
ADD CONSTRAINT check_rsvp_deadline_before_event 
CHECK (rsvp_deadline IS NULL OR rsvp_deadline <= start_date);

COMMIT;