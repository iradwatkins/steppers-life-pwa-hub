import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { 
  checkinService, 
  CheckinRecord, 
  TicketVerificationResult, 
  EventAttendanceData,
  CheckinAnalytics,
  WaitlistEntry,
  AttendeeInfo
} from '@/services/checkinService';

export interface UseCheckinOptions {
  eventId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useCheckin = ({ eventId, autoRefresh = true, refreshInterval = 30000 }: UseCheckinOptions) => {
  const [attendanceData, setAttendanceData] = useState<EventAttendanceData | null>(null);
  const [analytics, setAnalytics] = useState<CheckinAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastVerification, setLastVerification] = useState<TicketVerificationResult | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<CheckinRecord[]>([]);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

  // Real-time event listener for check-in updates
  useEffect(() => {
    const handleCheckinEvent = (event: any) => {
      switch (event.type) {
        case 'checkin_processed':
          setRecentCheckins(prev => [event.data, ...prev.slice(0, 9)]);
          loadAttendanceData();
          toast({
            title: "Check-in Successful",
            description: `Attendee checked in successfully`,
          });
          break;
        
        case 'attendance_updated':
          setAttendanceData(event.data);
          break;
        
        case 'offline_sync_completed':
          toast({
            title: "Sync Complete",
            description: `${event.data.syncedCount} offline check-ins synced`,
          });
          break;
      }
    };

    checkinService.addEventListener(handleCheckinEvent);
    return () => checkinService.removeEventListener(handleCheckinEvent);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-refresh attendance data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadAttendanceData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, eventId]);

  // Load initial data
  useEffect(() => {
    loadAttendanceData();
    loadAnalytics();
  }, [eventId]);

  const loadAttendanceData = useCallback(async () => {
    try {
      const data = await checkinService.getAttendanceData(eventId);
      setAttendanceData(data);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    }
  }, [eventId]);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await checkinService.getCheckinAnalytics(eventId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [eventId]);

  // QR Code scanning and verification
  const verifyTicket = useCallback(async (qrCode: string): Promise<TicketVerificationResult> => {
    setIsScanning(true);
    try {
      const result = await checkinService.verifyTicket(qrCode, eventId);
      setLastVerification(result);
      
      if (!result.isValid) {
        toast({
          title: "Ticket Verification Failed",
          description: result.error,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      const errorResult: TicketVerificationResult = {
        isValid: false,
        status: 'invalid',
        error: 'Verification failed: ' + (error as Error).message,
        timestamp: new Date()
      };
      setLastVerification(errorResult);
      return errorResult;
    } finally {
      setIsScanning(false);
    }
  }, [eventId]);

  // Process check-in after successful verification
  const processCheckin = useCallback(async (
    ticketId: string,
    method: 'qr_scan' | 'manual' | 'self_service',
    staffId?: string,
    notes?: string
  ): Promise<CheckinRecord | null> => {
    setIsLoading(true);
    try {
      const checkinRecord = await checkinService.processCheckin(
        ticketId,
        eventId,
        method,
        staffId,
        notes
      );
      
      if (offlineMode) {
        toast({
          title: "Offline Check-in",
          description: "Check-in saved. Will sync when online.",
          variant: "default",
        });
      }
      
      return checkinRecord;
    } catch (error) {
      toast({
        title: "Check-in Failed",
        description: "Failed to process check-in: " + (error as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [eventId, offlineMode]);

  // Manual check-in by name lookup
  const manualCheckinByName = useCallback(async (
    firstName: string,
    lastName: string,
    staffId: string,
    notes?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await checkinService.manualCheckinByName(
        firstName,
        lastName,
        eventId,
        staffId,
        notes
      );

      if (result.isValid) {
        toast({
          title: "Manual Check-in Successful",
          description: `${firstName} ${lastName} checked in successfully`,
        });
        return true;
      } else {
        toast({
          title: "Manual Check-in Failed",
          description: result.error,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Manual Check-in Error",
        description: "Failed to process manual check-in: " + (error as Error).message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Waitlist management
  const addToWaitlist = useCallback(async (attendeeInfo: Partial<AttendeeInfo>): Promise<WaitlistEntry | null> => {
    setIsLoading(true);
    try {
      const entry = await checkinService.addToWaitlist(eventId, attendeeInfo);
      toast({
        title: "Added to Waitlist",
        description: `Position #${entry.position} on the waitlist`,
      });
      return entry;
    } catch (error) {
      toast({
        title: "Waitlist Error",
        description: "Failed to add to waitlist: " + (error as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Export attendance data
  const exportAttendanceData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const csvData = await checkinService.exportAttendanceCSV(eventId);
      
      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-${eventId}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Attendance data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export attendance data: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Combined scan and check-in function
  const scanAndCheckin = useCallback(async (
    qrCode: string,
    staffId?: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const verification = await verifyTicket(qrCode);
      
      if (!verification.isValid || !verification.ticketInfo) {
        return false;
      }

      const checkinRecord = await processCheckin(
        verification.ticketInfo.ticketId,
        'qr_scan',
        staffId,
        notes
      );

      return checkinRecord !== null;
    } catch (error) {
      toast({
        title: "Scan & Check-in Failed",
        description: "Failed to scan and check-in: " + (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  }, [verifyTicket, processCheckin]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadAttendanceData(),
        loadAnalytics()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [loadAttendanceData, loadAnalytics]);

  return {
    // Data
    attendanceData,
    analytics,
    lastVerification,
    recentCheckins,
    
    // State
    isLoading,
    isScanning,
    offlineMode,
    
    // Actions
    verifyTicket,
    processCheckin,
    manualCheckinByName,
    scanAndCheckin,
    addToWaitlist,
    exportAttendanceData,
    refreshData,
    
    // Utils
    loadAttendanceData,
    loadAnalytics
  };
};

export default useCheckin; 