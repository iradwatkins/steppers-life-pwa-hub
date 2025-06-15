import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  pwaStatisticsService, 
  EventStatistics, 
  HourlyPattern, 
  StatisticsAlert,
  MultiEventOverview
} from '../services/pwaStatisticsService';

interface UsePWAStatisticsReturn {
  // Statistics Data
  statistics: EventStatistics | null;
  hourlyPatterns: HourlyPattern[];
  alerts: StatisticsAlert[];
  multiEventOverview: MultiEventOverview | null;
  
  // Loading States
  isLoading: boolean;
  isRefreshing: boolean;
  isSyncing: boolean;
  
  // Error States
  error: string | null;
  
  // Network Status
  isOnline: boolean;
  lastUpdated: string | null;
  
  // Actions
  refreshStatistics: () => Promise<void>;
  loadEventStatistics: (eventId: string) => Promise<void>;
  loadMultiEventOverview: (organizerId: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  
  // Auto-refresh Control
  enableAutoRefresh: () => void;
  disableAutoRefresh: () => void;
  isAutoRefreshEnabled: boolean;
}

export const usePWAStatistics = (initialEventId?: string): UsePWAStatisticsReturn => {
  // State Management
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [hourlyPatterns, setHourlyPatterns] = useState<HourlyPattern[]>([]);
  const [alerts, setAlerts] = useState<StatisticsAlert[]>([]);
  const [multiEventOverview, setMultiEventOverview] = useState<MultiEventOverview | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  
  // Refs
  const currentEventId = useRef<string | null>(initialEventId || null);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeFunctions = useRef<(() => void)[]>([]);

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

  // Subscribe to service events
  useEffect(() => {
    const unsubscribeRefresh = pwaStatisticsService.onStatisticsUpdate(() => {
      if (currentEventId.current && isAutoRefreshEnabled) {
        refreshStatistics();
      }
    });

    const unsubscribeAlert = pwaStatisticsService.onAlertReceived((alert: StatisticsAlert) => {
      setAlerts(prev => [alert, ...prev]);
      
      // Show toast notification for critical alerts
      if (alert.severity === 'critical') {
        toast.error(alert.title, {
          description: alert.message,
          duration: 10000
        });
      } else if (alert.severity === 'warning') {
        toast.warning(alert.title, {
          description: alert.message,
          duration: 5000
        });
      }
    });

    const unsubscribeSync = pwaStatisticsService.onSyncCompleted(() => {
      setIsSyncing(false);
      setLastUpdated(new Date().toLocaleTimeString());
      
      if (currentEventId.current) {
        loadEventStatistics(currentEventId.current);
      }
    });

    unsubscribeFunctions.current = [unsubscribeRefresh, unsubscribeAlert, unsubscribeSync];

    return () => {
      unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
    };
  }, [isAutoRefreshEnabled]);

  // Load event statistics
  const loadEventStatistics = useCallback(async (eventId: string) => {
    if (!eventId) return;
    
    setIsLoading(true);
    setError(null);
    currentEventId.current = eventId;

    try {
      // Load all data in parallel
      const [statisticsData, patternsData, alertsData] = await Promise.all([
        pwaStatisticsService.getEventStatistics(eventId),
        pwaStatisticsService.getHourlyPatterns(eventId),
        pwaStatisticsService.getStatisticsAlerts(eventId)
      ]);

      setStatistics(statisticsData);
      setHourlyPatterns(patternsData);
      setAlerts(alertsData);
      setLastUpdated(new Date().toLocaleTimeString());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      
      if (!isOnline) {
        toast.error('Offline', {
          description: 'Using cached data. Will sync when online.',
          duration: 3000
        });
      } else {
        toast.error('Error', {
          description: errorMessage,
          duration: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  // Load multi-event overview
  const loadMultiEventOverview = useCallback(async (organizerId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const overview = await pwaStatisticsService.getMultiEventOverview(organizerId);
      setMultiEventOverview(overview);
      setLastUpdated(new Date().toLocaleTimeString());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load overview';
      setError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh current statistics
  const refreshStatistics = useCallback(async () => {
    if (!currentEventId.current) return;
    
    setIsRefreshing(true);
    setError(null);

    try {
      await loadEventStatistics(currentEventId.current);
      
      if (isOnline) {
        toast.success('Updated', {
          description: 'Statistics refreshed successfully',
          duration: 2000
        });
      }
    } catch (err) {
      // Error handling is done in loadEventStatistics
    } finally {
      setIsRefreshing(false);
    }
  }, [loadEventStatistics, isOnline]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await pwaStatisticsService.acknowledgeAlert(alertId);
      
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, acknowledged: true }
            : alert
        )
      );

      toast.success('Alert acknowledged', {
        duration: 2000
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge alert';
      toast.error('Error', {
        description: errorMessage,
        duration: 3000
      });
    }
  }, []);

  // Auto-refresh control
  const enableAutoRefresh = useCallback(() => {
    setIsAutoRefreshEnabled(true);
    
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
    
    refreshInterval.current = setInterval(() => {
      if (currentEventId.current && isOnline) {
        refreshStatistics();
      }
    }, 30000); // Refresh every 30 seconds

  }, [refreshStatistics, isOnline]);

  const disableAutoRefresh = useCallback(() => {
    setIsAutoRefreshEnabled(false);
    
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (isAutoRefreshEnabled) {
      enableAutoRefresh();
    } else {
      disableAutoRefresh();
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [isAutoRefreshEnabled, enableAutoRefresh, disableAutoRefresh]);

  // Load initial data
  useEffect(() => {
    if (initialEventId) {
      loadEventStatistics(initialEventId);
    }
  }, [initialEventId, loadEventStatistics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return {
    // Data
    statistics,
    hourlyPatterns,
    alerts,
    multiEventOverview,
    
    // Loading States
    isLoading,
    isRefreshing,
    isSyncing,
    
    // Error States
    error,
    
    // Network Status
    isOnline,
    lastUpdated,
    
    // Actions
    refreshStatistics,
    loadEventStatistics,
    loadMultiEventOverview,
    acknowledgeAlert,
    
    // Auto-refresh Control
    enableAutoRefresh,
    disableAutoRefresh,
    isAutoRefreshEnabled
  };
}; 