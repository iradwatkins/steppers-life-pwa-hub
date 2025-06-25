import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

// CRITICAL: ONLY these emails can EVER become super_admin
// This is hardcoded for security - NO OTHER USERS can bypass BMAD method epics
const AUTHORIZED_SUPER_ADMIN_EMAILS = Object.freeze([
  'bobbygwatkins@gmail.com',
  'iradwatkins@gmail.com'
]);

export class AdminService {
  /**
   * Validate if email is authorized for super_admin role
   */
  private static isAuthorizedSuperAdmin(email: string): boolean {
    return AUTHORIZED_SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
  }

  /**
   * Log role changes for audit trail
   */
  private static async logRoleChange(email: string, oldRole: string, newRole: string, success: boolean): Promise<void> {
    try {
      console.log(`🔐 ROLE CHANGE AUDIT: ${email} | ${oldRole} → ${newRole} | Success: ${success} | Time: ${new Date().toISOString()}`);
      
      // In production, this should go to a proper audit log table
      const auditEntry = {
        email,
        old_role: oldRole,
        new_role: newRole,
        success,
        timestamp: new Date().toISOString(),
        source: 'AdminService.updateUserRole'
      };
      
      // Store in browser console for now - should be proper database table in production
      console.table([auditEntry]);
    } catch (error) {
      console.error('Failed to log role change:', error);
    }
  }

  /**
   * Update user role by email address with strict security controls
   * CRITICAL: Only authorized emails can become super_admin
   */
  static async updateUserRole(email: string, role: UserRole): Promise<boolean> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // SECURITY CHECK: Prevent unauthorized super_admin elevation
      if (role === 'super_admin' && !this.isAuthorizedSuperAdmin(normalizedEmail)) {
        console.error(`🚨 SECURITY VIOLATION: Attempt to elevate unauthorized user to super_admin: ${normalizedEmail}`);
        await this.logRoleChange(normalizedEmail, 'unknown', 'super_admin', false);
        throw new Error('Unauthorized: Only specific authorized users can become super_admin');
      }

      // Get current role for audit logging
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', normalizedEmail)
        .single();

      const oldRole = currentUser?.role || 'unknown';

      // Perform the role update
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('email', normalizedEmail);

      if (error) {
        console.error('Error updating user role:', error);
        await this.logRoleChange(normalizedEmail, oldRole, role, false);
        return false;
      }

      console.log(`✅ Successfully updated ${normalizedEmail} from ${oldRole} to ${role}`);
      await this.logRoleChange(normalizedEmail, oldRole, role, true);
      
      return true;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      return false;
    }
  }

  /**
   * Set specific users as super admins - ONLY works for authorized emails
   * This method includes additional validation layers
   */
  static async setSuperAdmins(): Promise<boolean> {
    console.log('🔐 Executing setSuperAdmins with strict security controls...');
    
    let allSuccess = true;

    for (const email of AUTHORIZED_SUPER_ADMIN_EMAILS) {
      console.log(`🔧 Processing super_admin setup for: ${email}`);
      
      // Double-check authorization (redundant but critical for security)
      if (!this.isAuthorizedSuperAdmin(email)) {
        console.error(`🚨 CRITICAL ERROR: ${email} not in authorized list - this should never happen!`);
        allSuccess = false;
        continue;
      }

      const success = await this.updateUserRole(email, 'super_admin');
      if (!success) {
        console.error(`❌ Failed to set super_admin for ${email}`);
        allSuccess = false;
      } else {
        console.log(`✅ Successfully set super_admin for ${email}`);
      }
    }

    console.log(allSuccess ? '🎉 All authorized super admins configured successfully' : '⚠️ Some super admin setups failed');
    return allSuccess;
  }

  /**
   * BMAD Method: Controlled role progression for non-super-admin users
   * This ensures all other users follow proper epic progression
   */
  static async updateUserRoleBMAD(email: string, newRole: UserRole, currentUserEmail?: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    
    // ABSOLUTE BLOCK: No one except authorized emails can become super_admin
    if (newRole === 'super_admin') {
      console.error(`🚨 BMAD SECURITY: Blocked attempt to elevate ${normalizedEmail} to super_admin through BMAD method`);
      console.error(`🚨 Only setSuperAdmins() can create super_admin users for authorized emails`);
      return false;
    }

    // For other roles, follow BMAD progression logic
    console.log(`📈 BMAD Role Progression: ${normalizedEmail} → ${newRole}`);
    
    // Get current role to validate progression
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', normalizedEmail)
      .single();

    const currentRole = currentUser?.role || 'user';
    
    // BMAD Epic Validation Rules
    const isValidProgression = this.validateBMADProgression(currentRole, newRole);
    
    if (!isValidProgression) {
      console.error(`🚫 Invalid BMAD progression: ${currentRole} → ${newRole} for ${normalizedEmail}`);
      return false;
    }

    // Use standard updateUserRole (which already has super_admin blocks)
    return await this.updateUserRole(normalizedEmail, newRole);
  }

  /**
   * Validate BMAD method role progression rules
   */
  private static validateBMADProgression(currentRole: string, newRole: UserRole): boolean {
    // Define valid BMAD epic progressions
    const validProgressions: Record<string, UserRole[]> = {
      'user': ['organizer'], // Users can become organizers
      'organizer': ['admin'], // Organizers can become admins (with approval)
      'admin': ['admin'], // Admins can stay admins
      'super_admin': ['super_admin'] // Super admins stay super admins (but this method shouldn't be used for them)
    };

    const allowedRoles = validProgressions[currentRole] || [];
    const isValid = allowedRoles.includes(newRole);
    
    console.log(`📋 BMAD Progression Check: ${currentRole} → ${newRole} | Valid: ${isValid}`);
    return isValid;
  }

  /**
   * Get all users with admin roles
   */
  static async getAdminUsers(): Promise<{ email: string; role: UserRole; full_name?: string }[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, role, full_name')
        .in('role', ['admin', 'super_admin'])
        .order('role', { ascending: false });

      if (error) {
        console.error('Error fetching admin users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAdminUsers:', error);
      return [];
    }
  }
}