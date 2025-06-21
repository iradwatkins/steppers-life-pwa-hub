import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEventPerformance } from '@/hooks/useEventPerformance';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
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
  Legend
} from 'recharts';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

const EventPerformancePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const {
    data,
    benchmarks,
    loading,
    error,
    refreshData,
    exportData,
    autoRefresh,
    setAutoRefresh,
    lastRefresh
  } = useEventPerformance(eventId!);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
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
              {error || 'Failed to load event performance data'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performanceScore = Math.round(
    (data.totalSold / data.totalCapacity) * 100 * 0.4 +
    data.checkInRate * 0.3 +
    (data.averageTicketPrice > 30 ? 100 : (data.averageTicketPrice / 30) * 100) * 0.3
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
            <h1 className="text-3xl font-bold">{data.eventName}</h1>
            <p className="text-muted-foreground">
              Event Performance Dashboard
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
          </div>
          
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${data.averageTicketPrice.toFixed(2)} avg per ticket
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalSold} / {data.totalCapacity}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.totalSold / data.totalCapacity) * 100)}% capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.checkInRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.attendeeEngagement.checkedIn} of {data.attendeeEngagement.totalRegistered} attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
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
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
                <CardDescription>Daily ticket sales over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.salesTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8B5CF6" name="Daily Sales" />
                    <Line type="monotone" dataKey="cumulativeSales" stroke="#10B981" name="Total Sales" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ticket Types Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Sales by Type</CardTitle>
                <CardDescription>Revenue breakdown by ticket category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.ticketSales}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ticketType, percentage }) => `${ticketType} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {data.ticketSales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${value}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.salesTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value}`, 'Revenue']} />
                    <Area type="monotone" dataKey="cumulativeRevenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  </AreaChart>
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Online Sales</span>
                    <span className="font-medium">{data.salesChannels.online} tickets</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cash Sales</span>
                    <span className="font-medium">{data.salesChannels.cash} tickets</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Promotional</span>
                    <span className="font-medium">{data.salesChannels.promotional} tickets</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Ticket Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Ticket Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Ticket Type</th>
                      <th className="text-right p-2">Sold</th>
                      <th className="text-right p-2">Capacity</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ticketSales.map((ticket, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{ticket.ticketType}</td>
                        <td className="text-right p-2">{ticket.sold}</td>
                        <td className="text-right p-2">{ticket.capacity}</td>
                        <td className="text-right p-2">${ticket.revenue.toFixed(2)}</td>
                        <td className="text-right p-2">${ticket.averagePrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendees" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendee Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Registered</span>
                  <span className="font-medium">{data.attendeeEngagement.totalRegistered}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Checked In</span>
                  <span className="font-medium text-green-600">{data.attendeeEngagement.checkedIn}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>No Shows</span>
                  <span className="font-medium text-red-600">{data.attendeeEngagement.noShows}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Hour Check-ins</span>
                  <span className="font-medium">{data.attendeeEngagement.lastHourCheckIns}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check-in Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{data.checkInRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${data.checkInRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Attendee locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.geographicData.map((location, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{location.city}, {location.state}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{location.attendeeCount} attendees</div>
                      <div className="text-sm text-muted-foreground">{location.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Benchmarks</CardTitle>
              <CardDescription>Compare against historical and industry averages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benchmarks.map((benchmark, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{benchmark.metric}</h4>
                      <Badge variant={benchmark.performance === 'above' ? 'default' : benchmark.performance === 'below' ? 'destructive' : 'secondary'}>
                        {benchmark.performance === 'above' ? 'Above Average' : benchmark.performance === 'below' ? 'Below Average' : 'Average'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-medium">{benchmark.current}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Historical</div>
                        <div className="font-medium">{benchmark.historical}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Industry</div>
                        <div className="font-medium">{benchmark.industry}</div>
                      </div>
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

export default EventPerformancePage;