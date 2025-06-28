import { supabase } from '@/integrations/supabase/client';
import { ImageUploadService, type UploadResult } from './imageUploadService';

type UserRole = 'user' | 'organizer' | 'admin' | 'super_admin';

interface BMADImagePermissions {
  canUploadProfile: boolean;
  canUploadEventImages: boolean;
  canUploadCommunityImages: boolean;
  canUploadAdminImages: boolean;
  maxFileSize: number; // in MB
  maxFiles: number;
  allowedFormats: string[];
}

interface ImageAccessConfig {
  userId: string;
  userRole: UserRole;
  hasCompletedEpics: string[];
  organizerId?: string;
}

export class BMADImageService {
  /**
   * Get BMAD-compliant image permissions based on user role and epic completion
   */
  static getBMADImagePermissions(userRole: UserRole, hasCompletedEpics: string[] = []): BMADImagePermissions {
    const basePermissions: BMADImagePermissions = {
      canUploadProfile: true, // All users can upload profile images
      canUploadEventImages: false,
      canUploadCommunityImages: false,
      canUploadAdminImages: false,
      maxFileSize: 2, // 2MB for basic users
      maxFiles: 1,
      allowedFormats: ['image/jpeg', 'image/png']
    };

    switch (userRole) {
      case 'user':
        // Users must complete profile epic to upload profile images
        if (hasCompletedEpics.includes('profile-setup')) {
          basePermissions.maxFileSize = 3;
          basePermissions.allowedFormats.push('image/gif');
        }
        break;

      case 'organizer':
        // Organizers can upload event images after completing event-creation epic
        basePermissions.canUploadEventImages = hasCompletedEpics.includes('event-creation');
        basePermissions.maxFileSize = 5;
        basePermissions.maxFiles = 5;
        basePermissions.allowedFormats.push('image/gif', 'image/webp');
        
        // Community images require community-management epic
        basePermissions.canUploadCommunityImages = hasCompletedEpics.includes('community-management');
        break;

      case 'admin':
        // Admins have broader permissions after completing admin epics
        basePermissions.canUploadEventImages = true;
        basePermissions.canUploadCommunityImages = true;
        basePermissions.canUploadAdminImages = hasCompletedEpics.includes('admin-tools');
        basePermissions.maxFileSize = 10;
        basePermissions.maxFiles = 10;
        basePermissions.allowedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        break;

      case 'super_admin':
        // Super admins have all permissions (no epic requirements)
        return {
          canUploadProfile: true,
          canUploadEventImages: true,
          canUploadCommunityImages: true,
          canUploadAdminImages: true,
          maxFileSize: 25,
          maxFiles: 20,
          allowedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
        };
    }

    return basePermissions;
  }

  /**
   * Get BMAD-compliant folder structure for image storage
   */
  static getBMADStoragePath(
    imageType: 'profile' | 'event' | 'community' | 'admin' | 'system',
    config: ImageAccessConfig,
    entityId?: string
  ): string {
    const { userId, userRole, organizerId } = config;

    switch (imageType) {
      case 'profile':
        // Profile images stored by user ID
        return `profiles/${userId}`;

      case 'event':
        // Event images stored by organizer ID for security
        if (!organizerId) {
          throw new Error('Organizer ID required for event images');
        }
        return `events/${organizerId}/${entityId || 'general'}`;

      case 'community':
        // Community images organized by role hierarchy
        if (userRole === 'super_admin') {
          return `community/super-admin/${entityId || userId}`;
        } else if (userRole === 'admin') {
          return `community/admin/${entityId || userId}`;
        } else if (userRole === 'organizer') {
          return `community/organizer/${organizerId}/${entityId || 'general'}`;
        } else {
          throw new Error('Insufficient permissions for community images');
        }

      case 'admin':
        // Admin images only for admin+ roles
        if (!['admin', 'super_admin'].includes(userRole)) {
          throw new Error('Admin role required for admin images');
        }
        return `admin/${userRole}/${entityId || userId}`;

      case 'system':
        // System images only for super admins
        if (userRole !== 'super_admin') {
          throw new Error('Super admin role required for system images');
        }
        return `system/${entityId || 'general'}`;

      default:
        throw new Error(`Invalid image type: ${imageType}`);
    }
  }

  /**
   * Validate BMAD compliance before image upload
   */
  static async validateBMADImageUpload(
    file: File,
    imageType: 'profile' | 'event' | 'community' | 'admin' | 'system',
    config: ImageAccessConfig
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const permissions = this.getBMADImagePermissions(config.userRole, config.hasCompletedEpics);

      // Check basic file validation first
      const fileValidation = ImageUploadService.validateImageFile(file);
      if (!fileValidation.valid) {
        return fileValidation;
      }

      // Check file size against BMAD limits
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > permissions.maxFileSize) {
        return {
          valid: false,
          error: `File size ${fileSizeMB.toFixed(1)}MB exceeds ${permissions.maxFileSize}MB limit for ${config.userRole} role`
        };
      }

      // Check file format against BMAD permissions
      if (!permissions.allowedFormats.includes(file.type)) {
        return {
          valid: false,
          error: `File type ${file.type} not allowed for ${config.userRole} role. Allowed: ${permissions.allowedFormats.join(', ')}`
        };
      }

      // Check specific image type permissions
      switch (imageType) {
        case 'profile':
          if (!permissions.canUploadProfile) {
            return { valid: false, error: 'Profile image upload not permitted' };
          }
          break;

        case 'event':
          if (!permissions.canUploadEventImages) {
            return { valid: false, error: 'Event image upload requires organizer role and event-creation epic completion' };
          }
          if (config.userRole === 'organizer' && !config.organizerId) {
            return { valid: false, error: 'Organizer profile required for event image upload' };
          }
          break;

        case 'community':
          if (!permissions.canUploadCommunityImages) {
            return { valid: false, error: 'Community image upload requires community-management epic completion' };
          }
          break;

        case 'admin':
          if (!permissions.canUploadAdminImages) {
            return { valid: false, error: 'Admin image upload requires admin role and admin-tools epic completion' };
          }
          break;

        case 'system':
          if (config.userRole !== 'super_admin') {
            return { valid: false, error: 'System image upload requires super admin role' };
          }
          break;
      }

      return { valid: true };

    } catch (error) {
      return { valid: false, error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * BMAD-compliant image upload with epic progression validation
   */
  static async uploadImageBMAD(
    file: File,
    imageType: 'profile' | 'event' | 'community' | 'admin' | 'system',
    config: ImageAccessConfig,
    entityId?: string
  ): Promise<UploadResult> {
    try {
      console.log('🔐 BMAD Image Upload:', { 
        imageType, 
        userRole: config.userRole, 
        epics: config.hasCompletedEpics,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      });

      // Validate BMAD compliance
      const validation = await this.validateBMADImageUpload(file, imageType, config);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Get BMAD-compliant storage path
      const storagePath = this.getBMADStoragePath(imageType, config, entityId);
      
      console.log('📁 BMAD Storage Path:', storagePath);

      // Generate filename with BMAD metadata
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filename = `${timestamp}-${config.userRole}-${imageType}.${fileExt}`;
      const fullPath = `${storagePath}/${filename}`;

      // Upload using enhanced ImageUploadService with BMAD path
      const result = await ImageUploadService.uploadImage(file, 'images', storagePath, true, 3);

      console.log('✅ BMAD Image Upload Successful:', result);

      // Log the upload for audit trail
      await this.logBMADImageUpload({
        userId: config.userId,
        userRole: config.userRole,
        imageType,
        storagePath: result.path,
        fileSize: file.size,
        filename: file.name,
        success: true
      });

      return result;

    } catch (error) {
      console.error('❌ BMAD Image Upload Failed:', error);

      // Log failed upload attempt
      await this.logBMADImageUpload({
        userId: config.userId,
        userRole: config.userRole,
        imageType,
        storagePath: 'failed',
        fileSize: file.size,
        filename: file.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Log BMAD image operations for audit trail
   */
  private static async logBMADImageUpload(logData: {
    userId: string;
    userRole: UserRole;
    imageType: string;
    storagePath: string;
    fileSize: number;
    filename: string;
    success: boolean;
    error?: string;
  }): Promise<void> {
    try {
      const auditEntry = {
        ...logData,
        timestamp: new Date().toISOString(),
        source: 'BMADImageService'
      };

      console.log('📋 BMAD Image Audit Log:', auditEntry);
      
      // In production, this should go to a proper audit log table
      console.table([auditEntry]);

    } catch (error) {
      console.error('Failed to log BMAD image operation:', error);
    }
  }

  /**
   * Get user's current epic completion status
   */
  static async getUserEpicCompletion(userId: string): Promise<string[]> {
    try {
      // This would typically come from a user_epics table
      // For now, return mock data based on user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, created_at')
        .eq('id', userId)
        .single();

      if (!profile) return [];

      // Mock epic completion based on role and account age
      const completedEpics: string[] = [];
      const accountAge = Date.now() - new Date(profile.created_at).getTime();
      const daysSinceCreated = accountAge / (1000 * 60 * 60 * 24);

      // Basic epics for all users
      if (daysSinceCreated > 1) {
        completedEpics.push('profile-setup');
      }

      // Role-specific epics
      if (profile.role === 'organizer' || profile.role === 'admin' || profile.role === 'super_admin') {
        completedEpics.push('event-creation');
        
        if (daysSinceCreated > 7) {
          completedEpics.push('community-management');
        }
      }

      if (profile.role === 'admin' || profile.role === 'super_admin') {
        completedEpics.push('admin-tools');
      }

      return completedEpics;

    } catch (error) {
      console.error('Error fetching epic completion:', error);
      return [];
    }
  }

  /**
   * Test BMAD image system connectivity and permissions
   */
  static async testBMADImageSystem(userId: string): Promise<{ 
    canUpload: boolean; 
    permissions: BMADImagePermissions; 
    config: ImageAccessConfig;
    error?: string 
  }> {
    try {
      console.log('🧪 Testing BMAD Image System for user:', userId);
      
      // Get user configuration
      const config = await this.getBMADImageConfig(userId);
      const permissions = this.getBMADImagePermissions(config.userRole, config.hasCompletedEpics);
      
      // Test storage connectivity
      const storageTest = await ImageUploadService.testStorageConnectivity();
      if (!storageTest) {
        return {
          canUpload: false,
          permissions,
          config,
          error: 'Storage system not accessible'
        };
      }
      
      console.log('✅ BMAD Image System Test Passed:', {
        userRole: config.userRole,
        completedEpics: config.hasCompletedEpics,
        canUploadProfile: permissions.canUploadProfile,
        canUploadEvent: permissions.canUploadEventImages,
        maxFileSize: `${permissions.maxFileSize}MB`
      });
      
      return {
        canUpload: true,
        permissions,
        config
      };
      
    } catch (error) {
      console.error('❌ BMAD Image System Test Failed:', error);
      
      // Return safe defaults on error
      const fallbackConfig: ImageAccessConfig = {
        userId,
        userRole: 'user',
        hasCompletedEpics: []
      };
      
      return {
        canUpload: false,
        permissions: this.getBMADImagePermissions('user', []),
        config: fallbackConfig,
        error: error instanceof Error ? error.message : 'System test failed'
      };
    }
  }

  /**
   * Get BMAD image access configuration for a user
   */
  static async getBMADImageConfig(userId: string): Promise<ImageAccessConfig> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      const userRole = (profile?.role || 'user') as UserRole;
      const hasCompletedEpics = await this.getUserEpicCompletion(userId);

      // Get organizer ID if user is an organizer
      let organizerId: string | undefined;
      if (userRole === 'organizer') {
        const { data: organizer } = await supabase
          .from('organizers')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        organizerId = organizer?.id;
      }

      return {
        userId,
        userRole,
        hasCompletedEpics,
        organizerId
      };

    } catch (error) {
      console.error('Error getting BMAD image config:', error);
      // Return safe defaults
      return {
        userId,
        userRole: 'user',
        hasCompletedEpics: []
      };
    }
  }
}