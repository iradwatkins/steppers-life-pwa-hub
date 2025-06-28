-- CREATE STORAGE POLICIES - Production Ready
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new
-- This creates the necessary storage policies for image uploads

-- ===================================================================
-- STEP 1: ENSURE RLS IS ENABLED
-- ===================================================================

-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 2: CREATE STORAGE POLICIES
-- ===================================================================

-- Policy 1: Public can view all images
CREATE POLICY "Public can view images" 
ON storage.objects FOR SELECT 
TO public
USING (bucket_id = 'images');

-- Policy 2: Authenticated users can upload images
CREATE POLICY "Authenticated upload" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy 3: Users can update their own images
CREATE POLICY "Owner can update" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = owner);

-- Policy 4: Users can delete their own images
CREATE POLICY "Owner can delete" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = owner);

-- Policy 5: Admin users can manage all images
CREATE POLICY "Admin can manage all" 
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
-- STEP 3: VERIFICATION
-- ===================================================================

-- List all storage policies
SELECT 
    'STORAGE POLICIES CREATED:' as info,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Count policies
SELECT 
    'POLICY COUNT:' as info,
    COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check RLS status
SELECT 
    'RLS STATUS:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- ===================================================================
-- FINAL STATUS
-- ===================================================================

SELECT 
    'STORAGE POLICIES COMPLETE' as status,
    NOW() as completed_at,
    'Image uploads should now work in production' as result;