import React, { useState } from 'react';
import { useFollowers } from '@/hooks/useFollowers';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Users, 
  UserPlus, 
  Download, 
  Mail, 
  TrendingUp, 
  Bell,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  DollarSign,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { TeamMember } from '@/services/followerService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Form schemas
const teamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'staff', 'sales_agent']),
  permissions: z.array(z.string()).min(1, 'At least one permission required'),
  commission_rate: z.number().optional()
});

const notificationSchema = z.object({
  type: z.enum(['new_event', 'event_update', 'special_offer']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  event_id: z.string().optional()
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

export default function FollowerManagementPage() {
  const { user } = useAuth();
  const organizerId = user?.id || 'org_001'; // Mock organizer ID
  
  const {
    followers,
    teamMembers,
    stats,
    isLoading,
    error,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    notifyFollowers,
    exportFollowers
  } = useFollowers(organizerId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Forms
  const teamMemberForm = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'staff',
      permissions: [],
      commission_rate: 0
    }
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: 'new_event',
      title: '',
      message: '',
      event_id: ''
    }
  });

  // Available permissions by role
  const getAvailablePermissions = (role: string) => {
    const permissions = {
      admin: ['manage_events', 'manage_team', 'view_analytics', 'manage_tickets', 'manage_finances'],
      manager: ['manage_events', 'view_analytics', 'manage_tickets', 'check_in_attendees'],
      staff: ['check_in_attendees', 'view_events', 'manage_tickets'],
      sales_agent: ['sell_tickets', 'view_commission', 'view_events']
    };
    return permissions[role as keyof typeof permissions] || [];
  };

  // Handle form submissions
  const onSubmitTeamMember = async (data: TeamMemberFormData) => {
    try {
      if (editingMember) {
        await updateTeamMember(editingMember.id, data);
        toast.success('Team member updated successfully');
      } else {
        await addTeamMember(data);
        toast.success('Team member added successfully');
      }
      
      setShowAddMemberDialog(false);
      setEditingMember(null);
      teamMemberForm.reset();
    } catch (error) {
      toast.error('Failed to save team member');
    }
  };

  const onSubmitNotification = async (data: NotificationFormData) => {
    try {
      await notifyFollowers(data);
      toast.success('Notification sent to followers');
      setShowNotificationDialog(false);
      notificationForm.reset();
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  // Handle team member actions
  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    teamMemberForm.reset({
      name: member.name,
      email: member.email,
      role: member.role,
      permissions: member.permissions,
      commission_rate: member.commission_rate || 0
    });
    setShowAddMemberDialog(true);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      try {
        await removeTeamMember(memberId);
        toast.success('Team member removed');
      } catch (error) {
        toast.error('Failed to remove team member');
      }
    }
  };

  // Filter data
  const filteredFollowers = followers.filter(follower =>
    follower.follower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    follower.follower_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeamMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team & Followers</h1>
          <p className="text-muted-foreground">
            Manage your team members and follower community
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportFollowers('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
            <DialogTrigger asChild>
              <Button>
                <Bell className="h-4 w-4 mr-2" />
                Notify Followers
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Notification to Followers</DialogTitle>
                <DialogDescription>
                  Send a notification to all followers based on their preferences
                </DialogDescription>
              </DialogHeader>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onSubmitNotification)} className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new_event">New Event</SelectItem>
                            <SelectItem value="event_update">Event Update</SelectItem>
                            <SelectItem value="special_offer">Special Offer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Notification title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Notification message" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Send Notification
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowNotificationDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_followers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new_followers_this_month}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_followers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.engagement_rate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search followers or team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({teamMembers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Top Events by Followers */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Popular Events Among Followers</CardTitle>
                <CardDescription>Events with the most follower registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.top_events_by_followers.map((event, index) => (
                    <div key={event.event_id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.event_name}</p>
                        <p className="text-sm text-muted-foreground">Event ID: {event.event_id}</p>
                      </div>
                      <Badge variant="secondary">
                        {event.followers_registered} registered
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>Followers</CardTitle>
              <CardDescription>People following your events and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Followed At</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFollowers.map((follower) => (
                    <TableRow key={follower.id}>
                      <TableCell className="font-medium">{follower.follower_name}</TableCell>
                      <TableCell>{follower.follower_email}</TableCell>
                      <TableCell>{new Date(follower.followed_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {follower.notification_preferences.new_events && (
                            <Badge variant="outline" className="text-xs">Events</Badge>
                          )}
                          {follower.notification_preferences.event_updates && (
                            <Badge variant="outline" className="text-xs">Updates</Badge>
                          )}
                          {follower.notification_preferences.special_offers && (
                            <Badge variant="outline" className="text-xs">Offers</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={follower.status === 'active' ? 'default' : 'secondary'}>
                          {follower.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your team and their permissions</CardDescription>
                </div>
                <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingMember ? 'Update team member details' : 'Add a new member to your team'}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...teamMemberForm}>
                      <form onSubmit={teamMemberForm.handleSubmit(onSubmitTeamMember)} className="space-y-4">
                        <FormField
                          control={teamMemberForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter full name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={teamMemberForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="Enter email address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={teamMemberForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="staff">Staff</SelectItem>
                                  <SelectItem value="sales_agent">Sales Agent</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {teamMemberForm.watch('role') === 'sales_agent' && (
                          <FormField
                            control={teamMemberForm.control}
                            name="commission_rate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Commission Rate (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    placeholder="5.0" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1">
                            {editingMember ? 'Update Member' : 'Add Member'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowAddMemberDialog(false);
                              setEditingMember(null);
                              teamMemberForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {member.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.commission_rate ? `${member.commission_rate}%` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            member.status === 'active' ? 'default' : 
                            member.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMember(member)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}