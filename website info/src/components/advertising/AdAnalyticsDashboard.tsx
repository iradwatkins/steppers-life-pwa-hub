import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MousePointer,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { useAdvertising } from '@/hooks/useAdvertising';
import { toast } from 'sonner';

export const AdAnalyticsDashboard: React.FC = () => {
  const {
    analytics,
    adZones,
    directUserAds,
    loadingAnalytics,
    fetchAnalytics
  } = useAdvertising();

  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }
    
    fetchAnalytics({ start, end: now });
  }, [dateRange, fetchAnalytics]);

  const handleRefresh = async () => {
    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }
    
    try {
      await fetchAnalytics({ start, end: now });
      toast.success('Analytics refreshed');
    } catch (error) {
      toast.error('Failed to refresh analytics');
    }
  };

  const handleExportData = () => {
    if (!analytics) return;
    
    // Create CSV export of analytics data
    const csvData = [
      ['Date', 'Impressions', 'Clicks', 'CTR', 'Revenue'],
      ...analytics.trends.daily.map(day => [
        day.date.toLocaleDateString(),
        day.impressions,
        day.clicks,
        ((day.clicks / day.impressions) * 100).toFixed(2) + '%',
        day.revenue
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ad-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loadingAnalytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>No analytics data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Analytics data will appear here once ads start running</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, performance, trends } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          <p className="text-gray-600">Performance insights for your advertising platform</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {performance.revenueGrowth > 0 ? '+' : ''}{performance.revenueGrowth.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {performance.impressionGrowth > 0 ? '+' : ''}{performance.impressionGrowth.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {overview.averageCTR.toFixed(2)}% average CTR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeAds}</div>
            <p className="text-xs text-muted-foreground">
              {overview.pendingAds} pending approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Performance Trends
            </CardTitle>
            <CardDescription>Impressions, clicks, and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.daily.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">{day.date.toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {day.impressions.toLocaleString()} impressions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">${day.revenue}</div>
                    <div className="text-xs text-gray-500">
                      {day.clicks} clicks ({((day.clicks / day.impressions) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Ads */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Ads</CardTitle>
            <CardDescription>Highest revenue generating advertisements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance.topPerformingAds.slice(0, 5).map((ad, index) => (
                <div key={ad.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{ad.title}</div>
                      <div className="text-xs text-gray-500">
                        {ad.advertiserInfo.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      ${ad.performance?.totalRevenue || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ad.performance?.clickThroughRate.toFixed(2)}% CTR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Ad Zone Performance</CardTitle>
          <CardDescription>Revenue and engagement by advertising zone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performance.topPerformingZones?.map((zone) => (
              <div key={zone.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{zone.name}</h4>
                  {zone.pricing.isPremium && (
                    <Badge variant="default" className="bg-purple-500">Premium</Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price per day:</span>
                    <span className="font-medium">${zone.pricing.basePricePerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dimensions:</span>
                    <span>{zone.dimensions.width}×{zone.dimensions.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={zone.isActive ? "default" : "secondary"} className={zone.isActive ? "bg-green-500" : ""}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            )) || adZones.slice(0, 6).map((zone) => (
              <div key={zone.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{zone.name}</h4>
                  {zone.pricing.isPremium && (
                    <Badge variant="default" className="bg-purple-500">Premium</Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price per day:</span>
                    <span className="font-medium">${zone.pricing.basePricePerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dimensions:</span>
                    <span>{zone.dimensions.width}×{zone.dimensions.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={zone.isActive ? "default" : "secondary"} className={zone.isActive ? "bg-green-500" : ""}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 