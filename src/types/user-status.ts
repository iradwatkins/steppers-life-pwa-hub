/**
 * BMAD METHOD: Comprehensive User Status System
 * Complete enumeration of all user roles, statuses, and progression paths
 */

// Core database roles (from Supabase types)
// admin: Full administrative privileges 
// organizer: Can create events and delegate permissions to followers
// user: Can buy tickets, become followers of organizers
export type CoreUserRole = 'user' | 'organizer' | 'admin';

// Extended user statuses based on activities and epic completion
export type ExtendedUserStatus = 
  // Community Business Roles (Epic-gated)
  | 'store_owner'           // Users who create/manage stores (Epic J)
  | 'service_provider'      // Users who offer services (Epic K)
  | 'verified_business'     // Verified store/service providers
  
  // Commission & Sales Roles (BMAD progression-controlled)
  | 'follower'              // Users who follow organizers/stores/services for easy tracking
  | 'sales_follower'        // Followers with ticket selling permissions + commission earning
  | 'team_member'           // Organizer team member: sell tickets + earn commission + scan QR codes at events
  
  // Activity-based statuses
  | 'attendee'              // Event attendees
  | 'buyer'                 // Ticket purchasers
  | 'reviewer'              // Users who can review stores/services
  | 'content_creator'       // Users who create content/posts
  
  // Verification & Trust levels
  | 'verified_user'         // Account verified
  | 'trusted_reviewer'      // High-quality reviewers
  | 'community_moderator';  // Community content moderators

// Complete user status combining core role + extended statuses
export interface UserStatus {
  // Core database role
  coreRole: CoreUserRole;
  
  // Additional statuses based on activities/achievements
  extendedStatuses: ExtendedUserStatus[];
  
  // Epic completion tracking
  completedEpics: string[];
  
  // Business/commission permissions
  businessPermissions: BusinessPermissions;
  commissionPermissions: CommissionPermissions;
  
  // Verification status
  verificationLevel: VerificationLevel;
  
  // Activity metrics
  activityMetrics: UserActivityMetrics;
}

export interface BusinessPermissions {
  canCreateStore: boolean;
  canCreateService: boolean;
  canManageBusinessListings: boolean;
  canPromoteInCommunity: boolean;
  canAccessBusinessAnalytics: boolean;
  maxBusinessListings: number;
  requiredEpics: string[];
}

export interface CommissionPermissions {
  canEarnCommissions: boolean;
  canSellTicketsForOthers: boolean;
  canCreateTrackableLinks: boolean;
  canAccessSalesAnalytics: boolean;
  maxCommissionRate: number;
  requiredEpics: string[];
  authorizedOrganizers: string[];
}

export type VerificationLevel = 'unverified' | 'email_verified' | 'phone_verified' | 'business_verified' | 'trusted';

export interface UserActivityMetrics {
  eventsAttended: number;
  ticketsPurchased: number;
  reviewsWritten: number;
  commissionsEarned: number;
  businessListingsCreated: number;
  followersCount: number;
  organizersFollowed: number;
  salesGenerated: number;
  communityPostsCount: number;
}

// BMAD Method Epic Requirements for each status
export const BMAD_EPIC_REQUIREMENTS: Record<ExtendedUserStatus, string[]> = {
  // Community Business (Epic J & K)
  'store_owner': ['profile-setup', 'community-engagement', 'business-verification'],
  'service_provider': ['profile-setup', 'community-engagement', 'service-certification'],
  'verified_business': ['profile-setup', 'community-engagement', 'business-verification', 'trust-building'],
  
  // Commission & Sales System
  'follower': ['profile-setup'],
  'sales_follower': ['profile-setup', 'community-engagement', 'sales-training'],
  'team_member': ['profile-setup', 'community-engagement', 'sales-training', 'team-certification'],
  
  // Activity-based
  'attendee': ['profile-setup'],
  'buyer': ['profile-setup'],
  'reviewer': ['profile-setup', 'community-engagement'],
  'content_creator': ['profile-setup', 'community-engagement', 'content-creation'],
  
  // Verification & Trust
  'verified_user': ['profile-setup', 'email-verification'],
  'trusted_reviewer': ['profile-setup', 'community-engagement', 'trust-building'],
  'community_moderator': ['profile-setup', 'community-engagement', 'trust-building', 'moderation-training']
};

// BMAD Method Role Progression Paths
export const BMAD_ROLE_PROGRESSION: Record<CoreUserRole, CoreUserRole[]> = {
  'user': ['organizer'],                    // Users can become organizers
  'organizer': ['admin'],                   // Organizers can become admins (with approval)
  'admin': ['admin']                        // Admins stay admins (highest level)
};

// Status combinations that are allowed
export const VALID_STATUS_COMBINATIONS: Array<{
  coreRole: CoreUserRole;
  allowedStatuses: ExtendedUserStatus[];
}> = [
  {
    coreRole: 'user',
    allowedStatuses: ['follower', 'attendee', 'buyer', 'reviewer', 'verified_user', 'store_owner', 'service_provider']
  },
  {
    coreRole: 'organizer', 
    allowedStatuses: ['follower', 'sales_follower', 'team_member', 'attendee', 'buyer', 'reviewer', 'content_creator', 'verified_user', 'store_owner', 'service_provider', 'verified_business']
  },
  {
    coreRole: 'admin',
    allowedStatuses: ['community_moderator', 'trusted_reviewer', 'content_creator', 'verified_user', 'store_owner', 'service_provider', 'verified_business']
  }
];

// Authorization levels for different features
export interface FeatureAuthorization {
  featureName: string;
  requiredCoreRole: CoreUserRole[];
  requiredStatuses?: ExtendedUserStatus[];
  requiredEpics: string[];
  additionalChecks?: (userStatus: UserStatus) => boolean;
}

export const FEATURE_AUTHORIZATIONS: FeatureAuthorization[] = [
  // Store Management
  {
    featureName: 'create_store',
    requiredCoreRole: ['user', 'organizer', 'admin'],
    requiredEpics: ['profile-setup', 'community-engagement', 'business-verification'],
    additionalChecks: (user) => user.businessPermissions.canCreateStore
  },
  
  // Service Management  
  {
    featureName: 'create_service',
    requiredCoreRole: ['user', 'organizer', 'admin'],
    requiredEpics: ['profile-setup', 'community-engagement', 'service-certification'],
    additionalChecks: (user) => user.businessPermissions.canCreateService
  },
  
  // Commission System
  {
    featureName: 'earn_commissions',
    requiredCoreRole: ['user', 'organizer', 'admin'],
    requiredStatuses: ['sales_follower', 'team_member'],
    requiredEpics: ['profile-setup', 'sales-training'],
    additionalChecks: (user) => user.commissionPermissions.canEarnCommissions
  },
  
  // Ticket Sales Delegation
  {
    featureName: 'sell_tickets_for_others',
    requiredCoreRole: ['user', 'organizer', 'admin'], 
    requiredStatuses: ['sales_follower', 'team_member'],
    requiredEpics: ['profile-setup', 'sales-training'],
    additionalChecks: (user) => user.commissionPermissions.canSellTicketsForOthers
  },
  
  // Business Promotion
  {
    featureName: 'promote_business_in_community',
    requiredCoreRole: ['user', 'organizer', 'admin'],
    requiredStatuses: ['store_owner', 'service_provider', 'verified_business'],
    requiredEpics: ['profile-setup', 'community-engagement', 'business-verification'],
    additionalChecks: (user) => user.businessPermissions.canPromoteInCommunity
  },
  
  // Event Creation
  {
    featureName: 'create_events',
    requiredCoreRole: ['organizer', 'admin'],
    requiredEpics: ['profile-setup', 'event-creation'],
    additionalChecks: (user) => user.extendedStatuses.includes('verified_user')
  },
  
  // Admin Functions
  {
    featureName: 'admin_panel_access',
    requiredCoreRole: ['admin'],
    requiredEpics: ['admin-tools'],
    additionalChecks: (user) => user.verificationLevel !== 'unverified'
  }
];