import { useState, useEffect, useCallback } from 'react';
import { 
  pwaCheckinService, 
  type AttendeeInfo, 
  type ScanResult, 
  type EventStats,
  type CheckinRecord
} from '@/services/pwaCheckinService';
import { toast } from 'sonner';

export const usePWACheckin = (eventId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<Array<{
    attendee: AttendeeInfo;
    timestamp: string;
    method: string;
  }>>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnlineStatus = () => {
      const newOnlineStatus = navigator.onLine;
      setIsOnline(newOnlineStatus);
      
      if (newOnlineStatus && !isOnline) {
        // Just came back online, sync pending check-ins
        syncPendingCheckins();
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [isOnline]);

  // Load event data
  const loadEventData = useCallback(async (eventId: string) => {
    try {
      setIsLoading(true);
      
      // Load attendees for offline use
      await pwaCheckinService.loadEventAttendees(eventId);
      
      // Get stats and attendee list
      const [stats, attendeeList] = await Promise.all([
        pwaCheckinService.getEventStats(eventId),
        pwaCheckinService.getEventAttendees(eventId)
      ]);

      setEventStats(stats);
      setAttendees(attendeeList);
      
      // Sync if online
      if (isOnline) {
        await syncPendingCheckins();
      }
    } catch (error) {
      console.error('Failed to load event data:', error);
      toast.error('Failed to load event data');
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  // Sync pending check-ins
  const syncPendingCheckins = useCallback(async () => {
    try {
      await pwaCheckinService.syncPendingCheckins();
      setLastSyncTime(new Date());
      
      // Refresh stats after sync
      if (eventId) {
        const updatedStats = await pwaCheckinService.getEventStats(eventId);
        setEventStats(updatedStats);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync with server');
    }
  }, [eventId]);

  // Handle QR scan
  const handleQRScan = useCallback(async (qrData: string): Promise<ScanResult> => {
    try {
      const result = await pwaCheckinService.scanQRCode(qrData);
      
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

        // Provide feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
        toast.success(`✅ ${result.attendee.name} checked in successfully`);
      } else {
        toast.error(`❌ ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('QR scan failed:', error);
      const errorResult: ScanResult = { success: false, error: 'Failed to process QR code' };
      toast.error('Failed to process QR code');
      return errorResult;
    }
  }, [eventId]);

  // Search attendees
  const searchAttendees = useCallback(async (query: string): Promise<AttendeeInfo[]> => {
    if (!eventId || !query.trim()) {
      return [];
    }

    try {
      return await pwaCheckinService.searchAttendees(query, eventId);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
      return [];
    }
  }, [eventId]);

  // Manual check-in
  const performManualCheckin = useCallback(async (attendee: AttendeeInfo): Promise<boolean> => {
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
  }, [eventId]);

  // Emergency override
  const performEmergencyOverride = useCallback(async (attendeeId: string, reason: string): Promise<boolean> => {
    try {
      await pwaCheckinService.emergencyCheckin(attendeeId, reason);
      
      // Refresh stats
      if (eventId) {
        const updatedStats = await pwaCheckinService.getEventStats(eventId);
        setEventStats(updatedStats);
      }

      toast.success('Emergency check-in completed');
      return true;
    } catch (error) {
      console.error('Emergency override failed:', error);
      toast.error('Override failed');
      return false;
    }
  }, [eventId]);

  // Get check-in status for attendee
  const getCheckinStatus = useCallback(async (attendeeId: string): Promise<CheckinRecord | null> => {
    try {
      return await pwaCheckinService.getCheckinByAttendee(attendeeId);
    } catch (error) {
      console.error('Failed to get check-in status:', error);
      return null;
    }
  }, []);

  // Refresh event data
  const refreshEventData = useCallback(async () => {
    if (eventId) {
      await loadEventData(eventId);
    }
  }, [eventId, loadEventData]);

  // Clear event data (for switching events)
  const clearEventData = useCallback(async (eventId: string) => {
    try {
      await pwaCheckinService.clearEventData(eventId);
      setEventStats(null);
      setAttendees([]);
      setRecentCheckins([]);
      toast.success('Event data cleared');
    } catch (error) {
      console.error('Failed to clear event data:', error);
      toast.error('Failed to clear event data');
    }
  }, []);

  // Initialize on mount if eventId provided
  useEffect(() => {
    if (eventId) {
      loadEventData(eventId);
    }
  }, [eventId, loadEventData]);

  return {
    // State
    isLoading,
    isOnline,
    eventStats,
    attendees,
    recentCheckins,
    lastSyncTime,

    // Actions
    loadEventData,
    syncPendingCheckins,
    handleQRScan,
    searchAttendees,
    performManualCheckin,
    performEmergencyOverride,
    getCheckinStatus,
    refreshEventData,
    clearEventData
  };
};