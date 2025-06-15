// Role and Permission Management Types

export type UserRole = 'follower' | 'sales_agent' | 'event_staff' | 'marketing_assistant';

export type PermissionCategory = 'events' | 'financial' | 'attendees' | 'marketing' | 'team' | 'settings';

export type PermissionLevel = 'read' | 'write' | 'admin';

export type RoleScope = 'global' | 'per_event';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  level?: PermissionLevel;
}

export interface CustomPermissionSet {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface RoleConfig {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
  isCustom?: boolean;
}

export interface RoleAssignment {
  id: string;
  followerId: string;
  organizerId: string;
  role: UserRole;
  scope: RoleScope;
  eventIds?: string[]; // For per-event scope
  assignedBy: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
  customPermissions?: string[];
  notes?: string;
}

export interface RoleChangeAudit {
  id: string;
  roleAssignmentId: string;
  previousRole?: UserRole;
  newRole?: UserRole;
  previousScope?: RoleScope;
  newScope?: RoleScope;
  previousPermissions?: string[];
  newPermissions?: string[];
  changedBy: string;
  changedAt: string;
  reason?: string;
  action: 'assigned' | 'revoked' | 'modified' | 'expired';
}

export interface BulkRoleOperation {
  id: string;
  type: 'assign' | 'revoke' | 'modify';
  followerIds: string[];
  targetRole?: UserRole;
  targetScope?: RoleScope;
  targetEventIds?: string[];
  customPermissions?: string[];
  executedBy: string;
  executedAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results?: {
    successful: number;
    failed: number;
    errors: string[];
  };
}

export interface RoleNotification {
  id: string;
  followerId: string;
  organizerId: string;
  type: 'role_assigned' | 'role_revoked' | 'role_modified' | 'role_expiring';
  roleAssignmentId: string;
  sentAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface RolePermissionMatrix {
  [role: string]: {
    [permissionId: string]: boolean;
  };
}

export interface RoleAnalytics {
  totalAssignments: number;
  activeAssignments: number;
  expiredAssignments: number;
  roleDistribution: Record<UserRole, number>;
  scopeDistribution: Record<RoleScope, number>;
  permissionUsage: Record<string, number>;
  assignmentTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  topAssigners: {
    userId: string;
    userName: string;
    totalAssignments: number;
  }[];
}

export interface RoleFilter {
  roles?: UserRole[];
  scopes?: RoleScope[];
  status?: ('active' | 'expired' | 'expiring')[];
  assignedBy?: string[];
  eventIds?: string[];
  searchTerm?: string;
  dateRange?: {
    start: string;
    end: string;
  };
} 