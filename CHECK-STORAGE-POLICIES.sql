-- CHECK STORAGE POLICIES - Verify policies exist
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new

-- List all storage policies
SELECT 
    'STORAGE POLICIES:' as info,
    policyname,
    cmd as operation,
    roles,
    qual as condition
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Count policies
SELECT 
    'POLICY COUNT:' as info,
    COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check if specific policies exist
SELECT 
    'REQUIRED POLICIES CHECK:' as info,
    CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read images' AND tablename = 'objects' AND schemaname = 'storage') THEN 'EXISTS' ELSE 'MISSING' END as public_read,
    CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated upload' AND tablename = 'objects' AND schemaname = 'storage') THEN 'EXISTS' ELSE 'MISSING' END as auth_upload;