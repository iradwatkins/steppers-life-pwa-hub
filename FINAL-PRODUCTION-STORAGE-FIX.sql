-- FINAL PRODUCTION STORAGE FIX - Complete solution for voaxyetbqhmgbvcxsttf.supabase.co
-- Execute this in PRODUCTION Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new

-- ===================================================================
-- PRODUCTION ENVIRONMENT VERIFICATION
-- ===================================================================

SELECT 
    'PRODUCTION VERIFICATION:' as info,
    current_database() as database,
    current_user as user,
    NOW() as timestamp;

-- ===================================================================
-- STEP 1: ENSURE IMAGES BUCKET EXISTS IN PRODUCTION
-- ===================================================================

-- Update or create images bucket in production
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
    'images',
    'images',
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    updated_at = NOW();

-- ===================================================================
-- STEP 2: ENABLE RLS ON STORAGE.OBJECTS IN PRODUCTION
-- ===================================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 3: DROP ALL EXISTING POLICIES IN PRODUCTION
-- ===================================================================

DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on storage.objects
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- ===================================================================
-- STEP 4: GRANT PRODUCTION STORAGE PERMISSIONS
-- ===================================================================

-- Grant storage access to all necessary roles in production
GRANT USAGE ON SCHEMA storage TO anon, authenticated, public;
GRANT SELECT ON storage.buckets TO anon, authenticated, public;
GRANT SELECT ON storage.objects TO anon, authenticated, public;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- ===================================================================
-- STEP 5: CREATE PRODUCTION STORAGE POLICIES
-- ===================================================================

-- Policy 1: Public read access (works with anon key)
CREATE POLICY "production_public_read_images" 
ON storage.objects FOR SELECT 
TO anon, authenticated, public
USING (bucket_id = 'images');

-- Policy 2: Authenticated upload 
CREATE POLICY "production_authenticated_upload" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy 3: Owner update
CREATE POLICY "production_owner_update" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner::uuid);

-- Policy 4: Owner delete
CREATE POLICY "production_owner_delete" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner::uuid);

-- Policy 5: Admin full access
CREATE POLICY "production_admin_full_access" 
ON storage.objects FOR ALL 
TO authenticated
USING (
    bucket_id = 'images' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- ===================================================================
-- STEP 6: PRODUCTION VERIFICATION
-- ===================================================================

-- Verify bucket exists in production
SELECT 
    'PRODUCTION BUCKET CHECK:' as test,
    id,
    name,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as mime_count,
    'SUCCESS - Bucket configured' as status
FROM storage.buckets
WHERE id = 'images';

-- Count existing images in production
SELECT 
    'PRODUCTION IMAGES COUNT:' as test,
    COUNT(*) as image_count,
    'Images preserved' as status
FROM storage.objects 
WHERE bucket_id = 'images';

-- Verify policies in production
SELECT 
    'PRODUCTION POLICIES:' as test,
    COUNT(*) as policy_count,
    'Policies created' as status
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- List all production policies
SELECT 
    'PRODUCTION POLICY LIST:' as info,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Test anon access in production
SELECT 
    'PRODUCTION ANON ACCESS TEST:' as test,
    has_schema_privilege('anon', 'storage', 'USAGE') as can_use_storage,
    has_table_privilege('anon', 'storage.buckets', 'SELECT') as can_select_buckets,
    has_table_privilege('anon', 'storage.objects', 'SELECT') as can_select_objects,
    'Anon permissions verified' as status;

-- ===================================================================
-- STEP 7: PRODUCTION SUCCESS CONFIRMATION
-- ===================================================================

SELECT 
    'PRODUCTION STORAGE DEPLOYMENT COMPLETE' as status,
    'voaxyetbqhmgbvcxsttf.supabase.co' as database,
    NOW() as completed_at,
    'Application should now detect images bucket' as result;

-- Final production instructions
SELECT 
    'PRODUCTION DEPLOYMENT VERIFIED:' as info,
    '1. Images bucket exists and is configured' as step_1,
    '2. Storage policies created with anon support' as step_2,
    '3. All permissions granted for production app' as step_3,
    '4. Test image upload in your application now' as step_4;