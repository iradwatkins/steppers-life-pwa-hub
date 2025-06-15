import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['app_role'];

/**
 * Get a user by email address
 * @param email The email address to search for
 * @returns The user record or null if not found
 */
export const getUserByEmail = async (email: string) => {
  try {
    // For admin use only - search for a user by email
    const { data: userList, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      filter: {
        email: email
      }
    });

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    // Return the first user if found
    return userList.users.length > 0 ? userList.users[0] : null;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
};

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
      // Not returning false here since the database update was successful
    }
    
    return true;
  } catch (error) {
    console.error('Error in setUserRole:', error);
    return false;
  }
};

/**
 * Get the current role for a user
 * @param userId The user ID to check
 * @returns The user's current role or null if not found
 */
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return data?.role || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};

/**
 * Set a user as admin by email address
 * @param email The email address of the user to make admin
 * @returns True if successful, false otherwise
 */
export const makeUserAdmin = async (email: string): Promise<boolean> => {
  try {
    // First find the user by email
    const { data: userList, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user by email:', userError);
      
      // Try alternative approach - first get user from user_profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('email', email)
        .single();
      
      if (profileError) {
        console.error('Error finding user profile by email:', profileError);
        return false;
      }
      
      if (userProfile?.user_id) {
        return await setUserRole(userProfile.user_id, 'admin');
      }
      
      return false;
    }
    
    if (!userList || !userList.id) {
      console.error('User not found with email:', email);
      return false;
    }
    
    // Set the user role to admin
    return await setUserRole(userList.id, 'admin');
  } catch (error) {
    console.error('Error in makeUserAdmin:', error);
    return false;
  }
};

/**
 * Set a user as admin by user ID
 * @param userId The ID of the user to make admin
 * @returns True if successful, false otherwise
 */
export const makeUserAdminById = async (userId: string): Promise<boolean> => {
  return await setUserRole(userId, 'admin');
}; 