-- TEST STORAGE POLICIES - Verify policies are working correctly
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new

-- ===================================================================
-- STEP 1: TEST BASIC BUCKET ACCESS
-- ===================================================================

-- Test if current user can read from images bucket
SELECT 
    'BUCKET READ TEST:' as test,
    COUNT(*) as image_count,
    'SUCCESS - Can read bucket' as status
FROM storage.objects 
WHERE bucket_id = 'images';

-- ===================================================================
-- STEP 2: TEST POLICY CONFIGURATION  
-- ===================================================================

-- List all policies on storage.objects to verify they exist
SELECT 
    'POLICY LIST:' as test,
    policyname,
    cmd as operation,
    roles as target_roles,
    qual as condition
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- ===================================================================
-- STEP 3: TEST SPECIFIC POLICY CONDITIONS
-- ===================================================================

-- Test if public read policy is working
SELECT 
    'PUBLIC READ POLICY TEST:' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE policyname = 'Public read images' 
            AND tablename = 'objects' 
            AND schemaname = 'storage'
            AND cmd = 'SELECT'
        ) 
        THEN 'EXISTS - Public read policy found'
        ELSE 'MISSING - Public read policy not found'
    END as status;

-- Test if authenticated upload policy is working
SELECT 
    'AUTH UPLOAD POLICY TEST:' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE policyname = 'Authenticated upload' 
            AND tablename = 'objects' 
            AND schemaname = 'storage'
            AND cmd = 'INSERT'
        ) 
        THEN 'EXISTS - Auth upload policy found'
        ELSE 'MISSING - Auth upload policy not found'
    END as status;

-- ===================================================================
-- STEP 4: TEST BUCKET CONFIGURATION
-- ===================================================================

-- Verify bucket is properly configured
SELECT 
    'BUCKET CONFIG TEST:' as test,
    id,
    name,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as mime_types_count,
    CASE 
        WHEN public = true THEN 'SUCCESS - Bucket is public'
        ELSE 'ISSUE - Bucket not public'
    END as public_status
FROM storage.buckets
WHERE id = 'images';

-- ===================================================================
-- STEP 5: FINAL DIAGNOSIS
-- ===================================================================

SELECT 
    'FINAL DIAGNOSIS:' as summary,
    'If all tests show SUCCESS, the issue is likely with API keys or RLS context' as next_step,
    'If any test shows MISSING/ISSUE, policies need to be recreated' as alternative;