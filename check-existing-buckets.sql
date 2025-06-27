-- Check what buckets actually exist in production
SELECT 
    'All existing buckets:' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
ORDER BY created_at;

-- Check if there are any files in storage
SELECT 
    'Existing files count by bucket:' as info,
    bucket_id,
    COUNT(*) as file_count
FROM storage.objects
GROUP BY bucket_id;

-- Show sample file paths to understand the structure
SELECT 
    'Sample file paths:' as info,
    bucket_id,
    name,
    created_at
FROM storage.objects
ORDER BY created_at DESC
LIMIT 10;