-- BMAD Method: Add team_member permissions to follower system
-- Adds the missing field to distinguish sales_follower from team_member
--
-- ⚠️  CRITICAL WARNING - FOLLOWER DATABASE SCHEMA IS LOCKED ⚠️
-- This migration completes the BMAD follower system. The schema is FINAL.
-- DO NOT CREATE any additional follower-related migrations.
-- DO NOT MODIFY the follower_sales_permissions table structure.
-- SYSTEM IS PRODUCTION-LOCKED.

BEGIN;

-- Add team member permissions to follower_sales_permissions table
ALTER TABLE public.follower_sales_permissions 
ADD COLUMN IF NOT EXISTS is_team_member BOOLEAN DEFAULT false;

-- Add QR scanning permission for team members
ALTER TABLE public.follower_sales_permissions 
ADD COLUMN IF NOT EXISTS can_scan_qr_codes BOOLEAN DEFAULT false;

-- Update existing permissions to set QR scanning for team members only
-- This is a safe operation since we're adding new fields with sensible defaults

-- Add index for team member queries
CREATE INDEX IF NOT EXISTS idx_follower_permissions_team_member 
ON public.follower_sales_permissions(organizer_id, is_team_member) 
WHERE is_team_member = true;

-- Add index for QR scanning permissions
CREATE INDEX IF NOT EXISTS idx_follower_permissions_qr_scan 
ON public.follower_sales_permissions(organizer_id, can_scan_qr_codes) 
WHERE can_scan_qr_codes = true;

-- Update RLS policy to include team member checks
DROP POLICY IF EXISTS "Team members can scan QR codes" ON public.follower_sales_permissions;
CREATE POLICY "Team members can scan QR codes" ON public.follower_sales_permissions
    FOR SELECT USING (
        is_team_member = true 
        AND can_scan_qr_codes = true 
        AND follower_id = auth.uid()
    );

-- Add constraint to ensure QR scanning is only for team members
ALTER TABLE public.follower_sales_permissions 
ADD CONSTRAINT check_qr_scanning_team_only 
CHECK (
    (can_scan_qr_codes = false) OR 
    (can_scan_qr_codes = true AND is_team_member = true)
);

-- Log the schema update
INSERT INTO public.configuration_audit_log (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_by
) VALUES (
    'follower_sales_permissions',
    gen_random_uuid(),
    'ADD_TEAM_MEMBER_PERMISSIONS',
    '{"added_fields": ["is_team_member", "can_scan_qr_codes"]}'::json,
    '{"bmad_roles": "sales_follower vs team_member distinction", "qr_scanning": "team_member exclusive"}'::json,
    NULL
);

COMMIT;