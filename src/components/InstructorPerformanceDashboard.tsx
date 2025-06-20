import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Progress } from './ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Star,
  Calendar,
  Award,
  AlertTriangle,
  ChevronRight,
  Activity
} from 'lucide-react';
import instructorAnalyticsService from '../services/instructorAnalyticsService';
import {
  InstructorPerformanceMetrics,
  ClassPerformanceMetrics,
  PerformanceAlert,
  InstructorAnalyticsResponse,
  AnalyticsPeriod,
  InstructorAnalyticsFilters,
  AlertSeverity,
  TrendDirection
} from '../types/instructorAnalytics';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const InstructorPerformanceDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<InstructorAnalyticsResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>(AnalyticsPeriod.LAST_30_DAYS);
  const [loading, setLoading] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const filters: InstructorAnalyticsFilters = {
        period: selectedPeriod
      };
      const data = await instructorAnalyticsService.getInstructorAnalyticsDashboard(filters);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading instructor analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'destructive';
      case AlertSeverity.HIGH: return 'destructive';
      case AlertSeverity.MEDIUM: return 'warning';
      case AlertSeverity.LOW: return 'secondary';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (direction: TrendDirection) => {
    return direction === TrendDirection.INCREASING ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      direction === TrendDirection.DECREASING ?
      <TrendingDown className="h-4 w-4 text-red-500" /> :
      <Activity className="h-4 w-4 text-gray-500" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(value);
  };

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { instructors, summary, trends, alerts } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive performance tracking and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as AnalyticsPeriod)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AnalyticsPeriod.LAST_7_DAYS}>Last 7 Days</SelectItem>
              <SelectItem value={AnalyticsPeriod.LAST_30_DAYS}>Last 30 Days</SelectItem>
              <SelectItem value={AnalyticsPeriod.LAST_3_MONTHS}>Last 3 Months</SelectItem>
              <SelectItem value={AnalyticsPeriod.LAST_6_MONTHS}>Last 6 Months</SelectItem>
              <SelectItem value={AnalyticsPeriod.LAST_YEAR}>Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(trends.revenue.direction)}
                  <span className="text-sm text-gray-600 ml-1">
                    {trends.revenue.change > 0 ? '+' : ''}{formatCurrency(trends.revenue.change)}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Instructors</p>
                <p className="text-2xl font-bold text-gray-900">{summary.activeInstructors}</p>
                <p className="text-sm text-gray-600">of {summary.totalInstructors} total</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{summary.averageRating.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(trends.ratings.direction)}
                  <span className="text-sm text-gray-600 ml-1">
                    {trends.ratings.change > 0 ? '+' : ''}{trends.ratings.change.toFixed(1)}
                  </span>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalClasses}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(trends.bookings.direction)}
                  <span className="text-sm text-gray-600 ml-1">
                    {trends.bookings.change > 0 ? '+' : ''}{trends.bookings.change}
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Performance Alerts ({alerts.length})
            </CardTitle>
            <CardDescription>
              Critical issues requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity}
                      </Badge>
                      <span className="font-medium">{alert.message}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Current: {alert.currentValue} | Threshold: {alert.threshold}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends.revenue.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Highest rated instructors this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {instructors.slice(0, 5).map((instructor, index) => (
                    <div key={instructor.instructorId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">Instructor {instructor.instructorId}</p>
                          <p className="text-sm text-gray-600">{instructor.classesCount} classes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{instructor.averageRating.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{formatCurrency(instructor.totalRevenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Instructor Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Instructor Performance Metrics</CardTitle>
              <CardDescription>Detailed performance breakdown by instructor</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructors.map((instructor) => (
                    <TableRow key={instructor.instructorId}>
                      <TableCell className="font-medium">
                        Instructor {instructor.instructorId}
                      </TableCell>
                      <TableCell>{instructor.classesCount}</TableCell>
                      <TableCell>{instructor.uniqueStudents}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          {instructor.averageRating.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(instructor.totalRevenue)}</TableCell>
                      <TableCell>{formatPercentage(instructor.retentionRate)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={instructor.popularityScore} className="h-2" />
                          <p className="text-xs text-gray-600">{instructor.popularityScore}% popularity</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Revenue breakdown by instructor</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={instructors.map((instructor, index) => ({
                        name: `Instructor ${instructor.instructorId}`,
                        value: instructor.totalRevenue,
                        fill: COLORS[index % COLORS.length]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ value }) => formatCurrency(value)}
                    >
                      {instructors.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance vs Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Revenue</CardTitle>
                <CardDescription>Correlation between ratings and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={instructors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="instructorId" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="totalRevenue" fill="#3b82f6" name="Revenue" />
                    <Bar yAxisId="right" dataKey="averageRating" fill="#10b981" name="Rating" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Distribution of instructor ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = instructors.filter(i => Math.floor(i.averageRating) === rating).length;
                    const percentage = (count / instructors.length) * 100;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{rating}</span>
                        </div>
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-sm text-gray-600 w-12">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Student engagement and retention scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {instructors.map((instructor) => (
                    <div key={instructor.instructorId} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Instructor {instructor.instructorId}</span>
                        <span className="text-sm text-gray-600">{instructor.engagementScore}%</span>
                      </div>
                      <Progress value={instructor.engagementScore} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructorPerformanceDashboard;