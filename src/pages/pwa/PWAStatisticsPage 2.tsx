import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, Settings, AlertTriangle, CheckCircle, Clock, Users, DollarSign, TrendingUp, BarChart3, Bell, Eye, EyeOff, Wifi, WifiOff, Signal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { usePWAStatistics } from '@/hooks/usePWAStatistics';

export const PWAStatisticsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);

  const {
    statistics,
    loading,
    error,
    isOnline,
    lastSyncTime,
    autoRefreshEnabled,
    refreshInterval,
    alertsEnabled,
    refreshStatistics,
    acknowledgeAlert,
    toggleAutoRefresh,
    setRefreshInterval,
    toggleAlerts,
    exportStatistics,
    clearError,
    capacityUtilization,
    revenuePerAttendee,
    checkinVelocity,
    criticalAlerts,
    upcomingMilestones,
    timeUntilEventFormatted,
    peakHourFormatted,
    connectionStatus
  } = usePWAStatistics(eventId || '');

  useEffect(() => {
    if (!eventId) {
      navigate('/pwa');
      return;
    }
    
    // Store current event ID for service
    localStorage.setItem('currentEventId', eventId);
  }, [eventId, navigate]);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const data = await exportStatistics(format);
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-statistics-${eventId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Statistics exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export statistics');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Signal className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pwa')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {statistics?.eventName || 'Event Statistics'}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className={`flex items-center space-x-1 ${getStatusColor(connectionStatus)}`}>
                    {getStatusIcon(connectionStatus)}
                    <span className="capitalize">{connectionStatus}</span>
                  </div>
                  {lastSyncTime && (
                    <>
                      <span>•</span>
                      <span>Last sync: {formatTime(lastSyncTime)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStatistics}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button
                variant="link"
                size="sm"
                onClick={clearError}
                className="ml-2 h-auto p-0 text-red-600"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {criticalAlerts.map((alert) => (
            <Alert key={alert.id} className="border-red-200 bg-red-50 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="h-auto p-0 text-red-600"
                  >
                    Acknowledge
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-refresh">Auto Refresh</Label>
                  <p className="text-sm text-gray-500">Automatically update statistics</p>
                </div>
                <Switch
                  id="auto-refresh"
                  checked={autoRefreshEnabled}
                  onCheckedChange={toggleAutoRefresh}
                />
              </div>
              
              <div>
                <Label htmlFor="refresh-interval">Refresh Interval</Label>
                <Select
                  value={refreshInterval.toString()}
                  onValueChange={(value) => setRefreshInterval(Number(value))}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15000">15 seconds</SelectItem>
                    <SelectItem value="30000">30 seconds</SelectItem>
                    <SelectItem value="60000">1 minute</SelectItem>
                    <SelectItem value="300000">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="alerts">Alert Notifications</Label>
                  <p className="text-sm text-gray-500">Show alert notifications</p>
                </div>
                <Switch
                  id="alerts"
                  checked={alertsEnabled}
                  onCheckedChange={toggleAlerts}
                />
              </div>

              <Separator />

              <div>
                <Label>Export Statistics</Label>
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('json')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Checked In</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {statistics?.checkedIn || 0}
                        </p>
                        <span className="text-sm text-gray-500 ml-2">
                          / {statistics?.capacity || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Check-in Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics?.checkinRate || 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${statistics?.revenueTotal.toFixed(0) || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Arrival Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {checkinVelocity}/hr
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Capacity Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Capacity Utilization</CardTitle>
                <CardDescription>
                  Current attendance vs. event capacity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {statistics?.checkedIn || 0} / {statistics?.capacity || 0} attendees
                    </span>
                    <span className="text-sm text-gray-500">
                      {capacityUtilization}%
                    </span>
                  </div>
                  <Progress 
                    value={capacityUtilization} 
                    className="w-full h-3"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Available: </span>
                      <span className="font-medium">
                        {(statistics?.capacity || 0) - (statistics?.checkedIn || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Utilization: </span>
                      <span className="font-medium">{capacityUtilization}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Event Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time until event:</span>
                    <span className="font-medium">{timeUntilEventFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event status:</span>
                    <Badge variant={statistics?.eventStatus === 'live' ? 'default' : 'secondary'}>
                      {statistics?.eventStatus || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gate status:</span>
                    <Badge variant={statistics?.gateStatus === 'open' ? 'default' : 'secondary'}>
                      {statistics?.gateStatus || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Predicted peak:</span>
                    <span className="font-medium">{peakHourFormatted}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingMilestones.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingMilestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{milestone.description}</p>
                            <p className="text-sm text-gray-600">
                              {milestone.remaining} more attendees
                            </p>
                          </div>
                          <Badge variant="outline">
                            {milestone.percentage}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">All major milestones reached!</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Type Breakdown</CardTitle>
                <CardDescription>
                  Sales and check-in rates by ticket type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics?.ticketTypeBreakdown.map((type, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type.type}</span>
                        <span className="text-sm text-gray-500">
                          {type.checkedIn}/{type.sold} ({Math.round((type.checkedIn / type.sold) * 100)}%)
                        </span>
                      </div>
                      <Progress 
                        value={(type.checkedIn / type.sold) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Revenue: ${type.revenue.toFixed(2)}</span>
                        <span>Avg: ${type.averagePrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly Check-in Patterns</CardTitle>
                <CardDescription>
                  Check-in activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics?.hourlyPatterns.slice(-8).map((pattern, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 text-sm font-medium">
                        {new Date(pattern.hour).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{pattern.checkins} check-ins</span>
                          <span className="text-sm text-gray-500">
                            {pattern.cumulativeCheckins} total
                          </span>
                        </div>
                        <Progress 
                          value={pattern.checkins} 
                          max={Math.max(...(statistics?.hourlyPatterns.map(p => p.checkins) || [1]))} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Active Alerts
                </CardTitle>
                <CardDescription>
                  Current system alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statistics?.activeAlerts.length ? (
                  <div className="space-y-4">
                    {statistics.activeAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg border ${
                          alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                          alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Badge 
                                variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                                className="mr-2"
                              >
                                {alert.severity}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="font-medium mb-1">{alert.message}</p>
                            {alert.threshold && alert.currentValue && (
                              <p className="text-sm text-gray-600">
                                Threshold: {alert.threshold} | Current: {alert.currentValue}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {alert.acknowledged ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="text-sm">Acknowledged</span>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">No active alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="font-medium">${statistics?.revenueTotal.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Ticket Price:</span>
                    <span className="font-medium">${statistics?.averageTicketPrice.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue per Attendee:</span>
                    <span className="font-medium">${revenuePerAttendee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VIP Revenue:</span>
                    <span className="font-medium">
                      ${(statistics?.ticketTypeBreakdown.find(t => t.type === 'VIP')?.revenue || 0).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tickets Sold:</span>
                    <span className="font-medium">{statistics?.ticketsSold || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Checked In:</span>
                    <span className="font-medium">{statistics?.checkedIn || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Not Checked In:</span>
                    <span className="font-medium">{statistics?.notCheckedIn || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VIP Attendees:</span>
                    <span className="font-medium">{statistics?.vipCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comp Tickets:</span>
                    <span className="font-medium">{statistics?.compTickets || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection Status:</span>
                  <div className={`flex items-center space-x-1 ${getStatusColor(connectionStatus)}`}>
                    {getStatusIcon(connectionStatus)}
                    <span className="capitalize font-medium">{connectionStatus}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {statistics?.lastUpdated 
                      ? new Date(statistics.lastUpdated).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto Refresh:</span>
                  <span className="font-medium">
                    {autoRefreshEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Refresh Interval:</span>
                  <span className="font-medium">{refreshInterval / 1000}s</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};