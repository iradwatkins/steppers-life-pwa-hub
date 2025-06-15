import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, subMonths, subYears } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Users, 
  Ticket, 
  CalendarCheck, 
  Video, 
  DollarSign, 
  Download, 
  Loader2, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { usePlatformAnalytics } from '@/hooks/usePlatformAnalytics';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminDashboardPage: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });

  const { analytics, loading, error, fetchAnalytics } = usePlatformAnalytics();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("You are not authorized to view this page.");
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchAnalytics(format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd'));
    } else {
      fetchAnalytics();
    }
  }, [dateRange, fetchAnalytics]);

  const handleExport = (formatType: 'csv' | 'pdf') => {
    if (!analytics) {
      toast.info("No data to export.");
      return;
    }
    // In a real app, you'd send data to a backend endpoint for proper PDF/CSV generation
    // For mock, we'll just simulate download or show a message
    toast.success(`Exporting platform analytics as ${formatType.toUpperCase()}... (Simulated)`);
    console.log(`Exporting:`, analytics);
  };

  const QuickDateRangeButton: React.FC<{ label: string; days?: number; months?: number; years?: number }> = ({ label, days, months, years }) => {
    const handleClick = () => {
      const to = new Date();
      let from = new Date();
      if (days) from = subDays(to, days);
      if (months) from = subMonths(to, months);
      if (years) from = subYears(to, years);
      setDateRange({ from, to });
    };
    return <Button variant="outline" onClick={handleClick} className="w-full">{label}</Button>;
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-primary text-xl">Checking authorization...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Monitor overall platform health and key performance indicators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <QuickDateRangeButton label="Last 7 Days" days={7} />
          <QuickDateRangeButton label="Last 30 Days" days={30} />
          <QuickDateRangeButton label="Last 6 Months" months={6} />
          <QuickDateRangeButton label="Last Year" years={1} />
        </div>

        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Platform Overview</CardTitle>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        ` ${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" onClick={() => handleExport('csv')} disabled={loading}>
                <Download className="h-4 w-4 mr-2" /> CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')} disabled={loading}>
                <Download className="h-4 w-4 mr-2" /> PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading && !analytics ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
                Loading analytics...
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">
                Error: {error}
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Organizers</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.activeOrganizers.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalEvents.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalTicketsSold.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">VOD Subscriptions</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalVODSubscriptions.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No data available.
              </div>
            )}
          </CardContent>
        </Card>

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">User Growth Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.userGrowthOverTime} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(tick) => format(new Date(tick), 'MMM yy')} />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => `Date: ${format(new Date(label), 'MMM dd, yyyy')}`} formatter={(value: number) => value.toLocaleString()} />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Ticket Sales Volume Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.ticketSalesVolumeOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(tick) => format(new Date(tick), 'MMM yy')} />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => `Date: ${format(new Date(label), 'MMM dd, yyyy')}`} formatter={(value: number) => value.toLocaleString()} />
                    <Area type="monotone" dataKey="sales" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Top 10 Events by Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.topEventsBySales.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell className="text-right">{event.sales.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Top 10 Active Organizers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organizer Name</TableHead>
                      <TableHead className="text-right">Events</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.topActiveOrganizers.map((organizer) => (
                      <TableRow key={organizer.id}>
                        <TableCell className="font-medium">{organizer.name}</TableCell>
                        <TableCell className="text-right">{organizer.events.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Top 10 VOD Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>VOD Title</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.topVODContent.map((vod) => (
                      <TableRow key={vod.id}>
                        <TableCell className="font-medium">{vod.title}</TableCell>
                        <TableCell className="text-right">{vod.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage; 