import { useState, useEffect, useCallback } from 'react';
import { 
  pwaAttendeeService, 
  PWAAttendeeInfo, 
  AttendeeFilters, 
  AttendeeSortOptions,
  AttendeeExport 
} from '../services/pwaAttendeeService';
import { useToast } from './use-toast';

interface UsePWAAttendeesReturn {
  // State
  attendees: PWAAttendeeInfo[];
  filteredAttendees: PWAAttendeeInfo[];
  selectedAttendees: string[];
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  lastSyncTime: Date | null;
  
  // Stats
  stats: {
    total: number;
    checkedIn: number;
    notCheckedIn: number;
    vipCount: number;
    compTickets: number;
    revenueTotal: number;
    ticketTypes: Record<string, number>;
    checkinRate: number;
  };
  
  // Filters and Search
  filters: AttendeeFilters;
  sortOptions: AttendeeSortOptions;
  
  // Actions
  loadAttendees: (eventId: string) => Promise<void>;
  searchAttendees: (searchTerm: string) => void;
  setFilters: (filters: AttendeeFilters) => void;
  setSortOptions: (sortOptions: AttendeeSortOptions) => void;
  
  // Selection
  selectAttendee: (attendeeId: string) => void;
  selectAllAttendees: () => void;
  clearSelection: () => void;
  toggleAttendeeSelection: (attendeeId: string) => void;
  
  // Bulk Operations
  bulkCheckin: (notes?: string) => Promise<void>;
  exportAttendees: (format: 'csv' | 'json', fields: string[]) => Promise<string>;
  
  // Individual Actions
  getAttendeeDetails: (attendeeId: string) => Promise<PWAAttendeeInfo | null>;
  
  // Sync and Offline
  syncData: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Utilities
  getTicketTypes: () => string[];
  getFilteredCount: () => number;
  isAttendeeSelected: (attendeeId: string) => boolean;
}

export const usePWAAttendees = (eventId: string): UsePWAAttendeesReturn => {
  const [attendees, setAttendees] = useState<PWAAttendeeInfo[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<PWAAttendeeInfo[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const [filters, setFiltersState] = useState<AttendeeFilters>({
    searchTerm: '',
    checkinStatus: 'all'
  });
  
  const [sortOptions, setSortOptionsState] = useState<AttendeeSortOptions>({
    field: 'name',
    direction: 'asc'
  });
  
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    notCheckedIn: 0,
    vipCount: 0,
    compTickets: 0,
    revenueTotal: 0,
    ticketTypes: {} as Record<string, number>,
    checkinRate: 0
  });

  const { toast } = useToast();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load attendees
  const loadAttendees = useCallback(async (eventId: string) => {
    if (!eventId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load mock data if needed (development)
      if (attendees.length === 0) {
        await pwaAttendeeService.loadMockAttendees(eventId);
      }
      
      const loadedAttendees = await pwaAttendeeService.getAllAttendees(eventId);
      setAttendees(loadedAttendees);
      
      // Update stats
      const eventStats = await pwaAttendeeService.getEventStats(eventId);
      setStats(eventStats);
      
      setLastSyncTime(pwaAttendeeService.getLastSyncTime());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendees');
      toast({
        title: "Error",
        description: "Failed to load attendees. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [attendees.length, toast]);

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(async () => {
    if (!eventId) return;
    
    try {
      let filtered = await pwaAttendeeService.filterAttendees(eventId, filters);
      filtered = await pwaAttendeeService.sortAttendees(filtered, sortOptions);
      setFilteredAttendees(filtered);
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  }, [eventId, filters, sortOptions]);

  // Update filtered attendees when filters or sort options change
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Search attendees
  const searchAttendees = useCallback((searchTerm: string) => {
    setFilters({ ...filters, searchTerm });
  }, [filters]);

  // Set filters
  const setFilters = useCallback((newFilters: AttendeeFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Set sort options
  const setSortOptions = useCallback((newSortOptions: AttendeeSortOptions) => {
    setSortOptionsState(newSortOptions);
  }, []);

  // Selection management
  const selectAttendee = useCallback((attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  }, []);

  const selectAllAttendees = useCallback(() => {
    const allIds = filteredAttendees.map(a => a.id);
    setSelectedAttendees(allIds);
  }, [filteredAttendees]);

  const clearSelection = useCallback(() => {
    setSelectedAttendees([]);
  }, []);

  const toggleAttendeeSelection = useCallback((attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  }, []);

  // Bulk operations
  const bulkCheckin = useCallback(async (notes?: string) => {
    if (selectedAttendees.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select attendees to check in.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const staffId = 'current-staff-001'; // Would come from auth context
      const result = await pwaAttendeeService.bulkCheckin(
        selectedAttendees, 
        staffId, 
        notes
      );
      
      if (result.success.length > 0) {
        toast({
          title: "Bulk Check-in Successful",
          description: `Checked in ${result.success.length} attendees.`,
        });
        
        // Refresh data
        await loadAttendees(eventId);
        clearSelection();
      }
      
      if (result.failed.length > 0) {
        toast({
          title: "Partial Success",
          description: `${result.failed.length} attendees could not be checked in.`,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to perform bulk check-in.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedAttendees, toast, loadAttendees, eventId, clearSelection]);

  // Export attendees
  const exportAttendees = useCallback(async (
    format: 'csv' | 'json', 
    fields: string[]
  ): Promise<string> => {
    const exportConfig: AttendeeExport = {
      format,
      fields,
      attendees: selectedAttendees.length > 0 
        ? filteredAttendees.filter(a => selectedAttendees.includes(a.id))
        : filteredAttendees
    };
    
    try {
      const exportData = await pwaAttendeeService.exportAttendees(exportConfig);
      
      toast({
        title: "Export Successful",
        description: `Exported ${exportConfig.attendees.length} attendees in ${format.toUpperCase()} format.`,
      });
      
      return exportData;
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to export attendees.",
        variant: "destructive"
      });
      throw err;
    }
  }, [selectedAttendees, filteredAttendees, toast]);

  // Get attendee details
  const getAttendeeDetails = useCallback(async (attendeeId: string) => {
    try {
      return await pwaAttendeeService.getAttendeeById(attendeeId);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load attendee details.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Sync data
  const syncData = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync while offline.",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await pwaAttendeeService.syncWithServer();
      if (success) {
        setLastSyncTime(new Date());
        toast({
          title: "Sync Successful",
          description: "Data synchronized with server.",
        });
      } else {
        throw new Error('Sync failed');
      }
    } catch (err) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with server.",
        variant: "destructive"
      });
    }
  }, [isOnline, toast]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadAttendees(eventId);
  }, [loadAttendees, eventId]);

  // Utility functions
  const getTicketTypes = useCallback(() => {
    const types = new Set(attendees.map(a => a.ticketType));
    return Array.from(types);
  }, [attendees]);

  const getFilteredCount = useCallback(() => {
    return filteredAttendees.length;
  }, [filteredAttendees]);

  const isAttendeeSelected = useCallback((attendeeId: string) => {
    return selectedAttendees.includes(attendeeId);
  }, [selectedAttendees]);

  // Auto-load attendees when eventId changes
  useEffect(() => {
    if (eventId) {
      loadAttendees(eventId);
    }
  }, [eventId, loadAttendees]);

  return {
    // State
    attendees,
    filteredAttendees,
    selectedAttendees,
    isLoading,
    error,
    isOnline,
    lastSyncTime,
    stats,
    
    // Filters and Search
    filters,
    sortOptions,
    
    // Actions
    loadAttendees,
    searchAttendees,
    setFilters,
    setSortOptions,
    
    // Selection
    selectAttendee,
    selectAllAttendees,
    clearSelection,
    toggleAttendeeSelection,
    
    // Bulk Operations
    bulkCheckin,
    exportAttendees,
    
    // Individual Actions
    getAttendeeDetails,
    
    // Sync and Offline
    syncData,
    refreshData,
    
    // Utilities
    getTicketTypes,
    getFilteredCount,
    isAttendeeSelected
  };
};