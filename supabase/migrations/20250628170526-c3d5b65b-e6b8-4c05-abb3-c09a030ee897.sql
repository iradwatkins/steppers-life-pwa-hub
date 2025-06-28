
-- Update iradwatkins@gmail.com to admin role
UPDATE public.profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'iradwatkins@gmail.com';

-- Insert profile if it doesn't exist (in case user hasn't signed up yet)
INSERT INTO public.profiles (id, email, role, full_name, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'iradwatkins@gmail.com',
    'admin',
    'Ira Watkins',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 'iradwatkins@gmail.com'
);

-- Verify the update
SELECT email, role, full_name, updated_at 
FROM public.profiles 
WHERE email = 'iradwatkins@gmail.com';
