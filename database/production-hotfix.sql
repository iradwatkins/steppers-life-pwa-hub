-- PRODUCTION HOTFIX for SteppersLife Database Issues
-- Run this in Supabase SQL Editor to fix immediate production problems

-- 1. Add profile_picture_path column for Supabase Storage (not URL)
ALTER TABLE public.organizers 
ADD COLUMN IF NOT EXISTS profile_picture_path TEXT;

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for image uploads
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

CREATE POLICY "Users can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. Ensure RLS is properly configured
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Fix organizers table RLS policies
DROP POLICY IF EXISTS "Users can view all organizers" ON public.organizers;
DROP POLICY IF EXISTS "Users can create their own organizer profile" ON public.organizers;
DROP POLICY IF EXISTS "Users can update their own organizer profile" ON public.organizers;

CREATE POLICY "Users can view all organizers" ON public.organizers
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own organizer profile" ON public.organizers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizer profile" ON public.organizers
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Fix profiles table RLS policies  
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Fix events table RLS policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
DROP POLICY IF EXISTS "Organizers can manage own events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can create venues" ON public.venues;
DROP POLICY IF EXISTS "Anyone can view ticket types" ON public.ticket_types;
DROP POLICY IF EXISTS "Authenticated users can create ticket types" ON public.ticket_types;

-- Events: Public can view published events, organizers can manage their own
CREATE POLICY "Anyone can view published events" ON public.events
  FOR SELECT USING (status = 'published' OR status = 'draft');

CREATE POLICY "Organizers can manage own events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organizers 
      WHERE organizers.id = events.organizer_id 
      AND organizers.user_id = auth.uid()
    )
  );

-- Venues: Anyone can view venues, authenticated users can create venues
CREATE POLICY "Anyone can view venues" ON public.venues
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create venues" ON public.venues
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Ticket types: Anyone can view ticket types, authenticated users can create ticket types
CREATE POLICY "Anyone can view ticket types" ON public.ticket_types
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create ticket types" ON public.ticket_types
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Grant proper permissions
GRANT SELECT ON public.organizers TO anon, authenticated;
GRANT INSERT, UPDATE ON public.organizers TO authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE ON public.events TO authenticated;
GRANT SELECT ON public.venues TO anon, authenticated;
GRANT INSERT, UPDATE ON public.venues TO authenticated;
GRANT SELECT ON public.ticket_types TO anon, authenticated;
GRANT INSERT, UPDATE ON public.ticket_types TO authenticated;

-- 7. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_organizers_user_id ON public.organizers(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 8. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizers' 
  AND table_schema = 'public'
ORDER BY ordinal_position;