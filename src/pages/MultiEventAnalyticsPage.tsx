import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMultiEventAnalytics } from '@/hooks/useMultiEventAnalytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Target,
  Star,
  Lightbulb
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5A2B'];

const MultiEventAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    metrics,
    comparisons,
    trends,
    venuePerformance,
    audienceInsights,
    predictiveInsights,
    loading,
    error,
    filters,
    setFilters,
    refreshData,
    exportData,
    trendPeriod,
    setTrendPeriod,
    comparisonLimit,
    setComparisonLimit,
    lastRefresh
  } = useMultiEventAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              {error || 'Failed to load multi-event analytics data'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performanceScore = Math.round(
    (metrics.averageCapacityUtilization * 0.4) +
    (metrics.averageCheckInRate * 0.3) +
    (metrics.revenueGrowth > 0 ? 100 : 50) * 0.3
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Multi-Event Analytics</h1>
            <p className="text-muted-foreground">
              Portfolio performance and insights across all events
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <div className="flex gap-2">
            <Button onClick={() => exportData('csv')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button onClick={() => exportData('json')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastRefresh.toLocaleString()}
        </p>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              {Math.abs(metrics.revenueGrowth).toFixed(1)}% vs last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalAttendees.toLocaleString()} total attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageCapacityUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.averageCheckInRate.toFixed(1)}% check-in rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceScore}/100</div>
            <Badge variant={performanceScore >= 80 ? "default" : performanceScore >= 60 ? "secondary" : "destructive"}>
              {performanceScore >= 80 ? "Excellent" : performanceScore >= 60 ? "Good" : "Needs Improvement"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Event Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Revenue progression over time</CardDescription>
                <div className="flex gap-2">
                  <Select value={trendPeriod} onValueChange={(value: 'month' | 'quarter' | 'year') => setTrendPeriod(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Event Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Event Performance Distribution</CardTitle>
                <CardDescription>Performance rating across all events</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Excellent', value: comparisons.filter(e => e.performance === 'excellent').length, fill: '#10B981' },
                        { name: 'Good', value: comparisons.filter(e => e.performance === 'good').length, fill: '#8B5CF6' },
                        { name: 'Average', value: comparisons.filter(e => e.performance === 'average').length, fill: '#F59E0B' },
                        { name: 'Poor', value: comparisons.filter(e => e.performance === 'poor').length, fill: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      outerRadius={80}
                      dataKey="value"
                    />
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Attendee Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Growth</CardTitle>
              <CardDescription>Events and attendee growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="events" fill="#8B5CF6" name="Events" />
                  <Line yAxisId="right" type="monotone" dataKey="attendees" stroke="#10B981" name="Attendees" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="comparison-limit">Number of Events</Label>
              <Select value={comparisonLimit.toString()} onValueChange={(value) => setComparisonLimit(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min-revenue">Min Revenue</Label>
              <Input
                id="min-revenue"
                type="number"
                placeholder="$0"
                value={filters.minRevenue || ''}
                onChange={(e) => setFilters({ ...filters, minRevenue: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-32"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Performance Comparison</CardTitle>
              <CardDescription>Side-by-side comparison of your events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Event</th>
                      <th className="text-right p-2">Date</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Attendees</th>
                      <th className="text-right p-2">Capacity</th>
                      <th className="text-right p-2">Check-in Rate</th>
                      <th className="text-center p-2">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((event, index) => (
                      <tr key={event.eventId} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{event.eventName}</td>
                        <td className="text-right p-2">{new Date(event.date).toLocaleDateString()}</td>
                        <td className="text-right p-2">${event.revenue.toLocaleString()}</td>
                        <td className="text-right p-2">{event.attendees}</td>
                        <td className="text-right p-2">{event.capacity}</td>
                        <td className="text-right p-2">{event.checkInRate.toFixed(1)}%</td>
                        <td className="text-center p-2">
                          <Badge variant={
                            event.performance === 'excellent' ? 'default' :
                            event.performance === 'good' ? 'secondary' :
                            event.performance === 'average' ? 'outline' : 'destructive'
                          }>
                            {event.performance}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisons.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="eventName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Analysis</CardTitle>
              <CardDescription>Period-over-period growth rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Growth Rate']} />
                  <Line type="monotone" dataKey="growthRate" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Revenue per Event</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Avg Revenue']} />
                    <Area type="monotone" dataKey="averageRevenue" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events per Period</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="events" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="venues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Performance</CardTitle>
              <CardDescription>Compare performance across different venues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venuePerformance.map((venue, index) => (
                  <div key={venue.venueId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{venue.venueName}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{venue.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Events</div>
                        <div className="font-medium">{venue.eventsCount}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Revenue</div>
                        <div className="font-medium">${venue.totalRevenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Attendance</div>
                        <div className="font-medium">{Math.round(venue.averageAttendance)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Capacity Util</div>
                        <div className="font-medium">{venue.averageCapacityUtilization.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          {audienceInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Loyalty</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Repeat Attendees</span>
                      <span className="font-medium">{audienceInsights.repeatAttendees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Attendees</span>
                      <span className="font-medium">{audienceInsights.newAttendees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loyalty Rate</span>
                      <span className="font-medium">{audienceInsights.loyaltyRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cross-Event Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Cross-Event Rate</span>
                      <span className="font-medium">{audienceInsights.crossEventAttendance.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engagement Score</span>
                      <span className="font-medium">{audienceInsights.engagementScore.toFixed(0)}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audience Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {audienceInsights.audienceGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-2xl font-bold">
                      {audienceInsights.audienceGrowth >= 0 ? '+' : ''}{audienceInsights.audienceGrowth.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">vs previous period</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {predictiveInsights && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Pricing Optimization
                  </CardTitle>
                  <CardDescription>AI-powered pricing recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictiveInsights.optimalPricing.map((pricing, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{pricing.ticketType}</h4>
                          <Badge variant="outline">+{pricing.potentialIncrease.toFixed(1)}% potential</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Current</div>
                            <div className="font-medium">${pricing.currentPrice}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Recommended</div>
                            <div className="font-medium">${pricing.recommendedPrice}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Increase</div>
                            <div className="font-medium text-green-600">+${pricing.recommendedPrice - pricing.currentPrice}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Best Time Slots</CardTitle>
                    <CardDescription>Optimal scheduling recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {predictiveInsights.bestTimeSlots.map((slot, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{slot.dayOfWeek} {slot.timeSlot}</span>
                          <Badge variant={slot.successRate >= 90 ? 'default' : 'secondary'}>
                            {slot.successRate}% success
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Channel ROI</CardTitle>
                    <CardDescription>Channel effectiveness analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {predictiveInsights.marketingChannelEffectiveness.map((channel, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{channel.channel}</span>
                            <span className="text-sm text-green-600">{channel.roi}% ROI</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {channel.conversionRate}% conversion • ${channel.costPerAcquisition} CPA
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiEventAnalyticsPage;