import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Search, 
  Filter, 
  MoreHorizontal,
  Crown,
  Shield,
  Megaphone,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Activity,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  UserMinus,
  Settings
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFollowers } from '@/hooks/useFollowers';
import { TeamRole, TeamMember, Follower, TeamInvitation } from '@/services/followerService';
import { toast } from 'sonner';
import { format } from 'date-fns';

const organizerId = 'org-1'; // This would come from auth context

export default function FollowerManagementPage() {
  const {
    followers,
    teamMembers,
    invitations,
    analytics,
    recentActivities,
    loading,
    error,
    assignRoleToFollower,
    updateMemberRole,
    removeMember,
    sendInvitation,
    cancelInvitation,
    resendInvitation,
    getAvailableRoles,
    refresh
  } = useFollowers(organizerId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamRole | 'all'>('all');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleAssignDialogOpen, setRoleAssignDialogOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState<Follower | null>(null);

  // Role assignment form state
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteName, setNewInviteName] = useState('');
  const [newInviteRole, setNewInviteRole] = useState<TeamRole>('sales_agent');
  const [newInviteMessage, setNewInviteMessage] = useState('');

  const availableRoles = getAvailableRoles();

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'sales_agent': return <TrendingUp className="h-4 w-4" />;
      case 'event_staff': return <Shield className="h-4 w-4" />;
      case 'marketing_assistant': return <Megaphone className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: TeamRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'sales_agent': return 'bg-green-100 text-green-800';
      case 'event_staff': return 'bg-blue-100 text-blue-800';
      case 'marketing_assistant': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'away': return 'bg-orange-100 text-orange-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignRole = async (followerId: string, role: TeamRole) => {
    try {
      await assignRoleToFollower(followerId, role);
      setRoleAssignDialogOpen(false);
      setSelectedFollower(null);
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const handleSendInvitation = async () => {
    if (!newInviteEmail.trim() || !newInviteRole) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await sendInvitation(newInviteEmail, newInviteRole, newInviteMessage, newInviteName);
      setInviteDialogOpen(false);
      setNewInviteEmail('');
      setNewInviteName('');
      setNewInviteMessage('');
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  const filteredFollowers = followers.filter(follower => {
    const matchesSearch = follower.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          follower.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole && member.isActive;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your followers, team members, and invitations
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team with a specific role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name (Optional)</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newInviteName}
                    onChange={(e) => setNewInviteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={newInviteRole} onValueChange={(value) => setNewInviteRole(value as TeamRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(role.value)}
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-sm text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Join our team and help us create amazing events!"
                    value={newInviteMessage}
                    onChange={(e) => setNewInviteMessage(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvitation}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTeamMembers}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activeMembers} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From team sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTicketsSold}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.avgPerformanceScore)}%</div>
              <p className="text-xs text-muted-foreground">
                Average efficiency
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="followers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
          <TabsTrigger value="team">Team Members ({teamMembers.filter(m => m.isActive).length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Followers Tab */}
        <TabsContent value="followers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Followers</CardTitle>
                  <CardDescription>Users who follow your events</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search followers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFollowers.map((follower) => (
                  <div key={follower.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={follower.userAvatar} />
                        <AvatarFallback>{follower.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{follower.userName}</div>
                        <div className="text-sm text-muted-foreground">{follower.userEmail}</div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Follower since {follower.followerSince}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {follower.totalEventsAttended} events
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            ${follower.totalSpent} spent
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1">
                        {follower.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedFollower(follower);
                          setRoleAssignDialogOpen(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add to Team
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredFollowers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No followers found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your team roles and permissions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search team..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as TeamRole | 'all')}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTeamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.userAvatar} />
                        <AvatarFallback>{member.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.userName}</span>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {getRoleIcon(member.role)}
                            <span className="ml-1">{member.role.replace('_', ' ')}</span>
                          </Badge>
                          <Badge className={getAvailabilityColor(member.availability)}>
                            {member.availability}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{member.userEmail}</div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Joined {format(member.assignedAt, 'MMM d, yyyy')}</span>
                          <span>Last login {format(member.lastLogin, 'MMM d')}</span>
                          <span>Efficiency: {member.performance.efficiency}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <div className="font-medium">${member.performance.revenue.toLocaleString()}</div>
                        <div className="text-muted-foreground">{member.performance.ticketsSold} tickets</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => removeMember(member.id, 'Removed by organizer')}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {filteredTeamMembers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No team members found matching your filters.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Invitations</CardTitle>
              <CardDescription>Manage pending and sent invitations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{invitation.inviteeName || invitation.inviteeEmail}</div>
                        <div className="text-sm text-muted-foreground">{invitation.inviteeEmail}</div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Invited {format(invitation.invitedAt, 'MMM d, yyyy')}</span>
                          <span>Expires {format(invitation.expiresAt, 'MMM d, yyyy')}</span>
                          <Badge className={getRoleBadgeColor(invitation.role)}>
                            {invitation.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={invitation.status === 'pending' ? 'secondary' : invitation.status === 'accepted' ? 'default' : 'destructive'}>
                        {invitation.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {invitation.status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {invitation.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {invitation.status}
                      </Badge>
                      {invitation.status === 'pending' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => resendInvitation(invitation.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => cancelInvitation(invitation.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
                {invitations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No invitations found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Role Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.roleDistribution).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(role as TeamRole)}
                            <span className="text-sm">{role.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${(count / analytics.totalTeamMembers) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topPerformers.slice(0, 5).map((member, index) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.userAvatar} />
                            <AvatarFallback>{member.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{member.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              {member.performance.efficiency}% efficiency
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">${member.performance.revenue.toLocaleString()}</div>
                            <div className="text-muted-foreground">{member.performance.ticketsSold} tickets</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 py-2">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.result === 'success' ? 'bg-green-500' : 
                          activity.result === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm">{activity.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(activity.timestamp, 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Role Assignment Dialog */}
      <Dialog open={roleAssignDialogOpen} onOpenChange={setRoleAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Team</DialogTitle>
            <DialogDescription>
              Assign a role to {selectedFollower?.userName} and add them to your team.
            </DialogDescription>
          </DialogHeader>
          {selectedFollower && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <Avatar>
                  <AvatarImage src={selectedFollower.userAvatar} />
                  <AvatarFallback>{selectedFollower.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedFollower.userName}</div>
                  <div className="text-sm text-muted-foreground">{selectedFollower.userEmail}</div>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Select Role</Label>
                {availableRoles.map((role) => (
                  <div
                    key={role.value}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => handleAssignRole(selectedFollower.id, role.value)}
                  >
                    <div className="flex items-center gap-3">
                      {getRoleIcon(role.value)}
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                    </div>
                    <Button size="sm">Assign</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 