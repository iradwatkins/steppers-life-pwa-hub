-- Migration: Update specific users to super_admin role
-- Date: 2025-06-24
-- Description: Set iradwatkins@gmail.com and bobbygwatkins@gmail.com as super_admin users

-- Update iradwatkins@gmail.com to super_admin role
UPDATE profiles 
SET role = 'super_admin', updated_at = NOW()
WHERE email = 'iradwatkins@gmail.com';

-- Update bobbygwatkins@gmail.com to super_admin role  
UPDATE profiles 
SET role = 'super_admin', updated_at = NOW()
WHERE email = 'bobbygwatkins@gmail.com';

-- Insert profiles if they don't exist (in case they haven't signed up yet)
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'iradwatkins@gmail.com',
    'super_admin',
    'Ira Watkins',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'iradwatkins@gmail.com'
);

INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'bobbygwatkins@gmail.com', 
    'super_admin',
    'Bobby Watkins',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'bobbygwatkins@gmail.com'
);

-- Verify the updates
DO $$
BEGIN
    -- Log the current super_admin users
    RAISE NOTICE 'Super admin users after migration:';
    FOR r IN SELECT email, role FROM profiles WHERE role = 'super_admin' LOOP
        RAISE NOTICE '  - %: %', r.email, r.role;
    END LOOP;
END $$;