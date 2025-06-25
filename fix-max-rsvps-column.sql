-- Fix missing max_rsvps column in events table
-- Run this in your Supabase SQL Editor

-- Step 1: Check current events table structure
SELECT 
    'Current events table columns:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'events'
ORDER BY ordinal_position;

-- Step 2: Add the missing max_rsvps column
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_rsvps INTEGER;

-- Step 3: Add validation constraint (drop first if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_max_rsvps_positive' 
        AND table_name = 'events' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events 
        ADD CONSTRAINT check_max_rsvps_positive 
        CHECK (max_rsvps IS NULL OR max_rsvps > 0);
    END IF;
END $$;

-- Step 4: Add documentation comment
COMMENT ON COLUMN public.events.max_rsvps IS 'Maximum number of RSVPs allowed (null = unlimited)';

-- Step 5: Verify the column was added
SELECT 
    'Verification - events table now has:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'events'
AND column_name = 'max_rsvps';

-- Step 6: Check any existing constraints
SELECT 
    'Current constraints on events table:' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'events'
AND constraint_name LIKE '%rsvp%';