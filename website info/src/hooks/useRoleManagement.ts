import { useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  RoleAssignment, 
  RoleChangeAudit, 
  BulkRoleOperation, 
  RoleAnalytics, 
  RoleFilter,
  Permission,
  RoleConfig,
  CustomPermissionSet,
  RoleScope
} from '../types/roles';
import { roleManagementService } from '../services/roleManagementService';
import { toast } from 'sonner';

interface UseRoleManagementReturn {
  // State
  assignments: RoleAssignment[];
  auditTrail: RoleChangeAudit[];
  bulkOperations: BulkRoleOperation[];
  analytics: RoleAnalytics | null;
  permissions: Permission[];
  roleConfigs: RoleConfig[];
  customPermissionSets: CustomPermissionSet[];
  loading: boolean;
  error: string | null;

  // Actions
  assignRole: (
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
  ) => Promise<void>;
  revokeRole: (assignmentId: string, revokedBy: string, reason?: string) => Promise<void>;
  updateRoleAssignment: (
    assignmentId: string,
    updates: Partial<RoleAssignment>,
    updatedBy: string,
    reason?: string
  ) => Promise<void>;
  bulkAssignRoles: (
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
  ) => Promise<void>;
  bulkRevokeRoles: (assignmentIds: string[], revokedBy: string, reason?: string) => Promise<void>;
  createCustomPermissionSet: (
    name: string,
    description: string,
    permissions: string[],
    createdBy: string
  ) => Promise<void>;
  
  // Utility
  refreshData: () => Promise<void>;
  hasPermission: (assignmentId: string, permissionId: string) => Promise<boolean>;
  getPermissionsByCategory: (category: string) => Permission[];
  checkExpiredAssignments: (organizerId: string) => Promise<RoleAssignment[]>;
  getExpiringAssignments: (organizerId: string, daysAhead?: number) => Promise<RoleAssignment[]>;
  
  // Filters
  applyFilters: (filters: RoleFilter) => Promise<void>;
  clearFilters: () => Promise<void>;
}

export const useRoleManagement = (organizerId: string): UseRoleManagementReturn => {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [auditTrail, setAuditTrail] = useState<RoleChangeAudit[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkRoleOperation[]>([]);
  const [analytics, setAnalytics] = useState<RoleAnalytics | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>([]);
  const [customPermissionSets, setCustomPermissionSets] = useState<CustomPermissionSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<RoleFilter | undefined>();

  const handleError = useCallback((error: any, defaultMessage: string) => {
    const message = error?.message || defaultMessage;
    setError(message);
    toast.error(message);
    console.error(error);
  }, []);

  const refreshData = useCallback(async () => {
    if (!organizerId) return;

    setLoading(true);
    setError(null);

    try {
      const [
        assignmentsData,
        auditData,
        bulkOpsData,
        analyticsData,
        permissionsData,
        roleConfigsData,
        customSetsData
      ] = await Promise.all([
        roleManagementService.getRoleAssignments(organizerId, currentFilters),
        roleManagementService.getRoleAuditTrail(organizerId),
        roleManagementService.getBulkOperations(organizerId),
        roleManagementService.getRoleAnalytics(organizerId),
        roleManagementService.getPermissions(),
        roleManagementService.getRoleConfigs(),
        roleManagementService.getCustomPermissionSets(organizerId)
      ]);

      setAssignments(assignmentsData);
      setAuditTrail(auditData);
      setBulkOperations(bulkOpsData);
      setAnalytics(analyticsData);
      setPermissions(permissionsData);
      setRoleConfigs(roleConfigsData);
      setCustomPermissionSets(customSetsData);
    } catch (error) {
      handleError(error, 'Failed to load role management data');
    } finally {
      setLoading(false);
    }
  }, [organizerId, currentFilters, handleError]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const assignRole = useCallback(async (
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
  ) => {
    setLoading(true);
    setError(null);

    try {
      await roleManagementService.assignRole(followerId, role, organizerId, assignedBy, options);
      await refreshData();
      toast.success(`Role ${role} assigned successfully`);
    } catch (error) {
      handleError(error, 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  }, [refreshData, handleError]);

  const revokeRole = useCallback(async (
    assignmentId: string,
    revokedBy: string,
    reason?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      await roleManagementService.revokeRole(assignmentId, revokedBy, reason);
      await refreshData();
      toast.success('Role revoked successfully');
    } catch (error) {
      handleError(error, 'Failed to revoke role');
    } finally {
      setLoading(false);
    }
  }, [refreshData, handleError]);

  const updateRoleAssignment = useCallback(async (
    assignmentId: string,
    updates: Partial<RoleAssignment>,
    updatedBy: string,
    reason?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      await roleManagementService.updateRoleAssignment(assignmentId, updates, updatedBy, reason);
      await refreshData();
      toast.success('Role assignment updated successfully');
    } catch (error) {
      handleError(error, 'Failed to update role assignment');
    } finally {
      setLoading(false);
    }
  }, [refreshData, handleError]);

  const bulkAssignRoles = useCallback(async (
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
  ) => {
    setLoading(true);
    setError(null);

    try {
      const operation = await roleManagementService.bulkAssignRoles(
        followerIds,
        role,
        organizerId,
        assignedBy,
        options
      );
      
      await refreshData();
      
      if (operation.results) {
        const { successful, failed } = operation.results;
        if (failed > 0) {
          toast.warning(`Bulk assignment completed: ${successful} successful, ${failed} failed`);
        } else {
          toast.success(`Bulk assignment completed: ${successful} roles assigned successfully`);
        }
      }
    } catch (error) {
      handleError(error, 'Failed to perform bulk role assignment');
    } finally {
      setLoading(false);
    }
  }, [refreshData, handleError]);

  const bulkRevokeRoles = useCallback(async (
    assignmentIds: string[],
    revokedBy: string,
    reason?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const operation = await roleManagementService.bulkRevokeRoles(assignmentIds, revokedBy, reason);
      await refreshData();
      
      if (operation.results) {
        const { successful, failed } = operation.results;
        if (failed > 0) {
          toast.warning(`Bulk revocation completed: ${successful} successful, ${failed} failed`);
        } else {
          toast.success(`Bulk revocation completed: ${successful} roles revoked successfully`);
        }
      }
    } catch (error) {
      handleError(error, 'Failed to perform bulk role revocation');
    } finally {
      setLoading(false);
    }
  }, [refreshData, handleError]);

  const createCustomPermissionSet = useCallback(async (
    name: string,
    description: string,
    permissions: string[],
    createdBy: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      await roleManagementService.createCustomPermissionSet(name, description, permissions, createdBy);
      await refreshData();
      toast.success('Custom permission set created successfully');
    } catch (error) {
      handleError(error, 'Failed to create custom permission set');
    } finally {
      setLoading(false);
    }
  }, [refreshData, handleError]);

  const hasPermission = useCallback(async (
    assignmentId: string,
    permissionId: string
  ): Promise<boolean> => {
    try {
      return await roleManagementService.hasPermission(assignmentId, permissionId);
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }, []);

  const getPermissionsByCategory = useCallback((category: string): Permission[] => {
    return permissions.filter(p => p.category === category);
  }, [permissions]);

  const checkExpiredAssignments = useCallback(async (organizerId: string): Promise<RoleAssignment[]> => {
    try {
      const expired = await roleManagementService.checkExpiredAssignments(organizerId);
      if (expired.length > 0) {
        await refreshData(); // Refresh to show updated status
        toast.info(`${expired.length} role assignment(s) have expired and been deactivated`);
      }
      return expired;
    } catch (error) {
      handleError(error, 'Failed to check expired assignments');
      return [];
    }
  }, [refreshData, handleError]);

  const getExpiringAssignments = useCallback(async (
    organizerId: string,
    daysAhead: number = 7
  ): Promise<RoleAssignment[]> => {
    try {
      const expiring = await roleManagementService.getExpiringAssignments(organizerId, daysAhead);
      if (expiring.length > 0) {
        toast.warning(`${expiring.length} role assignment(s) will expire within ${daysAhead} days`);
      }
      return expiring;
    } catch (error) {
      handleError(error, 'Failed to check expiring assignments');
      return [];
    }
  }, [handleError]);

  const applyFilters = useCallback(async (filters: RoleFilter) => {
    setCurrentFilters(filters);
    setLoading(true);
    setError(null);

    try {
      const filteredAssignments = await roleManagementService.getRoleAssignments(organizerId, filters);
      setAssignments(filteredAssignments);
      toast.success('Filters applied successfully');
    } catch (error) {
      handleError(error, 'Failed to apply filters');
    } finally {
      setLoading(false);
    }
  }, [organizerId, handleError]);

  const clearFilters = useCallback(async () => {
    setCurrentFilters(undefined);
    await refreshData();
    toast.success('Filters cleared');
  }, [refreshData]);

  return {
    // State
    assignments,
    auditTrail,
    bulkOperations,
    analytics,
    permissions,
    roleConfigs,
    customPermissionSets,
    loading,
    error,

    // Actions
    assignRole,
    revokeRole,
    updateRoleAssignment,
    bulkAssignRoles,
    bulkRevokeRoles,
    createCustomPermissionSet,

    // Utility
    refreshData,
    hasPermission,
    getPermissionsByCategory,
    checkExpiredAssignments,
    getExpiringAssignments,

    // Filters
    applyFilters,
    clearFilters
  };
}; 