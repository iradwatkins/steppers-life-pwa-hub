import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  Database,
  Server,
  Shield,
  Settings,
  RefreshCw,
  Eye,
  UserPlus,
  Plus
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
  Bar 
} from 'recharts';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  payment: 'healthy' | 'warning' | 'critical';
}

interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  systemAlerts: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'event_created' | 'ticket_sold' | 'payment_processed' | 'system_alert';
  description: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'error';
}

const AdminDashboardOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    systemAlerts: 0
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    payment: 'healthy'
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 12000, users: 450 },
    { month: 'Feb', revenue: 15000, users: 520 },
    { month: 'Mar', revenue: 18000, users: 680 },
    { month: 'Apr', revenue: 22000, users: 750 },
    { month: 'May', revenue: 25000, users: 890 },
    { month: 'Jun', revenue: 28000, users: 950 }
  ];

  const eventData = [
    { day: 'Mon', events: 12, tickets: 145 },
    { day: 'Tue', events: 8, tickets: 98 },
    { day: 'Wed', events: 15, tickets: 201 },
    { day: 'Thu', events: 10, tickets: 156 },
    { day: 'Fri', events: 18, tickets: 234 },
    { day: 'Sat', events: 25, tickets: 312 },
    { day: 'Sun', events: 20, tickets: 267 }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load real metrics where possible
      const { count: userCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Mock data for demonstration
      setMetrics({
        totalUsers: userCount || 1247,
        activeUsers: 892,
        totalEvents: eventCount || 156,
        activeEvents: 34,
        totalRevenue: 156789,
        monthlyRevenue: 28000,
        pendingApprovals: 8,
        systemAlerts: 2
      });

      // Mock system health
      setSystemHealth({
        database: 'healthy',
        api: 'healthy',
        storage: 'healthy',
        payment: 'warning'
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered: sarah@example.com',
          timestamp: '2 minutes ago'
        },
        {
          id: '2',
          type: 'event_created',
          description: 'Event "Salsa Night Downtown" created by Mike Johnson',
          timestamp: '15 minutes ago'
        },
        {
          id: '3',
          type: 'ticket_sold',
          description: '5 tickets sold for "Bachata Workshop"',
          timestamp: '32 minutes ago'
        },
        {
          id: '4',
          type: 'system_alert',
          description: 'Payment gateway response time increased',
          timestamp: '1 hour ago',
          severity: 'warning'
        },
        {
          id: '5',
          type: 'payment_processed',
          description: 'Payment of $125.00 processed successfully',
          timestamp: '2 hours ago'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: SystemHealth[keyof SystemHealth]) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration': return <UserPlus className="h-4 w-4" />;
      case 'event_created': return <Calendar className="h-4 w-4" />;
      case 'ticket_sold': return <DollarSign className="h-4 w-4" />;
      case 'payment_processed': return <CheckCircle className="h-4 w-4" />;
      case 'system_alert': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor platform performance and manage key metrics
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics.activeUsers}</span> active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics.totalEvents} total events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requiring admin attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <p className="text-sm font-medium mt-1">Database</p>
              </div>
              <Badge className={getHealthStatusColor(systemHealth.database)}>
                {systemHealth.database}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Server className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <p className="text-sm font-medium mt-1">API</p>
              </div>
              <Badge className={getHealthStatusColor(systemHealth.api)}>
                {systemHealth.api}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <p className="text-sm font-medium mt-1">Storage</p>
              </div>
              <Badge className={getHealthStatusColor(systemHealth.storage)}>
                {systemHealth.storage}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <p className="text-sm font-medium mt-1">Payment</p>
              </div>
              <Badge className={getHealthStatusColor(systemHealth.payment)}>
                {systemHealth.payment}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & User Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Event Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="events" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/admin/users/create">
                <Button className="w-full justify-start" variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </Link>
              
              <Link to="/admin/events/create-assign">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
              
              <Link to="/admin/users">
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Pending Approvals ({metrics.pendingApprovals})
                </Button>
              </Link>
              
              <Link to="/admin/settings">
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Platform Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className={`p-1 rounded-full ${
                    activity.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    activity.severity === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardOverview; 