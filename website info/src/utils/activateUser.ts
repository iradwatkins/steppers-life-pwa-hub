import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to ensure a user account is activated
 * @param userId The Supabase user ID to activate
 * @returns Object indicating success or failure
 */
export const activateUser = async (userId: string): Promise<{success: boolean; error?: string}> => {
  try {
    // First get the current user status
    const { data: profiles, error: fetchError } = await supabase
      .from('user_profiles')
      .select('status')
      .eq('user_id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      return { 
        success: false, 
        error: `Could not fetch user profile: ${fetchError.message}` 
      };
    }
    
    // Check if user is already active
    if (profiles?.status === 'active') {
      return { success: true };
    }
    
    // Update user status to active
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ status: 'active' })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error activating user account:', updateError);
      return { 
        success: false, 
        error: `Failed to activate user: ${updateError.message}` 
      };
    }
    
    console.log('User account activated successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error during user activation:', error);
    return { 
      success: false, 
      error: `Activation failed: ${error.message || 'Unknown error'}` 
    };
  }
};

/**
 * Check if a user account has an active status
 * @param userId The Supabase user ID to check
 * @returns Whether the user account is active
 */
export const isUserActive = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('status')
      .eq('user_id', userId)
      .single();
      
    if (error || !data) {
      console.error('Error checking user status:', error);
      return false;
    }
    
    return data.status === 'active';
  } catch (error) {
    console.error('Error checking user active status:', error);
    return false;
  }
}; 