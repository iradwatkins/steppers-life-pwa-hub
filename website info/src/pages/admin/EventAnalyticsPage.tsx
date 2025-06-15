import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';

interface AnalyticsData {
  totalEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  averageTicketPrice: number;
  revenueByMonth: { month: string; revenue: number }[];
  attendeesByEvent: { event: string; attendees: number }[];
  revenueByCategory: { category: string; revenue: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const EventAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockData: AnalyticsData = {
      totalEvents: 156,
      totalRevenue: 1250000,
      totalAttendees: 25000,
      averageTicketPrice: 50,
      revenueByMonth: [
        { month: 'Jan', revenue: 150000 },
        { month: 'Feb', revenue: 180000 },
        { month: 'Mar', revenue: 220000 },
        { month: 'Apr', revenue: 190000 },
        { month: 'May', revenue: 250000 },
        { month: 'Jun', revenue: 260000 },
      ],
      attendeesByEvent: [
        { event: 'Music Festival', attendees: 5000 },
        { event: 'Tech Conference', attendees: 3000 },
        { event: 'Food Expo', attendees: 4000 },
        { event: 'Art Show', attendees: 2000 },
        { event: 'Sports Event', attendees: 6000 },
      ],
      revenueByCategory: [
        { category: 'Music', revenue: 400000 },
        { category: 'Technology', revenue: 300000 },
        { category: 'Food', revenue: 200000 },
        { category: 'Art', revenue: 150000 },
        { category: 'Sports', revenue: 200000 },
      ],
    };
    setAnalyticsData(mockData);
    setLoading(false);
  }, [timeRange]);

  if (loading || !analyticsData) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analytics and insights for all events
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Active events in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Revenue in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalAttendees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Attendees in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Ticket Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.averageTicketPrice}</div>
            <p className="text-xs text-muted-foreground">
              Average across all events
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendees by Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.attendeesByEvent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="event" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendees" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.revenueByCategory}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analyticsData.revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventAnalyticsPage; 