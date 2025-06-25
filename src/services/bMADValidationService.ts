/**
 * BMAD METHOD: Validation Service
 * 
 * Centralized BMAD method validation for epic completion and user status requirements
 * Ensures all business operations follow BMAD progression and security controls
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  UserStatus, 
  ExtendedUserStatus, 
  CoreUserRole,
  BMAD_EPIC_REQUIREMENTS,
  FEATURE_AUTHORIZATIONS,
  FeatureAuthorization 
} from '@/types/user-status';

export interface BMADValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredEpics: string[];
  completedEpics: string[];
  missingEpics: string[];
  userStatus: UserStatus | null;
}

export interface EpicCompletionCheck {
  epicId: string;
  isCompleted: boolean;
  completedAt?: string;
  progress?: number;
}

class BMADValidationService {

  /**
   * Validate user can perform a specific feature based on BMAD requirements
   */
  async validateFeatureAccess(
    userId: string, 
    featureName: string
  ): Promise<BMADValidationResult> {
    try {
      // Get feature authorization requirements
      const featureAuth = FEATURE_AUTHORIZATIONS.find(f => f.featureName === featureName);
      if (!featureAuth) {
        return {
          isValid: false,
          errors: [`Feature '${featureName}' not found in authorization matrix`],
          warnings: [],
          requiredEpics: [],
          completedEpics: [],
          missingEpics: [],
          userStatus: null
        };
      }

      // Get user's current status and epic completion
      const userStatus = await this.getUserStatus(userId);
      if (!userStatus) {
        return {
          isValid: false,
          errors: ['User status not found'],
          warnings: [],
          requiredEpics: featureAuth.requiredEpics,
          completedEpics: [],
          missingEpics: featureAuth.requiredEpics,
          userStatus: null
        };
      }

      // Validate core role requirements
      const hasRequiredRole = featureAuth.requiredCoreRole.includes(userStatus.coreRole);
      if (!hasRequiredRole) {
        return {
          isValid: false,
          errors: [`Insufficient role: requires one of [${featureAuth.requiredCoreRole.join(', ')}], current: ${userStatus.coreRole}`],
          warnings: [],
          requiredEpics: featureAuth.requiredEpics,
          completedEpics: userStatus.completedEpics,
          missingEpics: this.getMissingEpics(featureAuth.requiredEpics, userStatus.completedEpics),
          userStatus
        };
      }

      // Validate required statuses if specified
      if (featureAuth.requiredStatuses && featureAuth.requiredStatuses.length > 0) {
        const hasRequiredStatus = featureAuth.requiredStatuses.some(
          status => userStatus.extendedStatuses.includes(status)
        );
        if (!hasRequiredStatus) {
          return {
            isValid: false,
            errors: [`Missing required status: requires one of [${featureAuth.requiredStatuses.join(', ')}]`],
            warnings: [],
            requiredEpics: featureAuth.requiredEpics,
            completedEpics: userStatus.completedEpics,
            missingEpics: this.getMissingEpics(featureAuth.requiredEpics, userStatus.completedEpics),
            userStatus
          };
        }
      }

      // Validate epic completion
      const missingEpics = this.getMissingEpics(featureAuth.requiredEpics, userStatus.completedEpics);
      if (missingEpics.length > 0) {
        return {
          isValid: false,
          errors: [`Missing required epics: ${missingEpics.join(', ')}`],
          warnings: [],
          requiredEpics: featureAuth.requiredEpics,
          completedEpics: userStatus.completedEpics,
          missingEpics,
          userStatus
        };
      }

      // Run additional checks if specified
      if (featureAuth.additionalChecks && !featureAuth.additionalChecks(userStatus)) {
        return {
          isValid: false,
          errors: ['Additional authorization checks failed'],
          warnings: [],
          requiredEpics: featureAuth.requiredEpics,
          completedEpics: userStatus.completedEpics,
          missingEpics: [],
          userStatus
        };
      }

      return {
        isValid: true,
        errors: [],
        warnings: [],
        requiredEpics: featureAuth.requiredEpics,
        completedEpics: userStatus.completedEpics,
        missingEpics: [],
        userStatus
      };

    } catch (error) {
      console.error('Error validating feature access:', error);
      return {
        isValid: false,
        errors: ['Validation service error'],
        warnings: [],
        requiredEpics: [],
        completedEpics: [],
        missingEpics: [],
        userStatus: null
      };
    }
  }

  /**
   * Validate user can achieve a specific extended status
   */
  async validateStatusRequirements(
    userId: string,
    targetStatus: ExtendedUserStatus
  ): Promise<BMADValidationResult> {
    try {
      const requiredEpics = BMAD_EPIC_REQUIREMENTS[targetStatus];
      if (!requiredEpics) {
        return {
          isValid: false,
          errors: [`Status '${targetStatus}' not found in BMAD requirements`],
          warnings: [],
          requiredEpics: [],
          completedEpics: [],
          missingEpics: [],
          userStatus: null
        };
      }

      const userStatus = await this.getUserStatus(userId);
      if (!userStatus) {
        return {
          isValid: false,
          errors: ['User status not found'],
          warnings: [],
          requiredEpics,
          completedEpics: [],
          missingEpics: requiredEpics,
          userStatus: null
        };
      }

      const missingEpics = this.getMissingEpics(requiredEpics, userStatus.completedEpics);
      
      return {
        isValid: missingEpics.length === 0,
        errors: missingEpics.length > 0 ? [`Missing epics for '${targetStatus}': ${missingEpics.join(', ')}`] : [],
        warnings: [],
        requiredEpics,
        completedEpics: userStatus.completedEpics,
        missingEpics,
        userStatus
      };

    } catch (error) {
      console.error('Error validating status requirements:', error);
      return {
        isValid: false,
        errors: ['Status validation error'],
        warnings: [],
        requiredEpics: [],
        completedEpics: [],
        missingEpics: [],
        userStatus: null
      };
    }
  }

  /**
   * Get user's current status including epic completion
   */
  async getUserStatus(userId: string): Promise<UserStatus | null> {
    try {
      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role, full_name, email')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      // Get completed epics (mock implementation - replace with actual epic tracking)
      const completedEpics = await this.getUserCompletedEpics(userId);

      // Get business permissions based on role and epics
      const businessPermissions = this.calculateBusinessPermissions(
        profile.user_role as CoreUserRole,
        completedEpics
      );

      // Get commission permissions based on role and epics
      const commissionPermissions = this.calculateCommissionPermissions(
        profile.user_role as CoreUserRole,
        completedEpics
      );

      // Determine extended statuses based on epic completion
      const extendedStatuses = this.determineExtendedStatuses(
        profile.user_role as CoreUserRole,
        completedEpics
      );

      return {
        coreRole: profile.user_role as CoreUserRole,
        extendedStatuses,
        completedEpics,
        businessPermissions,
        commissionPermissions,
        verificationLevel: 'email_verified', // Mock - replace with actual verification tracking
        activityMetrics: {
          eventsAttended: 0,
          ticketsPurchased: 0,
          reviewsWritten: 0,
          commissionsEarned: 0,
          businessListingsCreated: 0,
          followersCount: 0,
          organizersFollowed: 0,
          salesGenerated: 0,
          communityPostsCount: 0
        }
      };

    } catch (error) {
      console.error('Error getting user status:', error);
      return null;
    }
  }

  /**
   * Get user's completed epics (mock implementation)
   */
  private async getUserCompletedEpics(userId: string): Promise<string[]> {
    try {
      // Mock implementation - replace with actual epic tracking system
      const { data: epicProgress, error } = await supabase
        .from('user_epic_progress')
        .select('epic_id, completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (error) {
        console.error('Error fetching epic progress:', error);
        // Return basic epics for all users to allow testing
        return ['profile-setup'];
      }

      return epicProgress?.map(ep => ep.epic_id) || ['profile-setup'];
    } catch (error) {
      console.error('Error getting completed epics:', error);
      return ['profile-setup']; // Minimum epic for all users
    }
  }

  /**
   * Calculate business permissions based on role and epic completion
   */
  private calculateBusinessPermissions(
    role: CoreUserRole,
    completedEpics: string[]
  ) {
    const hasBusinessVerification = completedEpics.includes('business-verification');
    const hasCommunityEngagement = completedEpics.includes('community-engagement');
    const hasServiceCertification = completedEpics.includes('service-certification');

    return {
      canCreateStore: hasBusinessVerification && hasCommunityEngagement,
      canCreateService: hasServiceCertification && hasCommunityEngagement,
      canManageBusinessListings: role !== 'user' || hasBusinessVerification,
      canPromoteInCommunity: hasBusinessVerification && hasCommunityEngagement,
      canAccessBusinessAnalytics: role !== 'user',
      maxBusinessListings: role === 'super_admin' ? 999 : role === 'admin' ? 50 : 10,
      requiredEpics: role === 'user' ? ['profile-setup', 'community-engagement'] : ['profile-setup']
    };
  }

  /**
   * Calculate commission permissions based on role and epic completion
   */
  private calculateCommissionPermissions(
    role: CoreUserRole,
    completedEpics: string[]
  ) {
    const hasSalesTraining = completedEpics.includes('sales-training');
    const hasAdvancedSales = completedEpics.includes('advanced-sales');

    return {
      canEarnCommissions: hasSalesTraining,
      canSellTicketsForOthers: hasSalesTraining,
      canCreateTrackableLinks: hasAdvancedSales,
      canAccessSalesAnalytics: hasSalesTraining,
      maxCommissionRate: hasAdvancedSales ? 15 : hasSalesTraining ? 10 : 0,
      requiredEpics: ['profile-setup', 'sales-training'],
      authorizedOrganizers: [] // Would be populated from follower permissions
    };
  }

  /**
   * Determine extended statuses based on epic completion
   */
  private determineExtendedStatuses(
    role: CoreUserRole,
    completedEpics: string[]
  ): ExtendedUserStatus[] {
    const statuses: ExtendedUserStatus[] = [];

    // Basic statuses
    if (completedEpics.includes('profile-setup')) {
      statuses.push('verified_user');
    }

    // Business statuses
    if (completedEpics.includes('business-verification') && 
        completedEpics.includes('community-engagement')) {
      statuses.push('store_owner');
    }

    if (completedEpics.includes('service-certification') && 
        completedEpics.includes('community-engagement')) {
      statuses.push('service_provider');
    }

    // Sales statuses
    if (completedEpics.includes('sales-training')) {
      statuses.push('sales_follower');
    }

    if (completedEpics.includes('content-creation')) {
      statuses.push('content_creator');
    }

    if (completedEpics.includes('trust-building') && 
        completedEpics.includes('community-engagement')) {
      statuses.push('trusted_reviewer');
    }

    return statuses;
  }

  /**
   * Helper to find missing epics
   */
  private getMissingEpics(requiredEpics: string[], completedEpics: string[]): string[] {
    return requiredEpics.filter(epic => !completedEpics.includes(epic));
  }

  /**
   * Check if user has completed a specific epic
   */
  async hasCompletedEpic(userId: string, epicId: string): Promise<boolean> {
    try {
      const completedEpics = await this.getUserCompletedEpics(userId);
      return completedEpics.includes(epicId);
    } catch (error) {
      console.error('Error checking epic completion:', error);
      return false;
    }
  }

  /**
   * Get detailed epic completion status
   */
  async getEpicCompletionStatus(
    userId: string, 
    epicIds: string[]
  ): Promise<EpicCompletionCheck[]> {
    try {
      const completedEpics = await this.getUserCompletedEpics(userId);
      
      return epicIds.map(epicId => ({
        epicId,
        isCompleted: completedEpics.includes(epicId),
        completedAt: completedEpics.includes(epicId) ? new Date().toISOString() : undefined,
        progress: completedEpics.includes(epicId) ? 100 : 0
      }));
    } catch (error) {
      console.error('Error getting epic completion status:', error);
      return epicIds.map(epicId => ({
        epicId,
        isCompleted: false,
        progress: 0
      }));
    }
  }

  /**
   * Validate super admin access (special BMAD security check)
   */
  async validateSuperAdminAccess(userId: string, userEmail: string): Promise<boolean> {
    const AUTHORIZED_SUPER_ADMIN_EMAILS = Object.freeze([
      'bobbygwatkins@gmail.com',
      'iradwatkins@gmail.com'
    ]);

    return AUTHORIZED_SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase());
  }
}

export const bMADValidationService = new BMADValidationService();
export default bMADValidationService;