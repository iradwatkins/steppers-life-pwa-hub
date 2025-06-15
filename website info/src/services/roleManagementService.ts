import { addDays, subDays, format, isAfter, isBefore } from 'date-fns';
import { 
  UserRole, 
  Permission, 
  RoleConfig, 
  RoleAssignment, 
  RoleChangeAudit, 
  BulkRoleOperation, 
  RoleNotification, 
  RoleAnalytics, 
  RoleFilter,
  CustomPermissionSet,
  RoleScope,
  PermissionCategory
} from '../types/roles';

// Extended permissions configuration
export const ROLE_PERMISSIONS: Permission[] = [
  // Event Management Permissions
  { id: 'view_events', name: 'View Events', description: 'View event details and listings', category: 'events' },
  { id: 'create_events', name: 'Create Events', description: 'Create new events', category: 'events' },
  { id: 'edit_events', name: 'Edit Events', description: 'Modify event details and settings', category: 'events' },
  { id: 'delete_events', name: 'Delete Events', description: 'Delete events', category: 'events' },
  { id: 'publish_events', name: 'Publish Events', description: 'Publish and unpublish events', category: 'events' },
  { id: 'manage_event_settings', name: 'Manage Event Settings', description: 'Configure event-specific settings', category: 'events' },
  
  // Financial Permissions
  { id: 'view_financial', name: 'View Financial Data', description: 'View revenue and financial reports', category: 'financial' },
  { id: 'manage_pricing', name: 'Manage Pricing', description: 'Set and modify ticket prices', category: 'financial' },
  { id: 'process_refunds', name: 'Process Refunds', description: 'Handle refund requests', category: 'financial' },
  { id: 'view_analytics', name: 'View Analytics', description: 'Access financial analytics and reports', category: 'financial' },
  { id: 'export_financial', name: 'Export Financial Data', description: 'Export financial reports and data', category: 'financial' },
  
  // Attendee Management Permissions
  { id: 'view_attendees', name: 'View Attendees', description: 'View attendee lists and information', category: 'attendees' },
  { id: 'manage_checkin', name: 'Manage Check-in', description: 'Handle event check-in process', category: 'attendees' },
  { id: 'export_attendees', name: 'Export Attendee Data', description: 'Export attendee information', category: 'attendees' },
  { id: 'send_communications', name: 'Send Communications', description: 'Send emails and notifications to attendees', category: 'attendees' },
  { id: 'manage_waitlist', name: 'Manage Waitlist', description: 'Handle event waitlist management', category: 'attendees' },
  
  // Marketing Permissions
  { id: 'manage_campaigns', name: 'Manage Campaigns', description: 'Create and manage marketing campaigns', category: 'marketing' },
  { id: 'manage_social', name: 'Manage Social Media', description: 'Handle social media promotion', category: 'marketing' },
  { id: 'view_marketing_analytics', name: 'View Marketing Analytics', description: 'Access marketing performance data', category: 'marketing' },
  { id: 'manage_promo_codes', name: 'Manage Promo Codes', description: 'Create and manage promotional codes', category: 'marketing' },
  { id: 'manage_collections', name: 'Manage Collections', description: 'Create and manage event collections', category: 'marketing' },
  
  // Team Management Permissions
  { id: 'view_team', name: 'View Team', description: 'View team members and their roles', category: 'team' },
  { id: 'manage_team', name: 'Manage Team', description: 'Add, remove, and manage team members', category: 'team' },
  { id: 'assign_roles', name: 'Assign Roles', description: 'Assign and modify team member roles', category: 'team' },
  { id: 'view_activity_logs', name: 'View Activity Logs', description: 'Access team activity and audit logs', category: 'team' },
  { id: 'manage_permissions', name: 'Manage Permissions', description: 'Create and manage custom permission sets', category: 'team' },
  
  // Settings Permissions
  { id: 'manage_integrations', name: 'Manage Integrations', description: 'Configure third-party integrations', category: 'settings' },
  { id: 'manage_notifications', name: 'Manage Notifications', description: 'Configure notification settings', category: 'settings' },
  { id: 'view_system_settings', name: 'View System Settings', description: 'Access system configuration', category: 'settings' },
  { id: 'manage_api_keys', name: 'Manage API Keys', description: 'Generate and manage API keys', category: 'settings' }
];

// Enhanced role configurations
export const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'follower',
    name: 'Follower',
    description: 'Basic follower with view-only access to public information',
    permissions: ['view_events'],
    color: '#6B7280',
    icon: '👥'
  },
  {
    role: 'sales_agent',
    name: 'Sales Agent',
    description: 'Can manage sales, pricing, customer communications, and financial operations',
    permissions: [
      'view_events', 'edit_events', 'manage_pricing', 'view_attendees', 
      'manage_checkin', 'send_communications', 'manage_promo_codes', 
      'view_financial', 'process_refunds', 'export_attendees', 'manage_waitlist'
    ],
    color: '#10B981',
    icon: '💼'
  },
  {
    role: 'event_staff',
    name: 'Event Staff (Scanner)',
    description: 'Can manage events and attendees during event operations with limited access',
    permissions: [
      'view_events', 'view_attendees', 'manage_checkin', 
      'send_communications', 'export_attendees', 'manage_waitlist'
    ],
    color: '#3B82F6',
    icon: '🎭'
  },
  {
    role: 'marketing_assistant',
    name: 'Marketing Assistant',
    description: 'Can manage marketing campaigns, social media, and promotional activities',
    permissions: [
      'view_events', 'manage_campaigns', 'manage_social', 'view_marketing_analytics',
      'manage_promo_codes', 'send_communications', 'manage_collections'
    ],
    color: '#8B5CF6',
    icon: '📢'
  }
];

class RoleManagementService {
  private roleAssignments: RoleAssignment[] = [];
  private roleAudits: RoleChangeAudit[] = [];
  private bulkOperations: BulkRoleOperation[] = [];
  private notifications: RoleNotification[] = [];
  private customPermissionSets: CustomPermissionSet[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock role assignments
    this.roleAssignments = [
      {
        id: 'ra-001',
        followerId: 'f-001',
        organizerId: 'org-001',
        role: 'sales_agent',
        scope: 'global',
        assignedBy: 'org-001',
        assignedAt: subDays(new Date(), 30).toISOString(),
        isActive: true,
        notes: 'Experienced sales professional with excellent customer service skills'
      },
      {
        id: 'ra-002',
        followerId: 'f-002',
        organizerId: 'org-001',
        role: 'event_staff',
        scope: 'per_event',
        eventIds: ['evt-001', 'evt-002'],
        assignedBy: 'org-001',
        assignedAt: subDays(new Date(), 15).toISOString(),
        expiresAt: addDays(new Date(), 30).toISOString(),
        isActive: true,
        notes: 'Temporary assignment for upcoming events'
      },
      {
        id: 'ra-003',
        followerId: 'f-003',
        organizerId: 'org-001',
        role: 'marketing_assistant',
        scope: 'global',
        assignedBy: 'org-001',
        assignedAt: subDays(new Date(), 7).toISOString(),
        isActive: true,
        customPermissions: ['manage_social', 'view_marketing_analytics']
      }
    ];

    // Mock audit trails
    this.roleAudits = [
      {
        id: 'audit-001',
        roleAssignmentId: 'ra-001',
        newRole: 'sales_agent',
        changedBy: 'org-001',
        changedAt: subDays(new Date(), 30).toISOString(),
        action: 'assigned',
        reason: 'Initial role assignment'
      },
      {
        id: 'audit-002',
        roleAssignmentId: 'ra-002',
        previousRole: 'follower',
        newRole: 'event_staff',
        changedBy: 'org-001',
        changedAt: subDays(new Date(), 15).toISOString(),
        action: 'assigned',
        reason: 'Needed for upcoming events'
      }
    ];

    // Mock custom permission sets
    this.customPermissionSets = [
      {
        id: 'cps-001',
        name: 'Social Media Manager',
        description: 'Custom role for managing social media and basic marketing',
        permissions: ['view_events', 'manage_social', 'view_marketing_analytics', 'manage_collections'],
        createdBy: 'org-001',
        createdAt: subDays(new Date(), 20).toISOString(),
        isActive: true
      }
    ];
  }

  // Role Assignment Management
  async assignRole(
    followerId: string,
    role: UserRole,
    organizerId: string,
    assignedBy: string,
    options: {
      scope: RoleScope;
      eventIds?: string[];
      expiresAt?: string;
      customPermissions?: string[];
      notes?: string;
    }
  ): Promise<RoleAssignment> {
    await this.simulateApiDelay();

    const assignment: RoleAssignment = {
      id: `ra-${Date.now()}`,
      followerId,
      organizerId,
      role,
      scope: options.scope,
      eventIds: options.eventIds,
      assignedBy,
      assignedAt: new Date().toISOString(),
      expiresAt: options.expiresAt,
      isActive: true,
      customPermissions: options.customPermissions,
      notes: options.notes
    };

    this.roleAssignments.push(assignment);

    // Create audit trail
    const audit: RoleChangeAudit = {
      id: `audit-${Date.now()}`,
      roleAssignmentId: assignment.id,
      newRole: role,
      newScope: options.scope,
      newPermissions: options.customPermissions,
      changedBy: assignedBy,
      changedAt: new Date().toISOString(),
      action: 'assigned',
      reason: 'Role assigned'
    };

    this.roleAudits.push(audit);

    // Create notification
    await this.createRoleNotification(
      followerId,
      organizerId,
      'role_assigned',
      assignment.id
    );

    return assignment;
  }

  async revokeRole(
    assignmentId: string,
    revokedBy: string,
    reason?: string
  ): Promise<void> {
    await this.simulateApiDelay();

    const assignment = this.roleAssignments.find(ra => ra.id === assignmentId);
    if (!assignment) {
      throw new Error('Role assignment not found');
    }

    // Create audit trail before deactivation
    const audit: RoleChangeAudit = {
      id: `audit-${Date.now()}`,
      roleAssignmentId: assignmentId,
      previousRole: assignment.role,
      changedBy: revokedBy,
      changedAt: new Date().toISOString(),
      action: 'revoked',
      reason: reason || 'Role revoked'
    };

    this.roleAudits.push(audit);

    // Deactivate assignment
    assignment.isActive = false;

    // Create notification
    await this.createRoleNotification(
      assignment.followerId,
      assignment.organizerId,
      'role_revoked',
      assignmentId
    );
  }

  async updateRoleAssignment(
    assignmentId: string,
    updates: Partial<RoleAssignment>,
    updatedBy: string,
    reason?: string
  ): Promise<RoleAssignment> {
    await this.simulateApiDelay();

    const assignmentIndex = this.roleAssignments.findIndex(ra => ra.id === assignmentId);
    if (assignmentIndex === -1) {
      throw new Error('Role assignment not found');
    }

    const currentAssignment = this.roleAssignments[assignmentIndex];
    const updatedAssignment = { ...currentAssignment, ...updates };

    // Create audit trail
    const audit: RoleChangeAudit = {
      id: `audit-${Date.now()}`,
      roleAssignmentId: assignmentId,
      previousRole: currentAssignment.role,
      newRole: updatedAssignment.role,
      previousScope: currentAssignment.scope,
      newScope: updatedAssignment.scope,
      previousPermissions: currentAssignment.customPermissions,
      newPermissions: updatedAssignment.customPermissions,
      changedBy: updatedBy,
      changedAt: new Date().toISOString(),
      action: 'modified',
      reason: reason || 'Role updated'
    };

    this.roleAudits.push(audit);
    this.roleAssignments[assignmentIndex] = updatedAssignment;

    // Create notification
    await this.createRoleNotification(
      updatedAssignment.followerId,
      updatedAssignment.organizerId,
      'role_modified',
      assignmentId
    );

    return updatedAssignment;
  }

  // Bulk Operations
  async bulkAssignRoles(
    followerIds: string[],
    role: UserRole,
    organizerId: string,
    assignedBy: string,
    options: {
      scope: RoleScope;
      eventIds?: string[];
      expiresAt?: string;
      customPermissions?: string[];
    }
  ): Promise<BulkRoleOperation> {
    await this.simulateApiDelay();

    const operation: BulkRoleOperation = {
      id: `bulk-${Date.now()}`,
      type: 'assign',
      followerIds,
      targetRole: role,
      targetScope: options.scope,
      targetEventIds: options.eventIds,
      customPermissions: options.customPermissions,
      executedBy: assignedBy,
      executedAt: new Date().toISOString(),
      status: 'in_progress'
    };

    this.bulkOperations.push(operation);

    // Simulate bulk processing
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const followerId of followerIds) {
      try {
        await this.assignRole(followerId, role, organizerId, assignedBy, options);
        successful++;
      } catch (error) {
        failed++;
        errors.push(`Failed to assign role to ${followerId}: ${error}`);
      }
    }

    // Update operation status
    const operationIndex = this.bulkOperations.findIndex(op => op.id === operation.id);
    this.bulkOperations[operationIndex] = {
      ...operation,
      status: 'completed',
      results: { successful, failed, errors }
    };

    return this.bulkOperations[operationIndex];
  }

  async bulkRevokeRoles(
    assignmentIds: string[],
    revokedBy: string,
    reason?: string
  ): Promise<BulkRoleOperation> {
    await this.simulateApiDelay();

    const operation: BulkRoleOperation = {
      id: `bulk-${Date.now()}`,
      type: 'revoke',
      followerIds: [], // Will be populated from assignments
      executedBy: revokedBy,
      executedAt: new Date().toISOString(),
      status: 'in_progress'
    };

    this.bulkOperations.push(operation);

    // Simulate bulk processing
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const assignmentId of assignmentIds) {
      try {
        await this.revokeRole(assignmentId, revokedBy, reason);
        successful++;
      } catch (error) {
        failed++;
        errors.push(`Failed to revoke assignment ${assignmentId}: ${error}`);
      }
    }

    // Update operation status
    const operationIndex = this.bulkOperations.findIndex(op => op.id === operation.id);
    this.bulkOperations[operationIndex] = {
      ...operation,
      status: 'completed',
      results: { successful, failed, errors }
    };

    return this.bulkOperations[operationIndex];
  }

  // Query Methods
  async getRoleAssignments(
    organizerId: string,
    filters?: RoleFilter
  ): Promise<RoleAssignment[]> {
    await this.simulateApiDelay();

    let assignments = this.roleAssignments.filter(ra => ra.organizerId === organizerId);

    if (filters) {
      if (filters.roles?.length) {
        assignments = assignments.filter(ra => filters.roles!.includes(ra.role));
      }

      if (filters.scopes?.length) {
        assignments = assignments.filter(ra => filters.scopes!.includes(ra.scope));
      }

      if (filters.status?.length) {
        assignments = assignments.filter(ra => {
          const isExpired = ra.expiresAt && isAfter(new Date(), new Date(ra.expiresAt));
          const isExpiring = ra.expiresAt && 
            isAfter(new Date(ra.expiresAt), new Date()) && 
            isBefore(new Date(ra.expiresAt), addDays(new Date(), 7));

          if (filters.status!.includes('active') && ra.isActive && !isExpired) return true;
          if (filters.status!.includes('expired') && (isExpired || !ra.isActive)) return true;
          if (filters.status!.includes('expiring') && isExpiring) return true;

          return false;
        });
      }

      if (filters.eventIds?.length) {
        assignments = assignments.filter(ra => 
          ra.eventIds?.some(eventId => filters.eventIds!.includes(eventId))
        );
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        assignments = assignments.filter(ra => 
          ra.role.toLowerCase().includes(term) ||
          ra.notes?.toLowerCase().includes(term)
        );
      }
    }

    return assignments;
  }

  async getRoleAssignmentById(assignmentId: string): Promise<RoleAssignment | null> {
    await this.simulateApiDelay();
    return this.roleAssignments.find(ra => ra.id === assignmentId) || null;
  }

  async getRoleAuditTrail(
    organizerId: string,
    assignmentId?: string
  ): Promise<RoleChangeAudit[]> {
    await this.simulateApiDelay();

    let audits = this.roleAudits;

    if (assignmentId) {
      audits = audits.filter(audit => audit.roleAssignmentId === assignmentId);
    }

    // Filter by organizer (would need to cross-reference with assignments in real implementation)
    return audits.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  }

  async getBulkOperations(organizerId: string): Promise<BulkRoleOperation[]> {
    await this.simulateApiDelay();
    return this.bulkOperations
      .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());
  }

  // Analytics
  async getRoleAnalytics(organizerId: string): Promise<RoleAnalytics> {
    await this.simulateApiDelay();

    const assignments = await this.getRoleAssignments(organizerId);
    const activeAssignments = assignments.filter(ra => ra.isActive);
    const expiredAssignments = assignments.filter(ra => 
      !ra.isActive || (ra.expiresAt && isAfter(new Date(), new Date(ra.expiresAt)))
    );

    const roleDistribution = activeAssignments.reduce((acc, ra) => {
      acc[ra.role] = (acc[ra.role] || 0) + 1;
      return acc;
    }, {} as Record<UserRole, number>);

    const scopeDistribution = activeAssignments.reduce((acc, ra) => {
      acc[ra.scope] = (acc[ra.scope] || 0) + 1;
      return acc;
    }, {} as Record<RoleScope, number>);

    return {
      totalAssignments: assignments.length,
      activeAssignments: activeAssignments.length,
      expiredAssignments: expiredAssignments.length,
      roleDistribution,
      scopeDistribution,
      permissionUsage: {},
      assignmentTrends: {
        daily: Array(7).fill(0).map(() => Math.floor(Math.random() * 10)),
        weekly: Array(4).fill(0).map(() => Math.floor(Math.random() * 50)),
        monthly: Array(12).fill(0).map(() => Math.floor(Math.random() * 200))
      },
      topAssigners: [
        { userId: 'org-001', userName: 'Main Organizer', totalAssignments: assignments.length }
      ]
    };
  }

  // Permission Management
  async getPermissions(): Promise<Permission[]> {
    await this.simulateApiDelay();
    return ROLE_PERMISSIONS;
  }

  async getPermissionsByCategory(category: PermissionCategory): Promise<Permission[]> {
    await this.simulateApiDelay();
    return ROLE_PERMISSIONS.filter(p => p.category === category);
  }

  async getRoleConfigs(): Promise<RoleConfig[]> {
    await this.simulateApiDelay();
    return ROLE_CONFIGS;
  }

  async hasPermission(
    assignmentId: string,
    permissionId: string
  ): Promise<boolean> {
    const assignment = await this.getRoleAssignmentById(assignmentId);
    if (!assignment || !assignment.isActive) return false;

    const roleConfig = ROLE_CONFIGS.find(rc => rc.role === assignment.role);
    if (!roleConfig) return false;

    // Check role permissions
    if (roleConfig.permissions.includes(permissionId)) return true;

    // Check custom permissions
    if (assignment.customPermissions?.includes(permissionId)) return true;

    return false;
  }

  // Custom Permission Sets
  async createCustomPermissionSet(
    name: string,
    description: string,
    permissions: string[],
    createdBy: string
  ): Promise<CustomPermissionSet> {
    await this.simulateApiDelay();

    const permissionSet: CustomPermissionSet = {
      id: `cps-${Date.now()}`,
      name,
      description,
      permissions,
      createdBy,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    this.customPermissionSets.push(permissionSet);
    return permissionSet;
  }

  async getCustomPermissionSets(organizerId: string): Promise<CustomPermissionSet[]> {
    await this.simulateApiDelay();
    return this.customPermissionSets.filter(cps => cps.createdBy === organizerId);
  }

  // Notifications
  private async createRoleNotification(
    followerId: string,
    organizerId: string,
    type: RoleNotification['type'],
    roleAssignmentId: string
  ): Promise<void> {
    const notification: RoleNotification = {
      id: `notif-${Date.now()}`,
      followerId,
      organizerId,
      type,
      roleAssignmentId,
      sentAt: new Date().toISOString(),
      acknowledged: false
    };

    this.notifications.push(notification);
  }

  async getRoleNotifications(
    followerId: string,
    acknowledged?: boolean
  ): Promise<RoleNotification[]> {
    await this.simulateApiDelay();

    let notifications = this.notifications.filter(n => n.followerId === followerId);

    if (acknowledged !== undefined) {
      notifications = notifications.filter(n => n.acknowledged === acknowledged);
    }

    return notifications.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  async acknowledgeNotification(notificationId: string): Promise<void> {
    await this.simulateApiDelay();

    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.acknowledged = true;
      notification.acknowledgedAt = new Date().toISOString();
    }
  }

  // Utility Methods
  private async simulateApiDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  }

  async checkExpiredAssignments(organizerId: string): Promise<RoleAssignment[]> {
    await this.simulateApiDelay();

    const now = new Date();
    const expiredAssignments = this.roleAssignments.filter(ra => 
      ra.organizerId === organizerId && 
      ra.isActive && 
      ra.expiresAt && 
      isAfter(now, new Date(ra.expiresAt))
    );

    // Auto-deactivate expired assignments
    for (const assignment of expiredAssignments) {
      assignment.isActive = false;

      // Create audit trail
      const audit: RoleChangeAudit = {
        id: `audit-${Date.now()}`,
        roleAssignmentId: assignment.id,
        previousRole: assignment.role,
        changedBy: 'system',
        changedAt: new Date().toISOString(),
        action: 'expired',
        reason: 'Assignment expired automatically'
      };

      this.roleAudits.push(audit);
    }

    return expiredAssignments;
  }

  async getExpiringAssignments(
    organizerId: string,
    daysAhead: number = 7
  ): Promise<RoleAssignment[]> {
    await this.simulateApiDelay();

    const futureDate = addDays(new Date(), daysAhead);
    return this.roleAssignments.filter(ra => 
      ra.organizerId === organizerId && 
      ra.isActive && 
      ra.expiresAt && 
      isAfter(new Date(ra.expiresAt), new Date()) &&
      isBefore(new Date(ra.expiresAt), futureDate)
    );
  }
}

export const roleManagementService = new RoleManagementService(); 