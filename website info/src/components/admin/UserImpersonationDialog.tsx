import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  UserCog, 
  Search, 
  Filter, 
  AlertTriangle, 
  Eye, 
  Users,
  Calendar,
  GraduationCap,
  Briefcase,
  ShoppingCart,
  Shield,
  Star,
  Loader2
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useUserImpersonation } from '@/hooks/useUserImpersonation';
import { User } from '@/services/adminUserService';

interface UserImpersonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserImpersonationDialog: React.FC<UserImpersonationDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { users, loading: usersLoading, fetchUsers } = useUsers();
  const { startImpersonation, loading: impersonationLoading, canImpersonate } = useUserImpersonation();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const isNotCurrentAdmin = user.role !== 'admin'; // Don't allow impersonating other admins
    
    return matchesSearch && matchesRole && isNotCurrentAdmin;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'organizer': return <Calendar className="h-4 w-4" />;
      case 'instructor': return <GraduationCap className="h-4 w-4" />;
      case 'sales_agent': return <Briefcase className="h-4 w-4" />;
      case 'event_staff': return <Users className="h-4 w-4" />;
      case 'buyer': return <ShoppingCart className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'organizer': return 'bg-blue-500';
      case 'instructor': return 'bg-green-500';
      case 'sales_agent': return 'bg-orange-500';
      case 'event_staff': return 'bg-purple-500';
      case 'buyer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCommonUseCases = (role: string) => {
    switch (role) {
      case 'organizer':
        return [
          'Update event coordinator dates',
          'Fix event details and descriptions',
          'Manage event settings and pricing',
          'Update venue information'
        ];
      case 'instructor':
        return [
          'Add missing class days/times',
          'Update class descriptions',
          'Fix instructor profile information',
          'Manage class schedules'
        ];
      case 'buyer':
        return [
          'Fix incorrect user address',
          'Update payment information',
          'Resolve ticket purchase issues',
          'Update profile information'
        ];
      case 'sales_agent':
        return [
          'Update commission settings',
          'Fix sales agent profile',
          'Manage promotional codes',
          'Update payout information'
        ];
      case 'event_staff':
        return [
          'Update staff assignments',
          'Fix check-in permissions',
          'Manage event access',
          'Update staff contact info'
        ];
      default:
        return ['General account corrections and updates'];
    }
  };

  const handleImpersonate = async () => {
    if (!selectedUser || !purpose.trim()) {
      return;
    }

    try {
      await startImpersonation(selectedUser);
      onOpenChange(false);
      setSelectedUser(null);
      setPurpose('');
      setSearchTerm('');
      setRoleFilter('');
    } catch (error) {
      console.error('Failed to start impersonation:', error);
    }
  };

  if (!canImpersonate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Act As User
          </DialogTitle>
          <DialogDescription>
            Select a user to act as for making corrections and updates on their behalf.
            This action will be logged for audit purposes.
          </DialogDescription>
        </DialogHeader>

        {/* Warning Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Administrator Mode:</strong> You will be acting as the selected user with all their permissions and limitations. 
            All actions will be logged and attributed to your admin account for auditing.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="organizer">Event Organizer</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="sales_agent">Sales Agent</SelectItem>
                  <SelectItem value="event_staff">Event Staff</SelectItem>
                  <SelectItem value="buyer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg max-h-64 overflow-auto">
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading users...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id}
                      className={selectedUser?.id === user.id ? 'bg-blue-50' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getRoleColor(user.role)} text-white`}
                        >
                          <span className="mr-1">{getRoleIcon(user.role)}</span>
                          {user.role}
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
                      <TableCell className="text-right">
                        <Button
                          variant={selectedUser?.id === user.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          {selectedUser?.id === user.id ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Selected User Details & Purpose */}
          {selectedUser && (
            <div className="space-y-4">
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Selected User: {selectedUser.name}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Common Use Cases for {selectedUser.role}s:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {getCommonUseCases(selectedUser.role).map((useCase, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-blue-500" />
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="purpose">Purpose of Impersonation *</Label>
                      <Input
                        id="purpose"
                        placeholder="e.g., Fix incorrect event date, Update user address..."
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be logged for audit purposes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={impersonationLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImpersonate}
              disabled={!selectedUser || !purpose.trim() || impersonationLoading}
            >
              {impersonationLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Act as {selectedUser?.name || 'User'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserImpersonationDialog; 