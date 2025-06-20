import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  Globe, 
  Smartphone, 
  Monitor,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
  Activity,
  MapPin,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { useWebAnalytics } from '@/hooks/useWebAnalytics';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const WebAnalyticsPage = () => {
  const {
    // Data
    overview,
    pageAnalytics,
    trafficSources,
    deviceAnalytics,
    geographicAnalytics,
    conversionFunnels,
    userJourneys,
    realTimeData,
    
    // State
    loading,
    error,
    filters,
    autoRefresh,
    
    // Computed values
    topPages,
    topSources,
    topCountries,
    
    // Actions
    refreshData,
    updateFilters,
    resetFilters,
    toggleAutoRefresh,
    exportData,
    getTimeRangeLabel,
    formatMetric,
    getDateRangePresets
  } = useWebAnalytics();

  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDatePreset, setSelectedDatePreset] = useState('Last 30 days');

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    if (range?.from && range?.to) {
      updateFilters({
        dateRange: {
          start: range.from,
          end: range.to
        }
      });
      setSelectedDatePreset('Custom');
    }
  };

  const handleDatePresetChange = (preset: string) => {
    const presets = getDateRangePresets();
    const selected = presets.find(p => p.label === preset);
    if (selected) {
      updateFilters({
        dateRange: selected.value
      });
      setSelectedDatePreset(preset);
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (current < previous) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600">Error Loading Analytics</h3>
              <p className="text-gray-600 mt-2">{error}</p>
              <Button onClick={refreshData} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Website & App Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics for {getTimeRangeLabel()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={toggleAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value="" onValueChange={(format) => exportData(format as any)}>
            <SelectTrigger className="w-32">
              <Download className="h-4 w-4 mr-2" />
              Export
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date Range Preset</Label>
                <Select value={selectedDatePreset} onValueChange={handleDatePresetChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getDateRangePresets().map((preset) => (
                      <SelectItem key={preset.label} value={preset.label}>
                        {preset.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="Custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Custom Date Range</Label>
                <DatePickerWithRange
                  value={{
                    from: filters.dateRange.start,
                    to: filters.dateRange.end
                  }}
                  onChange={handleDateRangeChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Data Banner */}
      {realTimeData && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Live</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="font-medium">{realTimeData.activeUsers}</span>
                    <span className="text-muted-foreground ml-1">active users</span>
                  </div>
                  <div>
                    <span className="font-medium">{realTimeData.pageViewsLast5Min}</span>
                    <span className="text-muted-foreground ml-1">views (5 min)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Top page: </span>
                  <span className="font-medium">
                    {realTimeData.topPages[0]?.page || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Top source: </span>
                  <span className="font-medium">
                    {realTimeData.topSources[0]?.source || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(overview.totalPageViews, 'number')}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getTrendIcon(overview.totalPageViews, overview.totalPageViews * 0.9)}
                    <span className="ml-1">
                      {getChangePercentage(overview.totalPageViews, overview.totalPageViews * 0.9)} from previous period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(overview.sessions, 'number')}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getTrendIcon(overview.sessions, overview.sessions * 0.85)}
                    <span className="ml-1">
                      {getChangePercentage(overview.sessions, overview.sessions * 0.85)} from previous period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(overview.bounceRate, 'percentage')}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getTrendIcon(overview.bounceRate * 0.9, overview.bounceRate)}
                    <span className="ml-1">
                      {getChangePercentage(overview.bounceRate * 0.9, overview.bounceRate)} from previous period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(overview.avgSessionDuration, 'duration')}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getTrendIcon(overview.avgSessionDuration, overview.avgSessionDuration * 0.95)}
                    <span className="ml-1">
                      {getChangePercentage(overview.avgSessionDuration, overview.avgSessionDuration * 0.95)} from previous period
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most viewed pages by traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="page" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Sessions by traffic source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="sessions"
                    >
                      {topSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
              <CardDescription>Detailed analytics for all pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Page</th>
                      <th className="text-right py-2">Page Views</th>
                      <th className="text-right py-2">Unique Views</th>
                      <th className="text-right py-2">Avg. Time</th>
                      <th className="text-right py-2">Bounce Rate</th>
                      <th className="text-right py-2">Exit Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageAnalytics.map((page, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">
                          <div>
                            <div className="font-medium">{page.title}</div>
                            <div className="text-sm text-muted-foreground">{page.page}</div>
                          </div>
                        </td>
                        <td className="text-right py-2">{formatMetric(page.pageViews, 'number')}</td>
                        <td className="text-right py-2">{formatMetric(page.uniquePageViews, 'number')}</td>
                        <td className="text-right py-2">{formatMetric(page.avgTimeOnPage, 'duration')}</td>
                        <td className="text-right py-2">{formatMetric(page.bounceRate, 'percentage')}</td>
                        <td className="text-right py-2">{formatMetric(page.exitRate, 'percentage')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Sessions by acquisition channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={trafficSources}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" fill="#8884d8" name="Sessions" />
                    <Bar dataKey="conversions" fill="#82ca9d" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources Table */}
            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
                <CardDescription>Detailed metrics by traffic source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trafficSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{source.source}</div>
                        <div className="text-sm text-muted-foreground">{source.medium}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatMetric(source.sessions, 'number')} sessions</div>
                        <div className="text-sm text-muted-foreground">
                          {formatMetric(source.conversionRate, 'percentage')} conversion rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Types */}
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>Sessions by device category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceAnalytics.reduce((acc, device) => {
                        const existing = acc.find(d => d.type === device.deviceType);
                        if (existing) {
                          existing.sessions += device.sessions;
                        } else {
                          acc.push({ type: device.deviceType, sessions: device.sessions });
                        }
                        return acc;
                      }, [] as Array<{ type: string; sessions: number }>)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="sessions"
                    >
                      {deviceAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Details */}
            <Card>
              <CardHeader>
                <CardTitle>Device Details</CardTitle>
                <CardDescription>Browser and OS breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deviceAnalytics.map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {device.deviceType === 'mobile' ? (
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Monitor className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium">{device.browser}</div>
                          <div className="text-sm text-muted-foreground">{device.os}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatMetric(device.sessions, 'number')}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatMetric(device.conversionRate, 'percentage')} conv.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Sessions by country</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCountries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geographic Details */}
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>Performance by geographic region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographicAnalytics.slice(0, 10).map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{location.city}, {location.region}</div>
                          <div className="text-sm text-muted-foreground">{location.country}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatMetric(location.users, 'number')} users</div>
                        <div className="text-sm text-muted-foreground">
                          {formatMetric(location.revenue, 'currency')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-6">
          {conversionFunnels.map((funnel, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>{funnel.name}</span>
                </CardTitle>
                <CardDescription>
                  Overall conversion rate: {formatMetric(funnel.overallConversionRate, 'percentage')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnel.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                        {stepIndex + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{step.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatMetric(step.users, 'number')} users
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${step.conversionRate * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Conversion: {formatMetric(step.conversionRate, 'percentage')}</span>
                          <span>Drop-off: {formatMetric(step.dropOffRate, 'percentage')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebAnalyticsPage;