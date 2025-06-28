-- CREATE MISSING STORAGE POLICIES - Direct SQL approach
-- Execute this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new

-- Enable RLS first (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create the missing storage policies directly
CREATE POLICY "Public read images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Authenticated upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Owner update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images' AND auth.uid()::text = owner);

CREATE POLICY "Owner delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images' AND auth.uid()::text = owner);

-- Verify policies were created
SELECT 
    'POLICIES CREATED:' as info,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Final verification
SELECT 
    'FINAL CHECK:' as info,
    COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';