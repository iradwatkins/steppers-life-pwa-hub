import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '../components/ui/alert-dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Shield, 
  Activity,
  Filter,
  Download,
  CheckSquare,
  X
} from 'lucide-react';
import { useRoleManagement } from '../hooks/useRoleManagement';
import { UserRole, RoleScope, RoleFilter } from '../types/roles';
import { format } from 'date-fns';

const MOCK_ORGANIZER_ID = 'org-001';
const MOCK_USER_ID = 'user-001';

const RoleManagementPage: React.FC = () => {
  const {
    assignments,
    auditTrail,
    bulkOperations,
    analytics,
    permissions,
    roleConfigs,
    customPermissionSets,
    loading,
    error,
    assignRole,
    revokeRole,
    updateRoleAssignment,
    bulkAssignRoles,
    bulkRevokeRoles,
    createCustomPermissionSet,
    refreshData,
    hasPermission,
    getPermissionsByCategory,
    checkExpiredAssignments,
    getExpiringAssignments,
    applyFilters,
    clearFilters
  } = useRoleManagement(MOCK_ORGANIZER_ID);

  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isBulkOperationDialogOpen, setIsBulkOperationDialogOpen] = useState(false);
  const [isCustomPermissionDialogOpen, setIsCustomPermissionDialogOpen] = useState(false);

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    followerId: '',
    role: 'follower' as UserRole,
    scope: 'global' as RoleScope,
    eventIds: [] as string[],
    expiresAt: '',
    customPermissions: [] as string[],
    notes: ''
  });

  // Custom permission set form state
  const [customPermissionForm, setCustomPermissionForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    // Check for expired assignments on component mount
    checkExpiredAssignments(MOCK_ORGANIZER_ID);
    getExpiringAssignments(MOCK_ORGANIZER_ID, 7);
  }, [checkExpiredAssignments, getExpiringAssignments]);

  const handleSearch = () => {
    const filters: RoleFilter = {};
    
    if (searchTerm) filters.searchTerm = searchTerm;
    if (roleFilter !== 'all') filters.roles = [roleFilter as UserRole];
    if (statusFilter !== 'all') filters.status = [statusFilter as any];

    if (Object.keys(filters).length > 0) {
      applyFilters(filters);
    } else {
      clearFilters();
    }
  };

  const getRoleConfig = (role: UserRole) => {
    return roleConfigs.find(rc => rc.role === role);
  };

  const getStatusBadge = (assignment: any) => {
    if (!assignment.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    
    if (assignment.expiresAt) {
      const expiryDate = new Date(assignment.expiresAt);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 0) {
        return <Badge variant="destructive">Expired</Badge>;
      } else if (daysUntilExpiry <= 7) {
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">
          Expires in {daysUntilExpiry} days
        </Badge>;
      }
    }
    
    return <Badge variant="default" className="bg-green-500">Active</Badge>;
  };

  const handleAssignRole = async () => {
    try {
      await assignRole(
        assignmentForm.followerId,
        assignmentForm.role,
        MOCK_ORGANIZER_ID,
        MOCK_USER_ID,
        {
          scope: assignmentForm.scope,
          eventIds: assignmentForm.eventIds,
          expiresAt: assignmentForm.expiresAt || undefined,
          customPermissions: assignmentForm.customPermissions,
          notes: assignmentForm.notes || undefined
        }
      );
      setIsAssignDialogOpen(false);
      setAssignmentForm({
        followerId: '',
        role: 'follower',
        scope: 'global',
        eventIds: [],
        expiresAt: '',
        customPermissions: [],
        notes: ''
      });
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const handleBulkRevoke = async () => {
    if (selectedAssignments.length === 0) return;
    
    try {
      await bulkRevokeRoles(selectedAssignments, MOCK_USER_ID, 'Bulk revocation operation');
      setSelectedAssignments([]);
      setIsBulkOperationDialogOpen(false);
    } catch (error) {
      console.error('Failed to bulk revoke roles:', error);
    }
  };

  const handleCreateCustomPermissionSet = async () => {
    try {
      await createCustomPermissionSet(
        customPermissionForm.name,
        customPermissionForm.description,
        customPermissionForm.permissions,
        MOCK_USER_ID
      );
      setIsCustomPermissionDialogOpen(false);
      setCustomPermissionForm({
        name: '',
        description: '',
        permissions: []
      });
    } catch (error) {
      console.error('Failed to create custom permission set:', error);
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading role management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Role & Permission Management</h1>
          <p className="text-gray-600">
            Manage follower roles, permissions, and access control for your events
          </p>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalAssignments}</p>
                    <p className="text-sm text-gray-600">Total Assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-green-600 mb-2" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeAssignments}</p>
                    <p className="text-sm text-gray-600">Active Roles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600 mb-2" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{analytics.expiredAssignments}</p>
                    <p className="text-sm text-gray-600">Expired</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-purple-600 mb-2" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(analytics.roleDistribution).length}</p>
                    <p className="text-sm text-gray-600">Role Types</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignments">Role Assignments</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Role Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Role Assignments</CardTitle>
                    <CardDescription>
                      Manage follower roles and permissions
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Assign Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Assign Role</DialogTitle>
                          <DialogDescription>
                            Assign a role to a follower with specific permissions
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="followerId">Follower ID</Label>
                            <Input
                              id="followerId"
                              value={assignmentForm.followerId}
                              onChange={(e) => setAssignmentForm(prev => ({ ...prev, followerId: e.target.value }))}
                              placeholder="Enter follower ID"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                              value={assignmentForm.role}
                              onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, role: value as UserRole }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roleConfigs.map(config => (
                                  <SelectItem key={config.role} value={config.role}>
                                    <div className="flex items-center">
                                      <span className="mr-2">{config.icon}</span>
                                      {config.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="scope">Scope</Label>
                            <Select
                              value={assignmentForm.scope}
                              onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, scope: value as RoleScope }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="global">Global (All Events)</SelectItem>
                                <SelectItem value="per_event">Per Event</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                            <Input
                              id="expiresAt"
                              type="datetime-local"
                              value={assignmentForm.expiresAt}
                              onChange={(e) => setAssignmentForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              value={assignmentForm.notes}
                              onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Additional notes about this role assignment"
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button onClick={handleAssignRole} className="flex-1">
                              Assign Role
                            </Button>
                            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {selectedAssignments.length > 0 && (
                      <AlertDialog open={isBulkOperationDialogOpen} onOpenChange={setIsBulkOperationDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Bulk Revoke ({selectedAssignments.length})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Multiple Roles</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke {selectedAssignments.length} role assignment(s)? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBulkRevoke} className="bg-red-600 hover:bg-red-700">
                              Revoke All
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roleConfigs.map(config => (
                        <SelectItem key={config.role} value={config.role}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="expiring">Expiring Soon</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={handleSearch}>
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>

                {/* Assignments Table */}
                <div className="border rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <Checkbox
                              checked={selectedAssignments.length === assignments.length && assignments.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAssignments(assignments.map(a => a.id));
                                } else {
                                  setSelectedAssignments([]);
                                }
                              }}
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Follower</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Role</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Scope</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Assigned</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {assignments.map((assignment) => {
                          const roleConfig = getRoleConfig(assignment.role);
                          return (
                            <tr key={assignment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <Checkbox
                                  checked={selectedAssignments.includes(assignment.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedAssignments(prev => [...prev, assignment.id]);
                                    } else {
                                      setSelectedAssignments(prev => prev.filter(id => id !== assignment.id));
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-4 py-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Follower {assignment.followerId}
                                  </p>
                                  {assignment.notes && (
                                    <p className="text-sm text-gray-500 truncate max-w-xs">{assignment.notes}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  <span className="mr-2 text-lg">{roleConfig?.icon}</span>
                                  <div>
                                    <Badge 
                                      className="mb-1"
                                      style={{ backgroundColor: roleConfig?.color || '#6B7280' }}
                                    >
                                      {roleConfig?.name}
                                    </Badge>
                                    {assignment.customPermissions && assignment.customPermissions.length > 0 && (
                                      <p className="text-xs text-gray-500">
                                        +{assignment.customPermissions.length} custom permissions
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <Badge variant="outline">
                                  {assignment.scope === 'global' ? 'Global' : 'Per Event'}
                                </Badge>
                                {assignment.eventIds && assignment.eventIds.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {assignment.eventIds.length} events
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                {getStatusBadge(assignment)}
                              </td>
                              <td className="px-4 py-4">
                                <p className="text-sm text-gray-900">
                                  {format(new Date(assignment.assignedAt), 'MMM d, yyyy')}
                                </p>
                                {assignment.expiresAt && (
                                  <p className="text-xs text-gray-500">
                                    Expires: {format(new Date(assignment.expiresAt), 'MMM d, yyyy')}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem>
                                      <Edit3 className="h-4 w-4 mr-2" />
                                      Edit Assignment
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => revokeRole(assignment.id, MOCK_USER_ID, 'Manual revocation')}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Revoke Role
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {assignments.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No role assignments found</p>
                      <p className="text-sm text-gray-400">Assign roles to followers to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Role Configurations */}
              <Card>
                <CardHeader>
                  <CardTitle>Predefined Roles</CardTitle>
                  <CardDescription>
                    Standard role types with their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {roleConfigs.map((config) => (
                    <div key={config.role} className="border rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">{config.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{config.name}</h4>
                          <p className="text-sm text-gray-500">{config.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {config.permissions.map((permissionId) => {
                          const permission = permissions.find(p => p.id === permissionId);
                          return permission ? (
                            <Badge key={permissionId} variant="outline" className="text-xs">
                              {permission.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Custom Permission Sets */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Custom Permission Sets</CardTitle>
                      <CardDescription>
                        Create custom permission combinations
                      </CardDescription>
                    </div>
                    <Dialog open={isCustomPermissionDialogOpen} onOpenChange={setIsCustomPermissionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Set
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Custom Permission Set</DialogTitle>
                          <DialogDescription>
                            Define a custom set of permissions for specialized roles
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="setName">Name</Label>
                            <Input
                              id="setName"
                              value={customPermissionForm.name}
                              onChange={(e) => setCustomPermissionForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Social Media Manager"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="setDescription">Description</Label>
                            <Textarea
                              id="setDescription"
                              value={customPermissionForm.description}
                              onChange={(e) => setCustomPermissionForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe what this permission set allows"
                            />
                          </div>
                          
                          <div>
                            <Label>Permissions</Label>
                            <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
                              {Object.entries(
                                permissions.reduce((acc, permission) => {
                                  if (!acc[permission.category]) acc[permission.category] = [];
                                  acc[permission.category].push(permission);
                                  return acc;
                                }, {} as Record<string, typeof permissions>)
                              ).map(([category, categoryPermissions]) => (
                                <div key={category}>
                                  <h5 className="font-medium text-gray-900 mb-2 capitalize">{category}</h5>
                                  <div className="space-y-1">
                                    {categoryPermissions.map((permission) => (
                                      <div key={permission.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={customPermissionForm.permissions.includes(permission.id)}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setCustomPermissionForm(prev => ({
                                                ...prev,
                                                permissions: [...prev.permissions, permission.id]
                                              }));
                                            } else {
                                              setCustomPermissionForm(prev => ({
                                                ...prev,
                                                permissions: prev.permissions.filter(id => id !== permission.id)
                                              }));
                                            }
                                          }}
                                        />
                                        <div>
                                          <p className="text-sm font-medium">{permission.name}</p>
                                          <p className="text-xs text-gray-500">{permission.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button onClick={handleCreateCustomPermissionSet} className="flex-1">
                              Create Permission Set
                            </Button>
                            <Button variant="outline" onClick={() => setIsCustomPermissionDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customPermissionSets.length > 0 ? (
                    customPermissionSets.map((set) => (
                      <div key={set.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{set.name}</h4>
                          <Badge variant="secondary">Custom</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{set.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {set.permissions.map((permissionId) => {
                            const permission = permissions.find(p => p.id === permissionId);
                            return permission ? (
                              <Badge key={permissionId} variant="outline" className="text-xs">
                                {permission.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No custom permission sets</p>
                      <p className="text-sm text-gray-400">Create custom sets for specialized roles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  Track all role assignment changes and modifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditTrail.map((audit) => (
                    <div key={audit.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Activity className="h-5 w-5 text-blue-600 mt-1" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={
                            audit.action === 'assigned' ? 'default' :
                            audit.action === 'revoked' ? 'destructive' :
                            audit.action === 'modified' ? 'secondary' : 'outline'
                          }>
                            {audit.action}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(new Date(audit.changedAt), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">
                          {audit.action === 'assigned' && `Role ${audit.newRole} assigned`}
                          {audit.action === 'revoked' && `Role ${audit.previousRole} revoked`}
                          {audit.action === 'modified' && `Role changed from ${audit.previousRole} to ${audit.newRole}`}
                          {audit.action === 'expired' && `Role ${audit.previousRole} expired`}
                        </p>
                        {audit.reason && (
                          <p className="text-sm text-gray-500 mt-1">Reason: {audit.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {auditTrail.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No audit trail available</p>
                      <p className="text-sm text-gray-400">Role changes will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Role Distribution</CardTitle>
                    <CardDescription>
                      Current distribution of assigned roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.roleDistribution).map(([role, count]) => {
                        const roleConfig = getRoleConfig(role as UserRole);
                        const percentage = (count / analytics.activeAssignments) * 100;
                        
                        return (
                          <div key={role} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{roleConfig?.icon}</span>
                              <span className="text-sm font-medium">{roleConfig?.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full"
                                  style={{ 
                                    width: `${percentage}%`, 
                                    backgroundColor: roleConfig?.color || '#6B7280' 
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count} ({Math.round(percentage)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Scope Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scope Distribution</CardTitle>
                    <CardDescription>
                      Global vs per-event role assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.scopeDistribution).map(([scope, count]) => {
                        const percentage = (count / analytics.activeAssignments) * 100;
                        
                        return (
                          <div key={scope} className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{scope.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count} ({Math.round(percentage)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RoleManagementPage; 