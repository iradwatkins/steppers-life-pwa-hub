-- Ensure admin user exists and has proper admin role
-- Run this in your Supabase SQL editor

-- First, let's check if the user profile exists
DO $$
DECLARE
    user_uuid UUID;
    profile_id_val INTEGER;
BEGIN
    -- Get the user UUID from auth.users table (replace with your actual email)
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'iradwatkins@gmail.com'
    LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        RAISE NOTICE 'Found user UUID: %', user_uuid;
        
        -- Check if user profile exists
        SELECT id INTO profile_id_val
        FROM public.user_profiles
        WHERE user_id = user_uuid;
        
        IF profile_id_val IS NULL THEN
            -- Create user profile if it doesn't exist
            INSERT INTO public.user_profiles (
                user_id, 
                username, 
                first_name, 
                last_name, 
                role, 
                status, 
                is_verified, 
                is_active
            ) VALUES (
                user_uuid,
                'admin',
                'Admin',
                'User',
                'admin',
                'active',
                true,
                true
            ) RETURNING id INTO profile_id_val;
            
            RAISE NOTICE 'Created user profile with ID: %', profile_id_val;
        ELSE
            -- Update existing profile to admin
            UPDATE public.user_profiles 
            SET role = 'admin', 
                status = 'active', 
                is_verified = true, 
                is_active = true
            WHERE id = profile_id_val;
            
            RAISE NOTICE 'Updated existing user profile ID: %', profile_id_val;
        END IF;
        
        -- Ensure admin role exists in user_roles table
        INSERT INTO public.user_roles (
            user_id,
            profile_id,
            role,
            is_primary,
            granted_by
        ) VALUES (
            user_uuid,
            profile_id_val,
            'admin',
            true,
            user_uuid
        )
        ON CONFLICT (user_id, profile_id, role) 
        DO UPDATE SET 
            is_primary = true,
            updated_at = NOW();
        
        RAISE NOTICE 'Ensured admin role exists for user';
        
        -- Also ensure there's a user account for financial transactions
        INSERT INTO public.user_accounts (
            user_id,
            available_balance,
            pending_balance,
            total_earned,
            total_withdrawn,
            is_frozen
        ) VALUES (
            user_uuid,
            0.00,
            0.00,
            0.00,
            0.00,
            false
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Ensured user account exists';
        
    ELSE
        RAISE NOTICE 'User with email iradwatkins@gmail.com not found in auth.users';
    END IF;
END $$;