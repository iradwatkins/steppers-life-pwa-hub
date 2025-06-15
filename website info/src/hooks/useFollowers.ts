import { useState, useEffect, useCallback } from 'react';
import { 
  followerService, 
  TeamMember, 
  TeamInvitation, 
  TeamMemberActivity, 
  TeamAnalytics, 
  Follower,
  TeamRole,
  BulkRoleUpdate
} from '../services/followerService';
import { toast } from 'sonner';

interface UseFollowersOptions {
  organizerId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseFollowersReturn {
  // Data state
  followers: Follower[];
  teamMembers: TeamMember[];
  invitations: TeamInvitation[];
  analytics: TeamAnalytics | null;
  recentActivities: TeamMemberActivity[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Core functions
  refresh: () => Promise<void>;
  assignRoleToFollower: (followerId: string, role: TeamRole) => Promise<void>;
  updateMemberRole: (memberId: string, role: TeamRole, reason?: string) => Promise<void>;
  removeMember: (memberId: string, reason?: string) => Promise<void>;
  sendInvitation: (email: string, role: TeamRole, message?: string, name?: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
  getAvailableRoles: () => { value: TeamRole; label: string; description: string }[];
  
  // Bulk operations
  bulkUpdateRoles: (updates: BulkRoleUpdate[]) => Promise<void>;
}

export const useFollowers = ({ organizerId, autoRefresh = false, refreshInterval = 30000 }: UseFollowersOptions): UseFollowersReturn => {
  // Data state
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [recentActivities, setRecentActivities] = useState<TeamMemberActivity[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        followersData,
        teamMembersData,
        invitationsData,
        analyticsData,
        activitiesData
      ] = await Promise.all([
        followerService.getFollowers(organizerId),
        followerService.getTeamMembers(organizerId),
        followerService.getInvitations(organizerId),
        followerService.getTeamAnalytics(organizerId),
        followerService.getTeamActivities(organizerId, 50)
      ]);
      
      setFollowers(followersData);
      setTeamMembers(teamMembersData);
      setInvitations(invitationsData);
      setAnalytics(analyticsData);
      setRecentActivities(activitiesData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load team data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  // Role assignment functions
  const assignRoleToFollower = useCallback(async (followerId: string, role: TeamRole): Promise<void> => {
    try {
      await followerService.assignRole(followerId, role, organizerId, organizerId);
      await refresh();
      toast.success('Role assigned successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign role';
      toast.error(errorMessage);
      throw err;
    }
  }, [organizerId, refresh]);

  const updateMemberRole = useCallback(async (memberId: string, role: TeamRole, reason?: string): Promise<void> => {
    try {
      await followerService.updateTeamMemberRole(memberId, role, organizerId, reason);
      await refresh();
      toast.success('Role updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      toast.error(errorMessage);
      throw err;
    }
  }, [organizerId, refresh]);

  const removeMember = useCallback(async (memberId: string, reason?: string): Promise<void> => {
    try {
      await followerService.removeTeamMember(memberId, organizerId, reason);
      await refresh();
      toast.success('Team member removed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove team member';
      toast.error(errorMessage);
      throw err;
    }
  }, [organizerId, refresh]);

  // Team invitation functions
  const sendInvitation = useCallback(async (email: string, role: TeamRole, message?: string, name?: string): Promise<void> => {
    try {
      await followerService.sendInvitation(organizerId, email, role, message, name);
      await refresh();
      toast.success(`Invitation sent to ${email}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
      toast.error(errorMessage);
      throw err;
    }
  }, [organizerId, refresh]);

  const cancelInvitation = useCallback(async (invitationId: string): Promise<void> => {
    try {
      await followerService.cancelInvitation(invitationId);
      await refresh();
      toast.success('Invitation cancelled');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel invitation';
      toast.error(errorMessage);
      throw err;
    }
  }, [refresh]);

  const resendInvitation = useCallback(async (invitationId: string): Promise<void> => {
    try {
      await followerService.resendInvitation(invitationId);
      await refresh();
      toast.success('Invitation resent');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend invitation';
      toast.error(errorMessage);
      throw err;
    }
  }, [refresh]);

  // Bulk operations
  const bulkUpdateRoles = useCallback(async (updates: BulkRoleUpdate[]): Promise<void> => {
    try {
      await followerService.bulkUpdateRoles(updates, organizerId);
      await refresh();
      toast.success('Bulk role update completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update roles';
      toast.error(errorMessage);
      throw err;
    }
  }, [organizerId, refresh]);

  // Utility functions
  const getAvailableRoles = useCallback(() => {
    return followerService.getAvailableRoles();
  }, []);

  // Initialize data on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    // Data
    followers,
    teamMembers,
    invitations,
    analytics,
    recentActivities,
    
    // Loading states
    loading,
    error,
    
    // Core functions
    refresh,
    assignRoleToFollower,
    updateMemberRole,
    removeMember,
    sendInvitation,
    cancelInvitation,
    resendInvitation,
    getAvailableRoles,
    
    // Bulk operations
    bulkUpdateRoles
  };
}; 