import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  financialReportsService, 
  FinancialReport, 
  FinancialReportFilters, 
  ExportConfig,
  ExpenseCategory 
} from '@/services/financialReportsService';
import { toast } from '@/components/ui/use-toast';

interface UseFinancialReportsState {
  report: FinancialReport | null;
  multiEventReports: FinancialReport[];
  loading: boolean;
  error: string | null;
  exporting: boolean;
  syncing: boolean;
  lastUpdated: Date | null;
}

interface UseFinancialReportsReturn extends UseFinancialReportsState {
  // Core functions
  fetchReport: (eventId: string, filters?: FinancialReportFilters) => Promise<void>;
  fetchMultiEventReports: (eventIds: string[]) => Promise<void>;
  refreshReport: () => Promise<void>;
  
  // Export functions
  exportReport: (config: ExportConfig) => Promise<string>;
  
  // Accounting sync functions
  syncWithQuickBooks: () => Promise<void>;
  syncWithXero: () => Promise<void>;
  
  // Data manipulation functions
  updateExpenseCategory: (categoryId: string, updates: Partial<ExpenseCategory>) => Promise<void>;
  processCommissionPayout: (agentId: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  getRevenueGrowth: () => number | null;
  getProfitTrend: () => 'increasing' | 'decreasing' | 'stable' | null;
  getTopExpenseCategories: (limit?: number) => ExpenseCategory[];
  getPaymentMethodOptimization: () => { method: string; savings: number } | null;
  getCashFlowStatus: () => 'healthy' | 'warning' | 'critical' | null;
  getCommissionSummary: () => { totalOwed: number; agentCount: number; overdueCount: number };
  
  // Formatting utilities
  formatCurrency: (amount: number, currency?: string) => string;
  formatPercentage: (value: number, decimals?: number) => string;
  formatDateRange: () => string;
}

export const useFinancialReports = (eventId?: string): UseFinancialReportsReturn => {
  const [state, setState] = useState<UseFinancialReportsState>({
    report: null,
    multiEventReports: [],
    loading: false,
    error: null,
    exporting: false,
    syncing: false,
    lastUpdated: null,
  });

  // Core fetch function
  const fetchReport = useCallback(async (targetEventId: string, filters?: FinancialReportFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const report = await financialReportsService.getFinancialReport(targetEventId, filters);
      setState(prev => ({
        ...prev,
        report,
        loading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch financial report';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Fetch multiple event reports
  const fetchMultiEventReports = useCallback(async (eventIds: string[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const reports = await financialReportsService.getMultiEventFinancials(eventIds);
      setState(prev => ({
        ...prev,
        multiEventReports: reports,
        loading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch multi-event reports';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Refresh current report
  const refreshReport = useCallback(async () => {
    if (!eventId || !state.report) return;
    await fetchReport(eventId);
  }, [eventId, state.report, fetchReport]);

  // Export report
  const exportReport = useCallback(async (config: ExportConfig): Promise<string> => {
    if (!eventId) throw new Error('No event selected');
    
    setState(prev => ({ ...prev, exporting: true }));
    
    try {
      const downloadUrl = await financialReportsService.exportFinancialReport(eventId, config);
      setState(prev => ({ ...prev, exporting: false }));
      return downloadUrl;
    } catch (error) {
      setState(prev => ({ ...prev, exporting: false }));
      throw error;
    }
  }, [eventId]);

  // Sync with QuickBooks
  const syncWithQuickBooks = useCallback(async () => {
    if (!eventId) {
      toast({
        title: "Error",
        description: "No event selected for sync",
        variant: "destructive",
      });
      return;
    }
    
    setState(prev => ({ ...prev, syncing: true }));
    
    try {
      await financialReportsService.syncWithAccounting('quickbooks', eventId);
      await refreshReport();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with QuickBooks",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, syncing: false }));
    }
  }, [eventId, refreshReport]);

  // Sync with Xero
  const syncWithXero = useCallback(async () => {
    if (!eventId) {
      toast({
        title: "Error",
        description: "No event selected for sync",
        variant: "destructive",
      });
      return;
    }
    
    setState(prev => ({ ...prev, syncing: true }));
    
    try {
      await financialReportsService.syncWithAccounting('xero', eventId);
      await refreshReport();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Xero",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, syncing: false }));
    }
  }, [eventId, refreshReport]);

  // Update expense category
  const updateExpenseCategory = useCallback(async (categoryId: string, updates: Partial<ExpenseCategory>) => {
    if (!eventId) return;
    
    try {
      await financialReportsService.updateExpenseCategory(eventId, categoryId, updates);
      await refreshReport();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update expense category",
        variant: "destructive",
      });
    }
  }, [eventId, refreshReport]);

  // Process commission payout
  const processCommissionPayout = useCallback(async (agentId: string) => {
    if (!eventId) return;
    
    try {
      await financialReportsService.processCommissionPayout(eventId, agentId);
      await refreshReport();
    } catch (error) {
      toast({
        title: "Payout Failed",
        description: "Failed to process commission payout",
        variant: "destructive",
      });
    }
  }, [eventId, refreshReport]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Utility functions
  const getRevenueGrowth = useCallback((): number | null => {
    if (!state.report) return null;
    
    // Calculate growth based on forecast data
    const currentRevenue = state.report.summary.totalRevenue;
    const projectedRevenue = state.report.forecast.nextMonth.projectedRevenue;
    
    if (currentRevenue <= 0) return null;
    
    return ((projectedRevenue - currentRevenue) / currentRevenue) * 100;
  }, [state.report]);

  const getProfitTrend = useCallback((): 'increasing' | 'decreasing' | 'stable' | null => {
    if (!state.report) return null;
    
    const currentProfit = state.report.summary.netProfit;
    const projectedProfit = state.report.forecast.nextMonth.projectedProfit;
    
    const difference = projectedProfit - currentProfit;
    const threshold = currentProfit * 0.05; // 5% threshold
    
    if (Math.abs(difference) < threshold) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }, [state.report]);

  const getTopExpenseCategories = useCallback((limit: number = 3): ExpenseCategory[] => {
    if (!state.report) return [];
    
    return [...state.report.expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }, [state.report]);

  const getPaymentMethodOptimization = useCallback((): { method: string; savings: number } | null => {
    if (!state.report) return null;
    
    const fees = state.report.paymentFees;
    const potentialSavings = fees.optimization.potentialSavings;
    
    if (potentialSavings <= 0) return null;
    
    // Find the method with highest fees for optimization
    const methods = [
      { method: 'Credit Card', fees: fees.creditCard.totalFees, rate: fees.creditCard.averageFeeRate },
      { method: 'PayPal', fees: fees.paypal.totalFees, rate: fees.paypal.averageFeeRate },
      { method: 'Other', fees: fees.other.totalFees, rate: fees.other.averageFeeRate },
    ];
    
    const highestFeeMethod = methods.reduce((prev, current) => 
      current.rate > prev.rate ? current : prev
    );
    
    return {
      method: highestFeeMethod.method,
      savings: potentialSavings,
    };
  }, [state.report]);

  const getCashFlowStatus = useCallback((): 'healthy' | 'warning' | 'critical' | null => {
    if (!state.report) return null;
    
    const cashFlow = state.report.cashFlow.currentCashFlow;
    const totalRevenue = state.report.summary.totalRevenue;
    
    if (totalRevenue <= 0) return null;
    
    const ratio = cashFlow / totalRevenue;
    
    if (ratio >= 0.2) return 'healthy';
    if (ratio >= 0.1) return 'warning';
    return 'critical';
  }, [state.report]);

  const getCommissionSummary = useCallback(() => {
    if (!state.report) {
      return { totalOwed: 0, agentCount: 0, overdueCount: 0 };
    }
    
    const commissions = state.report.commissions;
    const totalOwed = commissions.totalCommissions.owed;
    const agentCount = commissions.salesAgents.length + commissions.affiliates.length;
    
    const now = new Date();
    const overdueCount = commissions.payoutSchedule.filter(
      payout => payout.dueDate < now && payout.status === 'pending'
    ).length;
    
    return { totalOwed, agentCount, overdueCount };
  }, [state.report]);

  // Formatting utilities
  const formatCurrency = useCallback((amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  }, []);

  const formatDateRange = useCallback((): string => {
    if (!state.report) return '';
    
    const start = new Date(state.report.reportPeriod.start);
    const end = new Date(state.report.reportPeriod.end);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }, [state.report]);

  // Auto-fetch report when eventId changes
  useEffect(() => {
    if (eventId) {
      fetchReport(eventId);
    }
  }, [eventId, fetchReport]);

  // Memoized return object
  return useMemo(() => ({
    ...state,
    fetchReport,
    fetchMultiEventReports,
    refreshReport,
    exportReport,
    syncWithQuickBooks,
    syncWithXero,
    updateExpenseCategory,
    processCommissionPayout,
    clearError,
    getRevenueGrowth,
    getProfitTrend,
    getTopExpenseCategories,
    getPaymentMethodOptimization,
    getCashFlowStatus,
    getCommissionSummary,
    formatCurrency,
    formatPercentage,
    formatDateRange,
  }), [
    state,
    fetchReport,
    fetchMultiEventReports,
    refreshReport,
    exportReport,
    syncWithQuickBooks,
    syncWithXero,
    updateExpenseCategory,
    processCommissionPayout,
    clearError,
    getRevenueGrowth,
    getProfitTrend,
    getTopExpenseCategories,
    getPaymentMethodOptimization,
    getCashFlowStatus,
    getCommissionSummary,
    formatCurrency,
    formatPercentage,
    formatDateRange,
  ]);
}; 