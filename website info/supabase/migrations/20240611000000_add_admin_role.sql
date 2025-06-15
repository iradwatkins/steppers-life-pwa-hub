-- Add admin role for irawatkins@gmail.com
INSERT INTO public.user_roles (user_id, profile_id, role)
SELECT 
    au.id as user_id,
    up.id as profile_id,
    'admin' as role
FROM auth.users au
JOIN public.user_profiles up ON up.user_id = au.id
WHERE au.email = 'irawatkins@gmail.com'
AND NOT EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = au.id 
    AND ur.role = 'admin'
); 