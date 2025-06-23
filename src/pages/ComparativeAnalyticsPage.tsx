import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useComparativeAnalytics } from '@/hooks/useComparativeAnalytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Area, AreaChart
} from 'recharts';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Search,
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Calendar,
  MapPin,
  Trophy,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Info,
  Star,
  Award
} from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

export default function ComparativeAnalyticsPage() {
  const navigate = useNavigate();
  const {
    events,
    selectedEventIds,
    comparisonData,
    benchmarkData,
    performanceScores,
    trendAnalysis,
    seasonalPatterns,
    venueComparison,
    teamPerformance,
    loading,
    error,
    filters,
    autoRefresh,
    selectEvent,
    deselectEvent,
    clearSelection,
    compareSelectedEvents,
    calculatePerformanceScore,
    loadBenchmarkData,
    loadTrendAnalysis,
    loadSeasonalAnalysis,
    loadVenueComparison,
    loadTeamPerformance,
    applyFilters,
    clearFilters,
    searchEvents,
    exportData,
    generateReport,
    refresh,
    setAutoRefresh,
    getFilteredEvents,
    getComparisonInsights,
    totalEvents,
    averageRevenue,
    topPerformingEvent
  } = useComparativeAnalytics();

  const [activeTab, setActiveTab] = useState('setup');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [timeRange, setTimeRange] = useState('12months');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [showFilters, setShowFilters] = useState(false);

  // Load additional data on mount
  useEffect(() => {
    loadSeasonalAnalysis();
    loadVenueComparison();
    loadTeamPerformance();
  }, []);

  // Load trend analysis when metric or time range changes
  useEffect(() => {
    if (selectedMetric && timeRange) {
      loadTrendAnalysis(selectedMetric, timeRange);
    }
  }, [selectedMetric, timeRange]);

  // Calculate performance scores for selected events
  useEffect(() => {
    selectedEventIds.forEach(eventId => {
      if (!performanceScores[eventId]) {
        calculatePerformanceScore(eventId);
      }
    });
  }, [selectedEventIds]);

  const filteredEvents = getFilteredEvents();
  const searchResults = searchQuery ? searchEvents(searchQuery) : filteredEvents;

  const handleEventSelection = (eventId: string, checked: boolean) => {
    if (checked) {
      selectEvent(eventId);
    } else {
      deselectEvent(eventId);
    }
  };

  const handleCompare = async () => {
    await compareSelectedEvents();
    setActiveTab('charts');
  };

  const handleExport = async () => {
    await exportData(exportFormat);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      case 'opportunity': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Comparative Analytics</h1>
            <p className="text-muted-foreground">Compare performance across events and benchmarks</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={(checked) => setAutoRefresh(checked)}
            />
            <Label>Auto Refresh</Label>
          </div>
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Available for comparison
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageRevenue.toLocaleString()}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-1" />
              Across all events
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {topPerformingEvent?.eventName || 'N/A'}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 mr-1" />
              Highest revenue
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selected Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedEventIds.length}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Target className="h-4 w-4 mr-1" />
              Ready to compare
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select Events to Compare</CardTitle>
                  <CardDescription>
                    Choose 2 or more events for comparative analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>

                  {/* Filter Panel */}
                  {showFilters && (
                    <Card className="p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Event Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fitness">Fitness</SelectItem>
                              <SelectItem value="wellness">Wellness</SelectItem>
                              <SelectItem value="dance">Dance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Venue</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="All venues" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="central-park">Central Park Pavilion</SelectItem>
                              <SelectItem value="downtown">Downtown Studio</SelectItem>
                              <SelectItem value="grand-ballroom">Grand Ballroom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={clearFilters}>Clear</Button>
                        <Button onClick={() => setShowFilters(false)}>Apply</Button>
                      </div>
                    </Card>
                  )}

                  {/* Event List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((event) => (
                      <div
                        key={event.eventId}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={selectedEventIds.includes(event.eventId)}
                          onCheckedChange={(checked) => 
                            handleEventSelection(event.eventId, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium">{event.eventName}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-4">
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${event.totalRevenue.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {event.totalAttendees}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.venue}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">{event.eventType}</Badge>
                      </div>
                    ))}
                  </div>

                  {/* Selection Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {selectedEventIds.length} event{selectedEventIds.length !== 1 ? 's' : ''} selected
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" onClick={clearSelection}>
                        Clear Selection
                      </Button>
                      <Button 
                        onClick={handleCompare}
                        disabled={selectedEventIds.length < 2}
                      >
                        Compare Events
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setActiveTab('benchmarks')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Benchmarks
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setActiveTab('trends')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trend Analysis
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setActiveTab('performance')}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Performance Scores
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Format</Label>
                    <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleExport}
                    disabled={selectedEventIds.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          {comparisonData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData.events}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="eventName" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="totalRevenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Attendance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData.events}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="eventName" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalAttendees" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={comparisonData.events.map(event => ({
                      event: event.eventName.split(' ')[0],
                      Revenue: (event.totalRevenue / 25000) * 100,
                      Attendance: event.checkInRate,
                      Satisfaction: (event.customerSatisfaction / 5) * 100,
                      Profit: event.profitMargin
                    }))}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="event" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar dataKey="Revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar dataKey="Attendance" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Radar dataKey="Satisfaction" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                      <Radar dataKey="Profit" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Conversion Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion & Check-in Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={comparisonData.events}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="eventName" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="conversionRate" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="checkInRate" stroke="#82ca9d" strokeWidth={2} />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <PieChartIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Comparison Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Select events from the Setup tab to view comparison charts
                  </p>
                  <Button onClick={() => setActiveTab('setup')}>
                    Go to Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          {comparisonData ? (
            <div className="space-y-6">
              {/* Key Differences */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Differences</CardTitle>
                  <CardDescription>
                    Percentage differences between selected events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(comparisonData.differences).map(([metric, value]) => (
                      <div key={metric} className="text-center p-4 border rounded-lg">
                        <div className="text-sm font-medium capitalize mb-2">{metric}</div>
                        <div className={`text-2xl font-bold ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {value > 0 ? '+' : ''}{value.toFixed(1)}%
                        </div>
                        <div className="flex items-center justify-center mt-1">
                          {value > 0 ? 
                            <TrendingUp className="h-4 w-4 text-green-600" /> : 
                            value < 0 ? 
                            <TrendingDown className="h-4 w-4 text-red-600" /> :
                            <div className="h-4 w-4" />
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Metrics Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Metrics Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Metric</th>
                          {comparisonData.events.map(event => (
                            <th key={event.eventId} className="text-left p-2">{event.eventName}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Total Revenue</td>
                          {comparisonData.events.map(event => (
                            <td key={event.eventId} className="p-2">${event.totalRevenue.toLocaleString()}</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Tickets Sold</td>
                          {comparisonData.events.map(event => (
                            <td key={event.eventId} className="p-2">{event.totalTicketsSold}</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Attendees</td>
                          {comparisonData.events.map(event => (
                            <td key={event.eventId} className="p-2">{event.totalAttendees}</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Check-in Rate</td>
                          {comparisonData.events.map(event => (
                            <td key={event.eventId} className="p-2">{event.checkInRate.toFixed(1)}%</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Customer Satisfaction</td>
                          {comparisonData.events.map(event => (
                            <td key={event.eventId} className="p-2">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                {event.customerSatisfaction.toFixed(1)}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Profit Margin</td>
                          {comparisonData.events.map(event => (
                            <td key={event.eventId} className="p-2">{event.profitMargin}%</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Metrics Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Compare events to view detailed metrics
                  </p>
                  <Button onClick={() => setActiveTab('setup')}>
                    Compare Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>
                  Performance trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex space-x-4">
                  <div>
                    <Label>Metric</Label>
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="satisfaction">Satisfaction</SelectItem>
                        <SelectItem value="profit">Profit Margin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Range</Label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="12months">12 Months</SelectItem>
                        <SelectItem value="24months">24 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {trendAnalysis[selectedMetric] ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={trendAnalysis[selectedMetric].timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Trend Statistics */}
              {trendAnalysis[selectedMetric] && (
                <Card>
                  <CardHeader>
                    <CardTitle>Trend Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium">Growth Rate</div>
                      <div className="text-2xl font-bold text-green-600">
                        +{trendAnalysis[selectedMetric].growthRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Volatility</div>
                      <div className="text-lg">{trendAnalysis[selectedMetric].volatility}%</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Trend</div>
                      <Badge variant="outline" className="capitalize">
                        {trendAnalysis[selectedMetric].trend}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Seasonal Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  {seasonalPatterns.length > 0 ? (
                    <div className="space-y-3">
                      {seasonalPatterns.map((pattern, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">{pattern.period}</div>
                          <div className="text-lg font-bold">
                            ${pattern.averagePerformance.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Peak: {pattern.peakMonths.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Loading seasonal data...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {benchmarkData.map((benchmark, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{benchmark.metric}</CardTitle>
                  <CardDescription>
                    Industry comparison and performance ranking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Your Performance</span>
                    <span className="text-lg font-bold">
                      {benchmark.metric.includes('Rate') || benchmark.metric.includes('Satisfaction') 
                        ? benchmark.userValue.toFixed(1) 
                        : benchmark.userValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Industry Average</span>
                      <span>{benchmark.industryAverage.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={(benchmark.userValue / benchmark.bestInClass) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Worst: {benchmark.worstInClass.toLocaleString()}</span>
                      <span>Best: {benchmark.bestInClass.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={benchmark.percentile > 75 ? 'default' : benchmark.percentile > 50 ? 'secondary' : 'outline'}>
                      {benchmark.percentile}th Percentile
                    </Badge>
                    <div className="flex items-center">
                      {benchmark.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : benchmark.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      <span className="text-sm ml-1 capitalize">{benchmark.trend}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Venue Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {venueComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={venueComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="venue" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageRevenue" fill="#8884d8" />
                    <Bar dataKey="roi" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedEventIds.map(eventId => {
              const event = events.find(e => e.eventId === eventId);
              const score = performanceScores[eventId];
              
              if (!event || !score) return null;

              return (
                <Card key={eventId}>
                  <CardHeader>
                    <CardTitle>{event.eventName}</CardTitle>
                    <CardDescription>
                      Overall Performance Score: {score.overall.toFixed(1)}/100
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {score.breakdown.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.category}</span>
                            <span>{item.score.toFixed(1)}/100</span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Revenue Score</div>
                        <div className="text-lg">{score.revenue.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="font-medium">Satisfaction Score</div>
                        <div className="text-lg">{score.satisfaction.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="font-medium">Efficiency Score</div>
                        <div className="text-lg">{score.efficiency.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="font-medium">Growth Score</div>
                        <div className="text-lg">{score.growth.toFixed(1)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {teamPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Team Configuration</th>
                        <th className="text-left p-3">Avg Revenue</th>
                        <th className="text-left p-3">Satisfaction</th>
                        <th className="text-left p-3">Efficiency</th>
                        <th className="text-left p-3">Cost per Event</th>
                        <th className="text-left p-3">Incidents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamPerformance.map((team, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3 font-medium">{team.staffConfiguration}</td>
                          <td className="p-3">${team.averageRevenue.toLocaleString()}</td>
                          <td className="p-3">{team.customerSatisfaction.toFixed(1)}</td>
                          <td className="p-3">{team.operationalEfficiency}%</td>
                          <td className="p-3">${team.costPerEvent.toLocaleString()}</td>
                          <td className="p-3">{team.incidentRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {comparisonData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comparison Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparison Insights</CardTitle>
                  <CardDescription>
                    Key findings from your event comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comparisonData.insights.map((insight) => (
                      <div key={insight.id} className="flex space-x-3 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant={getInsightBadgeVariant(insight.type)}>
                              {insight.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                          {insight.recommendation && (
                            <p className="text-sm font-medium text-blue-600">
                              💡 {insight.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strategic Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Recommendations</CardTitle>
                  <CardDescription>
                    AI-powered insights for optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Revenue Optimization</h4>
                      <p className="text-sm text-blue-700">
                        Based on your highest-performing events, consider increasing marketing spend 
                        for similar event types and venues.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Operational Efficiency</h4>
                      <p className="text-sm text-green-700">
                        Your check-in rates are above industry average. Consider offering this 
                        as a service differentiator in your marketing.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Market Timing</h4>
                      <p className="text-sm text-yellow-700">
                        Seasonal analysis suggests March-April are your peak performance months. 
                        Plan your major events during this period.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Customer Experience</h4>
                      <p className="text-sm text-purple-700">
                        Your satisfaction scores are strong. Consider implementing a referral 
                        program to leverage word-of-mouth marketing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Compare events to generate insights and recommendations
                  </p>
                  <Button onClick={() => setActiveTab('setup')}>
                    Start Comparison
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}