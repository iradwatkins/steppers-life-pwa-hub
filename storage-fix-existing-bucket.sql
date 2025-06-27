-- STORAGE FIX FOR EXISTING BUCKET
-- This script fixes policies for an existing images bucket

-- Step 1: Check what buckets currently exist
SELECT 
    'Current buckets:' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY created_at;

-- Step 2: Drop any existing conflicting policies
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public access to profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to event images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;

-- Step 3: Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'images',
  'images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'images'
);

-- Step 4: Update existing bucket settings if it exists
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
WHERE id = 'images';

-- Step 5: Create comprehensive RLS policies
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

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT SELECT ON storage.buckets TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- Step 7: Verify the setup
SELECT 
    'Verification - Final bucket state:' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'images';

SELECT 
    'Verification - RLS policies:' as info,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE '%image%';