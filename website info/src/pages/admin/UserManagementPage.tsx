import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter, 
  RefreshCw, 
  UserRound, 
  Zap, 
  ShieldAlert, 
  Loader2 
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/services/adminUserService';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import UserDetailDialog from '@/components/admin/UserDetailDialog';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const UserManagementPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();

  const { 
    users, 
    totalUsers, 
    loading, 
    error, 
    fetchUsers, 
    currentPage, 
    setPage, 
    currentLimit, 
    setLimit, 
    currentSortBy, 
    setSortBy, 
    currentSortOrder, 
    setSortOrder, 
    currentQuery, 
    setQuery, 
    currentRoleFilter, 
    setRoleFilter, 
    currentStatusFilter, 
    setStatusFilter 
  } = useUsers();

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const totalPages = Math.ceil(totalUsers / currentLimit);

  const handleSort = (column: keyof User) => {
    if (currentSortBy === column) {
      setSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: keyof User) => {
    if (currentSortBy === column) {
      return currentSortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
    }
    return null;
  };

  const roleOptions: { value: User['role'] | 'all'; label: string }[] = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'organizer', label: 'Organizer' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'buyer', label: 'Buyer' },
    { value: 'event_staff', label: 'Event Staff' },
    { value: 'sales_agent', label: 'Sales Agent' },
  ];

  const statusOptions: { value: User['status'] | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'deactivated', label: 'Deactivated' },
  ];

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    fetchUsers(); 
  };

  const handleApproveOrganizer = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-primary text-xl">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">User Account Management</h1>
          <p className="text-lg text-muted-foreground">Oversee and manage all user accounts on the platform.</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Filter & Search Users</CardTitle>
            <Button variant="outline" onClick={() => fetchUsers()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  className="pl-9"
                  value={currentQuery}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Select onValueChange={(value) => setRoleFilter(value === 'all' ? '' : value as User['role'])} value={currentRoleFilter || 'all'} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value as User['status'])} value={currentStatusFilter || 'all'} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">User List ({totalUsers} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-500 text-center py-4">
                Error: {error}
              </div>
            )}

            {loading && users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4" />
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserRound className="mx-auto h-8 w-8 mb-4" />
                No users found matching your criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('name')}
                    >
                      Name {getSortIcon('name')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('email')}
                    >
                      Email {getSortIcon('email')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('role')}
                    >
                      Role {getSortIcon('role')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('status')}
                    >
                      Status {getSortIcon('status')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('registrationDate')}
                    >
                      Registered {getSortIcon('registrationDate')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('lastLogin')}
                    >
                      Last Login {getSortIcon('lastLogin')}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.status === 'active' ? 'success' : user.status === 'pending_approval' ? 'warning' : 'destructive'}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.registrationDate}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)}>
                          View Details
                        </Button>
                        {user.role === 'organizer' && user.status === 'pending_approval' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="ml-2 bg-green-500 hover:bg-green-600"
                            onClick={() => handleApproveOrganizer(user)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {totalUsers > currentLimit && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationPrevious 
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setPage(i + 1)}
                        isActive={currentPage === i + 1}
                        disabled={loading}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationNext 
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  />
                </PaginationContent>
              </Pagination>
            )}

            <div className="flex items-center justify-end space-x-2 py-4">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select onValueChange={(value) => setLimit(Number(value))} value={String(currentLimit || 10)} disabled={loading}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserDetailDialog
        user={selectedUser}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default UserManagementPage; 