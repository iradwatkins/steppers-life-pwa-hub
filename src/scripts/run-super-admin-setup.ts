/**
 * Standalone script to setup super admin privileges
 * Can be run in browser console or called from components
 */

import { setupAndTestSuperAdmins } from '@/utils/setup-super-admins';

// Main execution function
export async function runSuperAdminSetup(): Promise<void> {
  console.log('🚀 Starting Super Admin Setup Script...');
  console.log('📧 Target emails: bobbygwatkins@gmail.com, iradwatkins@gmail.com');
  
  try {
    await setupAndTestSuperAdmins();
    console.log('🎉 Super Admin Setup Script completed successfully!');
  } catch (error) {
    console.error('❌ Super Admin Setup Script failed:', error);
    throw error;
  }
}

// Auto-run in development mode
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Make it available globally for easy console access
  (window as any).runSuperAdminSetup = runSuperAdminSetup;
  console.log('🔧 Development mode: Run super admin setup with: runSuperAdminSetup()');
}

// Export for use in components
export default runSuperAdminSetup;