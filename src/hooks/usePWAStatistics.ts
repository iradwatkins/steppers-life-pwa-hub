import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  pwaStatisticsService, 
  ComprehensiveEventStats, 
  StatisticsAlert,
  EventStatistics 
} from '../services/pwaStatisticsService';

interface UsePWAStatisticsState {
  statistics: ComprehensiveEventStats | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  lastSyncTime: Date | null;
  autoRefreshEnabled: boolean;
  refreshInterval: number;
  alertsEnabled: boolean;
}

interface UsePWAStatisticsActions {
  refreshStatistics: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  toggleAutoRefresh: () => Promise<void>;
  setRefreshInterval: (intervalMs: number) => Promise<void>;
  toggleAlerts: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  exportStatistics: (format: 'json' | 'csv') => Promise<string>;
  clearError: () => void;
}

export interface UsePWAStatisticsReturn extends UsePWAStatisticsState, UsePWAStatisticsActions {
  // Computed values
  capacityUtilization: number;
  revenuePerAttendee: number;
  checkinVelocity: number;
  criticalAlerts: StatisticsAlert[];
  upcomingMilestones: Array<{ percentage: number; remaining: number; description: string }>;
  timeUntilEventFormatted: string;
  peakHourFormatted: string;
  connectionStatus: 'online' | 'offline' | 'syncing' | 'error';
}

export const usePWAStatistics = (eventId: string): UsePWAStatisticsReturn => {
  const [state, setState] = useState<UsePWAStatisticsState>({
    statistics: null,
    loading: true,
    error: null,
    isOnline: navigator.onLine,
    lastSyncTime: null,
    autoRefreshEnabled: true,
    refreshInterval: 30000,
    alertsEnabled: true
  });

  const listenerRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  // Online/offline status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast.success('Connection restored');
      refreshStatistics();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast.warning('Working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load initial settings and statistics
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Load settings
        const settings = await pwaStatisticsService.getSettings();
        
        // Load statistics
        const statistics = await pwaStatisticsService.getEventStatistics(eventId);
        
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            statistics,
            loading: false,
            lastSyncTime: pwaStatisticsService.getLastSyncTime(),
            autoRefreshEnabled: settings.autoRefreshEnabled,
            refreshInterval: settings.refreshIntervalMs,
            alertsEnabled: settings.alertsEnabled
          }));
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load statistics'
          }));
        }
      }
    };

    loadInitialData();
  }, [eventId]);

  // Set up statistics listener
  useEffect(() => {
    const unsubscribe = pwaStatisticsService.addListener((statistics) => {
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          statistics,
          lastSyncTime: new Date(),
          error: null
        }));

        // Show alerts for new critical issues
        const criticalAlerts = statistics.activeAlerts.filter(
          alert => alert.severity === 'critical' && !alert.acknowledged
        );
        
        if (prev.alertsEnabled && criticalAlerts.length > 0) {
          criticalAlerts.forEach(alert => {
            toast.error(alert.message, {
              duration: 10000,
              action: {
                label: 'Acknowledge',
                onClick: () => acknowledgeAlert(alert.id)
              }
            });
          });
        }
      }
    });

    listenerRef.current = unsubscribe;
    return () => {
      if (listenerRef.current) {
        listenerRef.current();
      }
    };
  }, [eventId, state.alertsEnabled]);

  // Auto-refresh management
  useEffect(() => {
    if (state.autoRefreshEnabled && eventId) {
      pwaStatisticsService.startAutoRefresh(eventId);
    } else {
      pwaStatisticsService.stopAutoRefresh();
    }

    return () => {
      pwaStatisticsService.stopAutoRefresh();
    };
  }, [eventId, state.autoRefreshEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      pwaStatisticsService.stopAutoRefresh();
    };
  }, []);

  const refreshStatistics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const statistics = await pwaStatisticsService.getEventStatistics(eventId);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          statistics,
          loading: false,
          lastSyncTime: new Date()
        }));
        
        toast.success('Statistics updated');
      }
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to refresh statistics'
        }));
        
        toast.error('Failed to refresh statistics');
      }
    }
  }, [eventId]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await pwaStatisticsService.acknowledgeAlert(alertId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        statistics: prev.statistics ? {
          ...prev.statistics,
          activeAlerts: prev.statistics.activeAlerts.map(alert =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          )
        } : null
      }));
      
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  }, []);

  const toggleAutoRefresh = useCallback(async () => {
    const newValue = !state.autoRefreshEnabled;
    
    try {
      await pwaStatisticsService.updateSettings({ autoRefreshEnabled: newValue });
      setState(prev => ({ ...prev, autoRefreshEnabled: newValue }));
      
      if (newValue) {
        pwaStatisticsService.startAutoRefresh(eventId);
        toast.success('Auto-refresh enabled');
      } else {
        pwaStatisticsService.stopAutoRefresh();
        toast.success('Auto-refresh disabled');
      }
    } catch (error) {
      console.error('Failed to toggle auto-refresh:', error);
      toast.error('Failed to update auto-refresh setting');
    }
  }, [state.autoRefreshEnabled, eventId]);

  const setRefreshInterval = useCallback(async (intervalMs: number) => {
    try {
      await pwaStatisticsService.updateSettings({ refreshIntervalMs: intervalMs });
      pwaStatisticsService.setRefreshInterval(intervalMs);
      
      setState(prev => ({ ...prev, refreshInterval: intervalMs }));
      toast.success(`Refresh interval set to ${intervalMs / 1000} seconds`);
    } catch (error) {
      console.error('Failed to set refresh interval:', error);
      toast.error('Failed to update refresh interval');
    }
  }, []);

  const toggleAlerts = useCallback(async () => {
    const newValue = !state.alertsEnabled;
    
    try {
      await pwaStatisticsService.updateSettings({ alertsEnabled: newValue });
      setState(prev => ({ ...prev, alertsEnabled: newValue }));
      
      toast.success(newValue ? 'Alerts enabled' : 'Alerts disabled');
    } catch (error) {
      console.error('Failed to toggle alerts:', error);
      toast.error('Failed to update alerts setting');
    }
  }, [state.alertsEnabled]);

  const startAutoRefresh = useCallback(() => {
    pwaStatisticsService.startAutoRefresh(eventId);
  }, [eventId]);

  const stopAutoRefresh = useCallback(() => {
    pwaStatisticsService.stopAutoRefresh();
  }, []);

  const exportStatistics = useCallback(async (format: 'json' | 'csv'): Promise<string> => {
    if (!state.statistics) {
      throw new Error('No statistics available to export');
    }

    try {
      if (format === 'json') {
        return JSON.stringify(state.statistics, null, 2);
      } else {
        // CSV format
        const csvHeaders = [
          'Metric',
          'Value',
          'Percentage',
          'Timestamp'
        ].join(',');

        const csvRows = [
          `Total Tickets Sold,${state.statistics.ticketsSold},,${state.statistics.lastUpdated}`,
          `Checked In,${state.statistics.checkedIn},${state.statistics.checkinRate}%,${state.statistics.lastUpdated}`,
          `Not Checked In,${state.statistics.notCheckedIn},,${state.statistics.lastUpdated}`,
          `Revenue Total,$${state.statistics.revenueTotal.toFixed(2)},,${state.statistics.lastUpdated}`,
          `VIP Count,${state.statistics.vipCount},,${state.statistics.lastUpdated}`,
          `Comp Tickets,${state.statistics.compTickets},,${state.statistics.lastUpdated}`,
          `Current Arrival Rate,${state.statistics.currentArrivalRate}/hour,,${state.statistics.lastUpdated}`
        ];

        return [csvHeaders, ...csvRows].join('\n');
      }
    } catch (error) {
      console.error('Failed to export statistics:', error);
      throw new Error('Failed to export statistics');
    }
  }, [state.statistics]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const capacityUtilization = state.statistics 
    ? Math.round((state.statistics.checkedIn / state.statistics.capacity) * 100)
    : 0;

  const revenuePerAttendee = state.statistics && state.statistics.checkedIn > 0
    ? state.statistics.revenueTotal / state.statistics.checkedIn
    : 0;

  const checkinVelocity = state.statistics
    ? state.statistics.currentArrivalRate
    : 0;

  const criticalAlerts = state.statistics
    ? state.statistics.activeAlerts.filter(alert => alert.severity === 'critical')
    : [];

  const upcomingMilestones = state.statistics
    ? state.statistics.capacityMilestones
        .filter(milestone => !milestone.reached)
        .map(milestone => ({
          percentage: milestone.percentage,
          remaining: Math.max(0, Math.ceil((milestone.percentage / 100) * state.statistics!.capacity) - state.statistics!.checkedIn),
          description: milestone.description
        }))
        .slice(0, 2) // Next 2 milestones
    : [];

  const timeUntilEventFormatted = state.statistics
    ? state.statistics.timeUntilEvent > 0
      ? `${Math.floor(state.statistics.timeUntilEvent / 60)}h ${state.statistics.timeUntilEvent % 60}m`
      : 'Event Started'
    : '--';

  const peakHourFormatted = state.statistics?.arrivalPredictions.predictedPeakHour
    ? new Date(state.statistics.arrivalPredictions.predictedPeakHour).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : '--';

  const connectionStatus: 'online' | 'offline' | 'syncing' | 'error' = 
    state.error ? 'error' :
    !state.isOnline ? 'offline' :
    state.loading ? 'syncing' :
    'online';

  return {
    // State
    statistics: state.statistics,
    loading: state.loading,
    error: state.error,
    isOnline: state.isOnline,
    lastSyncTime: state.lastSyncTime,
    autoRefreshEnabled: state.autoRefreshEnabled,
    refreshInterval: state.refreshInterval,
    alertsEnabled: state.alertsEnabled,

    // Actions
    refreshStatistics,
    acknowledgeAlert,
    toggleAutoRefresh,
    setRefreshInterval,
    toggleAlerts,
    startAutoRefresh,
    stopAutoRefresh,
    exportStatistics,
    clearError,

    // Computed values
    capacityUtilization,
    revenuePerAttendee,
    checkinVelocity,
    criticalAlerts,
    upcomingMilestones,
    timeUntilEventFormatted,
    peakHourFormatted,
    connectionStatus
  };
};