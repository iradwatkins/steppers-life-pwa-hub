import { useState, useEffect, useCallback } from 'react';
import { 
  AttendeeReportService, 
  AttendeeInfo, 
  AttendeeAnalytics, 
  FilterOptions,
  BulkOperation 
} from '@/services/attendeeReportService';
import { toast } from 'sonner';

export interface UseAttendeeReportReturn {
  attendees: AttendeeInfo[];
  analytics: AttendeeAnalytics | null;
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  selectedAttendees: Set<string>;
  setSelectedAttendees: (attendees: Set<string>) => void;
  selectAll: () => void;
  clearSelection: () => void;
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'excel' | 'pdf', fields?: string[]) => Promise<void>;
  executeBulkOperation: (operation: BulkOperation) => Promise<void>;
  updateAttendeeNotes: (attendeeId: string, notes: string) => Promise<void>;
  checkInAttendee: (attendeeId: string) => Promise<void>;
  getAttendeeDetails: (attendeeId: string) => Promise<AttendeeInfo | null>;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  paginatedAttendees: AttendeeInfo[];
  
  // Sorting
  sortField: keyof AttendeeInfo;
  sortDirection: 'asc' | 'desc';
  setSorting: (field: keyof AttendeeInfo, direction: 'asc' | 'desc') => void;
  
  lastRefresh: Date | null;
}

export const useAttendeeReport = (eventId: string): UseAttendeeReportReturn => {
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([]);
  const [analytics, setAnalytics] = useState<AttendeeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortField, setSortField] = useState<keyof AttendeeInfo>('purchaseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      const [attendeesData, analyticsData] = await Promise.all([
        AttendeeReportService.getEventAttendees(eventId, filters),
        AttendeeReportService.getAttendeeAnalytics(eventId)
      ]);

      setAttendees(attendeesData);
      setAnalytics(analyticsData);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attendee data';
      setError(errorMessage);
      toast.error('Failed to load attendee data', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, filters]);

  const refreshData = useCallback(async () => {
    await fetchData();
    toast.success('Attendee data refreshed');
  }, [fetchData]);

  const exportData = useCallback(async (format: 'csv' | 'excel' | 'pdf', fields?: string[]) => {
    if (!eventId) return;

    try {
      const exportedData = await AttendeeReportService.exportAttendeeData(eventId, format, filters, fields);
      
      // Create download
      const mimeType = format === 'csv' ? 'text/csv' : 'application/octet-stream';
      const blob = new Blob([exportedData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendees-${eventId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Attendee data exported as ${format.toUpperCase()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      toast.error('Export failed', {
        description: errorMessage
      });
    }
  }, [eventId, filters]);

  const executeBulkOperation = useCallback(async (operation: BulkOperation) => {
    try {
      await AttendeeReportService.executeBulkOperation(operation);
      await refreshData();
      
      const operationNames = {
        check_in: 'check in',
        add_note: 'add notes to',
        update_vip: 'update VIP status for',
        send_notification: 'send notifications to',
        export: 'export'
      };
      
      toast.success(`Successfully ${operationNames[operation.type]} ${operation.attendeeIds.length} attendees`);
      setSelectedAttendees(new Set()); // Clear selection after operation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk operation failed';
      toast.error('Bulk operation failed', {
        description: errorMessage
      });
    }
  }, [refreshData]);

  const updateAttendeeNotes = useCallback(async (attendeeId: string, notes: string) => {
    try {
      await AttendeeReportService.updateAttendeeNotes(attendeeId, notes);
      await refreshData();
      toast.success('Attendee notes updated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notes';
      toast.error('Update failed', {
        description: errorMessage
      });
    }
  }, [refreshData]);

  const checkInAttendee = useCallback(async (attendeeId: string) => {
    try {
      await AttendeeReportService.checkInAttendee(attendeeId);
      await refreshData();
      toast.success('Attendee checked in successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check in attendee';
      toast.error('Check-in failed', {
        description: errorMessage
      });
    }
  }, [refreshData]);

  const getAttendeeDetails = useCallback(async (attendeeId: string) => {
    try {
      return await AttendeeReportService.getAttendeeDetails(attendeeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attendee details';
      toast.error('Failed to load details', {
        description: errorMessage
      });
      return null;
    }
  }, []);

  const selectAll = useCallback(() => {
    setSelectedAttendees(new Set(attendees.map(a => a.id)));
  }, [attendees]);

  const clearSelection = useCallback(() => {
    setSelectedAttendees(new Set());
  }, []);

  const setSorting = useCallback((field: keyof AttendeeInfo, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Sort attendees
  const sortedAttendees = [...attendees].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAttendees.length / pageSize);
  const paginatedAttendees = sortedAttendees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return {
    attendees: sortedAttendees,
    analytics,
    loading,
    error,
    filters,
    setFilters,
    selectedAttendees,
    setSelectedAttendees,
    selectAll,
    clearSelection,
    refreshData,
    exportData,
    executeBulkOperation,
    updateAttendeeNotes,
    checkInAttendee,
    getAttendeeDetails,
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize,
    paginatedAttendees,
    sortField,
    sortDirection,
    setSorting,
    lastRefresh
  };
};