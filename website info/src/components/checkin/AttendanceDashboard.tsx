import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Download, 
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  Calendar,
  MapPin
} from 'lucide-react';
import useCheckin from '@/hooks/useCheckin';
import { format } from 'date-fns';

interface AttendanceDashboardProps {
  eventId: string;
  eventName?: string;
  autoRefresh?: boolean;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({
  eventId,
  eventName = "Event",
  autoRefresh = true
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'hour' | 'all'>('today');
  const [showDetails, setShowDetails] = useState(false);

  const {
    attendanceData,
    analytics,
    recentCheckins,
    isLoading,
    offlineMode,
    refreshData,
    exportAttendanceData
  } = useCheckin({ eventId, autoRefresh });

  // Calculate additional metrics
  const capacityUtilization = attendanceData 
    ? (attendanceData.checkedInCount / attendanceData.totalCapacity) * 100 
    : 0;

  const ticketSalesRate = attendanceData 
    ? (attendanceData.ticketsSold / attendanceData.totalCapacity) * 100 
    : 0;

  const attendanceRate = attendanceData?.attendanceRate || 0;

  const getCapacityStatus = () => {
    if (capacityUtilization >= 90) return { color: 'text-red-600', label: 'At Capacity' };
    if (capacityUtilization >= 75) return { color: 'text-orange-600', label: 'Near Full' };
    if (capacityUtilization >= 50) return { color: 'text-yellow-600', label: 'Filling Up' };
    return { color: 'text-green-600', label: 'Available' };
  };

  const capacityStatus = getCapacityStatus();

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Get peak hour data for visualization
  const getPeakHourData = () => {
    if (!analytics?.checkinsByHour) return [];
    
    return analytics.checkinsByHour
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
      .map(item => ({
        hour: item.hour,
        count: item.count,
        percentage: Math.max((item.count / Math.max(...analytics.checkinsByHour.map(h => h.count))) * 100, 5)
      }));
  };

  const peakHourData = getPeakHourData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{eventName} - Attendance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time check-in monitoring and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {offlineMode && (
            <Badge variant="outline" className="text-orange-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Offline Mode
            </Badge>
          )}
          <Button 
            onClick={refreshData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={exportAttendanceData}
            disabled={isLoading}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Checked In */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(attendanceData?.checkedInCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatNumber(attendanceData?.ticketsSold || 0)} ticket holders
            </p>
            <Progress value={attendanceRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        {/* Capacity Utilization */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {capacityUtilization.toFixed(1)}%
            </div>
            <p className={`text-xs ${capacityStatus.color} font-medium`}>
              {capacityStatus.label}
            </p>
            <Progress value={capacityUtilization} className="mt-2" />
          </CardContent>
        </Card>

        {/* Hourly Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceData?.checkinsThisHour || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              check-ins in last 60 minutes
            </p>
            <div className="flex items-center mt-2">
              <Activity className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">Live updates</span>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hour */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.peakArrivalTime || '--:--'}
            </div>
            <p className="text-xs text-muted-foreground">
              highest arrival rate
            </p>
            <div className="text-xs text-blue-600 mt-2">
              {analytics ? `${analytics.totalCheckins} total` : 'Calculating...'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Check-in Pattern */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hourly Check-in Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peakHourData.length > 0 ? (
                peakHourData.map((item) => (
                  <div key={item.hour} className="flex items-center gap-3">
                    <span className="text-sm font-mono w-12">{item.hour}</span>
                    <div className="flex-1">
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {item.count}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No check-in data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Check-in Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Check-in Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.checkinsByMethod ? (
                Object.entries(analytics.checkinsByMethod).map(([method, count]) => {
                  const percentage = (count / analytics.totalCheckins) * 100;
                  const methodLabel = method.replace('_', ' ').toUpperCase();
                  
                  return (
                    <div key={method} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{methodLabel}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No method data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Check-ins
            <Badge variant="outline" className="ml-auto">
              Last 10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCheckins.length > 0 ? (
            <div className="space-y-3">
              {recentCheckins.slice(0, 10).map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium">Ticket #{checkin.ticketId.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {checkin.checkinMethod.replace('_', ' ')} • {checkin.checkinLocation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(checkin.checkinTime, 'HH:mm')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(checkin.checkinTime, 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent check-ins</p>
              <p className="text-xs">Check-ins will appear here as they happen</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Information Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Last updated: {attendanceData?.lastUpdated.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Event ID: {eventId}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {autoRefresh && (
                <span className="text-green-600">Auto-refresh enabled</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceDashboard; 