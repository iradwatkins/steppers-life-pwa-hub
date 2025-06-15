import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  userDashboardService, 
  UserRole, 
  DashboardWidget, 
  UserProgress, 
  ContentCreationOption 
} from '@/services/userDashboardService';
import { toast } from 'sonner';

export const useUserDashboard = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [activeRoles, setActiveRoles] = useState<string[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [contentOptions, setContentOptions] = useState<ContentCreationOption[]>([]);
  const [allContentOptions, setAllContentOptions] = useState<ContentCreationOption[]>([]);
  const [roleSuggestions, setRoleSuggestions] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load user roles
      const roles = await userDashboardService.getUserRoles(user.id);
      setUserRoles(roles);

      const active = roles.filter(role => role.isActive).map(role => role.id);
      setActiveRoles(active);

      // Load dashboard widgets based on active roles
      const widgets = await userDashboardService.getDashboardWidgets(user.id, active);
      setDashboardWidgets(widgets);

      // Load user progress
      const progress = await userDashboardService.getUserProgress(user.id);
      setUserProgress(progress);

      // Load content creation options
      const options = await userDashboardService.getContentCreationOptions(active);
      setContentOptions(options);

      // Load all content options for role discovery
      const allOptions = await userDashboardService.getAllContentCreationOptions();
      setAllContentOptions(allOptions);

      // Load role activation suggestions
      const suggestions = await userDashboardService.getRoleActivationSuggestions(user.id, active);
      setRoleSuggestions(suggestions);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Activate a new role
  const activateRole = async (roleId: string) => {
    if (!user?.id) return;

    try {
      const activatedRole = await userDashboardService.activateRole(user.id, roleId);
      
      // Update local state
      setUserRoles(prev => prev.map(role => 
        role.id === roleId ? activatedRole : role
      ));
      
      setActiveRoles(prev => [...prev, roleId]);

      // Reload dashboard to reflect new role
      await loadDashboardData();

      toast.success(`${activatedRole.displayName} role activated! 🎉`);
    } catch (err) {
      toast.error('Failed to activate role');
    }
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = async (widgetId: string, isVisible: boolean) => {
    if (!user?.id) return;

    try {
      await userDashboardService.updateWidgetVisibility(user.id, widgetId, isVisible);
      
      setDashboardWidgets(prev => prev.map(widget =>
        widget.id === widgetId ? { ...widget, isVisible } : widget
      ));

      toast.success(`Widget ${isVisible ? 'shown' : 'hidden'}`);
    } catch (err) {
      toast.error('Failed to update widget visibility');
    }
  };

  // Get role by ID
  const getRoleById = (roleId: string): UserRole | undefined => {
    return userRoles.find(role => role.id === roleId);
  };

  // Check if user has specific role
  const hasRole = (roleId: string): boolean => {
    return activeRoles.includes(roleId);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roleIds: string[]): boolean => {
    return roleIds.some(roleId => activeRoles.includes(roleId));
  };

  // Get role permissions
  const getRolePermissions = (): string[] => {
    return userRoles
      .filter(role => role.isActive)
      .flatMap(role => role.permissions);
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    const permissions = getRolePermissions();
    return permissions.includes(permission);
  };

  // Get visible widgets sorted by priority
  const getVisibleWidgets = (): DashboardWidget[] => {
    return dashboardWidgets
      .filter(widget => widget.isVisible)
      .filter(widget => {
        // Filter by role restrictions
        if (widget.roleRestriction) {
          return hasAnyRole(widget.roleRestriction);
        }
        return true;
      })
      .sort((a, b) => a.priority - b.priority);
  };

  // Get available content creation options
  const getAvailableContentOptions = (): ContentCreationOption[] => {
    return contentOptions.filter(option => !option.comingSoon);
  };

  // Get coming soon content options
  const getComingSoonOptions = (): ContentCreationOption[] => {
    return allContentOptions.filter(option => option.comingSoon);
  };

  // Get role activation suggestions
  const getRoleActivationSuggestions = (): UserRole[] => {
    return roleSuggestions.slice(0, 3); // Show top 3 suggestions
  };

  // Load data when user changes
  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  return {
    // State
    userRoles,
    activeRoles,
    dashboardWidgets,
    userProgress,
    contentOptions,
    allContentOptions,
    roleSuggestions,
    isLoading,
    error,

    // Actions
    loadDashboardData,
    activateRole,
    toggleWidgetVisibility,

    // Utilities
    getRoleById,
    hasRole,
    hasAnyRole,
    getRolePermissions,
    hasPermission,
    getVisibleWidgets,
    getAvailableContentOptions,
    getComingSoonOptions,
    getRoleActivationSuggestions
  };
}; 