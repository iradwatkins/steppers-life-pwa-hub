-- SIMPLE STORAGE RESTORE - Return to basic working state
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new

-- ===================================================================
-- STEP 1: DISABLE RLS (RETURN TO ORIGINAL STATE)
-- ===================================================================

-- Disable Row Level Security to restore original functionality
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 2: ENSURE BUCKET IS CONFIGURED
-- ===================================================================

-- Update images bucket to ensure it's public and properly configured
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY[
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif', 
        'image/webp', 
        'image/svg+xml', 
        'image/bmp'
    ]
WHERE id = 'images';

-- ===================================================================
-- STEP 3: GRANT BASIC PERMISSIONS
-- ===================================================================

-- Grant basic storage access to all roles
GRANT USAGE ON SCHEMA storage TO anon, authenticated, public;
GRANT SELECT ON storage.buckets TO anon, authenticated, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon, public;

-- ===================================================================
-- STEP 4: VERIFICATION
-- ===================================================================

-- Verify RLS is disabled
SELECT 
    'RLS STATUS:' as check,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN 'SUCCESS - RLS disabled'
        ELSE 'ISSUE - RLS still enabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Verify bucket configuration
SELECT 
    'BUCKET STATUS:' as check,
    id,
    name,
    public,
    file_size_limit,
    CASE 
        WHEN public = true THEN 'SUCCESS - Bucket is public'
        ELSE 'ISSUE - Bucket not public'
    END as status
FROM storage.buckets
WHERE id = 'images';

-- Count existing images
SELECT 
    'IMAGE COUNT:' as check,
    COUNT(*) as total_images,
    'Images preserved' as status
FROM storage.objects 
WHERE bucket_id = 'images';

-- ===================================================================
-- FINAL STATUS
-- ===================================================================

SELECT 
    'SIMPLE STORAGE RESTORE COMPLETE' as status,
    'RLS disabled - back to original working state' as result,
    'Test your application now - should work like before' as instruction;