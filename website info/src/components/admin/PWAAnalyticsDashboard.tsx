import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Smartphone, 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  BarChart3,
  Tablet,
  Monitor,
  RefreshCw,
  Trash2,
  Database,
  AlertCircle,
  Calendar,
  Timer,
  Star
} from 'lucide-react';
import { pwaAnalyticsService, PWAAnalytics } from '@/services/pwaAnalyticsService';

interface PWAAnalyticsDashboardProps {
  className?: string;
}

const PWAAnalyticsDashboard: React.FC<PWAAnalyticsDashboardProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<PWAAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadAnalytics = () => {
    setLoading(true);
    try {
      const data = pwaAnalyticsService.getAnalytics();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load PWA analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'android': return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'ios': return <Smartphone className="h-4 w-4 text-blue-600" />;
      case 'desktop': return <Monitor className="h-4 w-4 text-gray-600" />;
      default: return <Tablet className="h-4 w-4 text-orange-600" />;
    }
  };

  const generateMockData = () => {
    pwaAnalyticsService.generateMockData();
    loadAnalytics();
  };

  const clearData = () => {
    if (confirm('Are you sure you want to clear all PWA analytics data? This action cannot be undone.')) {
      pwaAnalyticsService.clearAnalytics();
      loadAnalytics();
    }
  };

  if (loading && !analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading PWA analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No PWA analytics data available. Install and use the app to generate analytics data.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateMockData}
              className="ml-2"
            >
              Generate Mock Data
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PWA Analytics</h2>
          <p className="text-gray-600">Progressive Web App download and usage statistics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(analytics.totalInstalls)}
            </div>
            <p className="text-xs text-gray-600">All-time PWA installations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(analytics.dailyActiveUsers)}
            </div>
            <p className="text-xs text-gray-600">Active users today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Active Users</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(analytics.weeklyActiveUsers)}
            </div>
            <p className="text-xs text-gray-600">Active users this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(analytics.monthlyActiveUsers)}
            </div>
            <p className="text-xs text-gray-600">Active users this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Duration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timer className="h-4 w-4 mr-2" />
                  Average Session Duration
                </CardTitle>
                <CardDescription>How long users spend in the app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatDuration(analytics.averageSessionDuration)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Average time per session across all users
                </p>
              </CardContent>
            </Card>

            {/* Most Used Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Most Used Features
                </CardTitle>
                <CardDescription>Top features used by staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.mostUsedFeatures.slice(0, 5).map((feature, index) => (
                    <div key={feature.feature} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="text-sm font-medium capitalize">
                          {feature.feature.replace('-', ' ')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatNumber(feature.count)} uses
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Installs by Platform */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Downloads by Platform
                </CardTitle>
                <CardDescription>PWA installations across devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.installsByPlatform).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(platform)}
                        <span className="text-sm font-medium capitalize">{platform}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">{formatNumber(count)}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${analytics.totalInstalls > 0 ? (count / analytics.totalInstalls) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage by Platform */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Usage by Platform
                </CardTitle>
                <CardDescription>App usage in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.usageByPlatform).map(([platform, count]) => {
                    const totalUsage = Object.values(analytics.usageByPlatform).reduce((sum, val) => sum + val, 0);
                    return (
                      <div key={platform} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(platform)}
                          <span className="text-sm font-medium capitalize">{platform}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold">{formatNumber(count)}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${totalUsage > 0 ? (count / totalUsage) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          {/* Feature Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Feature Usage Breakdown
              </CardTitle>
              <CardDescription>How often different features are used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.mostUsedFeatures.map((feature) => {
                  const maxCount = analytics.mostUsedFeatures[0]?.count || 1;
                  const percentage = (feature.count / maxCount) * 100;
                  
                  return (
                    <div key={feature.feature} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {feature.feature.replace('-', ' ')}
                        </span>
                        <span className="text-gray-600">
                          {formatNumber(feature.count)} uses
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Installs Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Daily Installs (Last 30 Days)
                </CardTitle>
                <CardDescription>PWA installation trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.dailyInstalls.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center justify-between text-sm">
                      <span>{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{day.count}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full" 
                            style={{ 
                              width: `${day.count > 0 ? Math.max((day.count / Math.max(...analytics.dailyInstalls.map(d => d.count))) * 100, 5) : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Active Users Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Daily Active Users (Last 30 Days)
                </CardTitle>
                <CardDescription>User engagement trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.dailyActiveUsersHistory.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center justify-between text-sm">
                      <span>{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{day.count}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-green-600 h-1 rounded-full" 
                            style={{ 
                              width: `${day.count > 0 ? Math.max((day.count / Math.max(...analytics.dailyActiveUsersHistory.map(d => d.count))) * 100, 5) : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Analytics Management
          </CardTitle>
          <CardDescription>Manage PWA analytics data</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={generateMockData}
            className="flex items-center"
          >
            <Activity className="h-4 w-4 mr-2" />
            Generate Test Data
          </Button>
          <Button 
            variant="outline" 
            onClick={clearData}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
          <div className="text-sm text-gray-600">
            Total data points: {analytics.totalInstalls + analytics.dailyActiveUsersHistory.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAAnalyticsDashboard; 