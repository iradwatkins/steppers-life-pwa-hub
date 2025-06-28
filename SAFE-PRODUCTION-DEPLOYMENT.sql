-- SAFE PRODUCTION DEPLOYMENT SCRIPT
-- Execute this in production Supabase dashboard SQL editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new
--
-- This script PRESERVES existing data and images
-- Safe for production environments with existing content

-- ===================================================================
-- SECTION 1: SAFE STORAGE SETUP (PRESERVE EXISTING DATA)
-- ===================================================================

-- Check current storage state
SELECT 
    'PRODUCTION - Current buckets:' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY created_at;

-- Check if images bucket exists and what's in it
SELECT 
    'EXISTING IMAGES COUNT:' as info,
    COUNT(*) as image_count
FROM storage.objects 
WHERE bucket_id = 'images';

-- Drop any conflicting policies ONLY (preserve bucket and data)
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public access to profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to event images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update images they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images they own" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all images" ON storage.objects;

-- CREATE images bucket ONLY if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'images',
      'images',
      true,
      52428800, -- 50MB limit
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
    );
    RAISE NOTICE 'Created new images bucket';
  ELSE
    -- Update existing bucket settings to ensure proper configuration
    UPDATE storage.buckets 
    SET 
      public = true,
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
    WHERE id = 'images';
    RAISE NOTICE 'Updated existing images bucket configuration';
  END IF;
END $$;

-- Create comprehensive RLS policies for production
CREATE POLICY "Public can view all images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update images they own" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images'
  AND auth.uid() = owner::uuid
);

CREATE POLICY "Users can delete images they own" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images'
  AND auth.uid() = owner::uuid
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT SELECT ON storage.buckets TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- SECTION 2: SAFE ROLE CONSOLIDATION
-- ===================================================================

-- Check current role distribution before changes
SELECT 
    'BEFORE ROLE CONSOLIDATION:' as info,
    role,
    COUNT(*) as user_count
FROM public.profiles 
GROUP BY role
ORDER BY role;

-- Update all users with super_admin role to admin role (safe operation)
UPDATE public.profiles 
SET role = 'admin'::user_role 
WHERE role = 'super_admin'::user_role;

-- Drop policies that depend on the role column (safe to recreate)
DROP POLICY IF EXISTS "Admins can manage all organizers" ON public.organizers;
DROP POLICY IF EXISTS "Users can view all organizers" ON public.organizers;
DROP POLICY IF EXISTS "Users can create their own organizer profile" ON public.organizers;
DROP POLICY IF EXISTS "Users can update their own organizer profile" ON public.organizers;
DROP POLICY IF EXISTS "Admin users can manage content" ON public.content_pages;
DROP POLICY IF EXISTS "Admin users can manage content versions" ON public.content_page_versions;
DROP POLICY IF EXISTS "Admin users can manage categories" ON public.platform_categories;
DROP POLICY IF EXISTS "Admin users can manage settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admin users can manage VOD config" ON public.vod_configuration;
DROP POLICY IF EXISTS "Admin users can manage pickup locations" ON public.pickup_locations;
DROP POLICY IF EXISTS "Admin users can read audit log" ON public.configuration_audit_log;
DROP POLICY IF EXISTS "Admins can view all analytics sessions" ON public.web_analytics_sessions;
DROP POLICY IF EXISTS "Admins can view all page views" ON public.web_analytics_page_views;
DROP POLICY IF EXISTS "Admins can view all instructor profiles" ON public.instructor_profiles;
DROP POLICY IF EXISTS "Admins can view all performance metrics" ON public.instructor_performance_metrics;
DROP POLICY IF EXISTS "Admins can manage inventory audit logs" ON public.inventory_audit_logs;
DROP POLICY IF EXISTS "Admins can manage all follower permissions" ON public.follower_sales_permissions;
DROP POLICY IF EXISTS "Admins can manage all follower commissions" ON public.follower_commissions;

-- Safe enum update - only proceed if super_admin exists
DO $$ 
BEGIN
  -- Check if super_admin exists in current enum
  IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin' AND enumtypid = 'user_role'::regtype) THEN
    -- Create new enum without super_admin
    CREATE TYPE user_role_new AS ENUM ('user', 'organizer', 'admin');
    
    -- Update the profiles table to use the new enum
    ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
    
    ALTER TABLE public.profiles 
    ALTER COLUMN role TYPE user_role_new 
    USING (
      CASE 
        WHEN role::text = 'super_admin' THEN 'admin'::user_role_new
        WHEN role::text = 'admin' THEN 'admin'::user_role_new  
        WHEN role::text = 'organizer' THEN 'organizer'::user_role_new
        ELSE 'user'::user_role_new
      END
    );
    
    -- Restore the default after type change
    ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user'::user_role_new;
    
    -- Drop the old enum and rename the new one
    DROP TYPE user_role;
    ALTER TYPE user_role_new RENAME TO user_role;
    
    RAISE NOTICE 'Role enum updated - removed super_admin';
  ELSE
    RAISE NOTICE 'Role enum already consolidated - no super_admin found';
  END IF;
END $$;

-- ===================================================================
-- SECTION 3: RECREATE ADMIN POLICIES
-- ===================================================================

-- Organizer policies
CREATE POLICY "Users can view all organizers" ON public.organizers
FOR SELECT USING (true);

CREATE POLICY "Users can create their own organizer profile" ON public.organizers
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizer profile" ON public.organizers
FOR UPDATE USING (auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all organizers" ON public.organizers
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Content management policies (create if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_pages') THEN
    CREATE POLICY "Admin users can manage content" ON public.content_pages
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_page_versions') THEN
    CREATE POLICY "Admin users can manage content versions" ON public.content_page_versions
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_categories') THEN
    CREATE POLICY "Admin users can manage categories" ON public.platform_categories
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_settings') THEN
    CREATE POLICY "Admin users can manage settings" ON public.platform_settings
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- ===================================================================
-- SECTION 4: BMAD FOLLOWER SYSTEM (Safe Check)
-- ===================================================================

-- Check if BMAD system exists and create notice
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follower_sales_permissions') THEN
    RAISE NOTICE 'BMAD follower system not found. Please run the full BMAD migration separately.';
  ELSE
    RAISE NOTICE 'BMAD follower system already exists.';
  END IF;
END $$;

-- ===================================================================
-- SECTION 5: TEAM MEMBER PERMISSIONS (Safe Add)
-- ===================================================================

-- Add team member permissions only if BMAD table exists and columns don't exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follower_sales_permissions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'follower_sales_permissions' 
                   AND column_name = 'is_team_member') THEN
      
      ALTER TABLE public.follower_sales_permissions 
      ADD COLUMN is_team_member BOOLEAN DEFAULT false;
      
      ALTER TABLE public.follower_sales_permissions 
      ADD COLUMN can_scan_qr_codes BOOLEAN DEFAULT false;
      
      -- Add constraint to ensure QR scanning is only for team members
      ALTER TABLE public.follower_sales_permissions 
      ADD CONSTRAINT check_qr_scanning_team_only 
      CHECK (
        (can_scan_qr_codes = false) OR 
        (can_scan_qr_codes = true AND is_team_member = true)
      );
      
      RAISE NOTICE 'Team member permissions added successfully.';
    ELSE
      RAISE NOTICE 'Team member permissions already exist.';
    END IF;
  ELSE
    RAISE NOTICE 'BMAD follower table not found - skipping team member permissions.';
  END IF;
END $$;

-- ===================================================================
-- SECTION 6: EVENT TYPES (Safe Add)
-- ===================================================================

-- Add event_type column to events table if it doesn't exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' 
                   AND column_name = 'event_type') THEN
      
      -- Create enum for event types
      CREATE TYPE event_type AS ENUM ('simple', 'ticketed', 'premium');
      
      -- Add event_type column
      ALTER TABLE public.events 
      ADD COLUMN event_type event_type DEFAULT 'simple';
      
      RAISE NOTICE 'Event types added successfully.';
    ELSE
      RAISE NOTICE 'Event types already exist.';
    END IF;
  ELSE
    RAISE NOTICE 'Events table not found - skipping event types.';
  END IF;
END $$;

-- ===================================================================
-- SECTION 7: ADMIN POLICIES FOR STORAGE
-- ===================================================================

-- Add admin policy for storage management
CREATE POLICY "Admins can manage all images" ON storage.objects
FOR ALL USING (
  bucket_id = 'images'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- ===================================================================
-- SECTION 8: PRODUCTION VERIFICATION
-- ===================================================================

-- Verify storage setup
SELECT 
    'PRODUCTION VERIFICATION - Storage:' as check_type,
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets
WHERE id = 'images';

-- Count existing images (should be preserved)
SELECT 
    'PRODUCTION VERIFICATION - Existing Images:' as check_type,
    COUNT(*) as preserved_images
FROM storage.objects 
WHERE bucket_id = 'images';

-- Verify role consolidation
SELECT 
    'PRODUCTION VERIFICATION - Roles:' as check_type,
    role,
    COUNT(*) as user_count
FROM public.profiles 
GROUP BY role
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'organizer' THEN 2 
        WHEN 'user' THEN 3 
    END;

-- Verify policies count
SELECT 
    'PRODUCTION VERIFICATION - Storage Policies:' as check_type,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Verify BMAD system (if exists)
SELECT 
    'PRODUCTION VERIFICATION - BMAD Tables:' as check_type,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name IN (
    'follower_sales_permissions',
    'follower_trackable_links', 
    'follower_sales_attribution',
    'follower_commissions'
);

-- Final status
SELECT 
    'SAFE PRODUCTION DEPLOYMENT COMPLETE' as status,
    NOW() as completed_at,
    'All existing data preserved - Image uploads should now work' as next_step;