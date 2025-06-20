import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '@/styles/pwa-mobile.css';
import { 
  QrCode, 
  Search, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { PWAQRScanner } from '@/components/pwa/PWAQRScanner';
import { ManualLookupComponent } from '@/components/pwa/ManualLookupComponent';
import { PWAAnalyticsDashboard } from '@/components/pwa/PWAAnalyticsDashboard';
import { EmergencyOverrideComponent } from '@/components/pwa/EmergencyOverrideComponent';
import { 
  pwaCheckinService, 
  type AttendeeInfo, 
  type ScanResult, 
  type EventStats 
} from '@/services/pwaCheckinService';
import { toast } from 'sonner';

export const PWACheckinPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('scanner');
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<Array<{
    attendee: AttendeeInfo;
    timestamp: string;
    method: string;
  }>>([]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        
        // Load event attendees for offline use
        await pwaCheckinService.loadEventAttendees(eventId);
        
        // Get initial stats and attendees
        const [stats, attendeeList] = await Promise.all([
          pwaCheckinService.getEventStats(eventId),
          pwaCheckinService.getEventAttendees(eventId)
        ]);

        setEventStats(stats);
        setAttendees(attendeeList);
        
        // Sync any pending check-ins
        if (isOnline) {
          await pwaCheckinService.syncPendingCheckins();
          setLastSyncTime(new Date());
        }
      } catch (error) {
        console.error('Failed to initialize data:', error);
        toast.error('Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [eventId, isOnline]);

  // Monitor online status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        // Auto-sync when coming back online
        pwaCheckinService.syncPendingCheckins().then(() => {
          setLastSyncTime(new Date());
          toast.success('Synced with server');
        });
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Handle QR scan results
  const handleScanResult = async (result: ScanResult) => {
    if (result.success && result.attendee) {
      // Add to recent check-ins
      setRecentCheckins(prev => [{
        attendee: result.attendee!,
        timestamp: new Date().toISOString(),
        method: 'QR Scan'
      }, ...prev.slice(0, 4)]);

      // Refresh stats
      if (eventId) {
        const updatedStats = await pwaCheckinService.getEventStats(eventId);
        setEventStats(updatedStats);
      }
    }
  };

  // Manual check-in
  const handleManualCheckin = async (attendee: AttendeeInfo): Promise<boolean> => {
    try {
      // Check if already checked in
      const existingCheckin = await pwaCheckinService.getCheckinByAttendee(attendee.id);
      if (existingCheckin) {
        toast.error(`${attendee.name} is already checked in`);
        return false;
      }

      await pwaCheckinService.performCheckin(attendee, 'manual');
      
      // Add to recent check-ins
      setRecentCheckins(prev => [{
        attendee,
        timestamp: new Date().toISOString(),
        method: 'Manual'
      }, ...prev.slice(0, 4)]);

      // Refresh stats
      if (eventId) {
        const updatedStats = await pwaCheckinService.getEventStats(eventId);
        setEventStats(updatedStats);
      }

      toast.success(`✅ ${attendee.name} checked in manually`);
      return true;
    } catch (error) {
      console.error('Manual check-in failed:', error);
      toast.error('Check-in failed');
      return false;
    }
  };

  // Emergency override
  const handleEmergencyOverride = async (attendeeId: string) => {
    try {
      await pwaCheckinService.emergencyCheckin(attendeeId, 'Staff override - Technical issue');
      toast.success('Emergency check-in completed');
      
      // Refresh data
      if (eventId) {
        const updatedStats = await pwaCheckinService.getEventStats(eventId);
        setEventStats(updatedStats);
      }
    } catch (error) {
      console.error('Emergency override failed:', error);
      toast.error('Override failed');
    }
  };

  // Manual sync
  const handleManualSync = async () => {
    try {
      await pwaCheckinService.syncPendingCheckins();
      setLastSyncTime(new Date());
      toast.success('Synced successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  const checkinPercentage = eventStats 
    ? Math.round((eventStats.checkedIn / eventStats.totalCapacity) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pwa-safe-area">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Event Check-in</h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">{eventStats?.eventName}</p>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="default" className="bg-green-500">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {eventStats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{eventStats.checkedIn}</div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <Progress value={checkinPercentage} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{eventStats.arrivalRate}</div>
                <p className="text-sm text-muted-foreground">Last Hour</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">Active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Offline Alert */}
        {!isOnline && (
          <div className="pwa-offline-banner mb-6 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span>Offline Mode - Changes will sync when connected</span>
            </div>
            {lastSyncTime && (
              <div className="text-xs mt-1 opacity-90">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 pwa-tabs">
            <TabsTrigger value="scanner" className="pwa-tab-trigger pwa-touch-target">
              <QrCode className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Scanner</span>
              <span className="sm:hidden">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="pwa-tab-trigger pwa-touch-target">
              <Search className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Manual</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="pwa-tab-trigger pwa-touch-target">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Emergency</span>
              <span className="sm:hidden">Alert</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="pwa-tab-trigger pwa-touch-target">
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* QR Scanner Tab */}
          <TabsContent value="scanner" className="mt-6">
            {eventId && (
              <PWAQRScanner 
                eventId={eventId}
                onScanResult={handleScanResult}
                onError={(error) => toast.error(error)}
              />
            )}
          </TabsContent>

          {/* Manual Lookup Tab */}
          <TabsContent value="manual" className="mt-6">
            {eventId && (
              <ManualLookupComponent
                eventId={eventId}
                onCheckin={handleManualCheckin}
                onGetCheckinStatus={async (attendeeId) => await pwaCheckinService.getCheckinByAttendee(attendeeId)}
                searchAttendees={async (query) => await pwaCheckinService.searchAttendees(query, eventId)}
              />
            )}
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="mt-6">
            {eventId && (
              <EmergencyOverrideComponent
                isOnline={isOnline}
                onEmergencyCheckin={async (attendeeId, reason) => {
                  try {
                    await pwaCheckinService.emergencyCheckin(attendeeId, reason);
                    
                    // Refresh stats
                    const updatedStats = await pwaCheckinService.getEventStats(eventId);
                    setEventStats(updatedStats);
                    
                    return true;
                  } catch (error) {
                    console.error('Emergency check-in failed:', error);
                    return false;
                  }
                }}
                onBulkCheckin={async (attendeeIds, reason) => {
                  let successCount = 0;
                  
                  for (const attendeeId of attendeeIds) {
                    try {
                      await pwaCheckinService.emergencyCheckin(attendeeId, reason);
                      successCount++;
                    } catch (error) {
                      console.error(`Failed to check in ${attendeeId}:`, error);
                    }
                  }
                  
                  // Refresh stats
                  if (successCount > 0) {
                    const updatedStats = await pwaCheckinService.getEventStats(eventId);
                    setEventStats(updatedStats);
                  }
                  
                  return successCount;
                }}
                searchAttendees={async (query) => await pwaCheckinService.searchAttendees(query, eventId)}
              />
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-6">
            <PWAAnalyticsDashboard
              eventStats={eventStats}
              recentCheckins={recentCheckins}
              onRefresh={async () => {
                if (eventId) {
                  const updatedStats = await pwaCheckinService.getEventStats(eventId);
                  setEventStats(updatedStats);
                }
              }}
              onExport={() => {
                // Export functionality - could generate CSV or PDF
                const exportData = {
                  event: eventStats?.eventName,
                  timestamp: new Date().toISOString(),
                  checkedIn: eventStats?.checkedIn,
                  totalCapacity: eventStats?.totalCapacity,
                  recentCheckins: recentCheckins.map(c => ({
                    name: c.attendee.name,
                    timestamp: c.timestamp,
                    method: c.method
                  }))
                };
                
                const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                  type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `event-analytics-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};