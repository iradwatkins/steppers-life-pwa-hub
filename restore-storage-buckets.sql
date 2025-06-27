-- EMERGENCY STORAGE BUCKET RESTORATION  
-- This fixes the 'images' bucket permissions to restore image uploads
-- Run this in your Supabase SQL Editor immediately

BEGIN;

-- Step 1: Check if bucket exists, create if missing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB limit (matches imageUploadService expectations)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Step 3: Drop any existing conflicting policies
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update images they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images they own" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Step 4: Create RLS policies that match the working configuration
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

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT SELECT ON storage.buckets TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

COMMIT;

-- Verify the restoration
SELECT 
    'Images bucket restored successfully!' as message,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'images';