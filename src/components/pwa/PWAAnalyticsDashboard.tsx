import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Crown, 
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type EventStats } from '@/services/pwaCheckinService';

interface PWAAnalyticsDashboardProps {
  eventStats: EventStats | null;
  recentCheckins: Array<{
    attendee: any;
    timestamp: string;
    method: string;
  }>;
  onRefresh: () => void;
  onExport?: () => void;
}

interface TimeSlot {
  hour: number;
  count: number;
  percentage: number;
}

export const PWAAnalyticsDashboard: React.FC<PWAAnalyticsDashboardProps> = ({
  eventStats,
  recentCheckins,
  onRefresh,
  onExport
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate derived metrics
  const metrics = useMemo(() => {
    if (!eventStats) return null;

    const attendanceRate = Math.round((eventStats.checkedIn / eventStats.totalCapacity) * 100);
    const remainingCapacity = eventStats.totalCapacity - eventStats.checkedIn;
    const vipPercentage = eventStats.totalCapacity > 0 
      ? Math.round((eventStats.vipCount / eventStats.totalCapacity) * 100)
      : 0;

    return {
      attendanceRate,
      remainingCapacity,
      vipPercentage,
      isNearCapacity: attendanceRate >= 90,
      isSoldOut: remainingCapacity === 0
    };
  }, [eventStats]);

  // Calculate hourly arrival patterns
  const arrivalPatterns = useMemo(() => {
    const hourlyData: Record<number, number> = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0;
    }

    // Count check-ins by hour
    recentCheckins.forEach(checkin => {
      const hour = new Date(checkin.timestamp).getHours();
      hourlyData[hour]++;
    });

    // Convert to array and calculate percentages
    const totalCheckins = recentCheckins.length;
    const slots: TimeSlot[] = Object.entries(hourlyData).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      percentage: totalCheckins > 0 ? Math.round((count / totalCheckins) * 100) : 0
    }));

    // Get peak hours (top 3)
    const peakHours = slots
      .filter(slot => slot.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return { slots, peakHours };
  }, [recentCheckins]);

  // Check-in method breakdown
  const methodBreakdown = useMemo(() => {
    const methods: Record<string, number> = {};
    
    recentCheckins.forEach(checkin => {
      methods[checkin.method] = (methods[checkin.method] || 0) + 1;
    });

    return Object.entries(methods).map(([method, count]) => ({
      method,
      count,
      percentage: recentCheckins.length > 0 
        ? Math.round((count / recentCheckins.length) * 100) 
        : 0
    }));
  }, [recentCheckins]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format time
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${period}`;
  };

  if (!eventStats) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              {metrics?.isSoldOut && (
                <Badge variant="destructive">Sold Out</Badge>
              )}
            </div>
            <div className="text-2xl font-bold">{eventStats.checkedIn}</div>
            <p className="text-sm text-muted-foreground">Total Check-ins</p>
            <Progress value={metrics?.attendanceRate || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.attendanceRate}% of capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {eventStats.arrivalRate > 5 && (
                <Badge variant="default" className="bg-green-500">High Activity</Badge>
              )}
            </div>
            <div className="text-2xl font-bold">{eventStats.arrivalRate}</div>
            <p className="text-sm text-muted-foreground">Last Hour</p>
            <div className="flex items-center mt-2">
              <Activity className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">
                {eventStats.arrivalRate > 0 ? 'Active' : 'Quiet'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <Badge variant="outline">{metrics?.vipPercentage}%</Badge>
            </div>
            <div className="text-2xl font-bold">{eventStats.vipCount}</div>
            <p className="text-sm text-muted-foreground">VIP Attendees</p>
            <Progress 
              value={metrics?.vipPercentage || 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              {metrics?.isNearCapacity && (
                <Badge variant="outline" className="text-orange-600">Near Capacity</Badge>
              )}
            </div>
            <div className="text-2xl font-bold">{metrics?.remainingCapacity}</div>
            <p className="text-sm text-muted-foreground">Remaining Spots</p>
            <p className="text-xs text-muted-foreground mt-1">
              of {eventStats.totalCapacity} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="arrival" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="arrival">Arrival Patterns</TabsTrigger>
          <TabsTrigger value="methods">Check-in Methods</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Arrival Patterns */}
        <TabsContent value="arrival" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Peak Arrival Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              {arrivalPatterns.peakHours.length > 0 ? (
                <div className="space-y-3">
                  {arrivalPatterns.peakHours.map((peak, index) => (
                    <div key={peak.hour} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{formatTime(peak.hour)}</span>
                        <Badge variant="outline" className="ml-2">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{peak.count} check-ins</div>
                        <div className="text-sm text-muted-foreground">{peak.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No arrival data available yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hourly Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {arrivalPatterns.slots
                  .filter(slot => slot.count > 0)
                  .slice(0, 8)
                  .map((slot) => (
                    <div key={slot.hour} className="text-center">
                      <div className="text-sm font-medium">{formatTime(slot.hour)}</div>
                      <Progress value={slot.percentage} className="mt-1 h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {slot.count}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Check-in Methods */}
        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Check-in Method Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {methodBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {methodBreakdown.map((method) => (
                    <div key={method.method} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{method.method}</span>
                        <Badge variant="outline">{method.percentage}%</Badge>
                      </div>
                      <Progress value={method.percentage} />
                      <div className="text-sm text-muted-foreground">
                        {method.count} check-ins
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No check-in data available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCheckins.length > 0 ? (
                <div className="space-y-3">
                  {recentCheckins.slice(0, 10).map((checkin, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{checkin.attendee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(checkin.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {checkin.method}
                        </Badge>
                        {checkin.attendee.isVIP && (
                          <Crown className="h-4 w-4 text-yellow-500 ml-2 inline" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent check-ins
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};