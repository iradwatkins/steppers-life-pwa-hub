import { useState, useEffect, useCallback } from 'react';
import { 
  commissionPaymentService, 
  CommissionPayment, 
  CommissionSummary, 
  PaymentConfiguration,
  CommissionDispute,
  PayoutBatch 
} from '../services/commissionPaymentService';
import { toast } from './use-toast';

interface UseCommissionPaymentsState {
  payments: CommissionPayment[];
  summary: CommissionSummary | null;
  configuration: PaymentConfiguration | null;
  payoutBatches: PayoutBatch[];
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: CommissionPayment['status'];
    agentId?: string;
    eventId?: string;
    dateRange?: { start: Date; end: Date };
    paymentMethod?: string;
  };
}

interface UseCommissionPaymentsReturn extends UseCommissionPaymentsState {
  // Data fetching
  fetchPayments: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchConfiguration: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Filtering
  setFilters: (filters: Partial<UseCommissionPaymentsState['filters']>) => void;
  clearFilters: () => void;
  
  // Payment operations
  markPaymentAsPaid: (
    paymentId: string,
    paymentDetails: {
      paymentMethod: CommissionPayment['paymentMethod'];
      paymentReference?: string;
      notes?: string;
      processedBy: string;
    }
  ) => Promise<void>;
  
  // Dispute operations
  createDispute: (
    paymentId: string,
    disputeData: {
      disputeType: CommissionDispute['disputeType'];
      description: string;
      submittedBy: string;
      supportingDocuments?: string[];
    }
  ) => Promise<void>;
  
  resolveDispute: (
    paymentId: string,
    disputeId: string,
    resolution: {
      resolution: string;
      resolvedBy: string;
      adjustedAmount?: number;
      status: 'resolved' | 'rejected';
    }
  ) => Promise<void>;
  
  // Batch operations
  createPayoutBatch: (
    paymentIds: string[],
    batchData: {
      paymentMethod: 'bank_transfer' | 'paypal' | 'manual';
      processedBy: string;
    }
  ) => Promise<void>;
  
  // Export operations
  exportPayments: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  
  // Configuration
  updateConfiguration: (config: Partial<PaymentConfiguration>) => Promise<void>;
  
  // Utility functions
  getFilteredPayments: () => CommissionPayment[];
  getPaymentById: (paymentId: string) => CommissionPayment | undefined;
  getPaymentsByAgent: (agentId: string) => CommissionPayment[];
  getPaymentsByStatus: (status: CommissionPayment['status']) => CommissionPayment[];
  getPendingAmount: () => number;
  getDisputedPayments: () => CommissionPayment[];
}

export const useCommissionPayments = (organizerId: string): UseCommissionPaymentsReturn => {
  const [state, setState] = useState<UseCommissionPaymentsState>({
    payments: [],
    summary: null,
    configuration: null,
    payoutBatches: [],
    isLoading: false,
    error: null,
    filters: {}
  });

  // Data fetching functions
  const fetchPayments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const payments = await commissionPaymentService.getCommissionPayments(organizerId, state.filters);
      setState(prev => ({ ...prev, payments, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payments';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [organizerId, state.filters]);

  const fetchSummary = useCallback(async () => {
    try {
      const summary = await commissionPaymentService.getCommissionSummary(organizerId);
      setState(prev => ({ ...prev, summary }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch summary';
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [organizerId]);

  const fetchConfiguration = useCallback(async () => {
    try {
      const configuration = await commissionPaymentService.getPaymentConfiguration(organizerId);
      setState(prev => ({ ...prev, configuration }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch configuration';
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [organizerId]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchPayments(),
      fetchSummary(),
      fetchConfiguration()
    ]);
  }, [fetchPayments, fetchSummary, fetchConfiguration]);

  // Filtering functions
  const setFilters = useCallback((newFilters: Partial<UseCommissionPaymentsState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: {} }));
  }, []);

  // Payment operations
  const markPaymentAsPaid = useCallback(async (
    paymentId: string,
    paymentDetails: {
      paymentMethod: CommissionPayment['paymentMethod'];
      paymentReference?: string;
      notes?: string;
      processedBy: string;
    }
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const updatedPayment = await commissionPaymentService.markPaymentAsPaid(paymentId, paymentDetails);
      
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(p => p.id === paymentId ? updatedPayment : p),
        isLoading: false
      }));
      
      toast({ title: "Success", description: "Payment marked as paid successfully" });
      
      // Refresh summary to update totals
      await fetchSummary();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark payment as paid';
      setState(prev => ({ ...prev, isLoading: false }));
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [fetchSummary]);

  // Dispute operations
  const createDispute = useCallback(async (
    paymentId: string,
    disputeData: {
      disputeType: CommissionDispute['disputeType'];
      description: string;
      submittedBy: string;
      supportingDocuments?: string[];
    }
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await commissionPaymentService.createDispute(paymentId, disputeData);
      
      // Refresh payments to show updated dispute status
      await fetchPayments();
      await fetchSummary();
      
      setState(prev => ({ ...prev, isLoading: false }));
      toast({ title: "Success", description: "Dispute created successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create dispute';
      setState(prev => ({ ...prev, isLoading: false }));
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [fetchPayments, fetchSummary]);

  const resolveDispute = useCallback(async (
    paymentId: string,
    disputeId: string,
    resolution: {
      resolution: string;
      resolvedBy: string;
      adjustedAmount?: number;
      status: 'resolved' | 'rejected';
    }
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await commissionPaymentService.resolveDispute(paymentId, disputeId, resolution);
      
      // Refresh payments to show updated dispute resolution
      await fetchPayments();
      await fetchSummary();
      
      setState(prev => ({ ...prev, isLoading: false }));
      toast({ 
        title: "Success", 
        description: `Dispute ${resolution.status} successfully` 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resolve dispute';
      setState(prev => ({ ...prev, isLoading: false }));
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [fetchPayments, fetchSummary]);

  // Batch operations
  const createPayoutBatch = useCallback(async (
    paymentIds: string[],
    batchData: {
      paymentMethod: 'bank_transfer' | 'paypal' | 'manual';
      processedBy: string;
    }
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const batch = await commissionPaymentService.createPayoutBatch(organizerId, paymentIds, batchData);
      
      setState(prev => ({
        ...prev,
        payoutBatches: [batch, ...prev.payoutBatches],
        isLoading: false
      }));
      
      // Refresh payments to show updated statuses
      await fetchPayments();
      await fetchSummary();
      
      toast({ 
        title: "Success", 
        description: `Payout batch created with ${paymentIds.length} payments` 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payout batch';
      setState(prev => ({ ...prev, isLoading: false }));
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [organizerId, fetchPayments, fetchSummary]);

  // Export operations
  const exportPayments = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const blob = await commissionPaymentService.exportCommissionData(organizerId, format, state.filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `commission-payments-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setState(prev => ({ ...prev, isLoading: false }));
      toast({ title: "Success", description: "Export completed successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export payments';
      setState(prev => ({ ...prev, isLoading: false }));
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [organizerId, state.filters]);

  // Configuration
  const updateConfiguration = useCallback(async (config: Partial<PaymentConfiguration>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const updatedConfig = await commissionPaymentService.updatePaymentConfiguration(organizerId, config);
      
      setState(prev => ({
        ...prev,
        configuration: updatedConfig,
        isLoading: false
      }));
      
      toast({ title: "Success", description: "Payment configuration updated successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update configuration';
      setState(prev => ({ ...prev, isLoading: false }));
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [organizerId]);

  // Utility functions
  const getFilteredPayments = useCallback((): CommissionPayment[] => {
    return state.payments;
  }, [state.payments]);

  const getPaymentById = useCallback((paymentId: string): CommissionPayment | undefined => {
    return state.payments.find(p => p.id === paymentId);
  }, [state.payments]);

  const getPaymentsByAgent = useCallback((agentId: string): CommissionPayment[] => {
    return state.payments.filter(p => p.agentId === agentId);
  }, [state.payments]);

  const getPaymentsByStatus = useCallback((status: CommissionPayment['status']): CommissionPayment[] => {
    return state.payments.filter(p => p.status === status);
  }, [state.payments]);

  const getPendingAmount = useCallback((): number => {
    return state.payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.netAmount, 0);
  }, [state.payments]);

  const getDisputedPayments = useCallback((): CommissionPayment[] => {
    return state.payments.filter(p => p.status === 'disputed');
  }, [state.payments]);

  // Auto-fetch data when organizerId or filters change
  useEffect(() => {
    if (organizerId) {
      fetchPayments();
    }
  }, [organizerId, fetchPayments]);

  // Initial data fetch
  useEffect(() => {
    if (organizerId) {
      refreshData();
    }
  }, [organizerId, refreshData]);

  return {
    ...state,
    fetchPayments,
    fetchSummary,
    fetchConfiguration,
    refreshData,
    setFilters,
    clearFilters,
    markPaymentAsPaid,
    createDispute,
    resolveDispute,
    createPayoutBatch,
    exportPayments,
    updateConfiguration,
    getFilteredPayments,
    getPaymentById,
    getPaymentsByAgent,
    getPaymentsByStatus,
    getPendingAmount,
    getDisputedPayments
  };
}; 