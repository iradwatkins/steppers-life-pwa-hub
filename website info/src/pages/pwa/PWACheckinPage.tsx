import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePWAAuth } from '@/hooks/usePWAAuth';
import { toast } from '@/components/ui/sonner';
import {
  QrCode,
  Search,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  UserCheck,
  Crown,
  RefreshCw,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import PWAQRScanner from '@/components/pwa/PWAQRScanner';
import { pwaCheckinService, PWATicketData, PWACheckinResult, PWAEventStats } from '@/services/pwaCheckinService';
import { pwaAnalyticsService } from '@/services/pwaAnalyticsService';

const PWACheckinPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, hasPermission, isOnline } = usePWAAuth();
  
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get('event') || '1');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PWATicketData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [eventStats, setEventStats] = useState<PWAEventStats | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<PWACheckinResult[]>([]);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [scanning, setScanning] = useState(false);

  // Check permissions
  useEffect(() => {
    if (!hasPermission('check_in')) {
      toast.error('You do not have permission to access check-in functionality');
      navigate('/pwa/dashboard');
    }
  }, [hasPermission, navigate]);

  // Initialize service and load stats
  useEffect(() => {
    const initializeService = async () => {
      try {
        await pwaCheckinService.initializeDB();
        await loadEventStats();
      } catch (error) {
        console.error('Service initialization error:', error);
      }
    };

    initializeService();
  }, [selectedEvent]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      handleSync();
    }
  }, [isOnline]);

  // Load event statistics
  const loadEventStats = async () => {
    try {
      const stats = await pwaCheckinService.getEventStats(selectedEvent);
      setEventStats(stats);
    } catch (error) {
      console.error('Failed to load event stats:', error);
    }
  };

  // Load recent check-ins
  const loadRecentCheckins = async () => {
    try {
      // Get recent check-ins from local storage or service
      const recent = JSON.parse(localStorage.getItem('recent-checkins') || '[]').slice(0, 20);
      setRecentCheckins(recent);
    } catch (error) {
      console.error('Failed to load recent check-ins:', error);
    }
  };

  // Handle successful check-in
  const handleCheckinSuccess = (result: PWACheckinResult) => {
    setRecentCheckins(prev => [result, ...prev.slice(0, 19)]); // Keep last 20
    loadEventStats(); // Refresh stats
    
    // Auto-clear after brief display
    setTimeout(() => {
      // Could clear the success message or do other cleanup
    }, 3000);
  };

  // Handle check-in error
  const handleCheckinError = (error: string) => {
    // Error handling is already done in the scanner component
    console.log('Check-in error:', error);
  };

  // Search attendees manually
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await pwaCheckinService.searchAttendees(searchQuery, selectedEvent);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Manual check-in from search results
  const handleManualCheckin = async (ticket: PWATicketData) => {
    console.log('Manual check-in for:', ticket);
    setIsSearching(false);
    
    // Track manual check-in usage
    pwaAnalyticsService.trackFeatureUsage('manual-checkin');
    
    try {
      const result = await pwaCheckinService.performCheckin(
        ticket,
        user?.id || 'unknown',
        isOnline
      );

      if (result.success) {
        handleCheckinSuccess(result);
        // Remove from search results
        setSearchResults(prev => prev.filter(t => t.ticketId !== ticket.ticketId));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Manual check-in error:', error);
      toast.error('Manual check-in failed');
    }
  };

  // Emergency check-in
  const handleEmergencyCheckin = async () => {
    if (!emergencyName.trim() || !emergencyReason.trim()) {
      toast.error('Please provide both name and reason for emergency entry');
      return;
    }

    try {
      const result = await pwaCheckinService.emergencyCheckin(
        emergencyName,
        emergencyReason,
        user?.id || 'unknown',
        selectedEvent
      );

      if (result.success) {
        handleCheckinSuccess(result);
        setEmergencyName('');
        setEmergencyReason('');
        toast.success('Emergency check-in completed');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Emergency check-in error:', error);
      toast.error('Emergency check-in failed');
    }
  };

  // Sync offline check-ins
  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      await pwaCheckinService.syncOfflineCheckins();
      await loadEventStats();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed');
    }
  };

  // Get offline queue status
  const offlineStatus = pwaCheckinService.getOfflineQueueStatus();

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    loadEventStats();
    loadRecentCheckins();
    
    // Track feature usage
    pwaAnalyticsService.trackFeatureUsage('check-in');
    
    // Set up periodic refresh for stats
    const interval = setInterval(() => {
      if (isOnline) {
        loadEventStats();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline]);

  const handleQRSuccess = async (ticketId: string) => {
    console.log('QR Code scanned:', ticketId);
    setScanning(false);
    
    // Track QR scanner usage
    pwaAnalyticsService.trackFeatureUsage('qr-scanner');
    
    // Process the check-in by converting ticketId to ticket object
    const ticket: PWATicketData = {
      ticketId,
      attendeeName: 'QR Scanned',
      ticketType: 'standard',
      status: 'checked-out'
    };
    
    await handleManualCheckin(ticket);
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Event Check-in</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Badge variant="outline">Event {selectedEvent}</Badge>
          {eventStats && (
            <>
              <span>•</span>
              <span>{eventStats.checkedInCount}/{eventStats.totalCapacity} checked in</span>
              <span>•</span>
              <span>{eventStats.arrivedInLastHour} in last hour</span>
            </>
          )}
        </div>
      </div>

      {/* Offline Warning & Sync Status */}
      {!isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're offline. Check-ins will be saved and synced when connection is restored.
            {offlineStatus.pending > 0 && (
              <span className="block mt-1 font-medium">
                {offlineStatus.pending} check-ins pending sync
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Button */}
      {isOnline && offlineStatus.pending > 0 && (
        <Alert>
          <RefreshCw className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{offlineStatus.pending} offline check-ins ready to sync</span>
            <Button size="sm" onClick={handleSync}>
              Sync Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Event Stats Dashboard */}
      {eventStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{eventStats.checkedInCount}</p>
                  <p className="text-xs text-gray-500">Checked In</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round((eventStats.checkedInCount / eventStats.totalCapacity) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{eventStats.arrivedInLastHour}</p>
                  <p className="text-xs text-gray-500">Last Hour</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{eventStats.vipCount}</p>
                  <p className="text-xs text-gray-500">VIP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scanner">
            <QrCode className="w-4 h-4 mr-2" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Search className="w-4 h-4 mr-2" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="w-4 h-4 mr-2" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="emergency">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency
          </TabsTrigger>
        </TabsList>

        {/* QR Scanner Tab */}
        <TabsContent value="scanner" className="space-y-4">
          <PWAQRScanner
            eventId={selectedEvent}
            onCheckinSuccess={handleQRSuccess}
            onCheckinError={handleCheckinError}
          />
        </TabsContent>

        {/* Manual Check-in Tab */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Manual Lookup</span>
              </CardTitle>
              <CardDescription>
                Search for attendees by name, email, phone number, or ticket ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Attendees</Label>
                <div className="flex space-x-2">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Name, email, phone, or ticket ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-12"
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <Zap className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        <p className="font-medium">{ticket.attendeeName}</p>
                        {ticket.isVIP && <Crown className="w-4 h-4 text-amber-500" />}
                      </div>
                      <p className="text-sm text-gray-600">{ticket.attendeeEmail}</p>
                      {ticket.attendeePhone && (
                        <p className="text-sm text-gray-600">{ticket.attendeePhone}</p>
                      )}
                      <p className="text-xs text-gray-500">{ticket.ticketType}</p>
                      {ticket.specialNotes && (
                        <p className="text-xs text-amber-600 font-medium">
                          Note: {ticket.specialNotes}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleManualCheckin(ticket)}
                    >
                      Check In
                    </Button>
                  </div>
                ))}
                
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2" />
                    <p>No attendees found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Check-ins Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Check-ins</span>
              </CardTitle>
              <CardDescription>
                Recently processed check-ins ({recentCheckins.length} shown)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentCheckins.length > 0 ? (
                <div className="space-y-3">
                  {recentCheckins.map((checkin, index) => (
                    <div
                      key={`${checkin.ticket?.ticketId}-${index}`}
                      className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{checkin.ticket?.attendeeName}</p>
                            {checkin.ticket?.isVIP && <Crown className="w-4 h-4 text-amber-500" />}
                          </div>
                          <p className="text-sm text-gray-600">{checkin.ticket?.ticketType}</p>
                          {!isOnline && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Offline
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {checkin.timestamp && (
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatTime(checkin.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(checkin.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>No recent check-ins</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Check-in Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span>Emergency Manual Override</span>
              </CardTitle>
              <CardDescription className="text-red-600">
                Use only for technical issues or special circumstances. All emergency entries are logged.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergency-name">Attendee Name</Label>
                <Input
                  id="emergency-name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Enter attendee name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-reason">Reason for Emergency Entry</Label>
                <Input
                  id="emergency-reason"
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  placeholder="e.g., damaged QR code, technical issues"
                />
              </div>

              <Button 
                onClick={handleEmergencyCheckin}
                disabled={!emergencyName.trim() || !emergencyReason.trim()}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Complete Emergency Check-in
              </Button>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Emergency entries require supervisor approval and are subject to audit.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWACheckinPage; 