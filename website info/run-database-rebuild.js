// Database Rebuild Script
// Run this in browser console to execute the database rebuild migration

async function rebuildDatabase() {
  console.log('🚀 Starting database rebuild...');
  
  try {
    // Check if we have Supabase client
    if (typeof window === 'undefined' || !window.supabase) {
      console.error('❌ Supabase client not found. Please run this from the SteppersLife app.');
      return false;
    }
    
    const supabase = window.supabase;
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('❌ Not authenticated. Please login first.');
      return false;
    }
    
    console.log('📝 Executing database rebuild migration...');
    
    // Execute the rebuild migration
    const migrationSQL = `
-- COMPLETE USER DATABASE REBUILD
-- This migration completely rebuilds the user authentication system from scratch

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
    `;
    
    // Since we can't execute DDL directly through the client, we'll need to use RPC
    console.log('⚠️  Note: Due to Supabase limitations, you may need to run the migration manually.');
    console.log('📋 Please copy the migration SQL from the migration file and run it in your Supabase SQL editor.');
    console.log('📂 File: supabase/migrations/20250609000000_rebuild_user_database.sql');
    
    // For now, let's just verify the current state and prepare for manual execution
    console.log('🔍 Checking current database state...');
    
    // Check existing tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_profiles', 'user_roles']);
      
    if (tablesError) {
      console.log('Could not check existing tables (this is expected if they don\'t exist)');
    } else {
      console.log('📊 Current tables:', tables?.map(t => t.table_name) || []);
    }
    
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the migration from: supabase/migrations/20250609000000_rebuild_user_database.sql');
    console.log('4. Execute the migration');
    console.log('5. Come back and run testAdminSetup() to verify');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during database rebuild:', error);
    return false;
  }
}

async function testAdminSetup() {
  console.log('🧪 Testing admin setup...');
  
  try {
    if (typeof window === 'undefined' || !window.supabase) {
      console.error('❌ Supabase client not found.');
      return false;
    }
    
    const supabase = window.supabase;
    
    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Not authenticated.');
      return false;
    }
    
    console.log('👤 Current user:', session.user.email);
    
    // Check user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return false;
    }
    
    console.log('📋 User profile:', profile);
    
    // Check user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);
      
    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError);
      return false;
    }
    
    console.log('🔐 User roles:', roles);
    
    // Test admin function
    const { data: isAdminResult, error: adminError } = await supabase
      .rpc('is_admin');
      
    if (adminError) {
      console.log('⚠️  Could not test is_admin function:', adminError);
    } else {
      console.log('👑 Is admin:', isAdminResult);
    }
    
    // Test role function
    const { data: roleResult, error: roleError } = await supabase
      .rpc('get_user_role');
      
    if (roleError) {
      console.log('⚠️  Could not test get_user_role function:', roleError);
    } else {
      console.log('🎭 User role:', roleResult);
    }
    
    console.log('');
    console.log('✅ Admin setup test completed!');
    
    if (session.user.email === 'irawatkins@gmail.com') {
      const hasAdminRole = roles?.some(role => role.role === 'admin');
      if (hasAdminRole) {
        console.log('🎉 Admin user is properly configured!');
        return true;
      } else {
        console.log('⚠️  Admin role not found. The migration may need to be run.');
        return false;
      }
    } else {
      console.log('ℹ️  User is not the designated admin (irawatkins@gmail.com)');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error testing admin setup:', error);
    return false;
  }
}

// Make functions available globally
window.rebuildDatabase = rebuildDatabase;
window.testAdminSetup = testAdminSetup;

// Auto-run the rebuild check
rebuildDatabase();

console.log('');
console.log('📌 Available functions:');
console.log('  rebuildDatabase() - Check rebuild status and show instructions');
console.log('  testAdminSetup() - Test the admin configuration after migration');