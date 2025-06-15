import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['app_role'];

/**
 * Set a user's role in the database
 * @param userId The user ID to update
 * @param role The role to assign
 * @returns True if successful, false otherwise
 */
export const setUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    console.log(`Setting role ${role} for user ${userId}`);
    
    // First check if the user already has a role
    const { data: existingRole, error: fetchError } = await supabase
      .from('user_roles')
      .select('id, role')
      .eq('user_id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking user role:', fetchError);
      return false;
    }
    
    if (existingRole) {
      // If already has the desired role, skip update
      if (existingRole.role === role) {
        console.log(`User ${userId} already has role ${role}`);
        return true;
      }
      
      // Update existing role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('id', existingRole.id);
      
      if (updateError) {
        console.error('Error updating user role:', updateError);
        return false;
      }
    } else {
      // Create new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (insertError) {
        console.error('Error creating user role:', insertError);
        return false;
      }
    }
    
    // Also update user metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { role }
    });
    
    if (metadataError) {
      console.error('Error updating user metadata:', metadataError);
    }
    
    console.log(`Successfully set role ${role} for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in setUserRole:', error);
    return false;
  }
};

/**
 * Find a user by email in the Supabase auth system
 * @param email The email to search for
 * @returns The user ID if found, null otherwise
 */
const findUserByEmail = async (email: string): Promise<string | null> => {
  try {
    // First try direct query to auth.users (requires admin privileges)
    const { data: users, error: authError } = await supabase.auth.admin.listUsers({
      filter: {
        email: email
      }
    });
    
    if (!authError && users && users.users.length > 0) {
      return users.users[0].id;
    }
    
    // If that fails, try getting from a related table
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', email)
      .single();
    
    if (!profileError && userProfiles) {
      return userProfiles.user_id;
    }
    
    // Finally, try a direct auth query
    const { data: { users: authUsers }, error } = await supabase.rpc('get_users_by_email', {
      p_email: email
    });
    
    if (!error && authUsers && authUsers.length > 0) {
      return authUsers[0].id;
    }
    
    console.log(`User with email ${email} not found`);
    return null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

/**
 * Makes sure that the specified email has admin privileges
 * Used to ensure that specific users like iradwatkins@gmail.com always have admin access
 */
export const ensureUserIsAdmin = async (email: string): Promise<boolean> => {
  try {
    console.log(`Ensuring ${email} has admin privileges...`);
    
    // Find the user by email
    const userId = await findUserByEmail(email);
    
    if (!userId) {
      console.log(`User with email ${email} not found. They will be made admin upon registration.`);
      return false;
    }
    
    // Set the user role to admin
    const success = await setUserRole(userId, 'admin');
    
    if (success) {
      console.log(`Successfully ensured ${email} has admin privileges`);
    } else {
      console.error(`Failed to set admin privileges for ${email}`);
    }
    
    return success;
  } catch (error) {
    console.error('Error in ensureUserIsAdmin:', error);
    return false;
  }
};

/**
 * Ensure iradwatkins@gmail.com is an admin user
 */
export const ensureIradIsAdmin = async (): Promise<void> => {
  await ensureUserIsAdmin('iradwatkins@gmail.com');
}; 