// Run this in the browser console while logged in
// This will check your current role and update it to admin

console.log('🔍 Checking current user role...');

// Import the supabase client
import { supabase } from '/src/integrations/supabase/client.js';

async function makeCurrentUserAdmin() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting current user:', userError);
      return;
    }
    
    if (!user) {
      console.error('❌ No user logged in');
      return;
    }
    
    console.log('👤 Current user:', user.email);
    
    // Check current role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email, full_name')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }
    
    console.log('📋 Current profile:', profile);
    
    if (profile.role === 'admin' || profile.role === 'super_admin') {
      console.log('✅ You already have admin access!');
      console.log('🎯 Try accessing: http://localhost:8080/admin/dashboard');
      return;
    }
    
    // Update to admin role
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)
      .select();
    
    if (updateError) {
      console.error('❌ Error updating role:', updateError);
      return;
    }
    
    console.log('✅ Successfully updated to admin role!');
    console.log('🎯 You can now access:');
    console.log('  • http://localhost:8080/admin/dashboard');
    console.log('  • http://localhost:8080/admin/event-claims');
    console.log('  • http://localhost:8080/admin/create-event');
    console.log('');
    console.log('🔄 Please refresh the page to see admin features in the navigation');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
makeCurrentUserAdmin();