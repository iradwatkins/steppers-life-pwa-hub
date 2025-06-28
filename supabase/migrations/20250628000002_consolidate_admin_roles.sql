-- BMAD Method: Consolidate admin roles
-- Remove super_admin confusion and create clean role hierarchy:
-- admin: Full administrative privileges
-- organizer: Can create events and delegate permissions to followers  
-- user: Can buy tickets, become followers of organizers

BEGIN;

-- Step 1: Update all users with super_admin role to admin role
UPDATE public.profiles 
SET role = 'admin'::user_role 
WHERE role = 'super_admin'::user_role;

-- Step 2: Drop all policies that depend on the role column
DROP POLICY IF EXISTS "Admins can manage all organizers" ON public.organizers;
DROP POLICY IF EXISTS "Users can view all organizers" ON public.organizers;
DROP POLICY IF EXISTS "Users can create their own organizer profile" ON public.organizers;
DROP POLICY IF EXISTS "Users can update their own organizer profile" ON public.organizers;
DROP POLICY IF EXISTS "Admin users can manage content" ON public.content_pages;
DROP POLICY IF EXISTS "Admin users can manage content versions" ON public.content_page_versions;
DROP POLICY IF EXISTS "Admin users can manage categories" ON public.platform_categories;
DROP POLICY IF EXISTS "Admin users can manage settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admin users can manage VOD config" ON public.vod_configuration;
DROP POLICY IF EXISTS "Admin users can manage pickup locations" ON public.pickup_locations;
DROP POLICY IF EXISTS "Admin users can read audit log" ON public.configuration_audit_log;
DROP POLICY IF EXISTS "Admins can view all analytics sessions" ON public.web_analytics_sessions;
DROP POLICY IF EXISTS "Admins can view all page views" ON public.web_analytics_page_views;
DROP POLICY IF EXISTS "Admins can view all instructor profiles" ON public.instructor_profiles;
DROP POLICY IF EXISTS "Admins can view all performance metrics" ON public.instructor_performance_metrics;
DROP POLICY IF EXISTS "Admins can manage inventory audit logs" ON public.inventory_audit_logs;
DROP POLICY IF EXISTS "Admins can manage all follower permissions" ON public.follower_sales_permissions;
DROP POLICY IF EXISTS "Admins can manage all follower commissions" ON public.follower_commissions;

-- Step 3: Update the user_role enum to remove super_admin
-- First create a new enum without super_admin
CREATE TYPE user_role_new AS ENUM ('user', 'organizer', 'admin');

-- Step 4: Update the profiles table to use the new enum
-- First drop the default, then change type, then restore default
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role_new 
USING (
  CASE 
    WHEN role::text = 'super_admin' THEN 'admin'::user_role_new
    WHEN role::text = 'admin' THEN 'admin'::user_role_new  
    WHEN role::text = 'organizer' THEN 'organizer'::user_role_new
    ELSE 'user'::user_role_new
  END
);

-- Restore the default after type change
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user'::user_role_new;

-- Step 5: Drop the old enum and rename the new one
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

-- Step 6: Add a comment to document the BMAD role structure
COMMENT ON TYPE user_role IS 'BMAD Method user roles: user (buy tickets, become followers), organizer (create events, delegate to followers), admin (full administrative privileges)';

-- Step 7: Log the consolidation for audit trail
INSERT INTO public.configuration_audit_log (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_by
) VALUES (
    'user_role_enum',
    gen_random_uuid(),
    'CONSOLIDATE_ROLES',
    '{"removed_role": "super_admin", "reason": "eliminated_confusion"}'::json,
    '{"consolidated_to": "admin", "bmad_hierarchy": "user->organizer->admin"}'::json,
    NULL
);

-- Verification: Show the updated roles
SELECT 
    'BMAD Role consolidation complete' as status,
    role,
    COUNT(*) as user_count
FROM public.profiles 
GROUP BY role
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'organizer' THEN 2 
        WHEN 'user' THEN 3 
    END;

COMMIT;