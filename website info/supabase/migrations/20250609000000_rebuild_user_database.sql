-- COMPLETE USER DATABASE REBUILD
-- This migration completely rebuilds the user authentication system from scratch
-- Run this to fix admin login issues and ensure clean user management

-- ========================================
-- STEP 1: CLEAN UP EXISTING STRUCTURES
-- ========================================

-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_update() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admins to modify user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admins to delete user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow user to manage their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow user to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to delete profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.user_profiles;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_user_profiles_user_id;
DROP INDEX IF EXISTS idx_user_profiles_email;
DROP INDEX IF EXISTS idx_user_roles_user_id;
DROP INDEX IF EXISTS idx_user_roles_profile_id;
DROP INDEX IF EXISTS idx_user_roles_role;

-- Drop existing tables (CASCADE to handle dependencies)
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop the app_role enum if it exists
DROP TYPE IF EXISTS public.app_role CASCADE;

-- ========================================
-- STEP 2: CREATE CLEAN ENUM TYPES
-- ========================================

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM (
    'buyer',
    'organizer', 
    'instructor',
    'admin',
    'event_staff',
    'sales_agent'
);

-- Create enum for user status
CREATE TYPE public.user_status AS ENUM (
    'active',
    'pending_approval',
    'suspended',
    'deactivated'
);

-- ========================================
-- STEP 3: CREATE CLEAN TABLE STRUCTURES
-- ========================================

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status public.user_status DEFAULT 'active'::public.user_status,
    phone VARCHAR(20),
    address TEXT,
    bio TEXT,
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Constraints
    CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id),
    CONSTRAINT user_profiles_email_unique UNIQUE (email),
    CONSTRAINT user_profiles_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create user_roles table  
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'buyer'::public.app_role,
    is_primary BOOLEAN DEFAULT true,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Constraints
    CONSTRAINT user_roles_user_profile_role_unique UNIQUE (user_id, profile_id, role),
    CONSTRAINT user_roles_one_primary_per_user EXCLUDE (user_id WITH =) WHERE (is_primary = true)
);

-- ========================================
-- STEP 4: CREATE OPTIMIZED INDEXES
-- ========================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

-- User roles indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_profile_id ON public.user_roles(profile_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_is_primary ON public.user_roles(is_primary);
CREATE INDEX idx_user_roles_user_role ON public.user_roles(user_id, role);

-- ========================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- ========================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'::public.app_role
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id UUID DEFAULT NULL)
RETURNS public.app_role AS $$
DECLARE
    user_id_to_check UUID;
    user_role public.app_role;
BEGIN
    -- Use provided user_id or current authenticated user
    user_id_to_check := COALESCE(target_user_id, auth.uid());
    
    -- Get primary role
    SELECT ur.role INTO user_role
    FROM public.user_roles ur
    WHERE ur.user_id = user_id_to_check
    AND ur.is_primary = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    LIMIT 1;
    
    -- Return role or default to buyer
    RETURN COALESCE(user_role, 'buyer'::public.app_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(target_role public.app_role, target_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    user_id_to_check UUID;
BEGIN
    -- Use provided user_id or current authenticated user
    user_id_to_check := COALESCE(target_user_id, auth.uid());
    
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        WHERE ur.user_id = user_id_to_check 
        AND ur.role = target_role
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_profile_id UUID;
    user_email TEXT;
    user_name TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
BEGIN
    -- Extract user information
    user_email := LOWER(TRIM(NEW.email));
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', user_email);
    user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(user_name, ' ', 1));
    user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(user_name, ' ', 2));
    
    -- Create user profile
    INSERT INTO public.user_profiles (
        user_id, 
        email, 
        name, 
        first_name, 
        last_name,
        email_verified,
        status
    ) VALUES (
        NEW.id, 
        user_email, 
        user_name, 
        user_first_name,
        user_last_name,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        'active'::public.user_status
    ) RETURNING id INTO new_profile_id;

    -- Determine initial role (admin for specific email, buyer for others)
    IF user_email = 'irawatkins@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, profile_id, role, is_primary, granted_by)
        VALUES (NEW.id, new_profile_id, 'admin'::public.app_role, true, NEW.id);
    ELSE
        INSERT INTO public.user_roles (user_id, profile_id, role, is_primary, granted_by)
        VALUES (NEW.id, new_profile_id, 'buyer'::public.app_role, true, NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile when auth.users is updated
    UPDATE public.user_profiles SET 
        email = LOWER(TRIM(NEW.email)),
        email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        last_login = CASE WHEN NEW.last_sign_in_at > OLD.last_sign_in_at THEN NEW.last_sign_in_at ELSE last_login END,
        updated_at = NOW()
    WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 7: CREATE ROW LEVEL SECURITY POLICIES
-- ========================================

-- USER PROFILES POLICIES
-- Allow users to view their own profile and admins to view all
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR public.is_admin()
    );

-- Allow users to insert their own profile (via trigger only)
CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Allow users to update their own profile and admins to update any
CREATE POLICY "user_profiles_update_policy" ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "user_profiles_delete_policy" ON public.user_profiles
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- USER ROLES POLICIES  
-- Allow anyone to read roles (for role checking)
CREATE POLICY "user_roles_select_policy" ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to insert their own initial role (via trigger only)
CREATE POLICY "user_roles_insert_policy" ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Only admins can update roles
CREATE POLICY "user_roles_update_policy" ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only admins can delete roles
CREATE POLICY "user_roles_delete_policy" ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ========================================
-- STEP 8: CREATE TRIGGERS
-- ========================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger for user updates
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_update();

-- ========================================
-- STEP 9: GRANT NECESSARY PERMISSIONS
-- ========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role, UUID) TO authenticated;

-- ========================================
-- STEP 10: SETUP ADMIN USER
-- ========================================

-- This will be handled by the trigger when the user logs in
-- But let's ensure it works for existing users too

DO $$
DECLARE
    admin_user_id UUID;
    admin_profile_id UUID;
BEGIN
    -- Find the admin user if they exist
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'irawatkins@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Check if profile exists
        SELECT id INTO admin_profile_id
        FROM public.user_profiles
        WHERE user_id = admin_user_id;
        
        -- Create profile if it doesn't exist
        IF admin_profile_id IS NULL THEN
            INSERT INTO public.user_profiles (
                user_id, 
                email, 
                name, 
                first_name, 
                last_name,
                status
            ) VALUES (
                admin_user_id, 
                'irawatkins@gmail.com', 
                'Irad Watkins', 
                'Irad',
                'Watkins',
                'active'::public.user_status
            ) RETURNING id INTO admin_profile_id;
        END IF;
        
        -- Ensure admin role exists
        INSERT INTO public.user_roles (user_id, profile_id, role, is_primary, granted_by)
        VALUES (admin_user_id, admin_profile_id, 'admin'::public.app_role, true, admin_user_id)
        ON CONFLICT (user_id, profile_id, role) DO UPDATE SET
            is_primary = true,
            updated_at = NOW();
            
        RAISE NOTICE 'Admin user setup completed for irawatkins@gmail.com';
    ELSE
        RAISE NOTICE 'Admin user irawatkins@gmail.com not found in auth.users - will be created on next login';
    END IF;
END $$;

-- ========================================
-- VERIFICATION
-- ========================================

-- Log the rebuild completion
DO $$
BEGIN
    RAISE NOTICE 'User database rebuild completed successfully!';
    RAISE NOTICE 'Tables created: user_profiles, user_roles';
    RAISE NOTICE 'Functions created: is_admin(), get_user_role(), has_role()';
    RAISE NOTICE 'Triggers created: on_auth_user_created, on_auth_user_updated';
    RAISE NOTICE 'RLS policies enabled and configured';
    RAISE NOTICE 'Admin user will be auto-configured for irawatkins@gmail.com';
END $$;