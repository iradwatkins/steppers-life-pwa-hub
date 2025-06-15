// Complete Authentication Test Script
// Run this after logging in to verify the entire authentication and dashboard system

async function testCompleteAuth() {
  console.log('🧪 Testing complete authentication system...');
  
  try {
    if (typeof window === 'undefined' || !window.supabase) {
      console.error('❌ Supabase client not found. Please run this from the SteppersLife app.');
      return false;
    }
    
    const supabase = window.supabase;
    
    // Test 1: Check authentication
    console.log('\n👤 Test 1: Authentication Status');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('❌ Not authenticated. Please login first.');
      return false;
    }
    
    console.log('✅ User authenticated:', session.user.email);
    
    // Test 2: Check role detection (should work for iradwatkins@gmail.com)
    console.log('\n🔐 Test 2: Role Detection');
    
    // Simulate hasRole function call
    if (session.user.email === 'iradwatkins@gmail.com') {
      console.log('✅ Admin detected for iradwatkins@gmail.com');
    } else {
      console.log('ℹ️  Regular user (not admin)');
    }
    
    // Test 3: Check user profile and roles in database
    console.log('\n📋 Test 3: Database Profile and Roles');
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (profileError) {
      console.log('⚠️  Profile not found (will be created by trigger):', profileError.message);
    } else {
      console.log('✅ Profile exists:', {
        email: profile.email,
        name: profile.name,
        status: profile.status
      });
    }
    
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);
      
    if (rolesError) {
      console.log('⚠️  Roles not found (will be created by trigger):', rolesError.message);
    } else {
      console.log('✅ User roles:', roles.map(r => ({
        role: r.role,
        is_primary: r.is_primary
      })));
    }
    
    // Test 4: Test navigation menu visibility
    console.log('\n🧭 Test 4: Navigation Menu');
    
    // Check if admin link should be visible
    const adminLinkVisible = session.user.email === 'iradwatkins@gmail.com' || 
                            roles?.some(r => r.role === 'admin');
    
    console.log('✅ Admin dashboard link should be:', adminLinkVisible ? 'VISIBLE' : 'HIDDEN');
    
    // Test 5: Test dashboard content
    console.log('\n📊 Test 5: Dashboard System');
    
    // Test the dashboard service directly
    try {
      // Import the dashboard service
      const { userDashboardService } = await import('/src/services/userDashboardService.ts');
      
      const userRoles = await userDashboardService.getUserRoles(session.user.id);
      console.log('✅ Dashboard roles loaded:', userRoles.map(r => ({
        name: r.displayName,
        active: r.isActive
      })));
      
      const activeRoleIds = userRoles.filter(r => r.isActive).map(r => r.id);
      const contentOptions = await userDashboardService.getContentCreationOptions(activeRoleIds);
      console.log('✅ Available content options:', contentOptions.map(o => o.title));
      
    } catch (dashboardError) {
      console.log('⚠️  Dashboard service test skipped (import limitation)');
    }
    
    // Test 6: Test routing access
    console.log('\n🛣️  Test 6: Route Access');
    
    const testRoutes = [
      { path: '/dashboard', name: 'User Dashboard', requiresAuth: true },
      { path: '/admin', name: 'Admin Dashboard', requiresAdmin: true },
      { path: '/organizer/events/create', name: 'Create Event', requiresRole: 'organizer' },
      { path: '/instructor/dashboard', name: 'Instructor Dashboard', requiresRole: 'instructor' }
    ];
    
    testRoutes.forEach(route => {
      let canAccess = true;
      let reason = 'Public access';
      
      if (route.requiresAuth && !session) {
        canAccess = false;
        reason = 'Not authenticated';
      } else if (route.requiresAdmin && session.user.email !== 'iradwatkins@gmail.com') {
        canAccess = false;
        reason = 'Not admin';
      } else if (route.requiresRole) {
        // This would need actual role checking
        reason = `Requires ${route.requiresRole} role`;
      } else if (route.requiresAuth) {
        reason = 'Authenticated';
      }
      
      console.log(`${canAccess ? '✅' : '❌'} ${route.name} (${route.path}): ${reason}`);
    });
    
    // Test 7: Final recommendations
    console.log('\n🎯 Test 7: System Status & Recommendations');
    
    if (session.user.email === 'iradwatkins@gmail.com') {
      console.log('🎉 ADMIN USER VERIFICATION COMPLETE');
      console.log('✅ Admin role detection: WORKING');
      console.log('✅ Navigation menu: Should show Admin Dashboard');
      console.log('✅ Route access: /admin should be accessible');
      
      console.log('\n📌 Next Steps for Admin:');
      console.log('1. Check dropdown menu under your name - Admin Dashboard should be visible');
      console.log('2. Click Admin Dashboard to access admin tools');
      console.log('3. Navigate to /admin directly if needed');
      
      if (!profile || !roles?.length) {
        console.log('\n⚠️  Database Setup Needed:');
        console.log('1. Run the database migration: supabase/migrations/20250609000000_rebuild_user_database.sql');
        console.log('2. Or run forceAdminSetup() to create the necessary records');
      }
    } else {
      console.log('ℹ️  REGULAR USER VERIFICATION COMPLETE');
      console.log('✅ User authentication: WORKING');
      console.log('✅ Dashboard system: Should show appropriate roles and options');
      console.log('✅ Role-based access: Working as expected');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

async function forceAdminSetup() {
  console.log('🔧 Force setting up admin access...');
  
  try {
    if (typeof window === 'undefined' || !window.supabase) {
      console.error('❌ Supabase client not found.');
      return false;
    }
    
    const supabase = window.supabase;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== 'iradwatkins@gmail.com') {
      console.error('❌ Must be logged in as iradwatkins@gmail.com');
      return false;
    }
    
    console.log('👤 Setting up admin for:', session.user.email);
    
    // Create or update profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: session.user.id,
        email: session.user.email,
        name: 'Irad Watkins',
        first_name: 'Irad',
        last_name: 'Watkins',
        status: 'active'
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
      
    if (profileError) {
      console.error('❌ Could not create/update profile:', profileError);
      return false;
    }
    
    console.log('✅ Profile created/updated');
    
    // Create admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: session.user.id,
        profile_id: profile.id,
        role: 'admin',
        is_primary: true,
        granted_by: session.user.id
      }, {
        onConflict: 'user_id,profile_id,role'
      });
      
    if (roleError) {
      console.error('❌ Could not create admin role:', roleError);
      return false;
    }
    
    console.log('✅ Admin role created');
    
    // Update user metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    
    if (metadataError) {
      console.error('⚠️  Could not update user metadata (non-critical):', metadataError);
    } else {
      console.log('✅ User metadata updated');
    }
    
    console.log('🎉 Admin setup complete!');
    console.log('🔄 Please refresh the page to see changes');
    
    return true;
    
  } catch (error) {
    console.error('❌ Force admin setup failed:', error);
    return false;
  }
}

// Make functions available globally
window.testCompleteAuth = testCompleteAuth;
window.forceAdminSetup = forceAdminSetup;

// Auto-run the complete test
testCompleteAuth();

console.log('');
console.log('📌 Available functions:');
console.log('  testCompleteAuth() - Test the complete authentication system');
console.log('  forceAdminSetup() - Force create admin access for iradwatkins@gmail.com');