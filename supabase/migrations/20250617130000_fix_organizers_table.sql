-- Fix organizers table and RLS policies
-- This migration ensures the organizers table has the profile_picture_url column and proper policies

-- Add profile_picture_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organizers' AND column_name = 'profile_picture_url') THEN
    ALTER TABLE public.organizers ADD COLUMN profile_picture_url TEXT;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all organizers" ON public.organizers;
DROP POLICY IF EXISTS "Users can create their own organizer profile" ON public.organizers;
DROP POLICY IF EXISTS "Users can update their own organizer profile" ON public.organizers;
DROP POLICY IF EXISTS "Admins can manage all organizers" ON public.organizers;

-- Create comprehensive RLS policies for organizers
CREATE POLICY "Users can view all organizers" ON public.organizers
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own organizer profile" ON public.organizers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizer profile" ON public.organizers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all organizers" ON public.organizers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Ensure profiles table has proper policies for role checking
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT ON public.organizers TO anon, authenticated;
GRANT INSERT, UPDATE ON public.organizers TO authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_organizers_user_id ON public.organizers(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);