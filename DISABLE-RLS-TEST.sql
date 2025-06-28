-- DISABLE RLS TEST - Return to original working state
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new
--
-- This disables RLS to test if that was the root cause

-- ===================================================================
-- STEP 1: VERIFY CURRENT STATE
-- ===================================================================

-- Check if RLS is currently enabled
SELECT 
    'CURRENT RLS STATUS:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check current policies (these will be ignored when RLS is disabled)
SELECT 
    'CURRENT POLICIES:' as info,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ===================================================================
-- STEP 2: DISABLE RLS (BACK TO BASICS)
-- ===================================================================

-- This should restore original functionality
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 3: VERIFY BUCKET EXISTS
-- ===================================================================

-- Check bucket configuration
SELECT 
    'BUCKET CHECK:' as info,
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets
WHERE id = 'images';

-- ===================================================================
-- STEP 4: TEST BASIC ACCESS
-- ===================================================================

-- Test if we can now see objects (should work with RLS disabled)
SELECT 
    'BASIC ACCESS TEST:' as info,
    COUNT(*) as object_count,
    'RLS disabled - should be accessible' as status
FROM storage.objects 
WHERE bucket_id = 'images';

-- ===================================================================
-- STEP 5: CONFIRMATION
-- ===================================================================

SELECT 
    'RLS DISABLED TEST COMPLETE' as status,
    'Test your application now - image upload should work' as instruction,
    'If this works, the issue was RLS policies' as conclusion;