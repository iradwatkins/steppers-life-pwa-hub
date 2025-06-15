import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  ShoppingCart,
  Target,
  ArrowLeftRight,
  Download,
  Filter,
  RefreshCw,
  Eye,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';

const AdminAnalyticsHub: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Mock data for comprehensive analytics
  const orderAnalytics = {
    totalOrders: 2456,
    totalRevenue: 145678,
    averageOrderValue: 59.32,
    conversionRate: 3.24,
    monthlyGrowth: 12.5,
    ordersByStatus: [
      { name: 'Completed', value: 2180, color: '#10B981' },
      { name: 'Pending', value: 156, color: '#F59E0B' },
      { name: 'Cancelled', value: 89, color: '#EF4444' },
      { name: 'Refunded', value: 31, color: '#6B7280' }
    ],
    dailyOrders: [
      { date: '2024-01-01', orders: 45, revenue: 2670 },
      { date: '2024-01-02', orders: 52, revenue: 3080 },
      { date: '2024-01-03', orders: 38, revenue: 2250 },
      { date: '2024-01-04', orders: 61, revenue: 3620 },
      { date: '2024-01-05', orders: 48, revenue: 2840 },
      { date: '2024-01-06', orders: 55, revenue: 3260 },
      { date: '2024-01-07', orders: 43, revenue: 2550 }
    ]
  };

  const eventAnalytics = {
    totalEvents: 234,
    activeEvents: 45,
    totalAttendees: 12456,
    averageAttendance: 85.3,
    topCategories: [
      { category: 'Salsa', events: 89, attendees: 4523 },
      { category: 'Bachata', events: 67, attendees: 3211 },
      { category: 'Workshops', events: 45, attendees: 2134 },
      { category: 'Competitions', events: 23, attendees: 1845 },
      { category: 'Social', events: 10, attendees: 743 }
    ],
    monthlyTrends: [
      { month: 'Jan', events: 18, attendees: 1234 },
      { month: 'Feb', events: 22, attendees: 1456 },
      { month: 'Mar', events: 25, attendees: 1678 },
      { month: 'Apr', events: 31, attendees: 2123 },
      { month: 'May', events: 28, attendees: 1987 },
      { month: 'Jun', events: 34, attendees: 2345 }
    ]
  };

  const userAnalytics = {
    totalUsers: 8934,
    activeUsers: 6721,
    newUsers: 234,
    retentionRate: 67.8,
    usersByRole: [
      { role: 'Buyers', count: 7234, percentage: 81 },
      { role: 'Organizers', count: 892, percentage: 10 },
      { role: 'Instructors', count: 456, percentage: 5 },
      { role: 'Agents', count: 234, percentage: 3 },
      { role: 'Admins', count: 118, percentage: 1 }
    ],
    userGrowth: [
      { week: 'Week 1', newUsers: 45, totalUsers: 8756 },
      { week: 'Week 2', newUsers: 62, totalUsers: 8818 },
      { week: 'Week 3', newUsers: 38, totalUsers: 8856 },
      { week: 'Week 4', newUsers: 89, totalUsers: 8934 }
    ]
  };

  const financialAnalytics = {
    totalRevenue: 245678,
    monthlyRecurring: 45234,
    profit: 123456,
    platformFees: 12345,
    payoutsPending: 8976,
    revenueStreams: [
      { source: 'Ticket Sales', amount: 198765, percentage: 81 },
      { source: 'Platform Fees', amount: 24567, percentage: 10 },
      { source: 'Premium Features', amount: 12345, percentage: 5 },
      { source: 'Advertising', amount: 6789, percentage: 3 },
      { source: 'Other', amount: 3212, percentage: 1 }
    ]
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Hub</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive platform analytics and insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Frame Selector */}
      <div className="flex space-x-2">
        {['7d', '30d', '90d', '1y'].map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe)}
          >
            {timeframe === '7d' && 'Last 7 Days'}
            {timeframe === '30d' && 'Last 30 Days'}
            {timeframe === '90d' && 'Last 90 Days'}
            {timeframe === '1y' && 'Last Year'}
          </Button>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders & Sales</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialAnalytics.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderAnalytics.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8.2%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventAnalytics.activeEvents}</div>
                <p className="text-xs text-muted-foreground">
                  of {eventAnalytics.totalEvents} total events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAnalytics.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {userAnalytics.retentionRate}% retention rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Combined Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Orders Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderAnalytics.dailyOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth & Events</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventAnalytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="events" stroke="#8884d8" />
                    <Line type="monotone" dataKey="attendees" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders & Sales Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderAnalytics.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${orderAnalytics.averageOrderValue}</div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderAnalytics.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">Visitor to buyer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{orderAnalytics.monthlyGrowth}%</div>
                <p className="text-xs text-muted-foreground">From last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Tooltip />
                    <Cell dataKey="value" />
                    {orderAnalytics.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Orders & Revenue</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderAnalytics.dailyOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Event Analytics</h2>
            <Link to="/organizer/analytics">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Multi-Event Analytics
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventAnalytics.totalEvents}</div>
                <p className="text-xs text-muted-foreground">All time events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventAnalytics.totalAttendees.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventAnalytics.averageAttendance}%</div>
                <p className="text-xs text-muted-foreground">Capacity utilization</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventAnalytics.activeEvents}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Categories Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventAnalytics.topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{category.events} events</div>
                        <div className="text-sm text-gray-500">{category.attendees} attendees</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Event Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventAnalytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="events" stroke="#8884d8" />
                    <Line type="monotone" dataKey="attendees" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAnalytics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAnalytics.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAnalytics.newUsers}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAnalytics.retentionRate}%</div>
                <p className="text-xs text-muted-foreground">Monthly retention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userAnalytics.usersByRole.map((role, index) => (
                    <div key={role.role} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium">{role.role}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{role.count.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{role.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userAnalytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="newUsers" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialAnalytics.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialAnalytics.platformFees.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Monthly fees collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialAnalytics.profit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Net profit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialAnalytics.payoutsPending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Awaiting processing</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Streams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialAnalytics.revenueStreams.map((stream, index) => (
                  <div key={stream.source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium">{stream.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${stream.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{stream.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalyticsHub; 