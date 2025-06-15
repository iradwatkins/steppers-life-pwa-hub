// Quick admin setup script
// Run this in the browser console while logged in to set up admin role

async function setupAdminRole() {
  // This should match your Supabase configuration
  const supabaseUrl = 'https://qlxxjwanrlgsrxmrltql.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseHhqd2Fucmxnc3J4bXJsdHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2ODY1NDksImV4cCI6MjA1MTI2MjU0OX0.D4VwrELp6zJdGvJtq5JE6rJh3-aR7k0c8ZYP0zVvScs';
  
  // Check if we're already in a Supabase context
  if (typeof window !== 'undefined' && window.supabase) {
    console.log('Using existing Supabase client');
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (!session) {
      console.error('Not logged in. Please login first.');
      return;
    }
    
    if (session.user.email !== 'irawatkins@gmail.com') {
      console.error('This script is only for irawatkins@gmail.com');
      return;
    }
    
    console.log('Logged in as:', session.user.email);
    
    // Check current roles
    const { data: roles, error: rolesError } = await window.supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);
      
    console.log('Current roles:', roles);
    
    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return;
    }
    
    // Check if already admin
    const hasAdmin = roles?.some(role => role.role === 'admin');
    if (hasAdmin) {
      console.log('User already has admin role');
      
      // Update metadata anyway
      const { error: metadataError } = await window.supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      if (metadataError) {
        console.error('Error updating metadata:', metadataError);
      } else {
        console.log('User metadata updated with admin role');
      }
      
      return;
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await window.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return;
    }
    
    console.log('User profile:', profile);
    
    // Create admin role
    const { error: insertError } = await window.supabase
      .from('user_roles')
      .insert({
        user_id: session.user.id,
        profile_id: profile.id,
        role: 'admin',
        is_primary: true
      });
      
    if (insertError) {
      console.error('Error creating admin role:', insertError);
      return;
    }
    
    console.log('Admin role created successfully');
    
    // Update metadata
    const { error: metadataError } = await window.supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    
    if (metadataError) {
      console.error('Error updating metadata:', metadataError);
    } else {
      console.log('User metadata updated with admin role');
    }
    
    console.log('✅ Admin setup complete! Please refresh the page.');
  } else {
    console.error('Supabase client not found. Please run this from the SteppersLife app.');
  }
}

// Run the setup
setupAdminRole().catch(console.error);