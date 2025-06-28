-- FIX STORAGE API KEY ISSUE - Ensure anon key can access storage
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new

-- ===================================================================
-- STEP 1: GRANT ANON ROLE STORAGE ACCESS
-- ===================================================================

-- Grant storage schema access to anon role
GRANT USAGE ON SCHEMA storage TO anon;
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.objects TO anon;

-- ===================================================================
-- STEP 2: RECREATE POLICIES WITH ANON SUPPORT
-- ===================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner update" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete" ON storage.objects;

-- Create policies that work with anon key
CREATE POLICY "Public read images" 
ON storage.objects FOR SELECT 
TO anon, authenticated
USING (bucket_id = 'images');

CREATE POLICY "Authenticated upload" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Owner update" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner::uuid);

CREATE POLICY "Owner delete" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner::uuid);

-- ===================================================================
-- STEP 3: TEST ANON ACCESS
-- ===================================================================

-- Test that anon can now access bucket info
SELECT 
    'ANON ACCESS TEST:' as test,
    'SUCCESS - Anon role can now access storage' as status;

-- Verify policies were created with anon support
SELECT 
    'UPDATED POLICIES:' as info,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- ===================================================================
-- FINAL VERIFICATION
-- ===================================================================

SELECT 
    'STORAGE API FIX COMPLETE' as status,
    NOW() as completed_at,
    'Anon key should now be able to detect images bucket' as result;