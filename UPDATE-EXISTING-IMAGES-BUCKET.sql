-- UPDATE EXISTING IMAGES BUCKET - Don't delete, just update
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new

-- Update the existing images bucket configuration
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY[
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif', 
        'image/webp', 
        'image/svg+xml', 
        'image/bmp'
    ],
    updated_at = NOW()
WHERE id = 'images';

-- Verify bucket configuration
SELECT 
    'BUCKET UPDATED:' as status,
    id,
    name,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as mime_count
FROM storage.buckets
WHERE id = 'images';

-- Check how many images exist
SELECT 
    'EXISTING IMAGES:' as info,
    COUNT(*) as image_count
FROM storage.objects
WHERE bucket_id = 'images';