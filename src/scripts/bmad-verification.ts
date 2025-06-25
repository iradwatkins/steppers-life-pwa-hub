/**
 * BMAD Method Comprehensive Verification Script
 * Tests all security controls and BMAD compliance
 */

import { AdminService } from '@/services/adminService';
import { BMADImageService } from '@/services/bMADImageService';
import { setupAndTestSuperAdmins } from '@/utils/setup-super-admins';

const AUTHORIZED_SUPER_ADMIN_EMAILS = ['bobbygwatkins@gmail.com', 'iradwatkins@gmail.com'];

interface VerificationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

class BMADVerificationSuite {
  private results: VerificationResult[] = [];

  private addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
    this.results.push({ category, test, status, message, details });
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} [${category}] ${test}: ${message}`);
    
    if (details) {
      console.log('   Details:', details);
    }
  }

  async verifySuperAdminSecurity(): Promise<void> {
    console.log('\n🔐 === SUPER ADMIN SECURITY VERIFICATION ===');

    try {
      // Test 1: Verify authorized super admins are set up
      const adminUsers = await AdminService.getAdminUsers();
      const superAdmins = adminUsers.filter(u => u.role === 'super_admin');
      const authorizedSuperAdmins = superAdmins.filter(u => AUTHORIZED_SUPER_ADMIN_EMAILS.includes(u.email));
      const unauthorizedSuperAdmins = superAdmins.filter(u => !AUTHORIZED_SUPER_ADMIN_EMAILS.includes(u.email));

      if (authorizedSuperAdmins.length === AUTHORIZED_SUPER_ADMIN_EMAILS.length) {
        this.addResult('Security', 'Authorized Super Admins', 'PASS', `All ${AUTHORIZED_SUPER_ADMIN_EMAILS.length} authorized users have super_admin role`);
      } else {
        this.addResult('Security', 'Authorized Super Admins', 'FAIL', `Only ${authorizedSuperAdmins.length}/${AUTHORIZED_SUPER_ADMIN_EMAILS.length} authorized users have super_admin role`);
      }

      if (unauthorizedSuperAdmins.length === 0) {
        this.addResult('Security', 'Unauthorized Super Admins', 'PASS', 'No unauthorized users have super_admin role');
      } else {
        this.addResult('Security', 'Unauthorized Super Admins', 'FAIL', `${unauthorizedSuperAdmins.length} unauthorized users have super_admin role`, unauthorizedSuperAdmins);
      }

      // Test 2: Try unauthorized elevation
      try {
        const unauthorizedResult = await AdminService.updateUserRole('test@unauthorized.com', 'super_admin');
        if (unauthorizedResult) {
          this.addResult('Security', 'Unauthorized Elevation Block', 'FAIL', 'Unauthorized super_admin elevation was allowed!');
        } else {
          this.addResult('Security', 'Unauthorized Elevation Block', 'PASS', 'Unauthorized super_admin elevation correctly blocked');
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          this.addResult('Security', 'Unauthorized Elevation Block', 'PASS', 'Unauthorized super_admin elevation correctly blocked with error');
        } else {
          this.addResult('Security', 'Unauthorized Elevation Block', 'WARNING', 'Unexpected error during unauthorized elevation test', error);
        }
      }

    } catch (error) {
      this.addResult('Security', 'Super Admin Verification', 'FAIL', 'Failed to verify super admin security', error);
    }
  }

  async verifyBMADRoleProgression(): Promise<void> {
    console.log('\n📈 === BMAD ROLE PROGRESSION VERIFICATION ===');

    try {
      // Test valid progression: user → organizer
      const validResult = await AdminService.updateUserRoleBMAD('test@example.com', 'organizer');
      if (validResult) {
        this.addResult('BMAD', 'Valid Progression (user→organizer)', 'PASS', 'Valid BMAD progression allowed');
      } else {
        this.addResult('BMAD', 'Valid Progression (user→organizer)', 'FAIL', 'Valid BMAD progression was blocked');
      }

      // Test invalid progression: user → admin (should fail)
      const invalidResult = await AdminService.updateUserRoleBMAD('test@example.com', 'admin');
      if (invalidResult) {
        this.addResult('BMAD', 'Invalid Progression Block (user→admin)', 'FAIL', 'Invalid BMAD progression was allowed');
      } else {
        this.addResult('BMAD', 'Invalid Progression Block (user→admin)', 'PASS', 'Invalid BMAD progression correctly blocked');
      }

      // Test super_admin block in BMAD method
      const superAdminBlock = await AdminService.updateUserRoleBMAD('test@example.com', 'super_admin');
      if (superAdminBlock) {
        this.addResult('BMAD', 'Super Admin Block in BMAD', 'FAIL', 'BMAD method allowed super_admin elevation!');
      } else {
        this.addResult('BMAD', 'Super Admin Block in BMAD', 'PASS', 'BMAD method correctly blocks super_admin elevation');
      }

    } catch (error) {
      this.addResult('BMAD', 'Role Progression Test', 'FAIL', 'Failed to test BMAD role progression', error);
    }
  }

  async verifyBMADImageSystem(): Promise<void> {
    console.log('\n🖼️ === BMAD IMAGE SYSTEM VERIFICATION ===');

    try {
      // Test 1: Basic user permissions
      const userPerms = BMADImageService.getBMADImagePermissions('user', []);
      if (!userPerms.canUploadEventImages && !userPerms.canUploadAdminImages) {
        this.addResult('BMAD Images', 'Basic User Restrictions', 'PASS', 'Basic users correctly restricted from event/admin images');
      } else {
        this.addResult('BMAD Images', 'Basic User Restrictions', 'FAIL', 'Basic users have elevated image permissions');
      }

      // Test 2: Organizer permissions with epic completion
      const organizerPerms = BMADImageService.getBMADImagePermissions('organizer', ['event-creation']);
      if (organizerPerms.canUploadEventImages) {
        this.addResult('BMAD Images', 'Organizer Epic Permissions', 'PASS', 'Organizers with event-creation epic can upload event images');
      } else {
        this.addResult('BMAD Images', 'Organizer Epic Permissions', 'FAIL', 'Organizers with epic completion cannot upload event images');
      }

      // Test 3: Super admin permissions
      const superAdminPerms = BMADImageService.getBMADImagePermissions('super_admin', []);
      if (superAdminPerms.canUploadAdminImages && superAdminPerms.canUploadEventImages && superAdminPerms.canUploadCommunityImages) {
        this.addResult('BMAD Images', 'Super Admin Permissions', 'PASS', 'Super admins have all image upload permissions');
      } else {
        this.addResult('BMAD Images', 'Super Admin Permissions', 'FAIL', 'Super admins missing some image upload permissions');
      }

      // Test 4: Storage path generation
      const testConfig = {
        userId: 'test-user',
        userRole: 'organizer' as const,
        hasCompletedEpics: ['event-creation'],
        organizerId: 'test-organizer'
      };

      const profilePath = BMADImageService.getBMADStoragePath('profile', testConfig);
      const eventPath = BMADImageService.getBMADStoragePath('event', testConfig, 'test-event');

      if (profilePath.includes('profiles/test-user') && eventPath.includes('events/test-organizer')) {
        this.addResult('BMAD Images', 'Storage Path Generation', 'PASS', 'BMAD storage paths generated correctly');
      } else {
        this.addResult('BMAD Images', 'Storage Path Generation', 'FAIL', 'BMAD storage paths incorrect', { profilePath, eventPath });
      }

    } catch (error) {
      this.addResult('BMAD Images', 'Image System Test', 'FAIL', 'Failed to test BMAD image system', error);
    }
  }

  async runFullVerification(): Promise<VerificationResult[]> {
    console.log('🚀 Starting BMAD Method Comprehensive Verification...\n');
    console.log('🎯 Target: Verify super admin security and BMAD method compliance');
    console.log('📋 Authorized Super Admins:', AUTHORIZED_SUPER_ADMIN_EMAILS);
    console.log('=' .repeat(80));

    this.results = []; // Reset results

    // Run all verification tests
    await this.verifySuperAdminSecurity();
    await this.verifyBMADRoleProgression();
    await this.verifyBMADImageSystem();

    // Summary
    console.log('\n' + '=' .repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('=' .repeat(80));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    console.log(`✅ PASSED: ${passed}`);
    console.log(`❌ FAILED: ${failed}`);
    console.log(`⚠️ WARNINGS: ${warnings}`);
    console.log(`📊 TOTAL: ${this.results.length}`);

    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! BMAD Method security is properly implemented.');
    } else {
      console.log(`\n🚨 ${failed} TESTS FAILED! Security issues detected.`);
    }

    // Show failed tests
    const failedTests = this.results.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`   • [${test.category}] ${test.test}: ${test.message}`);
      });
    }

    return this.results;
  }
}

// Export for use in components and console
export async function runBMADVerification(): Promise<VerificationResult[]> {
  const suite = new BMADVerificationSuite();
  return await suite.runFullVerification();
}

// Make available globally for console access
if (typeof window !== 'undefined') {
  (window as any).runBMADVerification = runBMADVerification;
  console.log('🔧 BMAD Verification available: runBMADVerification()');
}

export default runBMADVerification;