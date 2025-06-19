import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Globe, 
  Smartphone, 
  Activity, 
  ArrowLeft,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Map,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  MousePointer,
  Star,
  MessageSquare
} from 'lucide-react';

interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  userGrowthRate: number;
  totalEvents: number;
  activeEvents: number;
  eventsToday: number;
  totalRevenue: number;
  revenueToday: number;
  revenueGrowth: number;
  totalOrganizers: number;
  activeOrganizers: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  events: number;
  tickets: number;
}

interface GeographicData {
  region: string;
  users: number;
  revenue: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  users: number;
  percentage: number;
}

interface FeatureUsage {
  feature: string;
  users: number;
  usage_count: number;
  adoption_rate: number;
}

interface PerformanceMetrics {
  avg_load_time: number;
  error_rate: number;
  uptime: number;
  page_views: number;
  bounce_rate: number;
}

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin } = useRoles();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    userGrowthRate: 0,
    totalEvents: 0,
    activeEvents: 0,
    eventsToday: 0,
    totalRevenue: 0,
    revenueToday: 0,
    revenueGrowth: 0,
    totalOrganizers: 0,
    activeOrganizers: 0
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    avg_load_time: 0,
    error_rate: 0,
    uptime: 0,
    page_views: 0,
    bounce_rate: 0
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Load core platform metrics
        const [usersResult, eventsResult, organizersResult] = await Promise.all([
          supabase.from('profiles').select('id, created_at', { count: 'exact' }),
          supabase.from('events').select('id, created_at, status', { count: 'exact' }),
          supabase.from('organizers').select('id, created_at', { count: 'exact' })
        ]);

        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        
        // Calculate growth metrics
        const totalUsers = usersResult.count || 0;
        const newUsersToday = (usersResult.data || []).filter(u => 
          new Date(u.created_at) >= todayStart
        ).length;
        
        const totalEvents = eventsResult.count || 0;
        const activeEvents = (eventsResult.data || []).filter(e => e.status === 'published').length;
        const eventsToday = (eventsResult.data || []).filter(e => 
          new Date(e.created_at) >= todayStart
        ).length;

        const totalOrganizers = organizersResult.count || 0;
        
        // Mock revenue data (in production, this would come from orders/transactions)
        const mockRevenue = totalEvents * 125.50; // Average revenue per event
        const mockRevenueToday = eventsToday * 125.50;

        setMetrics({
          totalUsers,
          activeUsers: Math.floor(totalUsers * 0.65), // Mock 65% active rate
          newUsersToday,
          userGrowthRate: 12.5, // Mock growth rate
          totalEvents,
          activeEvents,
          eventsToday,
          totalRevenue: mockRevenue,
          revenueToday: mockRevenueToday,
          revenueGrowth: 8.3, // Mock revenue growth
          totalOrganizers,
          activeOrganizers: Math.floor(totalOrganizers * 0.8) // Mock 80% active rate
        });

        // Mock revenue trend data
        const mockRevenueData: RevenueData[] = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return {
            date: date.toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 1000) + 500,
            events: Math.floor(Math.random() * 10) + 1,
            tickets: Math.floor(Math.random() * 50) + 10
          };
        });
        setRevenueData(mockRevenueData);

        // Mock geographic data
        const mockGeographicData: GeographicData[] = [
          { region: 'California', users: Math.floor(totalUsers * 0.35), revenue: mockRevenue * 0.35, percentage: 35 },
          { region: 'Texas', users: Math.floor(totalUsers * 0.18), revenue: mockRevenue * 0.18, percentage: 18 },
          { region: 'New York', users: Math.floor(totalUsers * 0.15), revenue: mockRevenue * 0.15, percentage: 15 },
          { region: 'Florida', users: Math.floor(totalUsers * 0.12), revenue: mockRevenue * 0.12, percentage: 12 },
          { region: 'Illinois', users: Math.floor(totalUsers * 0.08), revenue: mockRevenue * 0.08, percentage: 8 },
          { region: 'Other', users: Math.floor(totalUsers * 0.12), revenue: mockRevenue * 0.12, percentage: 12 }
        ];
        setGeographicData(mockGeographicData);

        // Mock device data
        const mockDeviceData: DeviceData[] = [
          { device: 'Mobile (iOS)', users: Math.floor(totalUsers * 0.45), percentage: 45 },
          { device: 'Mobile (Android)', users: Math.floor(totalUsers * 0.35), percentage: 35 },
          { device: 'Desktop', users: Math.floor(totalUsers * 0.15), percentage: 15 },
          { device: 'Tablet', users: Math.floor(totalUsers * 0.05), percentage: 5 }
        ];
        setDeviceData(mockDeviceData);

        // Mock feature usage data
        const mockFeatureUsage: FeatureUsage[] = [
          { feature: 'Event Discovery', users: Math.floor(totalUsers * 0.89), usage_count: 15420, adoption_rate: 89 },
          { feature: 'Ticket Purchase', users: Math.floor(totalUsers * 0.67), usage_count: 8930, adoption_rate: 67 },
          { feature: 'Following System', users: Math.floor(totalUsers * 0.54), usage_count: 6780, adoption_rate: 54 },
          { feature: 'Profile Management', users: Math.floor(totalUsers * 0.78), usage_count: 4560, adoption_rate: 78 },
          { feature: 'Event Creation', users: Math.floor(totalUsers * 0.12), usage_count: 2340, adoption_rate: 12 },
          { feature: 'Community Directory', users: Math.floor(totalUsers * 0.43), usage_count: 3210, adoption_rate: 43 }
        ];
        setFeatureUsage(mockFeatureUsage);

        // Mock performance metrics
        setPerformanceMetrics({
          avg_load_time: 1.2,
          error_rate: 0.5,
          uptime: 99.8,
          page_views: 45678,
          bounce_rate: 28.5
        });

        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [dateRange]);

  // Export analytics data
  const exportData = (format: 'csv' | 'json') => {
    const data = {
      metrics,
      revenueData,
      geographicData,
      deviceData,
      featureUsage,
      performanceMetrics,
      exported_at: new Date().toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvContent = [
        'Metric,Value',
        `Total Users,${metrics.totalUsers}`,
        `Active Users,${metrics.activeUsers}`,
        `Total Events,${metrics.totalEvents}`,
        `Total Revenue,$${metrics.totalRevenue.toFixed(2)}`,
        `Revenue Growth,${metrics.revenueGrowth}%`,
        `Average Load Time,${performanceMetrics.avg_load_time}s`,
        `Uptime,${performanceMetrics.uptime}%`
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      // Export as JSON
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform_analytics_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  // Get status indicator based on metric
  const getStatusIndicator = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value <= threshold : value >= threshold;
    return isGood ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-pulse" />
              Loading Analytics
            </CardTitle>
            <CardDescription>Fetching platform analytics data...</CardDescription>
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
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Platform Analytics</h1>
              </div>
              <p className="text-muted-foreground">
                Comprehensive platform metrics and performance insights
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => exportData('csv')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+{metrics.userGrowthRate}%</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+{metrics.revenueGrowth}%</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Events</p>
                  <p className="text-2xl font-bold">{metrics.activeEvents}</p>
                  <p className="text-xs text-muted-foreground">{metrics.eventsToday} created today</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Health</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{performanceMetrics.uptime}%</p>
                    {getStatusIndicator(performanceMetrics.uptime, 99)}
                  </div>
                  <p className="text-xs text-muted-foreground">{performanceMetrics.avg_load_time}s avg load</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Revenue Trend (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.slice(-7).map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{new Date(data.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">${data.revenue}</span>
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(data.revenue / 1000) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Feature Adoption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featureUsage.slice(0, 5).map((feature, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{feature.feature}</span>
                          <span className="text-sm text-muted-foreground">{feature.adoption_rate}%</span>
                        </div>
                        <Progress value={feature.adoption_rate} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Users</span>
                      <Badge variant="secondary">{metrics.totalUsers.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Users</span>
                      <Badge variant="secondary">{metrics.activeUsers.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>New Today</span>
                      <Badge variant="secondary">{metrics.newUsersToday}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Growth Rate</span>
                      <Badge variant="default">+{metrics.userGrowthRate}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Device Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deviceData.map((device, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{device.device}</span>
                          <span className="text-sm text-muted-foreground">{device.percentage}%</span>
                        </div>
                        <Progress value={device.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ${metrics.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    +{metrics.revenueGrowth}% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    ${metrics.revenueToday.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    From {metrics.eventsToday} events
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg. Per Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    ${Math.round(metrics.totalRevenue / metrics.totalEvents)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Revenue per event
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Events</span>
                      <Badge variant="secondary">{metrics.totalEvents}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Events</span>
                      <Badge variant="default">{metrics.activeEvents}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Created Today</span>
                      <Badge variant="secondary">{metrics.eventsToday}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Organizers</span>
                      <Badge variant="secondary">{metrics.totalOrganizers}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Avg. Event Revenue</span>
                      <span className="font-medium">${Math.round(metrics.totalRevenue / metrics.totalEvents)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Organizers</span>
                      <span className="font-medium">{metrics.activeOrganizers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Events per Organizer</span>
                      <span className="font-medium">{Math.round(metrics.totalEvents / metrics.totalOrganizers)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>
                  User and revenue distribution by region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicData.map((region, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{region.region}</span>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{region.users} users</span>
                          <span>${region.revenue.toLocaleString()}</span>
                          <span>{region.percentage}%</span>
                        </div>
                      </div>
                      <Progress value={region.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Load Time</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{performanceMetrics.avg_load_time}s</span>
                        {getStatusIndicator(performanceMetrics.avg_load_time, 2, true)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Error Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{performanceMetrics.error_rate}%</span>
                        {getStatusIndicator(performanceMetrics.error_rate, 1, true)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Uptime</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{performanceMetrics.uptime}%</span>
                        {getStatusIndicator(performanceMetrics.uptime, 99)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Page Views</span>
                      <span className="font-medium">{performanceMetrics.page_views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Bounce Rate</span>
                      <span className="font-medium">{performanceMetrics.bounce_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg. Session Duration</span>
                      <span className="font-medium">5m 32s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;