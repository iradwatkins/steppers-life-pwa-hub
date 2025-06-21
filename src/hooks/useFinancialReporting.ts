import { useState, useEffect, useCallback } from 'react';
import { 
  FinancialReportingService,
  RevenueBreakdown,
  PaymentMethodAnalytics,
  TicketPricingAnalysis,
  ProfitLossStatement,
  RevenueTrend,
  TaxReport,
  FinancialForecast,
  FinancialAlerts
} from '@/services/financialReportingService';
import { toast } from 'sonner';

export interface UseFinancialReportingReturn {
  // Data
  revenueBreakdown: RevenueBreakdown | null;
  paymentMethodAnalytics: PaymentMethodAnalytics[];
  ticketPricingAnalysis: TicketPricingAnalysis[];
  profitLossStatement: ProfitLossStatement | null;
  revenueTrends: RevenueTrend[];
  taxReport: TaxReport | null;
  financialForecast: FinancialForecast[];
  financialAlerts: FinancialAlerts[];
  
  // State
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  
  // Actions
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'excel' | 'pdf', reportType: 'revenue' | 'pl_statement' | 'tax_report' | 'full_report') => Promise<void>;
  acknowledgeAlert: (alertIndex: number) => void;
  
  // Settings
  forecastMonths: number;
  setForecastMonths: (months: number) => void;
  trendDays: number;
  setTrendDays: (days: number) => void;
  
  // Auto-refresh
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
}

export const useFinancialReporting = (eventId: string): UseFinancialReportingReturn => {
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [paymentMethodAnalytics, setPaymentMethodAnalytics] = useState<PaymentMethodAnalytics[]>([]);
  const [ticketPricingAnalysis, setTicketPricingAnalysis] = useState<TicketPricingAnalysis[]>([]);
  const [profitLossStatement, setProfitLossStatement] = useState<ProfitLossStatement | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
  const [taxReport, setTaxReport] = useState<TaxReport | null>(null);
  const [financialForecast, setFinancialForecast] = useState<FinancialForecast[]>([]);
  const [financialAlerts, setFinancialAlerts] = useState<FinancialAlerts[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  const [forecastMonths, setForecastMonths] = useState(3);
  const [trendDays, setTrendDays] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      const [
        revenueData,
        paymentData,
        pricingData,
        plData,
        trendsData,
        taxData,
        forecastData,
        alertsData
      ] = await Promise.allSettled([
        FinancialReportingService.getRevenueBreakdown(eventId),
        FinancialReportingService.getPaymentMethodAnalytics(eventId),
        FinancialReportingService.getTicketPricingAnalysis(eventId),
        FinancialReportingService.getProfitLossStatement(eventId),
        FinancialReportingService.getRevenueTrends(eventId, trendDays),
        FinancialReportingService.getTaxReport(eventId),
        FinancialReportingService.getFinancialForecast(eventId, forecastMonths),
        FinancialReportingService.getFinancialAlerts(eventId)
      ]);

      // Set successful results
      if (revenueData.status === 'fulfilled') {
        setRevenueBreakdown(revenueData.value);
      }
      if (paymentData.status === 'fulfilled') {
        setPaymentMethodAnalytics(paymentData.value);
      }
      if (pricingData.status === 'fulfilled') {
        setTicketPricingAnalysis(pricingData.value);
      }
      if (plData.status === 'fulfilled') {
        setProfitLossStatement(plData.value);
      }
      if (trendsData.status === 'fulfilled') {
        setRevenueTrends(trendsData.value);
      }
      if (taxData.status === 'fulfilled') {
        setTaxReport(taxData.value);
      }
      if (forecastData.status === 'fulfilled') {
        setFinancialForecast(forecastData.value);
      }
      if (alertsData.status === 'fulfilled') {
        setFinancialAlerts(alertsData.value);
      }

      // Check for any errors
      const failedRequests = [
        revenueData, paymentData, pricingData, plData, 
        trendsData, taxData, forecastData, alertsData
      ].filter(result => result.status === 'rejected');
      
      if (failedRequests.length > 0) {
        console.warn('Some financial data failed to load:', failedRequests);
      }

      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial data';
      setError(errorMessage);
      toast.error('Failed to load financial data', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, trendDays, forecastMonths]);

  const refreshData = useCallback(async () => {
    await fetchData();
    toast.success('Financial data refreshed');
  }, [fetchData]);

  const exportData = useCallback(async (
    format: 'csv' | 'excel' | 'pdf', 
    reportType: 'revenue' | 'pl_statement' | 'tax_report' | 'full_report'
  ) => {
    if (!eventId) return;

    try {
      const exportedData = await FinancialReportingService.exportFinancialData(eventId, format, reportType);
      
      // Create download
      const mimeType = format === 'csv' ? 'text/csv' : 'application/octet-stream';
      const blob = new Blob([exportedData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-report-${reportType}-${eventId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Financial report exported as ${format.toUpperCase()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      toast.error('Export failed', {
        description: errorMessage
      });
    }
  }, [eventId]);

  const acknowledgeAlert = useCallback((alertIndex: number) => {
    setFinancialAlerts(alerts => 
      alerts.map((alert, index) => 
        index === alertIndex ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when settings change
  useEffect(() => {
    if (revenueBreakdown) { // Only refetch if we already have data
      fetchData();
    }
  }, [trendDays, forecastMonths]);

  // Computed values
  const profitMargin = revenueBreakdown && revenueBreakdown.totalRevenue > 0 
    ? ((revenueBreakdown.netRevenue / revenueBreakdown.totalRevenue) * 100)
    : 0;

  const totalFees = revenueBreakdown 
    ? revenueBreakdown.platformFees + revenueBreakdown.paymentProcessingFees
    : 0;

  const revenueGrowth = revenueTrends.length >= 2
    ? revenueTrends[revenueTrends.length - 1].growthRate
    : 0;

  const unacknowledgedAlerts = financialAlerts.filter(alert => !alert.acknowledged);

  return {
    // Data
    revenueBreakdown,
    paymentMethodAnalytics,
    ticketPricingAnalysis,
    profitLossStatement,
    revenueTrends,
    taxReport,
    financialForecast,
    financialAlerts,
    
    // State
    loading,
    error,
    lastRefresh,
    
    // Actions
    refreshData,
    exportData,
    acknowledgeAlert,
    
    // Settings
    forecastMonths,
    setForecastMonths,
    trendDays,
    setTrendDays,
    
    // Auto-refresh
    autoRefresh,
    setAutoRefresh
  };
};