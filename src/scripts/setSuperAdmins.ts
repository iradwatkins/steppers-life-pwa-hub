/**
 * Script to set super admin roles for specific users
 * Run this in the browser console or as part of initialization
 */

import { AdminService } from '@/services/adminService';

export async function setSuperAdminRoles() {
  console.log('🔧 Setting super admin roles...');
  
  try {
    const success = await AdminService.setSuperAdmins();
    
    if (success) {
      console.log('✅ Successfully set super admin roles');
      
      // Verify the changes
      const adminUsers = await AdminService.getAdminUsers();
      console.log('📋 Current admin users:', adminUsers);
    } else {
      console.error('❌ Failed to set some super admin roles');
    }
  } catch (error) {
    console.error('❌ Error setting super admin roles:', error);
  }
}

// Auto-run if in development environment
if (import.meta.env.DEV) {
  console.log('🚀 Development mode detected - super admin roles can be set via setSuperAdminRoles()');
}