import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Shield, 
  UserX, 
  UserCheck, 
  Key, 
  Mail, 
  Download, 
  Activity,
  ArrowLeft,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: 'active' | 'suspended' | 'pending' | 'deactivated';
  created_at: string;
  last_sign_in_at: string | null;
  email_verified: boolean;
  phone: string | null;
  avatar_url: string | null;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  dateRange: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
  ip_address?: string;
}

const UserManagementPage = () => {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin } = useRoles();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const [bulkAction, setBulkAction] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState('');

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            role,
            status,
            created_at,
            last_sign_in_at,
            email_verified,
            phone,
            avatar_url
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Map data to User interface with proper status handling
        const mappedUsers: User[] = (data || []).map(profile => ({
          ...profile,
          status: profile.status || 'active' as 'active' | 'suspended' | 'pending' | 'deactivated',
          email_verified: profile.email_verified || false
        }));

        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(user => 
        new Date(user.created_at) >= filterDate
      );
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  // Load user activities
  const loadUserActivities = async (userId: string) => {
    try {
      // Mock data for now - in real implementation, this would come from an audit log table
      const mockActivities: UserActivity[] = [
        {
          id: '1',
          user_id: userId,
          action: 'Login',
          details: 'Successful login from web browser',
          created_at: new Date().toISOString(),
          ip_address: '192.168.1.1'
        },
        {
          id: '2',
          user_id: userId,
          action: 'Profile Update',
          details: 'Updated full name and phone number',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          user_id: userId,
          action: 'Password Change',
          details: 'Password changed successfully',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      setUserActivities(mockActivities);
    } catch (error) {
      console.error('Error loading user activities:', error);
    }
  };

  // Handle user actions
  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'suspend':
          await supabase
            .from('profiles')
            .update({ status: 'suspended' })
            .eq('id', userId);
          break;
        case 'activate':
          await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('id', userId);
          break;
        case 'deactivate':
          await supabase
            .from('profiles')
            .update({ status: 'deactivated' })
            .eq('id', userId);
          break;
        case 'verify':
          await supabase
            .from('profiles')
            .update({ email_verified: true })
            .eq('id', userId);
          break;
        case 'reset_password':
          // Send password reset email
          await supabase.auth.resetPasswordForEmail(
            users.find(u => u.id === userId)?.email || ''
          );
          break;
      }

      // Reload users
      window.location.reload();
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id);

      setShowRoleDialog(false);
      setNewRole('');
      setSelectedUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUserIds.length === 0) return;

    try {
      switch (bulkAction) {
        case 'activate':
          await supabase
            .from('profiles')
            .update({ status: 'active' })
            .in('id', selectedUserIds);
          break;
        case 'suspend':
          await supabase
            .from('profiles')
            .update({ status: 'suspended' })
            .in('id', selectedUserIds);
          break;
        case 'export':
          // Export selected users to CSV
          const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
          const csv = [
            'Name,Email,Role,Status,Created',
            ...selectedUsers.map(u => 
              `${u.full_name || ''},${u.email},${u.role},${u.status},${u.created_at}`
            )
          ].join('\n');
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'users_export.csv';
          a.click();
          break;
      }

      setBulkAction('');
      setSelectedUserIds([]);
      if (bulkAction !== 'export') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, icon: CheckCircle },
      suspended: { variant: 'destructive' as const, icon: XCircle },
      pending: { variant: 'secondary' as const, icon: AlertTriangle },
      deactivated: { variant: 'outline' as const, icon: XCircle }
    };
    
    const config = variants[status as keyof typeof variants] || variants.active;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-pulse" />
              Loading Users
            </CardTitle>
            <CardDescription>Fetching user management data...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Users className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">User Management</h1>
              </div>
              <p className="text-muted-foreground">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleBulkAction()} disabled={selectedUserIds.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <Label>Role</Label>
                <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Registration Date</Label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUserIds.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedUserIds.length} user(s) selected
                  </span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Choose action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activate">Activate Users</SelectItem>
                      <SelectItem value="suspend">Suspend Users</SelectItem>
                      <SelectItem value="export">Export to CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBulkAction} disabled={!bulkAction}>
                    Apply Action
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedUserIds([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Users ({filteredUsers.length})</span>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length === filteredUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUserIds([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds([...selectedUserIds, user.id]);
                          } else {
                            setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {!user.email_verified && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            loadUserActivities(user.id);
                            setShowUserDetail(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>User Actions</DialogTitle>
                              <DialogDescription>
                                Choose an action for {user.full_name || user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role);
                                  setShowRoleDialog(true);
                                }}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                              </Button>
                              
                              {user.status === 'active' ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline">
                                      <UserX className="h-4 w-4 mr-2" />
                                      Suspend User
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to suspend {user.full_name || user.email}? 
                                        They will not be able to log in until reactivated.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleUserAction('suspend', user.id)}>
                                        Suspend
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={() => handleUserAction('activate', user.id)}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                onClick={() => handleUserAction('reset_password', user.id)}
                              >
                                <Key className="h-4 w-4 mr-2" />
                                Reset Password
                              </Button>

                              {!user.email_verified && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleUserAction('verify', user.id)}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Verify Email
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Complete profile and activity information
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="activity">Activity Log</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={selectedUser.full_name || ''} readOnly />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={selectedUser.email} readOnly />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={selectedUser.phone || ''} readOnly />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={selectedUser.role} readOnly />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="pt-2">
                        {getStatusBadge(selectedUser.status)}
                      </div>
                    </div>
                    <div>
                      <Label>Email Verified</Label>
                      <div className="pt-2">
                        <Badge variant={selectedUser.email_verified ? 'default' : 'destructive'}>
                          {selectedUser.email_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-3">
                    {userActivities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{activity.action}</h4>
                            <p className="text-sm text-muted-foreground">{activity.details}</p>
                            {activity.ip_address && (
                              <p className="text-xs text-muted-foreground">IP: {activity.ip_address}</p>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Current role: <Badge>{selectedUser.role}</Badge>
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-medium">Role Permissions:</h4>
                      {selectedUser.role === 'super_admin' && (
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Full platform administration</li>
                          <li>• User management and role assignment</li>
                          <li>• Event and organizer management</li>
                          <li>• System configuration</li>
                        </ul>
                      )}
                      {selectedUser.role === 'admin' && (
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Event and user moderation</li>
                          <li>• Organizer verification</li>
                          <li>• Content management</li>
                        </ul>
                      )}
                      {selectedUser.role === 'organizer' && (
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Create and manage events</li>
                          <li>• Ticketing and sales</li>
                          <li>• Customer management</li>
                        </ul>
                      )}
                      {selectedUser.role === 'user' && (
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Purchase tickets</li>
                          <li>• View events and classes</li>
                          <li>• Manage personal profile</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Role Change Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {selectedUser?.full_name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {isSuperAdmin && (
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRoleChange}>
                  Update Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagementPage;