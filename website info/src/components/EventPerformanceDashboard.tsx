import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar,
  Download,
  RefreshCw,
  Target,
  Star,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { useEventPerformance } from '../hooks/useEventPerformance';
import { EventPerformanceData } from '../services/eventPerformanceService';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface EventPerformanceDashboardProps {
  eventId: string;
  className?: string;
}

const CHART_COLORS = {
  primary: 'hsl(var(--brand-primary))',
  secondary: 'hsl(var(--brand-primary-hover))',
  success: 'hsl(var(--feedback-success))',
  warning: 'hsl(var(--feedback-warning))',
  error: 'hsl(var(--feedback-error))',
  muted: 'hsl(var(--text-secondary))',
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.error,
  CHART_COLORS.muted,
];

export const EventPerformanceDashboard: React.FC<EventPerformanceDashboardProps> = ({
  eventId,
  className = ""
}) => {
  const {
    data,
    isLoading,
    error,
    isRefreshing,
    lastUpdated,
    refreshData,
    exportData,
    overview,
    ticketSales,
    revenue,
    attendees,
    salesTrends,
    salesChannels,
    geographic,
    timeAnalytics
  } = useEventPerformance(eventId);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground mb-4">
          {error || 'No performance data available'}
        </p>
        <Button onClick={() => refreshData()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'ongoing': return 'bg-blue-500';
      case 'selling': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{overview?.eventName}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {overview?.eventDate.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {overview?.venue}
            </div>
            <Badge className={getStatusColor(overview?.status || '')}>
              {overview?.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('csv')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketSales?.totalSold} / {overview?.totalCapacity}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Progress value={ticketSales?.salesRate || 0} className="flex-1" />
              <span>{formatPercentage(ticketSales?.salesRate || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenue?.grossRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net: {formatCurrency(revenue?.netRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(attendees?.checkinRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {attendees?.checkedIn} / {attendees?.totalAttendees} attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(overview?.performanceScore || 0)}`}>
              {Math.round(overview?.performanceScore || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Based on all metrics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
                <CardDescription>Ticket sales over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeTickets" 
                      stroke={CHART_COLORS.primary}
                      name="Cumulative Tickets"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ticketsSold" 
                      stroke={CHART_COLORS.success}
                      name="Daily Sales"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales Channels */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Channels</CardTitle>
                <CardDescription>Breakdown by sales method</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesChannels}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ channel, percentage }) => `${channel}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {salesChannels?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Last updated: {lastUpdated?.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {ticketSales?.recentSales.count}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sales in {ticketSales?.recentSales.period}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(overview?.salesVelocity || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sales velocity
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {attendees?.satisfaction.averageRating.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average rating
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Types Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Types Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticketSales?.byType.map((type, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{type.ticketType}</span>
                        <span className="text-sm text-muted-foreground">
                          {type.sold} / {type.capacity}
                        </span>
                      </div>
                      <Progress value={(type.sold / type.capacity) * 100} />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(type.price)} each</span>
                        <span>{formatCurrency(type.revenue)} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales by Day of Week */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Day of Week</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeAnalytics?.salesByDayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill={CHART_COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Gross Revenue</span>
                    <span className="font-bold">{formatCurrency(revenue?.grossRevenue || 0)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Fees</span>
                    <span>-{formatCurrency(revenue?.fees || 0)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Refunds</span>
                    <span>-{formatCurrency(revenue?.refunds || 0)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Commissions</span>
                    <span>-{formatCurrency(revenue?.commissions || 0)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Revenue</span>
                    <span>{formatCurrency(revenue?.netRevenue || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Ticket Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Ticket Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenue?.revenueByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ticketType, percentage }) => `${ticketType}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {revenue?.revenueByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendees?.demographics.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={CHART_COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Satisfaction Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Ratings</CardTitle>
                <CardDescription>
                  Average: {attendees?.satisfaction.averageRating.toFixed(1)} stars 
                  ({attendees?.satisfaction.totalReviews} reviews)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendees?.satisfaction.ratingDistribution.map((rating, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span>{rating.stars}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress 
                        value={(rating.count / (attendees?.satisfaction.totalReviews || 1)) * 100} 
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-8">
                        {rating.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendees?.demographics.returningCustomers}
                  </div>
                  <p className="text-sm text-muted-foreground">Returning customers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {attendees?.demographics.newCustomers}
                  </div>
                  <p className="text-sm text-muted-foreground">New customers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {attendees?.checkedIn}
                  </div>
                  <p className="text-sm text-muted-foreground">Checked in</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {attendees?.noShows}
                  </div>
                  <p className="text-sm text-muted-foreground">No shows</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Cities */}
            <Card>
              <CardHeader>
                <CardTitle>Top Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographic?.topCities.map((city, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{city.city}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={city.percentage} className="w-20" />
                        <span className="text-sm text-muted-foreground w-8">
                          {city.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distance Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Distance Analysis</CardTitle>
                <CardDescription>How far attendees traveled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Local (&lt; 25 miles)</span>
                    <span className="font-bold">{geographic?.distanceAnalysis.local}%</span>
                  </div>
                  <Progress value={geographic?.distanceAnalysis.local || 0} />
                  
                  <div className="flex justify-between">
                    <span>Regional (25-100 miles)</span>
                    <span className="font-bold">{geographic?.distanceAnalysis.regional}%</span>
                  </div>
                  <Progress value={geographic?.distanceAnalysis.regional || 0} />
                  
                  <div className="flex justify-between">
                    <span>Distant (&gt; 100 miles)</span>
                    <span className="font-bold">{geographic?.distanceAnalysis.distant}%</span>
                  </div>
                  <Progress value={geographic?.distanceAnalysis.distant || 0} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 