// BMAD METHOD: Follower Dashboard Component
// Dashboard for followers to track their sales, earnings, and performance

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  ExternalLink,
  Calendar,
  Award,
  BarChart3,
  Link2,
  PlusCircle,
  Eye
} from 'lucide-react';
import { followerService, type FollowerEarnings, type FollowerCommission } from '@/services/followerService';
import { delegatedSalesService, type FollowerSalesStats } from '@/services/delegatedSalesService';
import { followerTrackableLinkService, type FollowerTrackableLink } from '@/services/followerTrackableLinkService';
import { followerCommissionService } from '@/services/followerCommissionService';

interface FollowerDashboardProps {
  followerId: string;
  organizerId?: string;
}

export function FollowerDashboard({ followerId, organizerId }: FollowerDashboardProps) {
  const [earnings, setEarnings] = useState<FollowerEarnings[]>([]);
  const [commissions, setCommissions] = useState<FollowerCommission[]>([]);
  const [salesStats, setSalesStats] = useState<FollowerSalesStats | null>(null);
  const [trackableLinks, setTrackableLinks] = useState<FollowerTrackableLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all_time'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [followerId, organizerId, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all dashboard data in parallel
      const [
        earningsData,
        commissionsData,
        statsData,
        linksData
      ] = await Promise.all([
        followerService.getFollowerEarnings(followerId, organizerId),
        followerService.getFollowerCommissions(followerId),
        delegatedSalesService.getFollowerSalesStats(followerId, organizerId, selectedPeriod),
        // Note: This would need the permission ID - simplified for demo
        // followerTrackableLinkService.getFollowerTrackableLinks(permissionId)
        Promise.resolve([]) as Promise<FollowerTrackableLink[]>
      ]);

      setEarnings(earningsData);
      setCommissions(commissionsData);
      setSalesStats(statsData);
      setTrackableLinks(linksData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentEarnings = earnings.find(e => 
    organizerId ? e.organizer_id === organizerId : true
  ) || {
    follower_id: followerId,
    organizer_id: organizerId || '',
    period_start: '',
    period_end: '',
    total_sales: 0,
    total_commission: 0,
    total_orders: 0,
    total_tickets_sold: 0,
    pending_commission: 0,
    approved_commission: 0,
    paid_commission: 0,
    conversion_rate: 0,
    average_order_value: 0,
    total_clicks: 0
  };

  const pendingCommissions = commissions.filter(c => c.status === 'pending');
  const approvedCommissions = commissions.filter(c => c.status === 'approved');
  const paidCommissions = commissions.filter(c => c.status === 'paid');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading your BMAD dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BMAD Sales Dashboard</h1>
          <p className="text-muted-foreground">Track your earnings and performance as a sales partner</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active Seller
          </Badge>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Period:</span>
        {(['today', 'week', 'month', 'all_time'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
          >
            {period === 'all_time' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentEarnings.total_commission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +${currentEarnings.pending_commission.toFixed(2)} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentEarnings.total_sales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {currentEarnings.total_orders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentEarnings.conversion_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {currentEarnings.total_clicks} total clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentEarnings.average_order_value.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {currentEarnings.total_tickets_sold} tickets sold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="links">Trackable Links</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commission Status */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Status</CardTitle>
                <CardDescription>
                  Breakdown of your commission earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="font-medium">${currentEarnings.pending_commission.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={(currentEarnings.pending_commission / currentEarnings.total_commission) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Approved</span>
                    <span className="font-medium">${currentEarnings.approved_commission.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={(currentEarnings.approved_commission / currentEarnings.total_commission) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paid</span>
                    <span className="font-medium">${currentEarnings.paid_commission.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={(currentEarnings.paid_commission / currentEarnings.total_commission) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Sales Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales Activity</CardTitle>
                <CardDescription>
                  Your latest commission earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commissions.slice(0, 5).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">${commission.commission_amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {commission.commission_rate}% commission
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            commission.status === 'paid' ? 'default' :
                            commission.status === 'approved' ? 'secondary' :
                            'outline'
                          }
                        >
                          {commission.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(commission.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {commissions.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No commission earnings yet. Start promoting events to earn your first commission!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>
                Complete history of your commission earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {commissions.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium">${commission.commission_amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {commission.commission_rate}% of ${commission.base_sale_amount.toFixed(2)} sale
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(commission.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge 
                        variant={
                          commission.status === 'paid' ? 'default' :
                          commission.status === 'approved' ? 'secondary' :
                          'outline'
                        }
                      >
                        {commission.status}
                      </Badge>
                      {commission.payment_date && (
                        <p className="text-xs text-muted-foreground">
                          Paid: {new Date(commission.payment_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trackable Links Tab */}
        <TabsContent value="links" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Your Trackable Links</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage links to track your sales performance
              </p>
            </div>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Link
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trackableLinks.map((link) => (
              <Card key={link.id}>
                <CardHeader>
                  <CardTitle className="text-base">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                      {link.full_url}
                    </code>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold">{link.click_count}</p>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{link.conversion_count}</p>
                      <p className="text-xs text-muted-foreground">Sales</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">${link.commission_earned.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Earned</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={link.is_active ? 'default' : 'secondary'}>
                      {link.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {trackableLinks.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No trackable links yet</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Create your first trackable link to start earning commissions from your promotions
                  </p>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Link
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                Analytics and recommendations to improve your sales performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Performance Score */}
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">85</div>
                <p className="text-sm text-muted-foreground">Performance Score</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Top 20% Performer</span>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-3">Recommendations</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Increase Social Media Promotion</p>
                      <p className="text-xs text-muted-foreground">
                        Your conversion rate is great! Try promoting more frequently to increase total sales.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Focus on Higher-Value Events</p>
                      <p className="text-xs text-muted-foreground">
                        Promote premium events to increase your average commission per sale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals Progress */}
              <div>
                <h4 className="font-medium mb-3">Monthly Goals</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Sales Target</span>
                      <span className="text-sm font-medium">${currentEarnings.total_sales.toFixed(2)} / $1,000</span>
                    </div>
                    <Progress value={(currentEarnings.total_sales / 1000) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Commission Goal</span>
                      <span className="text-sm font-medium">${currentEarnings.total_commission.toFixed(2)} / $100</span>
                    </div>
                    <Progress value={(currentEarnings.total_commission / 100) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FollowerDashboard;