import { supabase } from '@/integrations/supabase/client';
import { AdminService } from '@/services/adminService';

// CRITICAL SECURITY: These are the ONLY emails that can become super_admin
// This must match the whitelist in AdminService
const AUTHORIZED_SUPER_ADMIN_EMAILS = Object.freeze([
  'bobbygwatkins@gmail.com',
  'iradwatkins@gmail.com'
]);

export async function verifySuperAdminSetup(): Promise<void> {
  console.log('🔐 Starting SECURE super admin verification with strict controls...');
  console.log('🚨 SECURITY NOTICE: Only authorized emails can become super_admin');
  console.log('📋 Authorized emails:', AUTHORIZED_SUPER_ADMIN_EMAILS);
  
  try {
    // First, check current roles for authorized users ONLY
    console.log('📋 Checking current user roles for AUTHORIZED users only...');
    
    for (const email of AUTHORIZED_SUPER_ADMIN_EMAILS) {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
        .eq('email', email)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ User not found: ${email} - User needs to sign up first`);
        } else {
          console.error(`❌ Error checking user ${email}:`, error);
        }
        continue;
      }
      
      console.log(`👤 Found user: ${email}`, {
        name: user.full_name,
        currentRole: user.role,
        id: user.id
      });
      
      // Log current status
      if (user.role !== 'super_admin') {
        console.log(`⚠️ ${email} currently has role: ${user.role} (needs super_admin)`);
      } else {
        console.log(`✅ ${email} already has super_admin role`);
      }
    }
    
    // Use the SECURE AdminService method to set super admin roles
    console.log('\n🔐 Using secure AdminService.setSuperAdmins() method...');
    const setupSuccess = await AdminService.setSuperAdmins();
    
    if (!setupSuccess) {
      console.error('❌ Some super admin setups failed through secure method');
    }
    
    // Verify final state
    console.log('\n📊 Final verification of super admin roles:');
    const adminUsers = await AdminService.getAdminUsers();
    
    console.log('Current admin users:');
    adminUsers.forEach(user => {
      console.log(`  ${user.email}: ${user.role} (${user.full_name || 'No name'})`);
    });
    
    // Check if our AUTHORIZED users have super_admin
    const superAdminUsers = adminUsers.filter(user => user.role === 'super_admin');
    const authorizedUsersWithSuperAdmin = superAdminUsers.filter(user => 
      AUTHORIZED_SUPER_ADMIN_EMAILS.includes(user.email)
    );
    
    console.log(`\n🎯 Authorized super admins (${authorizedUsersWithSuperAdmin.length}/${AUTHORIZED_SUPER_ADMIN_EMAILS.length}):`);
    authorizedUsersWithSuperAdmin.forEach(user => {
      console.log(`  ✅ ${user.email}: ${user.role}`);
    });
    
    const missingUsers = AUTHORIZED_SUPER_ADMIN_EMAILS.filter(email => 
      !authorizedUsersWithSuperAdmin.some(user => user.email === email)
    );

    // SECURITY CHECK: Verify no unauthorized users have super_admin
    const unauthorizedSuperAdmins = superAdminUsers.filter(user => 
      !AUTHORIZED_SUPER_ADMIN_EMAILS.includes(user.email)
    );
    
    if (unauthorizedSuperAdmins.length > 0) {
      console.error('\n🚨 SECURITY ALERT: Unauthorized users found with super_admin role:');
      unauthorizedSuperAdmins.forEach(user => {
        console.error(`  🚨 UNAUTHORIZED: ${user.email}: ${user.role}`);
      });
    } else {
      console.log('\n✅ SECURITY CHECK PASSED: No unauthorized super admins found');
    }
    
    if (missingUsers.length > 0) {
      console.log(`\n⚠️ Authorized users still missing super_admin role:`);
      missingUsers.forEach(email => {
        console.log(`  ❌ ${email}`);
      });
    } else {
      console.log('\n🎉 All authorized users now have super_admin role!');
    }
    
  } catch (error) {
    console.error('❌ Error in super admin setup:', error);
  }
}

// Create a test function for super admin permissions
export async function testSuperAdminPermissions(): Promise<void> {
  console.log('🧪 Testing super admin permissions...');
  
  try {
    // Test accessing admin-only data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Cannot access profiles table:', profilesError);
    } else {
      console.log('✅ Can access profiles table');
    }
    
    // Test admin service functionality
    const adminUsers = await AdminService.getAdminUsers();
    console.log(`✅ AdminService.getAdminUsers() returned ${adminUsers.length} users`);
    
    console.log('🎉 Super admin permission test completed');
    
  } catch (error) {
    console.error('❌ Super admin permission test failed:', error);
  }
}

// Export a simple function to run both
export async function setupAndTestSuperAdmins(): Promise<void> {
  await verifySuperAdminSetup();
  await testSuperAdminPermissions();
}