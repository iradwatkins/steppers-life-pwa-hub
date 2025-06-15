// Test Rebuilt Authentication System
// Run this after executing the database rebuild migration

async function testRebuiltAuth() {
  console.log('🧪 Testing rebuilt authentication system...');
  
  try {
    if (typeof window === 'undefined' || !window.supabase) {
      console.error('❌ Supabase client not found. Please run this from the SteppersLife app.');
      return false;
    }
    
    const supabase = window.supabase;
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('❌ Not authenticated. Please login first.');
      return false;
    }
    
    console.log('👤 Testing user:', session.user.email);
    console.log('🆔 User ID:', session.user.id);
    
    // Test 1: Check user profile
    console.log('\n📋 Test 1: User Profile');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Profile test failed:', profileError);
      return false;
    } else {
      console.log('✅ Profile exists:', {
        email: profile.email,
        name: profile.name,
        status: profile.status
      });
    }
    
    // Test 2: Check user roles
    console.log('\n🔐 Test 2: User Roles');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);
      
    if (rolesError) {
      console.error('❌ Roles test failed:', rolesError);
      return false;
    } else {
      console.log('✅ Roles found:', roles.map(r => ({
        role: r.role,
        is_primary: r.is_primary,
        granted_at: r.granted_at
      })));
    }
    
    // Test 3: Test is_admin function
    console.log('\n👑 Test 3: Admin Function');
    const { data: isAdminResult, error: adminError } = await supabase
      .rpc('is_admin');
      
    if (adminError) {
      console.error('❌ Admin function test failed:', adminError);
    } else {
      console.log('✅ is_admin() result:', isAdminResult);
    }
    
    // Test 4: Test get_user_role function
    console.log('\n🎭 Test 4: Get User Role Function');
    const { data: roleResult, error: roleError } = await supabase
      .rpc('get_user_role');
      
    if (roleError) {
      console.error('❌ Get role function test failed:', roleError);
    } else {
      console.log('✅ get_user_role() result:', roleResult);
    }
    
    // Test 5: Test has_role function for admin
    console.log('\n🔍 Test 5: Has Role Function');
    const { data: hasAdminResult, error: hasAdminError } = await supabase
      .rpc('has_role', { target_role: 'admin' });
      
    if (hasAdminError) {
      console.error('❌ Has role function test failed:', hasAdminError);
    } else {
      console.log('✅ has_role("admin") result:', hasAdminResult);
    }
    
    // Test 6: Verify admin access for irawatkins@gmail.com
    console.log('\n🚀 Test 6: Admin Access Verification');
    if (session.user.email === 'irawatkins@gmail.com') {
      const hasAdminRole = roles?.some(role => role.role === 'admin' && role.is_primary);
      const adminFunctionResult = isAdminResult;
      
      if (hasAdminRole && adminFunctionResult) {
        console.log('🎉 ADMIN ACCESS CONFIRMED!');
        console.log('   ✅ Has admin role in database');
        console.log('   ✅ is_admin() function returns true');
        console.log('   ✅ Ready to access /admin dashboard');
        return true;
      } else {
        console.log('❌ ADMIN ACCESS ISSUE:');
        console.log('   Admin role in DB:', hasAdminRole);
        console.log('   is_admin() result:', adminFunctionResult);
        return false;
      }
    } else {
      console.log('ℹ️  User is not irawatkins@gmail.com (designated admin)');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

async function forceAdminSetup() {
  console.log('🔧 Force setting up admin role...');
  
  try {
    if (typeof window === 'undefined' || !window.supabase) {
      console.error('❌ Supabase client not found.');
      return false;
    }
    
    const supabase = window.supabase;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== 'irawatkins@gmail.com') {
      console.error('❌ Must be logged in as irawatkins@gmail.com');
      return false;
    }
    
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Could not find user profile:', profileError);
      return false;
    }
    
    // Check if admin role already exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();
      
    if (existingRole) {
      console.log('ℹ️  Admin role already exists');
      
      // Make sure it's primary
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ is_primary: true })
        .eq('id', existingRole.id);
        
      if (updateError) {
        console.error('❌ Could not update admin role:', updateError);
        return false;
      }
    } else {
      // Create admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: session.user.id,
          profile_id: profile.id,
          role: 'admin',
          is_primary: true,
          granted_by: session.user.id
        });
        
      if (insertError) {
        console.error('❌ Could not create admin role:', insertError);
        return false;
      }
    }
    
    // Update user metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    
    if (metadataError) {
      console.error('❌ Could not update user metadata:', metadataError);
    }
    
    console.log('✅ Admin role setup complete!');
    console.log('🔄 Please refresh the page and try accessing /admin');
    
    return true;
    
  } catch (error) {
    console.error('❌ Force admin setup failed:', error);
    return false;
  }
}

// Make functions available globally
window.testRebuiltAuth = testRebuiltAuth;
window.forceAdminSetup = forceAdminSetup;

// Auto-run test
testRebuiltAuth();

console.log('');
console.log('📌 Available functions:');
console.log('  testRebuiltAuth() - Test the rebuilt authentication system');
console.log('  forceAdminSetup() - Force create admin role for irawatkins@gmail.com');