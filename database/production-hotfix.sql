-- PRODUCTION HOTFIX for SteppersLife Database Issues
-- Run this in Supabase SQL Editor to fix immediate production problems

-- 1. Add profile_picture_url column if missing
ALTER TABLE public.organizers 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

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

-- 5. Grant proper permissions
GRANT SELECT ON public.organizers TO anon, authenticated;
GRANT INSERT, UPDATE ON public.organizers TO authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- 6. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_organizers_user_id ON public.organizers(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 7. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizers' 
  AND table_schema = 'public'
ORDER BY ordinal_position;