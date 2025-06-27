// BMAD METHOD: Organizer Follower Management Component
// Interface for organizers to manage follower sales permissions and commissions

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  UserPlus, 
  Settings, 
  DollarSign, 
  TrendingUp,
  Shield,
  Ban,
  CheckCircle,
  AlertCircle,
  Edit,
  MoreHorizontal,
  Eye,
  Link2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  followerService, 
  type OrganizerFollower, 
  type FollowerStats,
  type FollowerSalesPermission 
} from '@/services/followerService';
import { delegatedSalesService } from '@/services/delegatedSalesService';

interface OrganizerFollowerManagerProps {
  organizerId: string;
  organizerUserId: string;
}

interface PermissionForm {
  commission_type: 'percentage' | 'fixed_amount' | 'tiered';
  commission_rate: number;
  commission_fixed_amount: number;
  can_sell_tickets: boolean;
  can_create_promo_codes: boolean;
  can_view_sales_analytics: boolean;
  max_tickets_per_order: number;
  max_daily_sales?: number;
  max_monthly_sales?: number;
  notes?: string;
}

export function OrganizerFollowerManager({ organizerId, organizerUserId }: OrganizerFollowerManagerProps) {
  const [followers, setFollowers] = useState<OrganizerFollower[]>([]);
  const [stats, setStats] = useState<FollowerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFollower, setSelectedFollower] = useState<OrganizerFollower | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [permissionForm, setPermissionForm] = useState<PermissionForm>({
    commission_type: 'percentage',
    commission_rate: 5.0,
    commission_fixed_amount: 0,
    can_sell_tickets: true,
    can_create_promo_codes: false,
    can_view_sales_analytics: true,
    max_tickets_per_order: 10,
    max_daily_sales: undefined,
    max_monthly_sales: undefined,
    notes: ''
  });

  useEffect(() => {
    loadFollowerData();
  }, [organizerId]);

  const loadFollowerData = async () => {
    try {
      setLoading(true);
      const [followersData, statsData] = await Promise.all([
        followerService.getOrganizerFollowers(organizerId),
        followerService.getFollowerStats(organizerId)
      ]);
      
      setFollowers(followersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading follower data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async (follower: OrganizerFollower) => {
    setSelectedFollower(follower);
    
    // Pre-fill form with existing permission if available
    if (follower.sales_permission) {
      const permission = follower.sales_permission;
      setPermissionForm({
        commission_type: permission.commission_type,
        commission_rate: permission.commission_rate,
        commission_fixed_amount: permission.commission_fixed_amount,
        can_sell_tickets: permission.can_sell_tickets,
        can_create_promo_codes: permission.can_create_promo_codes,
        can_view_sales_analytics: permission.can_view_sales_analytics,
        max_tickets_per_order: permission.max_tickets_per_order,
        max_daily_sales: permission.max_daily_sales,
        max_monthly_sales: permission.max_monthly_sales,
        notes: permission.notes || ''
      });
    } else {
      // Reset to defaults for new permission
      setPermissionForm({
        commission_type: 'percentage',
        commission_rate: 5.0,
        commission_fixed_amount: 0,
        can_sell_tickets: true,
        can_create_promo_codes: false,
        can_view_sales_analytics: true,
        max_tickets_per_order: 10,
        max_daily_sales: undefined,
        max_monthly_sales: undefined,
        notes: ''
      });
    }
    
    setIsPermissionDialogOpen(true);
  };

  const handleSavePermission = async () => {
    if (!selectedFollower) return;

    try {
      if (selectedFollower.sales_permission) {
        // Update existing permission
        const success = await followerService.updateSalesPermission(
          selectedFollower.sales_permission.id,
          permissionForm
        );
        
        if (success) {
          await loadFollowerData();
          setIsPermissionDialogOpen(false);
          setSelectedFollower(null);
        }
      } else {
        // Grant new permission
        const permission = await followerService.grantSalesPermission(
          organizerId,
          selectedFollower.follower_user_id,
          permissionForm,
          organizerUserId
        );
        
        if (permission) {
          await loadFollowerData();
          setIsPermissionDialogOpen(false);
          setSelectedFollower(null);
        }
      }
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      const success = await followerService.revokeSalesPermission(permissionId);
      if (success) {
        await loadFollowerData();
      }
    } catch (error) {
      console.error('Error revoking permission:', error);
    }
  };

  const handleTogglePermissionStatus = async (permission: FollowerSalesPermission) => {
    try {
      const newStatus = permission.status === 'active' ? 'suspended' : 'active';
      const success = await followerService.updateSalesPermission(permission.id, {
        status: newStatus
      });
      
      if (success) {
        await loadFollowerData();
      }
    } catch (error) {
      console.error('Error toggling permission status:', error);
    }
  };

  const getPermissionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading follower management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BMAD Follower Management</h1>
          <p className="text-muted-foreground">Manage your sales team and commission structure</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Followers
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_followers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.new_followers_this_month} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Enabled</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sales_enabled_followers}</div>
              <p className="text-xs text-muted-foreground">
                Active sales partners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.total_sales_this_month.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From follower sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.total_commission_paid.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total lifetime
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="followers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="permissions">Sales Permissions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Followers Tab */}
        <TabsContent value="followers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Followers</CardTitle>
              <CardDescription>
                Manage your follower list and sales permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followers.map((follower) => (
                  <div key={follower.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{follower.follower_name}</p>
                        <p className="text-sm text-muted-foreground">{follower.follower_email}</p>
                        <p className="text-xs text-muted-foreground">
                          Followed {new Date(follower.followed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {follower.sales_permission ? (
                        <div className="flex items-center gap-2">
                          <Badge className={getPermissionStatusColor(follower.sales_permission.status)}>
                            {follower.sales_permission.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {follower.sales_permission.commission_rate}% commission
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline">No Sales Permission</Badge>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleGrantPermission(follower)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {follower.sales_permission ? 'Edit Permission' : 'Grant Permission'}
                          </DropdownMenuItem>
                          {follower.sales_permission && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleTogglePermissionStatus(follower.sales_permission!)}
                              >
                                {follower.sales_permission.status === 'active' ? (
                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRevokePermission(follower.sales_permission!.id)}
                                className="text-red-600"
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Revoke Permission
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Performance
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link2 className="h-4 w-4 mr-2" />
                            View Links
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                {followers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No followers yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      When people follow your organizer profile, they'll appear here
                    </p>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Share Your Profile
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sales Permissions</CardTitle>
              <CardDescription>
                Overview of all followers with sales permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followers
                  .filter(f => f.sales_permission)
                  .map((follower) => (
                    <div key={follower.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{follower.follower_name}</p>
                          <p className="text-sm text-muted-foreground">{follower.follower_email}</p>
                        </div>
                        <Badge className={getPermissionStatusColor(follower.sales_permission!.status)}>
                          {follower.sales_permission!.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Commission</p>
                          <p className="font-medium">
                            {follower.sales_permission!.commission_type === 'percentage' 
                              ? `${follower.sales_permission!.commission_rate}%`
                              : `$${follower.sales_permission!.commission_fixed_amount}`
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Max Per Order</p>
                          <p className="font-medium">{follower.sales_permission!.max_tickets_per_order} tickets</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Can Create Promos</p>
                          <p className="font-medium">
                            {follower.sales_permission!.can_create_promo_codes ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Granted</p>
                          <p className="font-medium">
                            {new Date(follower.sales_permission!.granted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {follower.sales_permission!.notes && (
                        <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                          <p className="text-muted-foreground">Notes:</p>
                          <p>{follower.sales_permission!.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Follower Performance</CardTitle>
              <CardDescription>
                Sales performance metrics for your follower sales team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Performance analytics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permission Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedFollower?.sales_permission ? 'Edit Sales Permission' : 'Grant Sales Permission'}
            </DialogTitle>
            <DialogDescription>
              Configure sales permissions and commission structure for {selectedFollower?.follower_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Basic Permissions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="can_sell_tickets"
                  checked={permissionForm.can_sell_tickets}
                  onCheckedChange={(checked) => 
                    setPermissionForm(prev => ({ ...prev, can_sell_tickets: checked }))
                  }
                />
                <Label htmlFor="can_sell_tickets">Can sell tickets</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="can_create_promo_codes"
                  checked={permissionForm.can_create_promo_codes}
                  onCheckedChange={(checked) => 
                    setPermissionForm(prev => ({ ...prev, can_create_promo_codes: checked }))
                  }
                />
                <Label htmlFor="can_create_promo_codes">Can create promo codes</Label>
              </div>
            </div>
            
            {/* Sales Restrictions Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Follower Sales Permissions</h4>
                  <p className="text-xs text-blue-700 mb-2">
                    Followers can sell individual tickets and earn commissions, but cannot sell:
                  </p>
                  <div className="space-y-1 text-xs text-blue-600">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      Table bookings and reserved seating
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      Premium event seating charts
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Individual tickets (all event types)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Structure */}
            <div className="space-y-3">
              <Label>Commission Structure</Label>
              <Select
                value={permissionForm.commission_type}
                onValueChange={(value: 'percentage' | 'fixed_amount' | 'tiered') =>
                  setPermissionForm(prev => ({ ...prev, commission_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage of Sale</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount per Sale</SelectItem>
                  <SelectItem value="tiered">Tiered Commission</SelectItem>
                </SelectContent>
              </Select>
              
              {permissionForm.commission_type === 'percentage' && (
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={permissionForm.commission_rate}
                    onChange={(e) => 
                      setPermissionForm(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              )}
              
              {permissionForm.commission_type === 'fixed_amount' && (
                <div>
                  <Label htmlFor="commission_fixed_amount">Fixed Commission Amount ($)</Label>
                  <Input
                    id="commission_fixed_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={permissionForm.commission_fixed_amount}
                    onChange={(e) => 
                      setPermissionForm(prev => ({ ...prev, commission_fixed_amount: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max_tickets_per_order">Max Tickets per Order</Label>
                <Input
                  id="max_tickets_per_order"
                  type="number"
                  min="1"
                  value={permissionForm.max_tickets_per_order}
                  onChange={(e) => 
                    setPermissionForm(prev => ({ ...prev, max_tickets_per_order: parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_daily_sales">Max Daily Sales ($)</Label>
                <Input
                  id="max_daily_sales"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="No limit"
                  value={permissionForm.max_daily_sales || ''}
                  onChange={(e) => 
                    setPermissionForm(prev => ({ ...prev, max_daily_sales: e.target.value ? parseFloat(e.target.value) : undefined }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_monthly_sales">Max Monthly Sales ($)</Label>
                <Input
                  id="max_monthly_sales"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="No limit"
                  value={permissionForm.max_monthly_sales || ''}
                  onChange={(e) => 
                    setPermissionForm(prev => ({ ...prev, max_monthly_sales: e.target.value ? parseFloat(e.target.value) : undefined }))
                  }
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this permission..."
                value={permissionForm.notes}
                onChange={(e) => 
                  setPermissionForm(prev => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermission}>
              {selectedFollower?.sales_permission ? 'Update Permission' : 'Grant Permission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrganizerFollowerManager;