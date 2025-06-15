import { useState, useEffect, useCallback } from 'react';
import { platformAnalyticsService, PlatformAnalytics } from '@/services/platformAnalyticsService';
import { toast } from 'sonner';

interface UsePlatformAnalyticsReturn {
  analytics: PlatformAnalytics | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: (startDate?: string, endDate?: string) => Promise<void>;
}

export const usePlatformAnalytics = (): UsePlatformAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await platformAnalyticsService.getPlatformAnalytics(startDate, endDate);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to fetch platform analytics:', err);
      setError(err.message || 'Failed to fetch platform analytics');
      toast.error(err.message || 'Failed to fetch platform analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  };
}; 