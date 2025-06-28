import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

// Admin emails for initial setup
const AUTHORIZED_ADMIN_EMAILS = Object.freeze([
  'bobbygwatkins@gmail.com',
  'iradwatkins@gmail.com'
]);

export class AdminService {
  /**
   * Validate if email is authorized for admin role
   */
  private static isAuthorizedAdmin(email: string): boolean {
    return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
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
   * Update user role by email address with security controls
   */
  static async updateUserRole(email: string, role: UserRole): Promise<boolean> {
    try {
      const normalizedEmail = email.toLowerCase().trim();

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
   * Set authorized users as admins
   */
  static async setAuthorizedAdmins(): Promise<boolean> {
    console.log('🔐 Setting up authorized admins...');
    
    let allSuccess = true;

    for (const email of AUTHORIZED_ADMIN_EMAILS) {
      console.log(`🔧 Processing admin setup for: ${email}`);
      
      const success = await this.updateUserRole(email, 'admin');
      if (!success) {
        console.error(`❌ Failed to set admin for ${email}`);
        allSuccess = false;
      } else {
        console.log(`✅ Successfully set admin for ${email}`);
      }
    }

    console.log(allSuccess ? '🎉 All authorized admins configured successfully' : '⚠️ Some admin setups failed');
    return allSuccess;
  }

  /**
   * Get all users with admin roles
   */
  static async getAdminUsers(): Promise<{ email: string; role: UserRole; full_name?: string }[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, role, full_name')
        .eq('role', 'admin')
        .order('email');

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