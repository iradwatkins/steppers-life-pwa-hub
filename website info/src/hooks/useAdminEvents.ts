import { useState, useEffect, useCallback } from 'react';
import { adminEventService, AdminEvent } from '@/services/adminEventService';
import { toast } from 'sonner';

interface UseAdminEventsOptions {
  query?: string;
  status?: AdminEvent['status'] | '';
  category?: string;
  organizerId?: string;
  dateRange?: { from?: string; to?: string };
  page?: number;
  limit?: number;
  sortBy?: keyof AdminEvent;
  sortOrder?: 'asc' | 'desc';
}

interface UseAdminEventsReturn {
  events: AdminEvent[];
  totalEvents: number;
  loading: boolean;
  error: string | null;
  fetchEvents: (options?: UseAdminEventsOptions) => Promise<void>;
  currentPage: number;
  setPage: (page: number) => void;
  currentLimit: number;
  setLimit: (limit: number) => void;
  currentSortBy: keyof AdminEvent;
  setSortBy: (sortBy: keyof AdminEvent) => void;
  currentSortOrder: 'asc' | 'desc';
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  currentQuery: string;
  setQuery: (query: string) => void;
  currentStatusFilter: AdminEvent['status'] | '';
  setStatusFilter: (status: AdminEvent['status'] | '') => void;
  currentCategoryFilter: string;
  setCategoryFilter: (category: string) => void;
  currentOrganizerFilter: string;
  setOrganizerFilter: (organizerId: string) => void;
  currentDateRange: { from?: string; to?: string } | undefined;
  setDateRange: (dateRange: { from?: string; to?: string } | undefined) => void;
  categories: string[];
}

export const useAdminEvents = (initialOptions?: UseAdminEventsOptions): UseAdminEventsReturn => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(initialOptions?.page || 1);
  const [currentLimit, setCurrentLimit] = useState(initialOptions?.limit || 10);
  const [currentSortBy, setCurrentSortBy] = useState<keyof AdminEvent>(initialOptions?.sortBy || 'createdAt');
  const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>(initialOptions?.sortOrder || 'desc');
  const [currentQuery, setCurrentQuery] = useState(initialOptions?.query || '');
  const [currentStatusFilter, setCurrentStatusFilter] = useState<AdminEvent['status'] | ''>((initialOptions?.status || ''));
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState(initialOptions?.category || '');
  const [currentOrganizerFilter, setCurrentOrganizerFilter] = useState(initialOptions?.organizerId || '');
  const [currentDateRange, setCurrentDateRange] = useState<{ from?: string; to?: string } | undefined>(initialOptions?.dateRange);

  const fetchEvents = useCallback(async (options?: UseAdminEventsOptions) => {
    setLoading(true);
    setError(null);
    try {
      const { events: fetchedEvents, total } = await adminEventService.getEvents(
        options?.query !== undefined ? options.query : currentQuery,
        options?.status !== undefined ? options.status : currentStatusFilter,
        options?.category !== undefined ? options.category : currentCategoryFilter,
        options?.organizerId !== undefined ? options.organizerId : currentOrganizerFilter,
        options?.dateRange !== undefined ? options.dateRange : currentDateRange,
        options?.page !== undefined ? options.page : currentPage,
        options?.limit !== undefined ? options.limit : currentLimit,
        options?.sortBy !== undefined ? options.sortBy : currentSortBy,
        options?.sortOrder !== undefined ? options.sortOrder : currentSortOrder
      );
      setEvents(fetchedEvents);
      setTotalEvents(total);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.message || 'Failed to fetch events');
      toast.error(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, currentSortBy, currentSortOrder, currentQuery, currentStatusFilter, currentCategoryFilter, currentOrganizerFilter, currentDateRange]);

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await adminEventService.getEventCategories();
      setCategories(fetchedCategories);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      toast.error(err.message || 'Failed to fetch categories');
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [fetchEvents, fetchCategories]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchEvents({ page });
  }, [fetchEvents]);

  const setLimit = useCallback((limit: number) => {
    setCurrentLimit(limit);
    setCurrentPage(1); // Reset to first page when limit changes
    fetchEvents({ limit, page: 1 });
  }, [fetchEvents]);

  const setSortBy = useCallback((sortBy: keyof AdminEvent) => {
    setCurrentSortBy(sortBy);
    fetchEvents({ sortBy });
  }, [fetchEvents]);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    setCurrentSortOrder(sortOrder);
    fetchEvents({ sortOrder });
  }, [fetchEvents]);

  const setQuery = useCallback((query: string) => {
    setCurrentQuery(query);
    setCurrentPage(1); // Reset to first page on new search query
    fetchEvents({ query, page: 1 });
  }, [fetchEvents]);

  const setStatusFilter = useCallback((status: AdminEvent['status'] | '') => {
    setCurrentStatusFilter(status);
    setCurrentPage(1); // Reset to first page on new filter
    fetchEvents({ status, page: 1 });
  }, [fetchEvents]);

  const setCategoryFilter = useCallback((category: string) => {
    setCurrentCategoryFilter(category);
    setCurrentPage(1); // Reset to first page on new filter
    fetchEvents({ category, page: 1 });
  }, [fetchEvents]);

  const setOrganizerFilter = useCallback((organizerId: string) => {
    setCurrentOrganizerFilter(organizerId);
    setCurrentPage(1); // Reset to first page on new filter
    fetchEvents({ organizerId, page: 1 });
  }, [fetchEvents]);

  const setDateRange = useCallback((dateRange: { from?: string; to?: string } | undefined) => {
    setCurrentDateRange(dateRange);
    setCurrentPage(1); // Reset to first page on new filter
    fetchEvents({ dateRange, page: 1 });
  }, [fetchEvents]);

  return {
    events,
    totalEvents,
    loading,
    error,
    fetchEvents,
    currentPage,
    setPage,
    currentLimit,
    setLimit,
    currentSortBy,
    setSortBy,
    currentSortOrder,
    setSortOrder,
    currentQuery,
    setQuery,
    currentStatusFilter,
    setStatusFilter,
    currentCategoryFilter,
    setCategoryFilter,
    currentOrganizerFilter,
    setOrganizerFilter,
    currentDateRange,
    setDateRange,
    categories,
  };
}; 