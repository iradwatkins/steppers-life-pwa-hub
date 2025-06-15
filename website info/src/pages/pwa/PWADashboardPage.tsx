import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { usePWAAuth } from '@/hooks/usePWAAuth';
import { toast } from '@/components/ui/sonner';
import {
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Clock,
  MapPin,
  Ticket,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowRight,
  Smartphone,
  Wifi,
  UserCheck,
  List,
  CreditCard,
  CalendarDays,
  Crown,
  Settings,
  WifiOff
} from 'lucide-react';
import { Event } from '@/types/event';
import { mockEvents } from '@/data/mockData';
import { pwaAnalyticsService } from '@/services/pwaAnalyticsService';

interface EventSummary {
  id: string;
  name: string;
  date: string;
  location: string;
  capacity: number;
  checkedIn: number;
  status: 'upcoming' | 'active' | 'completed';
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
  permission?: string;
}

const PWADashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole, hasPermission, isOnline, isOfflineMode } = usePWAAuth();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading events
    setTimeout(() => {
      setEvents([
        {
          id: '1',
          name: 'Chicago Step Workshop',
          date: '2024-12-20T19:00:00Z',
          location: 'Chicago Cultural Center',
          capacity: 150,
          checkedIn: 89,
          status: 'active'
        },
        {
          id: '2',
          name: 'Weekend Step Class',
          date: '2024-12-21T14:00:00Z',
          location: 'Dance Studio North',
          capacity: 100,
          checkedIn: 0,
          status: 'upcoming'
        },
        {
          id: '3',
          name: 'Beginner Step Session',
          date: '2024-12-19T18:00:00Z',
          location: 'Community Center',
          capacity: 80,
          checkedIn: 76,
          status: 'completed'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    loadEventData();
    
    // Track dashboard feature usage
    pwaAnalyticsService.trackFeatureUsage('dashboard');
    
    // Check online status
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Quick actions based on user role
  const quickActions: QuickAction[] = [
    {
      id: 'checkin',
      label: 'Event Check-in',
      description: 'Scan QR codes and check in attendees',
      icon: QrCode,
      path: '/pwa/checkin',
      color: 'bg-blue-500',
      permission: 'check_in'
    },
    {
      id: 'payments',
      label: 'Payment Processing',
      description: 'Process on-site payments and transactions',
      icon: CreditCard,
      path: '/pwa/payments',
      color: 'bg-emerald-500',
      permission: 'process_payments'
    },
    {
      id: 'statistics',
      label: 'Live Statistics',
      description: 'Monitor real-time event statistics',
      icon: BarChart3,
      path: '/pwa/statistics',
      color: 'bg-green-500',
      permission: 'view_reports'
    },
    {
      id: 'attendees',
      label: 'Attendee List',
      description: 'View and manage event attendees',
      icon: List,
      path: '/pwa/attendees',
      color: 'bg-indigo-500',
      permission: 'view_attendance'
    },
    {
      id: 'attendance',
      label: 'View Attendance',
      description: 'Monitor real-time attendance data',
      icon: Users,
      path: '/pwa/attendance',
      color: 'bg-purple-500',
      permission: 'view_attendance'
    },
    {
      id: 'manual-checkin',
      label: 'Manual Check-in',
      description: 'Check in attendees manually by name',
      icon: Plus,
      path: '/pwa/manual-checkin',
      color: 'bg-orange-500',
      permission: 'check_in'
    }
  ];

  // Filter quick actions based on permissions
  const visibleActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  const getStatusBadge = (status: EventSummary['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Live</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCheckInProgress = (checkedIn: number, capacity: number) => {
    return Math.round((checkedIn / capacity) * 100);
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email?.split('@')[0]}
        </h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleString()}</span>
          </div>
          <Badge variant="outline">{user?.role || 'Staff'}</Badge>
          {isOfflineMode && (
            <Badge variant="secondary">Offline Mode</Badge>
          )}
        </div>
      </div>

      {/* Connection Alert */}
      {!isOnline && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            You're working offline. Data will sync automatically when connection is restored.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            
            const handleActionClick = () => {
              if (action.id === 'payments') {
                // For payments, we need to select an event first
                // Navigate to the first active event, or show a selector
                const activeEvent = events.find(e => e.status === 'active');
                const eventId = activeEvent?.id || events[0]?.id || '1';
                navigate(`/pwa/payments/${eventId}`);
              } else {
                navigate(action.path);
              }
            };
            
            return (
              <Card 
                key={action.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={handleActionClick}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {action.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Event Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Events</h2>
          {hasRole(['organizer']) && (
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Event
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {event.name}
                      </h3>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatEventTime(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{event.checkedIn} / {event.capacity} checked in</span>
                        <span className="text-gray-400">
                          ({getCheckInProgress(event.checkedIn, event.capacity)}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <Progress 
                        value={getCheckInProgress(event.checkedIn, event.capacity)} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Event Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {event.status === 'active' && hasPermission('check_in') && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pwa/checkin?event=${event.id}`);
                        }}
                      >
                        <QrCode className="w-3 h-3 mr-1" />
                        Check-in
                      </Button>
                    )}
                    
                    {hasPermission('view_attendance') && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pwa/attendees/${event.id}`);
                        }}
                      >
                        <List className="w-3 h-3 mr-1" />
                        Attendees
                      </Button>
                    )}
                    
                    {hasPermission('view_reports') && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pwa/statistics/${event.id}`);
                        }}
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Statistics
                      </Button>
                    )}
                    
                    {hasPermission('view_attendance') && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pwa/attendance?event=${event.id}`);
                        }}
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Attendance
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Events
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">
              {events.filter(e => {
                const eventDate = new Date(e.date);
                const today = new Date();
                return eventDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Active and upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">
              {events.reduce((sum, event) => sum + event.checkedIn, 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Capacity Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(
                (events.reduce((sum, event) => sum + event.checkedIn, 0) /
                 events.reduce((sum, event) => sum + event.capacity, 0)) * 100
              )}%
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Overall attendance
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PWADashboardPage; 