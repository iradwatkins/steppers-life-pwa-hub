import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { usePWAAuth } from '@/hooks/usePWAAuth';
import {
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  RefreshCw,
  Download,
  Eye,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface AttendanceStats {
  totalCapacity: number;
  checkedIn: number;
  pendingCheckIn: number;
  checkInRate: number;
  peakHour: string;
  averageCheckInTime: string;
}

interface HourlyData {
  hour: string;
  checkIns: number;
  cumulative: number;
}

const PWAAttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, hasPermission, isOnline } = usePWAAuth();
  
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get('event') || '1');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock attendance data
  const [stats, setStats] = useState<AttendanceStats>({
    totalCapacity: 150,
    checkedIn: 89,
    pendingCheckIn: 61,
    checkInRate: 59.3,
    peakHour: '7:00 PM',
    averageCheckInTime: '2.3 min'
  });

  const [hourlyData] = useState<HourlyData[]>([
    { hour: '6:00 PM', checkIns: 12, cumulative: 12 },
    { hour: '6:30 PM', checkIns: 18, cumulative: 30 },
    { hour: '7:00 PM', checkIns: 25, cumulative: 55 },
    { hour: '7:30 PM', checkIns: 21, cumulative: 76 },
    { hour: '8:00 PM', checkIns: 13, cumulative: 89 }
  ]);

  // Check permissions
  useEffect(() => {
    if (!hasPermission('view_attendance')) {
      return;
    }
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [hasPermission]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      // In a real app, this would fetch fresh data
      setLastUpdate(new Date());
      
      // Simulate slight changes in data
      setStats(prev => ({
        ...prev,
        checkedIn: prev.checkedIn + Math.floor(Math.random() * 3),
        checkInRate: Math.round(((prev.checkedIn + Math.floor(Math.random() * 3)) / prev.totalCapacity) * 100 * 10) / 10
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const getCapacityColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCapacityBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-red-500">Near Capacity</Badge>;
    if (rate >= 75) return <Badge className="bg-yellow-500">High Attendance</Badge>;
    if (rate >= 50) return <Badge className="bg-blue-500">Good Attendance</Badge>;
    return <Badge variant="outline">Low Attendance</Badge>;
  };

  if (!hasPermission('view_attendance')) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to view attendance data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Monitoring</h1>
          <div className="flex items-center space-x-2">
            {getCapacityBadge(stats.checkInRate)}
            <Badge variant="outline">Event {selectedEvent}</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          {!isOnline && (
            <Badge variant="secondary">Offline Data</Badge>
          )}
        </div>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're offline. Showing cached attendance data. Updates will sync when connection is restored.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalCapacity}
            </div>
            <p className="text-sm text-gray-500">
              Maximum attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <UserCheck className="w-4 h-4 mr-2" />
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">
              {stats.checkedIn}
            </div>
            <p className="text-sm text-gray-500">
              Currently present
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Pending Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingCheckIn}
            </div>
            <p className="text-sm text-gray-500">
              Tickets sold, not checked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Check-in Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${getCapacityColor(stats.checkInRate)}`}>
              {stats.checkInRate}%
            </div>
            <p className="text-sm text-gray-500">
              Of total capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Capacity Overview</span>
          </CardTitle>
          <CardDescription>
            Real-time capacity utilization and check-in progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Check-in Progress</span>
              <span className="font-medium">{stats.checkedIn} / {stats.totalCapacity}</span>
            </div>
            <Progress value={stats.checkInRate} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
              <div className="text-sm text-gray-600">Checked In</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingCheckIn}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {stats.totalCapacity - stats.checkedIn - stats.pendingCheckIn}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Check-in Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Hourly Check-in Pattern</span>
          </CardTitle>
          <CardDescription>
            Check-in activity throughout the event period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hourlyData.map((data, index) => (
              <div key={data.hour} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{data.hour}</span>
                  <div className="flex space-x-4">
                    <span className="text-blue-600">{data.checkIns} new</span>
                    <span className="text-gray-600">{data.cumulative} total</span>
                  </div>
                </div>
                <div className="relative">
                  <Progress 
                    value={(data.cumulative / stats.totalCapacity) * 100} 
                    className="h-2" 
                  />
                  <div 
                    className="absolute top-0 h-2 bg-blue-500 rounded-full opacity-60"
                    style={{
                      width: `${(data.checkIns / Math.max(...hourlyData.map(d => d.checkIns))) * 30}%`,
                      left: `${((data.cumulative - data.checkIns) / stats.totalCapacity) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Peak Check-in Hour</span>
              <span className="font-medium">{stats.peakHour}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Check-in Time</span>
              <span className="font-medium">{stats.averageCheckInTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current Utilization</span>
              <span className={`font-medium ${getCapacityColor(stats.checkInRate)}`}>
                {stats.checkInRate}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Live Updates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">Real-time Monitoring</div>
              <p className="text-sm text-gray-600 mt-1">
                Data refreshes automatically every 30 seconds
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PWAAttendancePage; 