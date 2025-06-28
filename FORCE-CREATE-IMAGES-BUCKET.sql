-- FORCE CREATE IMAGES BUCKET - Guaranteed bucket creation
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new

-- Delete existing images bucket if it exists (start fresh)
DELETE FROM storage.buckets WHERE id = 'images';

-- Create images bucket from scratch
INSERT INTO storage.buckets (
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    created_at,
    updated_at
) VALUES (
    'images',
    'images', 
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    NOW(),
    NOW()
);

-- Verify bucket was created
SELECT 
    'BUCKET CREATED:' as status,
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets
WHERE id = 'images';