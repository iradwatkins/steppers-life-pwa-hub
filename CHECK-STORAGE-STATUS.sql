-- CHECK STORAGE STATUS - Verify what exists in production
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new

-- ===================================================================
-- STEP 1: CHECK ALL BUCKETS
-- ===================================================================

-- List all existing buckets
SELECT 
    'ALL BUCKETS:' as info,
    id,
    name,
    public,
    file_size_limit,
    created_at
FROM storage.buckets
ORDER BY created_at;

-- ===================================================================
-- STEP 2: CHECK FOR IMAGES BUCKET SPECIFICALLY
-- ===================================================================

-- Check if images bucket exists
SELECT 
    'IMAGES BUCKET CHECK:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') 
        THEN 'IMAGES BUCKET EXISTS' 
        ELSE 'IMAGES BUCKET NOT FOUND' 
    END as status;

-- ===================================================================
-- STEP 3: CHECK STORAGE POLICIES
-- ===================================================================

-- List all storage policies
SELECT 
    'STORAGE POLICIES:' as info,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- List policy names
SELECT 
    'POLICY DETAILS:' as info,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- ===================================================================
-- STEP 4: CHECK RLS STATUS
-- ===================================================================

-- Check if RLS is enabled on storage.objects
SELECT 
    'RLS STATUS:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';