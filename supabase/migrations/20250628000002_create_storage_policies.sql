-- CREATE STORAGE POLICIES MIGRATION
-- Production migration to create storage policies for image uploads
-- Executed via GitHub → Supabase integration with elevated privileges

-- ===================================================================
-- PRODUCTION SAFETY CHECK
-- ===================================================================

DO $$ 
BEGIN
    RAISE NOTICE 'PRODUCTION MIGRATION: Creating storage policies';
    RAISE NOTICE 'Migration: 20250628000002_create_storage_policies';
    RAISE NOTICE 'Timestamp: %', NOW();
END $$;

-- ===================================================================
-- STEP 1: ENABLE ROW LEVEL SECURITY
-- ===================================================================

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 2: DROP EXISTING POLICIES (SAFE CLEANUP)
-- ===================================================================

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner can update" ON storage.objects;
DROP POLICY IF EXISTS "Owner can delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage all" ON storage.objects;

-- ===================================================================
-- STEP 3: CREATE PRODUCTION STORAGE POLICIES
-- ===================================================================

-- Policy 1: Public read access for all images
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
USING (
    bucket_id = 'images' 
    AND (
        auth.uid()::text = owner 
        OR auth.uid()::text = owner::text
        OR auth.uid() = owner::uuid
    )
);

-- Policy 4: Users can delete their own images
CREATE POLICY "Owner can delete" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
    bucket_id = 'images' 
    AND (
        auth.uid()::text = owner 
        OR auth.uid()::text = owner::text
        OR auth.uid() = owner::uuid
    )
);

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
-- STEP 4: GRANT STORAGE PERMISSIONS
-- ===================================================================

-- Grant necessary permissions to roles
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT SELECT ON storage.buckets TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- ===================================================================
-- STEP 5: PRODUCTION VERIFICATION
-- ===================================================================

-- Verify storage policies were created
SELECT 
    'PRODUCTION STORAGE POLICIES:' as info,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- List all active storage policies
SELECT 
    'ACTIVE POLICIES:' as info,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Verify RLS is enabled
SELECT 
    'RLS VERIFICATION:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check bucket configuration
SELECT 
    'BUCKET VERIFICATION:' as info,
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets
WHERE id = 'images';

-- ===================================================================
-- STEP 6: SUCCESS CONFIRMATION
-- ===================================================================

SELECT 
    'PRODUCTION STORAGE POLICIES MIGRATION COMPLETE' as status,
    NOW() as completed_at,
    'All storage policies created successfully' as result,
    'Image uploads should now work in production application' as next_step;