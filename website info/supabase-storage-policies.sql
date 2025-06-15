-- Supabase Storage Policies for SteppersLife
-- Run this in Supabase SQL Editor after creating the 'uploads' bucket

-- Policy 1: Allow anyone to view/download public files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

-- Policy 2: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
);

-- Policy 3: Allow users to update their own uploaded files
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow users to delete their own files or admins to delete any
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE 
USING (
    bucket_id = 'uploads' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
);

-- Policy 5: Allow public access to bucket itself
CREATE POLICY "Anyone can view bucket" ON storage.buckets FOR SELECT USING (id = 'uploads');