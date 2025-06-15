import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  attendeeReportService, 
  AttendeeReportInfo, 
  AttendeeAnalytics, 
  AttendeeFilterOptions, 
  BulkOperation, 
  ExportConfig,
  PrivacyAuditRecord,
  AttendeeProfile,
  AttendeeFilters,
  AttendeeSort,
  AttendeeActivity
} from '../services/attendeeReportService';

interface UseAttendeeReportResult {
  // Data
  attendees: AttendeeReportInfo[];
  analytics: AttendeeAnalytics | null;
  selectedAttendees: string[];
  filteredCount: number;
  
  // Loading states
  isLoading: boolean;
  isExporting: boolean;
  isPerformingBulkOperation: boolean;
  isRefreshing: boolean;
  
  // Error states
  error: string | null;
  exportError: string | null;
  
  // Filters and search
  filters: AttendeeFilters;
  searchQuery: string;
  
  // Actions
  loadAttendees: (eventId: string, staffId?: string, justification?: string) => Promise<void>;
  refreshAttendees: () => Promise<void>;
  searchAttendees: (query: string, fields?: string[]) => Promise<void>;
  updateFilters: (newFilters: Partial<AttendeeFilters>) => void;
  clearFilters: () => void;
  
  // Selection management
  selectAttendee: (attendeeId: string) => void;
  deselectAttendee: (attendeeId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleAttendeeSelection: (attendeeId: string) => void;
  
  // Individual attendee operations
  getAttendeeDetails: (attendeeId: string) => Promise<AttendeeReportInfo | null>;
  updateAttendee: (attendeeId: string, updates: Partial<AttendeeReportInfo>, justification: string) => Promise<boolean>;
  
  // Bulk operations
  performBulkOperation: (operation: Omit<BulkOperation, 'attendeeIds'>) => Promise<boolean>;
  
  // Export functionality
  exportAttendees: (config: Omit<ExportConfig, 'filterOptions'>, justification: string) => Promise<void>;
  
  // Privacy and compliance
  getPrivacyAuditLog: (attendeeId?: string, dateRange?: { start: Date; end: Date }) => Promise<PrivacyAuditRecord[]>;
  
  // Utility functions
  getFilteredAttendees: () => AttendeeReportInfo[];
  getAttendeeCount: () => number;
  getCheckedInCount: () => number;
  getVIPCount: () => number;
  
  // New data
  selectedAttendee: AttendeeProfile | null;
  activities: AttendeeActivity[];
  
  // Pagination
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  
  // New actions
  loadAnalytics: (eventId: string) => Promise<void>;
  loadAttendeeDetails: (attendeeId: string) => Promise<void>;
  loadAttendeeActivities: (attendeeId: string) => Promise<void>;
  addTagToSelected: (tag: string) => Promise<void>;
  removeTagFromSelected: (tag: string) => Promise<void>;
  addNoteToSelected: (note: string) => Promise<void>;
  setVipStatusForSelected: (isVip: boolean) => Promise<void>;
  exportSelected: (eventId: string, format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  
  // New states
  loading: boolean;
  exportProgress: number;
}

export const useAttendeeReport = (
  eventId: string,
  staffId?: string,
  autoLoad: boolean = true
): UseAttendeeReportResult => {
  // State management
  const [attendees, setAttendees] = useState<AttendeeReportInfo[]>([]);
  const [analytics, setAnalytics] = useState<AttendeeAnalytics | null>(null);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPerformingBulkOperation, setIsPerformingBulkOperation] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AttendeeFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeProfile | null>(null);
  const [activities, setActivities] = useState<AttendeeActivity[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Load attendees data
  const loadAttendees = useCallback(async (
    eventIdToLoad: string, 
    staffIdToUse?: string, 
    justification?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await attendeeReportService.getAttendees(
        eventIdToLoad, 
        filters, 
        staffIdToUse || staffId, 
        justification
      );

      setAttendees(result.attendees);
      setAnalytics(result.analytics);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load attendees';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, staffId]);

  // Refresh attendees data
  const refreshAttendees = useCallback(async () => {
    if (!eventId) return;
    
    setIsRefreshing(true);
    try {
      await loadAttendees(eventId, staffId);
      toast.success('Attendee data refreshed');
    } finally {
      setIsRefreshing(false);
    }
  }, [eventId, staffId, loadAttendees]);

  // Search attendees
  const searchAttendees = useCallback(async (query: string, fields?: string[]) => {
    try {
      setSearchQuery(query);
      
      if (!query.trim()) {
        // If search is empty, reload all attendees with current filters
        await loadAttendees(eventId, staffId);
        return;
      }

      const results = await attendeeReportService.searchAttendees(
        eventId, 
        query, 
        fields, 
        staffId
      );

      setAttendees(results);
      
      // Recalculate analytics for search results
      if (analytics) {
        // You could implement a separate analytics calculation for search results
        // For now, we'll keep the original analytics
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [eventId, staffId, analytics, loadAttendees]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AttendeeFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Reload data with new filters
    if (eventId) {
      loadAttendees(eventId, staffId);
    }
  }, [filters, eventId, staffId, loadAttendees]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    
    if (eventId) {
      loadAttendees(eventId, staffId);
    }
  }, [eventId, staffId, loadAttendees]);

  // Selection management
  const selectAttendee = useCallback((attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) ? prev : [...prev, attendeeId]
    );
  }, []);

  const deselectAttendee = useCallback((attendeeId: string) => {
    setSelectedAttendees(prev => prev.filter(id => id !== attendeeId));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedAttendees(attendees.map(a => a.attendeeId));
  }, [attendees]);

  const deselectAll = useCallback(() => {
    setSelectedAttendees([]);
  }, []);

  const toggleAttendeeSelection = useCallback((attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  }, []);

  // Get attendee details
  const getAttendeeDetails = useCallback(async (attendeeId: string): Promise<AttendeeReportInfo | null> => {
    try {
      return await attendeeReportService.getAttendeeDetails(
        eventId, 
        attendeeId, 
        staffId, 
        'Viewing detailed attendee information'
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get attendee details';
      toast.error(errorMessage);
      return null;
    }
  }, [eventId, staffId]);

  // Update attendee
  const updateAttendee = useCallback(async (
    attendeeId: string, 
    updates: Partial<AttendeeReportInfo>, 
    justification: string
  ): Promise<boolean> => {
    try {
      const result = await attendeeReportService.updateAttendee(
        eventId, 
        attendeeId, 
        updates, 
        staffId || 'unknown-staff', 
        justification
      );

      if (result.success) {
        toast.success('Attendee updated successfully');
        await refreshAttendees(); // Refresh to get updated data
        return true;
      } else {
        toast.error(result.error || 'Failed to update attendee');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update attendee';
      toast.error(errorMessage);
      return false;
    }
  }, [eventId, staffId, refreshAttendees]);

  // Perform bulk operations
  const performBulkOperation = useCallback(async (
    operation: Omit<BulkOperation, 'attendeeIds'>
  ): Promise<boolean> => {
    if (selectedAttendees.length === 0) {
      toast.error('No attendees selected');
      return false;
    }

    try {
      setIsPerformingBulkOperation(true);

      const fullOperation: BulkOperation = {
        ...operation,
        attendeeIds: selectedAttendees,
        staffId: staffId || 'unknown-staff'
      };

      const result = await attendeeReportService.performBulkOperation(eventId, fullOperation);

      if (result.success) {
        toast.success(`Bulk operation completed successfully on ${selectedAttendees.length} attendees`);
        setSelectedAttendees([]); // Clear selection
        await refreshAttendees(); // Refresh data
        return true;
      } else {
        toast.error(`Bulk operation completed with ${result.errors.length} errors`);
        if (result.errors.length > 0) {
          console.error('Bulk operation errors:', result.errors);
        }
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk operation failed';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsPerformingBulkOperation(false);
    }
  }, [selectedAttendees, eventId, staffId, refreshAttendees]);

  // Export attendees
  const exportAttendees = useCallback(async (
    config: Omit<ExportConfig, 'filterOptions'>, 
    justification: string
  ) => {
    try {
      setIsExporting(true);
      setExportError(null);

      const fullConfig: ExportConfig = {
        ...config,
        filterOptions: filters
      };

      const result = await attendeeReportService.exportAttendeeData(
        eventId, 
        fullConfig, 
        staffId || 'unknown-staff', 
        justification
      );

      if (result.success && result.data && result.filename) {
        // Create and trigger download
        const blob = new Blob([result.data], { 
          type: config.format === 'csv' ? 'text/csv' : 'application/octet-stream' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Attendee data exported successfully as ${result.filename}`);
      } else {
        const errorMessage = result.error || 'Export failed';
        setExportError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setExportError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [eventId, staffId, filters]);

  // Get privacy audit log
  const getPrivacyAuditLog = useCallback(async (
    attendeeId?: string, 
    dateRange?: { start: Date; end: Date }
  ): Promise<PrivacyAuditRecord[]> => {
    try {
      return await attendeeReportService.getPrivacyAuditLog(
        attendeeId, 
        staffId, 
        dateRange
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get audit log';
      toast.error(errorMessage);
      return [];
    }
  }, [staffId]);

  // Utility functions
  const getFilteredAttendees = useCallback(() => attendees, [attendees]);
  
  const getAttendeeCount = useCallback(() => attendees.length, [attendees]);
  
  const getCheckedInCount = useCallback(() => 
    attendees.filter(a => a.isCheckedIn).length, [attendees]
  );
  
  const getVIPCount = useCallback(() => 
    attendees.filter(a => a.isVIP).length, [attendees]
  );

  // Auto-load data on mount or eventId change
  useEffect(() => {
    if (autoLoad && eventId && !isLoading) {
      loadAttendees(eventId, staffId);
    }
  }, [eventId, autoLoad, loadAttendees, staffId, isLoading]);

  // Listen to service events for real-time updates
  useEffect(() => {
    const handleServiceEvent = (event: any) => {
      switch (event.type) {
        case 'attendee_checkin_updated':
          if (event.data.eventId === eventId) {
            refreshAttendees();
          }
          break;
        case 'attendee_updated':
          if (event.data.eventId === eventId) {
            refreshAttendees();
          }
          break;
        case 'bulk_operation_completed':
          if (event.data.eventId === eventId) {
            toast.success(`Bulk ${event.data.operation} completed: ${event.data.successCount} success, ${event.data.errorCount} errors`);
          }
          break;
      }
    };

    attendeeReportService.addEventListener(handleServiceEvent);

    return () => {
      attendeeReportService.removeEventListener(handleServiceEvent);
    };
  }, [eventId, refreshAttendees]);

  // New actions
  const loadAnalytics = useCallback(async (eventIdParam?: string) => {
    const targetEventId = eventIdParam || eventId;
    if (!targetEventId) return;

    try {
      const analytics = await attendeeReportService.getAttendeeAnalytics(targetEventId);
      setAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [eventId]);

  const loadAttendeeDetails = useCallback(async (attendeeId: string) => {
    setLoading(true);

    try {
      const attendee = await attendeeReportService.getAttendeeProfile(attendeeId);
      setSelectedAttendee(attendee);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load attendee details');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAttendeeActivities = useCallback(async (attendeeId: string) => {
    try {
      const activities = await attendeeReportService.getAttendeeActivities(attendeeId);
      setActivities(activities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  }, []);

  const addTagToSelected = useCallback(async (tag: string) => {
    await performBulkOperation({
      type: 'add_tag',
      data: { tag }
    });
  }, [performBulkOperation]);

  const removeTagFromSelected = useCallback(async (tag: string) => {
    await performBulkOperation({
      type: 'remove_tag',
      data: { tag }
    });
  }, [performBulkOperation]);

  const addNoteToSelected = useCallback(async (note: string) => {
    await performBulkOperation({
      type: 'add_note',
      data: { note }
    });
  }, [performBulkOperation]);

  const setVipStatusForSelected = useCallback(async (isVip: boolean) => {
    await performBulkOperation({
      type: isVip ? 'set_vip' : 'remove_vip'
    });
  }, [performBulkOperation]);

  const exportSelected = useCallback(async (eventIdParam: string, format: 'csv' | 'excel' | 'pdf') => {
    if (selectedAttendees.length === 0) return;

    await exportAttendees({
      format,
      fields: ['firstName', 'lastName', 'email', 'phone', 'ticketType', 'purchaseDate', 'checkInStatus'],
      filters: {
        // Filter to only selected attendees - in a real implementation,
        // this would be handled differently
      }
    }, '');
  }, [selectedAttendees, exportAttendees]);

  return {
    // Data
    attendees,
    analytics,
    selectedAttendees,
    filteredCount: attendees.length,
    
    // Loading states
    isLoading,
    isExporting,
    isPerformingBulkOperation,
    isRefreshing,
    
    // Error states
    error,
    exportError,
    
    // Filters and search
    filters,
    searchQuery,
    
    // Actions
    loadAttendees,
    refreshAttendees,
    searchAttendees,
    updateFilters,
    clearFilters,
    
    // Selection management
    selectAttendee,
    deselectAttendee,
    selectAll,
    deselectAll,
    toggleAttendeeSelection,
    
    // Individual attendee operations
    getAttendeeDetails,
    updateAttendee,
    
    // Bulk operations
    performBulkOperation,
    
    // Export functionality
    exportAttendees,
    
    // Privacy and compliance
    getPrivacyAuditLog,
    
    // Utility functions
    getFilteredAttendees,
    getAttendeeCount,
    getCheckedInCount,
    getVIPCount,
    
    // New data
    selectedAttendee,
    activities,
    
    // Pagination
    page,
    totalPages,
    total,
    limit,
    
    // New actions
    loadAnalytics,
    loadAttendeeDetails,
    loadAttendeeActivities,
    addTagToSelected,
    removeTagFromSelected,
    addNoteToSelected,
    setVipStatusForSelected,
    exportSelected,
    
    // New states
    loading,
    exportProgress
  };
}; 