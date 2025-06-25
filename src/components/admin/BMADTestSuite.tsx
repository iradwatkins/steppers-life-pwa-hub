import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminService } from '@/services/adminService';
import { supabase } from '@/integrations/supabase/client';
import { verifyAndCreateStorageBucket, testImageUpload } from '@/utils/storage-setup';
import { ImageUploadService } from '@/services/imageUploadService';
import { BMADImageService } from '@/services/bMADImageService';
import { bMADValidationService } from '@/services/bMADValidationService';
import { storeService } from '@/services/storeService';
import { serviceService } from '@/services/serviceService';
import { followerCommissionService } from '@/services/followerCommissionService';
import { businessPromotionService } from '@/services/businessPromotionService';
import { Shield, TestTube, CheckCircle, XCircle, AlertTriangle, Database, Image as ImageIcon, Store, Users, Megaphone } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  details?: any;
}

const AUTHORIZED_EMAILS = ['bobbygwatkins@gmail.com', 'iradwatkins@gmail.com'];
const TEST_UNAUTHORIZED_EMAIL = 'test@unauthorized.com';

export const BMADTestSuite: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    // Core Security Tests
    { name: 'Super Admin Authorization Test', status: 'pending', message: 'Not run' },
    { name: 'Unauthorized Escalation Block Test', status: 'pending', message: 'Not run' },
    { name: 'BMAD Role Progression Test', status: 'pending', message: 'Not run' },
    { name: 'Database Role Update Test', status: 'pending', message: 'Not run' },
    
    // Image System Tests
    { name: 'Image Storage Setup Test', status: 'pending', message: 'Not run' },
    { name: 'BMAD Image Permissions Test', status: 'pending', message: 'Not run' },
    { name: 'Image Upload Security Test', status: 'pending', message: 'Not run' },
    
    // BMAD Validation Service Tests
    { name: 'BMAD Validation Service Test', status: 'pending', message: 'Not run' },
    { name: 'Epic Completion Validation Test', status: 'pending', message: 'Not run' },
    
    // Store/Service Creation Tests
    { name: 'Store Creation BMAD Validation', status: 'pending', message: 'Not run' },
    { name: 'Service Creation BMAD Validation', status: 'pending', message: 'Not run' },
    
    // Commission System Tests
    { name: 'Commission Eligibility Validation', status: 'pending', message: 'Not run' },
    { name: 'Sales Attribution BMAD Compliance', status: 'pending', message: 'Not run' },
    
    // Business Promotion Tests
    { name: 'Business Promotion BMAD Validation', status: 'pending', message: 'Not run' },
    { name: 'Community Post Creation Validation', status: 'pending', message: 'Not run' },
    
    // Final Validation
    { name: 'Current Super Admin Validation', status: 'pending', message: 'Not run' },
    { name: 'Complete BMAD System Integration', status: 'pending', message: 'Not run' }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runTest = async (testIndex: number, testFunction: () => Promise<{ success: boolean; message: string; details?: any }>) => {
    updateTest(testIndex, { status: 'running', message: 'Running...' });
    
    try {
      const result = await testFunction();
      updateTest(testIndex, { 
        status: result.success ? 'passed' : 'failed', 
        message: result.message,
        details: result.details
      });
    } catch (error) {
      updateTest(testIndex, { 
        status: 'failed', 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }
  };

  // Test 1: Super Admin Authorization
  const testSuperAdminAuth = async () => {
    console.log('🧪 Testing Super Admin Authorization...');
    
    try {
      const success = await AdminService.setSuperAdmins();
      
      if (!success) {
        return { success: false, message: 'setSuperAdmins() returned false' };
      }

      // Verify both authorized emails have super_admin role
      const adminUsers = await AdminService.getAdminUsers();
      const superAdmins = adminUsers.filter(u => u.role === 'super_admin');
      const authorizedSuperAdmins = superAdmins.filter(u => AUTHORIZED_EMAILS.includes(u.email));

      if (authorizedSuperAdmins.length === AUTHORIZED_EMAILS.length) {
        return { 
          success: true, 
          message: `✅ Both authorized emails have super_admin role`, 
          details: authorizedSuperAdmins 
        };
      } else {
        return { 
          success: false, 
          message: `❌ Only ${authorizedSuperAdmins.length}/${AUTHORIZED_EMAILS.length} authorized users have super_admin`, 
          details: { found: authorizedSuperAdmins, expected: AUTHORIZED_EMAILS }
        };
      }
    } catch (error) {
      return { success: false, message: `Failed: ${error}` };
    }
  };

  // Test 2: Unauthorized Escalation Block
  const testUnauthorizedBlock = async () => {
    console.log('🧪 Testing Unauthorized Escalation Block...');
    
    try {
      // Try to elevate an unauthorized email to super_admin
      const result = await AdminService.updateUserRole(TEST_UNAUTHORIZED_EMAIL, 'super_admin');
      
      if (result) {
        return { 
          success: false, 
          message: '❌ SECURITY FAILURE: Unauthorized user was elevated to super_admin!' 
        };
      } else {
        return { 
          success: true, 
          message: '✅ Unauthorized elevation correctly blocked' 
        };
      }
    } catch (error) {
      // An error is expected when trying unauthorized elevation
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return { 
          success: true, 
          message: '✅ Unauthorized elevation correctly blocked with error' 
        };
      } else {
        return { success: false, message: `Unexpected error: ${error}` };
      }
    }
  };

  // Test 3: BMAD Role Progression
  const testBMADProgression = async () => {
    console.log('🧪 Testing BMAD Role Progression...');
    
    try {
      // Test invalid progression: user directly to admin (should fail)
      const invalidResult = await AdminService.updateUserRoleBMAD('test@example.com', 'admin');
      
      if (invalidResult) {
        return { 
          success: false, 
          message: '❌ Invalid BMAD progression was allowed (user→admin)' 
        };
      }

      // Test valid progression: user to organizer (should succeed)
      const validResult = await AdminService.updateUserRoleBMAD('test@example.com', 'organizer');
      
      return { 
        success: validResult, 
        message: validResult ? '✅ BMAD progression rules working correctly' : '❌ Valid BMAD progression failed'
      };
    } catch (error) {
      return { success: false, message: `Error: ${error}` };
    }
  };

  // Test 4: Database Role Update
  const testDatabaseUpdate = async () => {
    console.log('🧪 Testing Database Role Updates...');
    
    try {
      // Check if we can read from profiles table
      const { data: profiles, error: readError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .limit(1);

      if (readError) {
        return { 
          success: false, 
          message: `❌ Cannot read profiles table: ${readError.message}` 
        };
      }

      // Check if we can query for admin users
      const adminUsers = await AdminService.getAdminUsers();
      
      if (adminUsers.length === 0) {
        return { 
          success: false, 
          message: '❌ No admin users found - may indicate database access issues' 
        };
      }

      return { 
        success: true, 
        message: `✅ Database access working (${adminUsers.length} admin users found)`,
        details: adminUsers
      };
    } catch (error) {
      return { success: false, message: `Database error: ${error}` };
    }
  };

  // Test 5: Image Storage Setup
  const testImageStorage = async () => {
    console.log('🧪 Testing Image Storage Setup...');
    
    try {
      const bucketExists = await verifyAndCreateStorageBucket();
      
      if (!bucketExists) {
        return { 
          success: false, 
          message: '❌ Image storage bucket setup failed' 
        };
      }

      const uploadTest = await testImageUpload();
      
      return { 
        success: uploadTest, 
        message: uploadTest ? '✅ Image storage working correctly' : '❌ Image upload test failed'
      };
    } catch (error) {
      return { success: false, message: `Storage error: ${error}` };
    }
  };

  // Test 6: BMAD Image Permissions
  const testBMADImagePermissions = async () => {
    console.log('🧪 Testing BMAD Image Permissions...');
    
    try {
      // Test permissions for different user roles
      const userPermissions = BMADImageService.getBMADImagePermissions('user', []);
      const organizerPermissions = BMADImageService.getBMADImagePermissions('organizer', ['event-creation']);
      const adminPermissions = BMADImageService.getBMADImagePermissions('admin', ['admin-tools']);
      const superAdminPermissions = BMADImageService.getBMADImagePermissions('super_admin', []);

      // Verify basic user restrictions
      if (userPermissions.canUploadEventImages || userPermissions.canUploadAdminImages) {
        return { 
          success: false, 
          message: '❌ Basic users should not have event/admin upload permissions' 
        };
      }

      // Verify organizer permissions
      if (!organizerPermissions.canUploadEventImages) {
        return { 
          success: false, 
          message: '❌ Organizers with event-creation epic should have event upload permissions' 
        };
      }

      // Verify super admin permissions
      if (!superAdminPermissions.canUploadAdminImages || !superAdminPermissions.canUploadEventImages) {
        return { 
          success: false, 
          message: '❌ Super admins should have all upload permissions' 
        };
      }

      return { 
        success: true, 
        message: '✅ BMAD image permissions working correctly',
        details: { userPermissions, organizerPermissions, adminPermissions, superAdminPermissions }
      };
    } catch (error) {
      return { success: false, message: `BMAD permissions error: ${error}` };
    }
  };

  // Test 7: Image Upload Security
  const testImageSecurity = async () => {
    console.log('🧪 Testing Image Upload Security...');
    
    try {
      // Test that ImageUploadService follows proper folder structure
      const testPaths = [
        'profiles/test-user-id',
        'events/test-event-id',
        'unauthorized/path'
      ];

      // This is more of a structural test - verify the service exists and has proper methods
      const hasUploadMethod = typeof ImageUploadService.uploadImage === 'function';
      const hasProfileMethod = typeof ImageUploadService.uploadProfilePicture === 'function';
      const hasEventMethod = typeof ImageUploadService.uploadEventImages === 'function';

      if (hasUploadMethod && hasProfileMethod && hasEventMethod) {
        return { 
          success: true, 
          message: '✅ Image upload service structure is correct' 
        };
      } else {
        return { 
          success: false, 
          message: '❌ Image upload service missing required methods' 
        };
      }
    } catch (error) {
      return { success: false, message: `Image security error: ${error}` };
    }
  };

  // Test 8: BMAD Validation Service
  const testBMADValidationService = async () => {
    console.log('🧪 Testing BMAD Validation Service...');
    
    try {
      // Test basic service functionality
      const mockUserId = 'test-user-123';
      
      // Test epic completion validation
      const storeValidation = await bMADValidationService.validateFeatureAccess(mockUserId, 'create_store');
      const serviceValidation = await bMADValidationService.validateFeatureAccess(mockUserId, 'create_service');
      const commissionValidation = await bMADValidationService.validateFeatureAccess(mockUserId, 'earn_commissions');
      
      // Validation should fail for user without epics (expected behavior)
      if (storeValidation.isValid || serviceValidation.isValid || commissionValidation.isValid) {
        return {
          success: false,
          message: '❌ BMAD validation incorrectly allowed access without completed epics'
        };
      }
      
      // Check that proper error messages and missing epics are returned
      if (storeValidation.missingEpics.length === 0 || serviceValidation.missingEpics.length === 0) {
        return {
          success: false,
          message: '❌ BMAD validation not properly identifying missing epics'
        };
      }
      
      return {
        success: true,
        message: '✅ BMAD validation service working correctly',
        details: { storeValidation, serviceValidation, commissionValidation }
      };
    } catch (error) {
      return { success: false, message: `BMAD validation error: ${error}` };
    }
  };

  // Test 9: Epic Completion Validation
  const testEpicCompletionValidation = async () => {
    console.log('🧪 Testing Epic Completion Validation...');
    
    try {
      const mockUserId = 'test-user-123';
      const testEpics = ['profile-setup', 'community-engagement', 'business-verification'];
      
      // Test epic completion status checking
      const epicStatus = await bMADValidationService.getEpicCompletionStatus(mockUserId, testEpics);
      
      if (!Array.isArray(epicStatus) || epicStatus.length !== testEpics.length) {
        return {
          success: false,
          message: '❌ Epic completion status not returned correctly'
        };
      }
      
      // Verify each epic has required properties
      const validEpicStatus = epicStatus.every(epic => 
        epic.hasOwnProperty('epicId') && 
        epic.hasOwnProperty('isCompleted') && 
        epic.hasOwnProperty('progress')
      );
      
      if (!validEpicStatus) {
        return {
          success: false,
          message: '❌ Epic status objects missing required properties'
        };
      }
      
      return {
        success: true,
        message: '✅ Epic completion validation working correctly',
        details: epicStatus
      };
    } catch (error) {
      return { success: false, message: `Epic validation error: ${error}` };
    }
  };

  // Test 10: Store Creation BMAD Validation
  const testStoreCreationValidation = async () => {
    console.log('🧪 Testing Store Creation BMAD Validation...');
    
    try {
      // Test that store creation requires BMAD validation
      const mockStoreData = {
        name: 'Test BMAD Store',
        category_id: 'test-category',
        description: 'Test store for BMAD validation',
        location_type: 'online' as const
      };
      
      // This should fail because test user doesn't have required epics
      try {
        await storeService.createStore(mockStoreData);
        return {
          success: false,
          message: '❌ Store creation should have been blocked by BMAD validation'
        };
      } catch (error) {
        // Expected error - BMAD validation should block this
        if (error instanceof Error && error.message.includes('epic')) {
          return {
            success: true,
            message: '✅ Store creation correctly blocked by BMAD validation'
          };
        } else {
          return {
            success: false,
            message: `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      }
    } catch (error) {
      return { success: false, message: `Store validation error: ${error}` };
    }
  };

  // Test 11: Service Creation BMAD Validation
  const testServiceCreationValidation = async () => {
    console.log('🧪 Testing Service Creation BMAD Validation...');
    
    try {
      const mockServiceData = {
        business_name: 'Test BMAD Service',
        category_id: 'test-category',
        service_description: 'Test service for BMAD validation',
        location_type: 'online' as const,
        service_offerings: ['Testing']
      };
      
      try {
        await serviceService.createService(mockServiceData);
        return {
          success: false,
          message: '❌ Service creation should have been blocked by BMAD validation'
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('epic')) {
          return {
            success: true,
            message: '✅ Service creation correctly blocked by BMAD validation'
          };
        } else {
          return {
            success: false,
            message: `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      }
    } catch (error) {
      return { success: false, message: `Service validation error: ${error}` };
    }
  };

  // Test 12: Commission Eligibility Validation
  const testCommissionEligibilityValidation = async () => {
    console.log('🧪 Testing Commission Eligibility Validation...');
    
    try {
      const mockFollowerId = 'test-follower-123';
      
      // Test commission summary with BMAD status
      const summary = await followerCommissionService.getFollowerCommissionSummary(mockFollowerId);
      
      // Verify BMAD status is included in response
      if (!summary.bmad_status) {
        return {
          success: false,
          message: '❌ Commission summary missing BMAD status validation'
        };
      }
      
      // Check that BMAD status has required properties
      const requiredProps = ['commission_eligible', 'required_epics', 'completed_epics', 'missing_epics'];
      const hasAllProps = requiredProps.every(prop => summary.bmad_status.hasOwnProperty(prop));
      
      if (!hasAllProps) {
        return {
          success: false,
          message: '❌ BMAD status missing required properties'
        };
      }
      
      return {
        success: true,
        message: '✅ Commission eligibility validation working correctly',
        details: summary.bmad_status
      };
    } catch (error) {
      return { success: false, message: `Commission validation error: ${error}` };
    }
  };

  // Test 13: Sales Attribution BMAD Compliance
  const testSalesAttributionCompliance = async () => {
    console.log('🧪 Testing Sales Attribution BMAD Compliance...');
    
    try {
      // Test that sales attribution requires BMAD validation
      const mockData = {
        orderId: 'test-order-123',
        followerPermissionId: 'test-permission-123',
        saleAmount: 100,
        attributionData: {
          attribution_method: 'manual' as const
        }
      };
      
      // This should fail because follower doesn't exist/isn't eligible
      const result = await followerCommissionService.createSalesAttribution(
        mockData.orderId,
        mockData.followerPermissionId,
        mockData.saleAmount,
        mockData.attributionData
      );
      
      // Result should be null due to BMAD validation failure
      if (result === null) {
        return {
          success: true,
          message: '✅ Sales attribution correctly blocked by BMAD validation'
        };
      } else {
        return {
          success: false,
          message: '❌ Sales attribution should have been blocked'
        };
      }
    } catch (error) {
      // Expected error due to missing follower permission
      if (error instanceof Error && (error.message.includes('permission') || error.message.includes('epic'))) {
        return {
          success: true,
          message: '✅ Sales attribution correctly blocked by BMAD validation'
        };
      }
      return { success: false, message: `Attribution error: ${error}` };
    }
  };

  // Test 14: Business Promotion BMAD Validation
  const testBusinessPromotionValidation = async () => {
    console.log('🧪 Testing Business Promotion BMAD Validation...');
    
    try {
      const mockPromotionData = {
        business_id: 'test-business-123',
        business_type: 'store' as const,
        promotion_type: 'featured' as const,
        title: 'Test BMAD Promotion',
        description: 'Test promotion for BMAD validation',
        promotion_content: {},
        promotion_schedule: {
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 86400000).toISOString()
        },
        budget: { total_budget: 100 }
      };
      
      try {
        await businessPromotionService.createPromotion(mockPromotionData);
        return {
          success: false,
          message: '❌ Business promotion should have been blocked by BMAD validation'
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('epic')) {
          return {
            success: true,
            message: '✅ Business promotion correctly blocked by BMAD validation'
          };
        } else {
          return {
            success: false,
            message: `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      }
    } catch (error) {
      return { success: false, message: `Promotion validation error: ${error}` };
    }
  };

  // Test 15: Community Post Creation Validation
  const testCommunityPostValidation = async () => {
    console.log('🧪 Testing Community Post Creation Validation...');
    
    try {
      const mockPostData = {
        business_id: 'test-business-123',
        business_type: 'service' as const,
        post_type: 'announcement' as const,
        content: {
          title: 'Test BMAD Post',
          description: 'Test community post for BMAD validation'
        },
        visibility: 'public' as const,
        boost_level: 'none' as const
      };
      
      try {
        await businessPromotionService.createCommunityPost(mockPostData);
        return {
          success: false,
          message: '❌ Community post should have been blocked by BMAD validation'
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('epic')) {
          return {
            success: true,
            message: '✅ Community post correctly blocked by BMAD validation'
          };
        } else {
          return {
            success: false,
            message: `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      }
    } catch (error) {
      return { success: false, message: `Community post validation error: ${error}` };
    }
  };

  // Test 16: Current Super Admin Validation
  const testCurrentSuperAdmins = async () => {
    console.log('🧪 Testing Current Super Admin Status...');
    
    try {
      const adminUsers = await AdminService.getAdminUsers();
      const superAdmins = adminUsers.filter(u => u.role === 'super_admin');
      const authorizedSuperAdmins = superAdmins.filter(u => AUTHORIZED_EMAILS.includes(u.email));
      const unauthorizedSuperAdmins = superAdmins.filter(u => !AUTHORIZED_EMAILS.includes(u.email));

      const message = `Found ${superAdmins.length} super admins: ${authorizedSuperAdmins.length} authorized, ${unauthorizedSuperAdmins.length} unauthorized`;
      
      return { 
        success: unauthorizedSuperAdmins.length === 0, 
        message: unauthorizedSuperAdmins.length === 0 ? `✅ ${message}` : `⚠️ ${message}`,
        details: { authorized: authorizedSuperAdmins, unauthorized: unauthorizedSuperAdmins }
      };
    } catch (error) {
      return { success: false, message: `Validation error: ${error}` };
    }
  };

  // Test 17: Complete BMAD System Integration
  const testCompleteBMADIntegration = async () => {
    console.log('🧪 Testing Complete BMAD System Integration...');
    
    try {
      // Count previous test results
      const passedTests = tests.filter(t => t.status === 'passed').length;
      const failedTests = tests.filter(t => t.status === 'failed').length;
      const totalCoreTests = tests.length - 1; // Excluding this test
      
      // Calculate success rate
      const successRate = passedTests / totalCoreTests;
      
      // Check if critical systems are working
      const criticalTests = [
        'Super Admin Authorization Test',
        'BMAD Validation Service Test', 
        'Store Creation BMAD Validation',
        'Service Creation BMAD Validation',
        'Commission Eligibility Validation',
        'Business Promotion BMAD Validation'
      ];
      
      const criticalPassed = tests.filter(t => 
        criticalTests.includes(t.name) && t.status === 'passed'
      ).length;
      
      const criticalSuccessRate = criticalPassed / criticalTests.length;
      
      if (criticalSuccessRate >= 0.8 && successRate >= 0.7) {
        return {
          success: true,
          message: `✅ BMAD system integration successful (${Math.round(successRate * 100)}% overall, ${Math.round(criticalSuccessRate * 100)}% critical)`,
          details: {
            overall_success_rate: successRate,
            critical_success_rate: criticalSuccessRate,
            passed_tests: passedTests,
            failed_tests: failedTests,
            critical_passed: criticalPassed,
            critical_total: criticalTests.length
          }
        };
      } else {
        return {
          success: false,
          message: `❌ BMAD system integration issues detected (${Math.round(successRate * 100)}% overall, ${Math.round(criticalSuccessRate * 100)}% critical)`,
          details: {
            overall_success_rate: successRate,
            critical_success_rate: criticalSuccessRate,
            passed_tests: passedTests,
            failed_tests: failedTests,
            critical_passed: criticalPassed,
            critical_total: criticalTests.length
          }
        };
      }
    } catch (error) {
      return { success: false, message: `Integration test error: ${error}` };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    const testFunctions = [
      testSuperAdminAuth,
      testUnauthorizedBlock,
      testBMADProgression,
      testDatabaseUpdate,
      testImageStorage,
      testBMADImagePermissions,
      testImageSecurity,
      testBMADValidationService,
      testEpicCompletionValidation,
      testStoreCreationValidation,
      testServiceCreationValidation,
      testCommissionEligibilityValidation,
      testSalesAttributionCompliance,
      testBusinessPromotionValidation,
      testCommunityPostValidation,
      testCurrentSuperAdmins,
      testCompleteBMADIntegration
    ];

    for (let i = 0; i < testFunctions.length; i++) {
      await runTest(i, testFunctions[i]);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  const runSingleTest = async (index: number) => {
    const testFunctions = [
      testSuperAdminAuth,
      testUnauthorizedBlock,
      testBMADProgression,
      testDatabaseUpdate,
      testImageStorage,
      testBMADImagePermissions,
      testImageSecurity,
      testBMADValidationService,
      testEpicCompletionValidation,
      testStoreCreationValidation,
      testServiceCreationValidation,
      testCommissionEligibilityValidation,
      testSalesAttributionCompliance,
      testBusinessPromotionValidation,
      testCommunityPostValidation,
      testCurrentSuperAdmins,
      testCompleteBMADIntegration
    ];
    
    await runTest(index, testFunctions[index]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-600">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            BMAD Method Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing for super admin security and BMAD method compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600">✅ {passedTests} Passed</span>
              <span className="text-red-600">❌ {failedTests} Failed</span>
              <span className="text-gray-600">📊 {tests.length} Total</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <span className="font-medium">{test.name}</span>
                    <p className="text-sm text-muted-foreground">{test.message}</p>
                    {test.details && (
                      <details className="mt-1">
                        <summary className="text-xs text-blue-600 cursor-pointer">Show details</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(test.status)}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => runSingleTest(index)}
                    disabled={isRunning}
                  >
                    Run
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Configure test parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email (for BMAD progression tests)</Label>
              <Input
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Authorized Super Admin Emails:</h4>
              <ul className="text-sm text-blue-700 mt-1">
                {AUTHORIZED_EMAILS.map(email => (
                  <li key={email}>• {email}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};