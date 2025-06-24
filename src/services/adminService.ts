import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export class AdminService {
  /**
   * Update user role by email address
   */
  static async updateUserRole(email: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('email', email);

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      console.log(`Successfully updated ${email} to role: ${role}`);
      return true;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      return false;
    }
  }

  /**
   * Set specific users as super admins
   */
  static async setSuperAdmins(): Promise<boolean> {
    const superAdminEmails = [
      'iradwatkins@gmail.com',
      'bobbygwatkins@gmail.com'
    ];

    let allSuccess = true;

    for (const email of superAdminEmails) {
      const success = await this.updateUserRole(email, 'super_admin');
      if (!success) {
        allSuccess = false;
      }
    }

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