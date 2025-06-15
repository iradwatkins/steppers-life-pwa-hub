import { useState, useEffect, useCallback } from 'react';
import { adminUserService, User } from '@/services/adminUserService';
import { toast } from 'sonner';

interface UseUsersOptions {
  query?: string;
  role?: User['role'] | '';
  status?: User['status'] | '';
  page?: number;
  limit?: number;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
}

interface UseUsersReturn {
  users: User[];
  totalUsers: number;
  loading: boolean;
  error: string | null;
  fetchUsers: (options?: UseUsersOptions) => Promise<void>;
  currentPage: number;
  setPage: (page: number) => void;
  currentLimit: number;
  setLimit: (limit: number) => void;
  currentSortBy: keyof User;
  setSortBy: (sortBy: keyof User) => void;
  currentSortOrder: 'asc' | 'desc';
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  currentQuery: string;
  setQuery: (query: string) => void;
  currentRoleFilter: User['role'] | '';
  setRoleFilter: (role: User['role'] | '') => void;
  currentStatusFilter: User['status'] | '';
  setStatusFilter: (status: User['status'] | '') => void;
}

export const useUsers = (initialOptions?: UseUsersOptions): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(initialOptions?.page || 1);
  const [currentLimit, setCurrentLimit] = useState(initialOptions?.limit || 10);
  const [currentSortBy, setCurrentSortBy] = useState<keyof User>(initialOptions?.sortBy || 'registrationDate');
  const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>(initialOptions?.sortOrder || 'desc');
  const [currentQuery, setCurrentQuery] = useState(initialOptions?.query || '');
  const [currentRoleFilter, setCurrentRoleFilter] = useState<User['role'] | ''>((initialOptions?.role || ''));
  const [currentStatusFilter, setCurrentStatusFilter] = useState<User['status'] | ''>((initialOptions?.status || ''));

  const fetchUsers = useCallback(async (options?: UseUsersOptions) => {
    setLoading(true);
    setError(null);
    try {
      const { users: fetchedUsers, total } = await adminUserService.getUsers(
        options?.query !== undefined ? options.query : currentQuery,
        options?.role !== undefined ? options.role : currentRoleFilter,
        options?.status !== undefined ? options.status : currentStatusFilter,
        options?.page !== undefined ? options.page : currentPage,
        options?.limit !== undefined ? options.limit : currentLimit,
        options?.sortBy !== undefined ? options.sortBy : currentSortBy,
        options?.sortOrder !== undefined ? options.sortOrder : currentSortOrder
      );
      setUsers(fetchedUsers);
      setTotalUsers(total);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to fetch users');
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, currentSortBy, currentSortOrder, currentQuery, currentRoleFilter, currentStatusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchUsers({ page });
  }, [fetchUsers]);

  const setLimit = useCallback((limit: number) => {
    setCurrentLimit(limit);
    setCurrentPage(1); // Reset to first page when limit changes
    fetchUsers({ limit, page: 1 });
  }, [fetchUsers]);

  const setSortBy = useCallback((sortBy: keyof User) => {
    setCurrentSortBy(sortBy);
    fetchUsers({ sortBy });
  }, [fetchUsers]);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    setCurrentSortOrder(sortOrder);
    fetchUsers({ sortOrder });
  }, [fetchUsers]);

  const setQuery = useCallback((query: string) => {
    setCurrentQuery(query);
    setCurrentPage(1); // Reset to first page on new search query
    fetchUsers({ query, page: 1 });
  }, [fetchUsers]);

  const setRoleFilter = useCallback((role: User['role'] | '') => {
    setCurrentRoleFilter(role);
    setCurrentPage(1); // Reset to first page on new filter
    fetchUsers({ role, page: 1 });
  }, [fetchUsers]);

  const setStatusFilter = useCallback((status: User['status'] | '') => {
    setCurrentStatusFilter(status);
    setCurrentPage(1); // Reset to first page on new filter
    fetchUsers({ status, page: 1 });
  }, [fetchUsers]);

  return {
    users,
    totalUsers,
    loading,
    error,
    fetchUsers,
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
    currentRoleFilter,
    setRoleFilter,
    currentStatusFilter,
    setStatusFilter,
  };
}; 