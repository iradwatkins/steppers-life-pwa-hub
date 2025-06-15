import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Plus, Edit, Users, ArrowLeft, Search, Filter, Eye, Settings, Calendar, CreditCard, FileText, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '@/hooks/useUsers';
import { adminUserService, User } from '@/services/adminUserService';
import { useToast } from "@/components/ui/use-toast";

interface RolePermissions {
  events: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    view: boolean;
  };
  users: {
    view: boolean;
    edit: boolean;
    create: boolean;
    delete: boolean;
  };
  payments: {
    view: boolean;
    process: boolean;
    refund: boolean;
  };
  content: {
    create: boolean;
    edit: boolean;
    moderate: boolean;
  };
  analytics: {
    view: boolean;
    export: boolean;
  };
}

interface RoleDefinition {
  role: User['role'];
  displayName: string;
  description: string;
  permissions: RolePermissions;
  userCount: number;
  color: string;
}

const AdminUserRolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users, fetchUsers } = useUsers();
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newRole, setNewRole] = useState<User['role']>('buyer');

  const roleDefinitions: RoleDefinition[] = [
    {
      role: 'admin',
      displayName: 'Administrator',
      description: 'Full system access and management capabilities',
      permissions: {
        events: { create: true, edit: true, delete: true, view: true },
        users: { view: true, edit: true, create: true, delete: true },
        payments: { view: true, process: true, refund: true },
        content: { create: true, edit: true, moderate: true },
        analytics: { view: true, export: true }
      },
      userCount: users.filter(u => u.role === 'admin').length,
      color: 'bg-red-500'
    },
    {
      role: 'organizer',
      displayName: 'Event Organizer',
      description: 'Can create and manage events, view analytics',
      permissions: {
        events: { create: true, edit: true, delete: false, view: true },
        users: { view: false, edit: false, create: false, delete: false },
        payments: { view: true, process: false, refund: true },
        content: { create: true, edit: true, moderate: false },
        analytics: { view: true, export: false }
      },
      userCount: users.filter(u => u.role === 'organizer').length,
      color: 'bg-blue-500'
    },
    {
      role: 'instructor',
      displayName: 'Instructor',
      description: 'Can create classes and educational content',
      permissions: {
        events: { create: true, edit: true, delete: false, view: true },
        users: { view: false, edit: false, create: false, delete: false },
        payments: { view: true, process: false, refund: false },
        content: { create: true, edit: true, moderate: false },
        analytics: { view: true, export: false }
      },
      userCount: users.filter(u => u.role === 'instructor').length,
      color: 'bg-green-500'
    },
    {
      role: 'event_staff',
      displayName: 'Event Staff',
      description: 'Can manage event operations and check-ins',
      permissions: {
        events: { create: false, edit: true, delete: false, view: true },
        users: { view: false, edit: false, create: false, delete: false },
        payments: { view: true, process: false, refund: false },
        content: { create: false, edit: false, moderate: false },
        analytics: { view: false, export: false }
      },
      userCount: users.filter(u => u.role === 'event_staff').length,
      color: 'bg-purple-500'
    },
    {
      role: 'sales_agent',
      displayName: 'Sales Agent',
      description: 'Can promote events and earn commissions',
      permissions: {
        events: { create: false, edit: false, delete: false, view: true },
        users: { view: false, edit: false, create: false, delete: false },
        payments: { view: true, process: false, refund: false },
        content: { create: false, edit: false, moderate: false },
        analytics: { view: true, export: false }
      },
      userCount: users.filter(u => u.role === 'sales_agent').length,
      color: 'bg-orange-500'
    },
    {
      role: 'buyer',
      displayName: 'Buyer',
      description: 'Can purchase tickets and attend events',
      permissions: {
        events: { create: false, edit: false, delete: false, view: true },
        users: { view: false, edit: false, create: false, delete: false },
        payments: { view: false, process: false, refund: false },
        content: { create: false, edit: false, moderate: false },
        analytics: { view: false, export: false }
      },
      userCount: users.filter(u => u.role === 'buyer').length,
      color: 'bg-gray-500'
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    try {
      // In a real implementation, this would call an API
      console.log(`Changing user ${userId} role to ${newRole}`);
      
      toast({
        title: "Role Updated",
        description: `User role has been changed to ${newRole}.`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  const handleBulkRoleAssignment = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select users to assign roles to.",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real implementation, this would call a bulk update API
      console.log(`Assigning role ${newRole} to users:`, selectedUsers);
      
      toast({
        title: "Bulk Assignment Complete",
        description: `${selectedUsers.length} users have been assigned the ${newRole} role.`,
      });
      
      setSelectedUsers([]);
      setBulkAssignDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk role assignment.",
        variant: "destructive"
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/users')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Roles Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user roles, permissions, and assignments
          </p>
        </div>
        <Dialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
          <Plus className="h-4 w-4 mr-2" />
              Bulk Assign Roles
        </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roleDefinitions.map((role) => (
          <Card key={role.role} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex-row items-center space-y-0 pb-2">
              <div className={`w-4 h-4 rounded-full ${role.color} mr-3`} />
              <CardTitle className="text-lg">{role.displayName}</CardTitle>
              <Badge variant="secondary" className="ml-auto">
                {role.userCount} users
              </Badge>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {role.description}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(role);
                    setEditDialogOpen(true);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(role);
                    setAssignRoleDialogOpen(true);
                  }}
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Assign
              </Button>
            </div>
          </CardContent>
        </Card>
        ))}
            </div>

      {/* User Role Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
            User Role Assignments
            </CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setBulkAssignDialogOpen(true)}
              disabled={selectedUsers.length === 0}
            >
              <Edit className="h-4 w-4 mr-2" />
              Bulk Edit ({selectedUsers.length})
            </Button>
          </div>
          </CardHeader>
          <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
            </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {roleDefinitions.find(r => r.role === user.role)?.displayName || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === 'active' ? 'default' :
                        user.status === 'pending_approval' ? 'secondary' : 'destructive'
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as User['role'])}
                    >
                      <SelectTrigger className="w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleDefinitions.map(role => (
                          <SelectItem key={role.role} value={role.role}>
                            {role.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </CardContent>
        </Card>

      {/* Role Details Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRole?.displayName} Role Details
            </DialogTitle>
            <DialogDescription>
              View permissions and capabilities for this role
            </DialogDescription>
          </DialogHeader>
          
          {selectedRole && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Role Information</h3>
                <p className="text-sm text-gray-600">{selectedRole.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Currently assigned to {selectedRole.userCount} users
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Permissions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Events
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.events.view} disabled />
                        View Events
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.events.create} disabled />
                        Create Events
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.events.edit} disabled />
                        Edit Events
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.events.delete} disabled />
                        Delete Events
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Users
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.users.view} disabled />
                        View Users
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.users.create} disabled />
                        Create Users
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.users.edit} disabled />
                        Edit Users
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.users.delete} disabled />
                        Delete Users
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payments
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.payments.view} disabled />
                        View Payments
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.payments.process} disabled />
                        Process Payments
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.payments.refund} disabled />
                        Process Refunds
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Content
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.content.create} disabled />
                        Create Content
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.content.edit} disabled />
                        Edit Content
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedRole.permissions.content.moderate} disabled />
                        Moderate Content
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Assignment Dialog */}
      <Dialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Role Assignment</DialogTitle>
            <DialogDescription>
              Assign a role to {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-role">New Role</Label>
              <Select value={newRole} onValueChange={(value) => setNewRole(value as User['role'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleDefinitions.map(role => (
                    <SelectItem key={role.role} value={role.role}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleBulkRoleAssignment} className="flex-1">
                Assign Role
              </Button>
              <Button variant="outline" onClick={() => setBulkAssignDialogOpen(false)}>
                Cancel
              </Button>
            </div>
      </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserRolesPage; 