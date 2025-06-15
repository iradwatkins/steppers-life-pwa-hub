import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  pwaAttendeeService, 
  PWAAttendeeInfo, 
  AttendeeFilterOptions, 
  AttendeeListMetadata,
  BulkOperation,
  ExportFormat
} from '@/services/pwaAttendeeService';
import { useToast } from '@/components/ui/use-toast';

export interface UsePWAAttendeesResult {
  // Data
  attendees: PWAAttendeeInfo[];
  metadata: AttendeeListMetadata | null;
  selectedAttendees: string[];
  
  // State
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: AttendeeFilterOptions;
  isOffline: boolean;
  lastSync: Date | null;
  
  // Actions
  loadAttendees: (eventId: string) => Promise<void>;
  searchAttendees: (query: string) => void;
  setFilters: (filters: AttendeeFilterOptions) => void;
  selectAttendee: (attendeeId: string) => void;
  deselectAttendee: (attendeeId: string) => void;
  selectAllAttendees: () => void;
  clearSelection: () => void;
  toggleAttendeeSelection: (attendeeId: string) => void;
  
  // Operations
  checkInAttendee: (attendeeId: string, staffId: string, notes?: string) => Promise<boolean>;
  performBulkOperation: (operation: BulkOperation) => Promise<boolean>;
  exportAttendeeList: (format: ExportFormat) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Utilities
  getAttendeeById: (attendeeId: string) => PWAAttendeeInfo | undefined;
  getCheckedInCount: () => number;
  getVIPCount: () => number;
  getCapacityUtilization: () => number;
}

export function usePWAAttendees(eventId?: string): UsePWAAttendeesResult {
  // State
  const [attendees, setAttendees] = useState<PWAAttendeeInfo[]>([]);
  const [metadata, setMetadata] = useState<AttendeeListMetadata | null>(null);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AttendeeFilterOptions>({});
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  // Refs
  const currentEventId = useRef<string | null>(null);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Toast for user feedback
  const { toast } = useToast();

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (currentEventId.current) {
        refreshData();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service event listener
  useEffect(() => {
    const handleServiceUpdate = (event: any) => {
      switch (event.type) {
        case 'attendee_checked_in':
        case 'attendee_updated':
          if (event.data.eventId === currentEventId.current) {
            // Update the specific attendee in the list
            setAttendees(prev => {
              const index = prev.findIndex(a => a.attendeeId === event.data.attendee.attendeeId);
              if (index !== -1) {
                const updated = [...prev];
                updated[index] = event.data.attendee;
                return updated;
              }
              return prev;
            });
            
            // Show success toast
            toast({
              title: "Attendee Updated",
              description: `${event.data.attendee.firstName} ${event.data.attendee.lastName} has been checked in.`,
            });
          }
          break;

        case 'sync_completed':
          setLastSync(new Date());
          toast({
            title: "Data Synced",
            description: "Offline data has been synchronized successfully.",
          });
          break;

        default:
          break;
      }
    };

    pwaAttendeeService.addEventListener(handleServiceUpdate);

    return () => {
      pwaAttendeeService.removeEventListener(handleServiceUpdate);
    };
  }, [toast]);

  // Auto-refresh when online
  useEffect(() => {
    if (!isOffline && currentEventId.current) {
      // Set up auto-refresh every 2 minutes
      refreshInterval.current = setInterval(() => {
        refreshData();
      }, 2 * 60 * 1000);

      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [isOffline]);

  // Load attendees for an event
  const loadAttendees = useCallback(async (newEventId: string) => {
    if (!newEventId) return;

    setLoading(true);
    setError(null);
    currentEventId.current = newEventId;

    try {
      const result = await pwaAttendeeService.getAttendees(newEventId, filters);
      setAttendees(result.attendees);
      setMetadata(result.metadata);
      setSelectedAttendees([]); // Clear selection when loading new data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load attendees';
      setError(errorMessage);
      toast({
        title: "Error Loading Attendees",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // Search attendees
  const searchAttendees = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!currentEventId.current) return;

    setLoading(true);
    setError(null);

    try {
      const searchFilters = { ...filters, search: query };
      const result = await pwaAttendeeService.getAttendees(currentEventId.current, searchFilters);
      setAttendees(result.attendees);
      setMetadata(result.metadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Apply filters
  const applyFilters = useCallback(async (newFilters: AttendeeFilterOptions) => {
    setFilters(newFilters);
    
    if (!currentEventId.current) return;

    setLoading(true);
    setError(null);

    try {
      const searchFilters = { ...newFilters, search: searchQuery };
      const result = await pwaAttendeeService.getAttendees(currentEventId.current, searchFilters);
      setAttendees(result.attendees);
      setMetadata(result.metadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Filter failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Selection management
  const selectAttendee = useCallback((attendeeId: string) => {
    setSelectedAttendees(prev => {
      if (!prev.includes(attendeeId)) {
        return [...prev, attendeeId];
      }
      return prev;
    });
  }, []);

  const deselectAttendee = useCallback((attendeeId: string) => {
    setSelectedAttendees(prev => prev.filter(id => id !== attendeeId));
  }, []);

  const selectAllAttendees = useCallback(() => {
    setSelectedAttendees(attendees.map(a => a.attendeeId));
  }, [attendees]);

  const clearSelection = useCallback(() => {
    setSelectedAttendees([]);
  }, []);

  const toggleAttendeeSelection = useCallback((attendeeId: string) => {
    setSelectedAttendees(prev => {
      if (prev.includes(attendeeId)) {
        return prev.filter(id => id !== attendeeId);
      } else {
        return [...prev, attendeeId];
      }
    });
  }, []);

  // Check in attendee
  const checkInAttendee = useCallback(async (
    attendeeId: string, 
    staffId: string, 
    notes?: string
  ): Promise<boolean> => {
    if (!currentEventId.current) return false;

    try {
      const result = await pwaAttendeeService.checkInAttendee(
        currentEventId.current,
        attendeeId,
        staffId,
        notes
      );

      if (result.success) {
        // The service will notify listeners and update the state
        return true;
      } else {
        toast({
          title: "Check-in Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Check-in failed';
      toast({
        title: "Check-in Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Perform bulk operation
  const performBulkOperation = useCallback(async (operation: BulkOperation): Promise<boolean> => {
    if (!currentEventId.current) return false;

    try {
      const result = await pwaAttendeeService.performBulkOperation(currentEventId.current, operation);

      if (result.success) {
        toast({
          title: "Bulk Operation Completed",
          description: `Successfully processed ${operation.attendeeIds.length} attendees.`,
        });
        
        // Refresh data to show updates
        await refreshData();
        return true;
      } else {
        toast({
          title: "Bulk Operation Partial Success",
          description: `Completed with ${result.errors.length} errors. Check details for more info.`,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk operation failed';
      toast({
        title: "Bulk Operation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Export attendee list
  const exportAttendeeList = useCallback(async (format: ExportFormat) => {
    if (!currentEventId.current) return;

    try {
      const result = await pwaAttendeeService.exportAttendeeList(
        currentEventId.current,
        format,
        { ...filters, search: searchQuery }
      );

      if (result.success && result.data && result.filename) {
        // Create download link
        const blob = new Blob([result.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Attendee list exported as ${result.filename}`,
        });
      } else {
        toast({
          title: "Export Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      toast({
        title: "Export Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [filters, searchQuery, toast]);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (!currentEventId.current) return;

    try {
      const result = await pwaAttendeeService.getAttendees(
        currentEventId.current,
        { ...filters, search: searchQuery }
      );
      setAttendees(result.attendees);
      setMetadata(result.metadata);
      setLastSync(new Date());
    } catch (err) {
      // Silent refresh failure - don't show toast to avoid spam
      console.error('Failed to refresh data:', err);
    }
  }, [filters, searchQuery]);

  // Utility functions
  const getAttendeeById = useCallback((attendeeId: string): PWAAttendeeInfo | undefined => {
    return attendees.find(a => a.attendeeId === attendeeId);
  }, [attendees]);

  const getCheckedInCount = useCallback((): number => {
    return attendees.filter(a => a.isCheckedIn).length;
  }, [attendees]);

  const getVIPCount = useCallback((): number => {
    return attendees.filter(a => a.isVIP).length;
  }, [attendees]);

  const getCapacityUtilization = useCallback((): number => {
    if (attendees.length === 0) return 0;
    return (getCheckedInCount() / attendees.length) * 100;
  }, [attendees, getCheckedInCount]);

  // Load attendees when eventId changes
  useEffect(() => {
    if (eventId && eventId !== currentEventId.current) {
      loadAttendees(eventId);
    }
  }, [eventId, loadAttendees]);

  return {
    // Data
    attendees,
    metadata,
    selectedAttendees,
    
    // State
    loading,
    error,
    searchQuery,
    filters,
    isOffline,
    lastSync,
    
    // Actions
    loadAttendees,
    searchAttendees,
    setFilters: applyFilters,
    selectAttendee,
    deselectAttendee,
    selectAllAttendees,
    clearSelection,
    toggleAttendeeSelection,
    
    // Operations
    checkInAttendee,
    performBulkOperation,
    exportAttendeeList,
    refreshData,
    
    // Utilities
    getAttendeeById,
    getCheckedInCount,
    getVIPCount,
    getCapacityUtilization,
  };
} 