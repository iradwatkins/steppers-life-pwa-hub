import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Users, 
  UserCheck, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Settings,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePWAStatistics } from '@/hooks/usePWAStatistics';
import { formatDistanceToNow } from 'date-fns';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color, 
  trend 
}) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <Card className={`p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white/50">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs opacity-75">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-3 w-3 ${!trend.isPositive && 'rotate-180'}`} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
};

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  color: 'green' | 'blue' | 'yellow' | 'red';
  subtitle?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ 
  title, 
  current, 
  total, 
  color, 
  subtitle 
}) => {
  const percentage = Math.round((current / total) * 100);
  
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm">{title}</h3>
          <Badge variant="secondary">{percentage}%</Badge>
        </div>
        
        <Progress 
          value={percentage} 
          className="h-2"
          indicatorClassName={colorClasses[color]}
        />
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>{current.toLocaleString()} / {total.toLocaleString()}</span>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
    </Card>
  );
};

const PWAStatisticsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const {
    statistics,
    hourlyPatterns,
    alerts,
    isLoading,
    isRefreshing,
    error,
    isOnline,
    lastUpdated,
    refreshStatistics,
    acknowledgeAlert,
    isAutoRefreshEnabled,
    enableAutoRefresh,
    disableAutoRefresh
  } = usePWAStatistics(eventId);

  const [activeTab, setActiveTab] = useState('overview');

  // Auto-scroll to top on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  if (isLoading && !statistics) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !statistics) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto py-12">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => refreshStatistics()} 
            className="w-full mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getTimeUntilEvent = (timeUntilEvent: number) => {
    if (timeUntilEvent <= 0) return 'Event Started';
    return formatDistanceToNow(new Date(Date.now() + timeUntilEvent));
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pwa/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-semibold text-lg">Live Statistics</h1>
                {statistics && (
                  <p className="text-sm text-gray-600">{statistics.eventName}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isOnline && (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              {isOnline && (
                <Wifi className="h-4 w-4 text-green-500" />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshStatistics}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Updated: {lastUpdated || 'Never'}</span>
              <div className={`flex items-center space-x-1 ${
                isAutoRefreshEnabled ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isAutoRefreshEnabled ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span>Auto-refresh</span>
              </div>
            </div>
            
            {unacknowledgedAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unacknowledgedAlerts.length} Alert{unacknowledgedAlerts.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {statistics && (
              <>
                {/* Event Status */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-lg">{statistics.eventName}</h2>
                      <p className="text-sm text-gray-600">
                        {statistics.eventDate} • {statistics.eventStartTime} - {statistics.eventEndTime}
                      </p>
                      <p className="text-sm text-gray-600">{statistics.venue}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={statistics.statusColor === 'green' ? 'default' : 'destructive'}
                        className={
                          statistics.statusColor === 'yellow' ? 'bg-yellow-500' : ''
                        }
                      >
                        {statistics.isLive ? 'Live' : statistics.isCompleted ? 'Completed' : 'Upcoming'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {!statistics.isCompleted && getTimeUntilEvent(statistics.timeUntilEvent)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      {statistics.statusMessage}
                    </p>
                  </div>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={Users}
                    title="Tickets Sold"
                    value={statistics.ticketsSold}
                    subtitle={`of ${statistics.totalCapacity}`}
                    color={statistics.salesPercentage > 90 ? 'red' : statistics.salesPercentage > 75 ? 'yellow' : 'green'}
                  />
                  
                  <StatCard
                    icon={UserCheck}
                    title="Checked In"
                    value={statistics.currentCheckins}
                    subtitle={`${statistics.checkinPercentage.toFixed(1)}%`}
                    color={statistics.checkinPercentage < 50 ? 'red' : statistics.checkinPercentage < 75 ? 'yellow' : 'green'}
                  />
                  
                  <StatCard
                    icon={DollarSign}
                    title="Revenue"
                    value={`$${statistics.totalRevenue.toLocaleString()}`}
                    subtitle={`of $${statistics.revenuePotential.toLocaleString()}`}
                    color="blue"
                  />
                  
                  <StatCard
                    icon={Clock}
                    title="Arrival Rate"
                    value={statistics.currentArrivalRate}
                    subtitle="per hour"
                    color="blue"
                  />
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <ProgressCard
                    title="Sales Progress"
                    current={statistics.ticketsSold}
                    total={statistics.totalCapacity}
                    color={statistics.salesPercentage > 90 ? 'red' : 'blue'}
                    subtitle={`${statistics.availableSpots} spots left`}
                  />
                  
                  <ProgressCard
                    title="Check-in Progress"
                    current={statistics.currentCheckins}
                    total={statistics.ticketsSold}
                    color={statistics.checkinPercentage < 50 ? 'red' : 'green'}
                    subtitle={`${statistics.ticketsSold - statistics.currentCheckins} pending`}
                  />
                </div>

                {/* Ticket Type Breakdown */}
                <Card className="p-4">
                  <h3 className="font-medium mb-3">Ticket Type Breakdown</h3>
                  <div className="space-y-3">
                    {statistics.ticketTypeBreakdown.map((type, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{type.type}</p>
                          <p className="text-xs text-gray-600">
                            {type.checkedIn}/{type.totalSold} checked in
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            ${type.revenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            {type.checkinRate.toFixed(1)}% rate
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-12"
                    onClick={() => navigate(`/pwa/checkin/${eventId}`)}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Check-in
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-12"
                    onClick={() => navigate(`/pwa/attendees/${eventId}`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Attendees
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-medium mb-3">Check-in Patterns</h3>
              <div className="space-y-3">
                {hourlyPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{pattern.hour}</span>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${(pattern.checkins / Math.max(...hourlyPatterns.map(p => p.checkins))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{pattern.checkins}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {alerts.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No alerts at this time</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                          >
                            {alert.severity}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-xs">
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-medium mb-3">Auto-refresh Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Automatic updates</p>
                  <p className="text-xs text-gray-600">
                    Refresh data every 30 seconds
                  </p>
                </div>
                <Button
                  variant={isAutoRefreshEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={isAutoRefreshEnabled ? disableAutoRefresh : enableAutoRefresh}
                >
                  {isAutoRefreshEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PWAStatisticsPage; 