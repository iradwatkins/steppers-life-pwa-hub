import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  QrCode, 
  MousePointer, 
  Users, 
  ShoppingCart,
  Eye,
  Calendar,
  Download,
  Share2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useQRCodes } from '../../hooks/useQRCodes';

interface QRCodeAnalyticsDashboardProps {
  eventId?: string;
}

export const QRCodeAnalyticsDashboard: React.FC<QRCodeAnalyticsDashboardProps> = ({ eventId }) => {
  const { qrCodes, analytics, isLoading, refresh } = useQRCodes(eventId);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedQRCode, setSelectedQRCode] = useState<string>('all');

  // Filter analytics based on selection
  const filteredAnalytics = useMemo(() => {
    if (selectedQRCode === 'all') {
      return analytics;
    }
    return analytics.filter(a => a.qrCodeId === selectedQRCode);
  }, [analytics, selectedQRCode]);

  // Calculate aggregate metrics
  const metrics = useMemo(() => {
    const totalScans = filteredAnalytics.reduce((sum, a) => sum + a.totalScans, 0);
    const totalClicks = filteredAnalytics.reduce((sum, a) => sum + a.totalClicks, 0);
    const totalConversions = filteredAnalytics.reduce((sum, a) => sum + a.conversions, 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const clickRate = totalScans > 0 ? (totalClicks / totalScans) * 100 : 0;

    // Calculate trends (mock calculation - in real app would compare to previous period)
    const scanTrend = Math.floor(Math.random() * 20) - 10; // -10% to +10%
    const clickTrend = Math.floor(Math.random() * 20) - 10;
    const conversionTrend = Math.floor(Math.random() * 20) - 10;

    return {
      totalScans,
      totalClicks,
      totalConversions,
      conversionRate,
      clickRate,
      scanTrend,
      clickTrend,
      conversionTrend
    };
  }, [filteredAnalytics]);

  // Top performing QR codes
  const topPerformingQRCodes = useMemo(() => {
    return analytics
      .sort((a, b) => b.totalScans - a.totalScans)
      .slice(0, 5)
      .map(a => {
        const qrCode = qrCodes.find(qr => qr.id === a.qrCodeId);
        return {
          ...a,
          name: qrCode?.name || 'Unknown QR Code'
        };
      });
  }, [analytics, qrCodes]);

  // Device breakdown
  const deviceBreakdown = useMemo(() => {
    const devices = filteredAnalytics.reduce((acc, a) => {
      Object.entries(a.deviceTypes).forEach(([device, count]) => {
        acc[device] = (acc[device] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(devices).reduce((sum, count) => sum + count, 0);
    return Object.entries(devices).map(([device, count]) => ({
      device,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }, [filteredAnalytics]);

  // Source breakdown
  const sourceBreakdown = useMemo(() => {
    const sources = filteredAnalytics.reduce((acc, a) => {
      Object.entries(a.sources).forEach(([source, count]) => {
        acc[source] = (acc[source] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(sources).reduce((sum, count) => sum + count, 0);
    return Object.entries(sources).map(([source, count]) => ({
      source,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }, [filteredAnalytics]);

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    trend, 
    icon: Icon,
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center mt-4">
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">QR Code Analytics</h3>
          <p className="text-sm text-gray-600 mt-1">
            Track performance and engagement across all your QR codes
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedQRCode} onValueChange={setSelectedQRCode}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select QR Code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All QR Codes</SelectItem>
              {qrCodes.map(qr => (
                <SelectItem key={qr.id} value={qr.id}>
                  {qr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Scans"
          value={metrics.totalScans.toLocaleString()}
          subtitle="QR code scans"
          trend={metrics.scanTrend}
          icon={QrCode}
          color="blue"
        />
        <MetricCard
          title="Page Views"
          value={metrics.totalClicks.toLocaleString()}
          subtitle={`${metrics.clickRate.toFixed(1)}% click-through rate`}
          trend={metrics.clickTrend}
          icon={MousePointer}
          color="green"
        />
        <MetricCard
          title="Conversions"
          value={metrics.totalConversions.toLocaleString()}
          subtitle={`${metrics.conversionRate.toFixed(1)}% conversion rate`}
          trend={metrics.conversionTrend}
          icon={ShoppingCart}
          color="purple"
        />
        <MetricCard
          title="Unique Users"
          value={Math.floor(metrics.totalScans * 0.7).toLocaleString()}
          subtitle="Estimated unique visitors"
          icon={Users}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing QR Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Top Performing QR Codes
            </CardTitle>
            <CardDescription>
              QR codes ranked by total scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingQRCodes.map((qr, index) => (
                <div key={qr.qrCodeId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{qr.name}</p>
                      <p className="text-sm text-gray-500">
                        {qr.totalClicks} clicks • {((qr.totalClicks / qr.totalScans) * 100).toFixed(1)}% CTR
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{qr.totalScans}</p>
                    <p className="text-sm text-gray-500">scans</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Device Breakdown
            </CardTitle>
            <CardDescription>
              How users are accessing your QR codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceBreakdown.map(({ device, count, percentage }) => (
                <div key={device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {device}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Traffic Sources
            </CardTitle>
            <CardDescription>
              Where your QR code scans are coming from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sourceBreakdown.map(({ source, count, percentage }) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="capitalize">
                      {source}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{count}</p>
                    <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest QR code interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.slice(0, 5).map((activity, index) => {
                const qrCode = qrCodes.find(qr => qr.id === activity.qrCodeId);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{qrCode?.name || 'Unknown QR'}</p>
                      <p className="text-sm text-gray-500">
                        {activity.totalScans} scans today
                      </p>
                    </div>
                    <Badge 
                      variant={activity.totalScans > activity.totalClicks ? 'default' : 'secondary'}
                    >
                      {activity.totalScans > 10 ? 'Active' : 'Low Activity'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Analytics
          </CardTitle>
          <CardDescription>
            Download detailed analytics reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF Report
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 