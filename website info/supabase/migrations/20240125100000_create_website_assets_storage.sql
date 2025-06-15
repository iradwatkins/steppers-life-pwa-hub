-- Create website-assets storage bucket for image management
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'website-assets',
  'website-assets',
  true,
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'],
  10485760  -- 10MB in bytes
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS for the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for admins to upload/manage all website assets
CREATE POLICY "Admins can upload website assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'website-assets' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update website assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'website-assets' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete website assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'website-assets' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy for public read access to website assets
CREATE POLICY "Website assets are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'website-assets');

-- Policy for authenticated users to view their own uploads
CREATE POLICY "Users can view their uploaded website assets" ON storage.objects
FOR SELECT USING (
  bucket_id = 'website-assets' AND 
  owner = auth.uid()
); 