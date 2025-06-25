-- COMPLETE DATABASE SCHEMA FIX
-- Fixes all identified database issues in production
-- Run this in your Supabase SQL Editor

-- ===============================================
-- 1. CREATE USER_EPIC_PROGRESS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS public.user_epic_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    epic_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate epic entries per user
    UNIQUE(user_id, epic_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_epic_progress_user_id ON public.user_epic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_epic_progress_epic_id ON public.user_epic_progress(epic_id);
CREATE INDEX IF NOT EXISTS idx_user_epic_progress_completed ON public.user_epic_progress(completed_at);

-- Add comments
COMMENT ON TABLE public.user_epic_progress IS 'Tracks user progress through BMAD method epics';
COMMENT ON COLUMN public.user_epic_progress.epic_id IS 'Epic identifier (e.g., profile-setup, business-verification)';
COMMENT ON COLUMN public.user_epic_progress.progress IS 'Progress percentage (0-100)';
COMMENT ON COLUMN public.user_epic_progress.completed_at IS 'When the epic was completed (null if not completed)';

-- Enable RLS
ALTER TABLE public.user_epic_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own epic progress" ON public.user_epic_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own epic progress" ON public.user_epic_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own epic progress" ON public.user_epic_progress
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all epic progress" ON public.user_epic_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ===============================================
-- 2. FIX PROFILES TABLE COLUMN ALIAS
-- ===============================================

-- The profiles table has 'role' column but queries are looking for 'user_role'
-- Create a view or function to handle the mapping, or update the service queries
-- For now, we'll note this needs to be fixed in the service layer

COMMENT ON COLUMN public.profiles.role IS 'User role (queries may reference as user_role)';

-- ===============================================
-- 3. ADD MISSING EVENTS TABLE COLUMNS
-- ===============================================

-- Add requires_tickets column if it doesn't exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS requires_tickets BOOLEAN DEFAULT true NOT NULL;

-- Add max_rsvps column if it doesn't exist (from your selected SQL)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_rsvps INTEGER;

-- Add rsvp_enabled column if it doesn't exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rsvp_enabled BOOLEAN DEFAULT false NOT NULL;

-- Add rsvp_deadline column if it doesn't exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rsvp_deadline TIMESTAMPTZ;

-- Add allow_waitlist column if it doesn't exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS allow_waitlist BOOLEAN DEFAULT false NOT NULL;

-- Add validation constraints
DO $$ 
BEGIN
    -- Add constraint for max_rsvps
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
    
    -- Add constraint that events must have either tickets OR rsvp enabled
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_event_has_tickets_or_rsvp' 
        AND table_name = 'events' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events 
        ADD CONSTRAINT check_event_has_tickets_or_rsvp 
        CHECK (requires_tickets = true OR rsvp_enabled = true);
    END IF;
END $$;

-- Add documentation comments
COMMENT ON COLUMN public.events.requires_tickets IS 'Whether this event requires paid tickets';
COMMENT ON COLUMN public.events.max_rsvps IS 'Maximum number of RSVPs allowed (null = unlimited)';
COMMENT ON COLUMN public.events.rsvp_enabled IS 'Whether RSVP is enabled for free events';
COMMENT ON COLUMN public.events.rsvp_deadline IS 'Deadline for RSVPs (null = until event start)';
COMMENT ON COLUMN public.events.allow_waitlist IS 'Whether to allow waitlist when max_rsvps is reached';

-- ===============================================
-- 4. CREATE IMAGES STORAGE BUCKET
-- ===============================================

-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- ===============================================
-- 5. CREATE SAMPLE EPIC RECORDS
-- ===============================================

-- Insert sample epics for testing (only if user exists)
DO $$
BEGIN
    -- Check if test user exists and insert sample epic progress
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = 'test-user-123') THEN
        INSERT INTO public.user_epic_progress (user_id, epic_id, progress, completed_at)
        VALUES 
            ('test-user-123', 'profile-setup', 100, NOW()),
            ('test-user-123', 'community-engagement', 75, NULL),
            ('test-user-123', 'business-verification', 50, NULL)
        ON CONFLICT (user_id, epic_id) DO NOTHING;
        
        RAISE NOTICE 'Sample epic progress created for test user';
    END IF;
END $$;

-- ===============================================
-- 6. UPDATE TRIGGER FOR USER_EPIC_PROGRESS
-- ===============================================

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_epic_progress_updated_at ON public.user_epic_progress;
CREATE TRIGGER update_user_epic_progress_updated_at
    BEFORE UPDATE ON public.user_epic_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 7. VERIFICATION QUERIES
-- ===============================================

-- Verify all tables and columns exist
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE SCHEMA FIX VERIFICATION';
    RAISE NOTICE '========================================';
    
    -- Check user_epic_progress table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_epic_progress') THEN
        RAISE NOTICE '✅ user_epic_progress table exists';
    ELSE
        RAISE NOTICE '❌ user_epic_progress table missing';
    END IF;
    
    -- Check events table columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'requires_tickets') THEN
        RAISE NOTICE '✅ events.requires_tickets column exists';
    ELSE
        RAISE NOTICE '❌ events.requires_tickets column missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'max_rsvps') THEN
        RAISE NOTICE '✅ events.max_rsvps column exists';
    ELSE
        RAISE NOTICE '❌ events.max_rsvps column missing';
    END IF;
    
    -- Check profiles table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        RAISE NOTICE '✅ profiles.role column exists (note: queries may reference as user_role)';
    ELSE
        RAISE NOTICE '❌ profiles.role column missing';
    END IF;
    
    -- Check storage bucket
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') THEN
        RAISE NOTICE '✅ images storage bucket exists';
    ELSE
        RAISE NOTICE '❌ images storage bucket missing';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCHEMA FIX COMPLETE';
    RAISE NOTICE '========================================';
END $$;

-- ===============================================
-- 8. ADDITIONAL NOTES FOR CODE FIXES
-- ===============================================

/*
CODE FIXES STILL NEEDED:

1. In bMADValidationService.ts line 224:
   Change: .select('user_role, full_name, email')
   To:     .select('role, full_name, email')
   
   Or create a computed column/view that aliases 'role' as 'user_role'

2. Verify all event queries use the new requires_tickets column correctly

3. Test that the images bucket works with the image upload services

4. The script includes sample data for test-user-123 - remove this for production
*/

COMMIT;