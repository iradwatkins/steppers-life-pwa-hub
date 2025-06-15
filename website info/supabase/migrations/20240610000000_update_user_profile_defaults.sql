-- Update default status for new users to be 'active' instead of 'pending_approval'
ALTER TABLE public.user_profiles 
  ALTER COLUMN status SET DEFAULT 'active';

-- Also update the user creation trigger to explicitly set status to 'active'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_profile_id UUID;
BEGIN
    -- Create user profile with active status
    INSERT INTO public.user_profiles (user_id, email, name, status)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', new.email), 'active')
    RETURNING id INTO new_profile_id;

    -- Set as buyer by default
    INSERT INTO public.user_roles (user_id, profile_id, role)
    VALUES (new.id, new_profile_id, 'buyer');

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update all existing pending users to active
UPDATE public.user_profiles
SET status = 'active'
WHERE status = 'pending_approval'; 