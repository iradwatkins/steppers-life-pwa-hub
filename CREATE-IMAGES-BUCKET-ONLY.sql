-- CREATE IMAGES BUCKET - Simple bucket creation only
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new
-- This only creates the bucket - no policies to avoid permission errors

-- ===================================================================
-- STEP 1: CREATE IMAGES BUCKET
-- ===================================================================

-- Insert images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
    'images',
    'images',
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images');

-- ===================================================================
-- STEP 2: VERIFICATION
-- ===================================================================

-- Check bucket was created
SELECT 
    'BUCKET CREATED:' as info,
    id,
    name,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as mime_count
FROM storage.buckets
WHERE id = 'images';

-- Final status
SELECT 
    'IMAGES BUCKET READY' as status,
    NOW() as completed_at;