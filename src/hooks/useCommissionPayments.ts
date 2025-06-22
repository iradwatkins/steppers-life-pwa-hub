// React Hook for Commission Payments Management - Epic F.004
import { useState, useEffect, useCallback } from 'react';
import { commissionPaymentService } from '@/services/commissionPaymentService';
import type {
  CommissionPayment,
  PaymentBatch,
  PaymentDispute,
  EventStaffInfo,
  StaffPerformanceMetrics,
  TaxDocument
} from '@/services/commissionPaymentService';

interface UseCommissionPaymentsResult {
  // Data
  payments: CommissionPayment[];
  batches: PaymentBatch[];
  disputes: PaymentDispute[];
  eventStaff: EventStaffInfo[];
  selectedPayment: CommissionPayment | null;
  
  // Loading states
  loading: boolean;
  loadingStaff: boolean;
  processing: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  refreshPayments: () => Promise<void>;
  markPaymentAsPaid: (paymentId: string, details: {
    payment_method: string;
    reference: string;
    notes?: string;
    marked_by: string;
  }) => Promise<CommissionPayment>;
  
  // Batch operations
  createPaymentBatch: (batchData: {
    name: string;
    payment_method: PaymentBatch['payment_method'];
    payment_ids: string[];
    created_by: string;
  }) => Promise<PaymentBatch>;
  processPaymentBatch: (batchId: string) => Promise<PaymentBatch>;
  
  // Disputes
  createPaymentDispute: (disputeData: Omit<PaymentDispute, 'id' | 'created_at' | 'status'>) => Promise<PaymentDispute>;
  resolvePaymentDispute: (disputeId: string, resolution: {
    status: 'resolved' | 'rejected';
    notes: string;
    amount?: number;
    resolved_by: string;
  }) => Promise<PaymentDispute>;
  
  // Staff management
  getEventStaff: (eventId?: string) => Promise<EventStaffInfo[]>;
  getStaffPerformanceMetrics: (staffId: string, period?: { start: string; end: string }) => Promise<StaffPerformanceMetrics>;
  
  // Tax documents
  generateTaxDocuments: (agentId: string, year: number) => Promise<TaxDocument[]>;
  
  // Export
  exportPaymentData: (format: 'csv' | 'excel' | 'pdf', filters?: any) => Promise<void>;
  
  // Filters and search
  setFilters: (filters: {
    status?: string;
    agent_id?: string;
    date_range?: { start: string; end: string };
  }) => void;
  searchPayments: (query: string) => CommissionPayment[];
  
  // Computed values
  totalPendingAmount: number;
  totalPaidAmount: number;
  totalDisputedAmount: number;
  paymentsSummary: {
    pending: number;
    processing: number;
    paid: number;
    disputed: number;
  };
}

export const useCommissionPayments = (organizerId: string): UseCommissionPaymentsResult => {
  // State
  const [payments, setPayments] = useState<CommissionPayment[]>([]);
  const [batches, setBatches] = useState<PaymentBatch[]>([]);
  const [disputes, setDisputes] = useState<PaymentDispute[]>([]);
  const [eventStaff, setEventStaff] = useState<EventStaffInfo[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<CommissionPayment | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFiltersState] = useState<{
    status?: string;
    agent_id?: string;
    date_range?: { start: string; end: string };
  }>({});

  // Fetch commission payments
  const fetchPayments = useCallback(async () => {
    try {
      setError(null);
      const paymentsData = await commissionPaymentService.getCommissionPayments(organizerId, filters);
      setPayments(paymentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    }
  }, [organizerId, filters]);

  // Fetch event staff
  const fetchEventStaff = useCallback(async (eventId?: string) => {
    try {
      setLoadingStaff(true);
      const staff = await commissionPaymentService.getEventStaff(eventId);
      setEventStaff(staff);
      return staff;
    } catch (err) {
      console.error('Failed to fetch event staff:', err);
      return [];
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  // Refresh all data
  const refreshPayments = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPayments(),
        fetchEventStaff()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [fetchPayments, fetchEventStaff]);

  // Mark payment as paid
  const markPaymentAsPaid = useCallback(async (paymentId: string, details: {
    payment_method: string;
    reference: string;
    notes?: string;
    marked_by: string;
  }) => {
    try {
      setProcessing(true);
      setError(null);
      
      const updatedPayment = await commissionPaymentService.markPaymentAsPaid(paymentId, details);
      
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId ? updatedPayment : payment
      ));
      
      return updatedPayment;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to mark payment as paid';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setProcessing(false);
    }
  }, []);

  // Create payment batch
  const createPaymentBatch = useCallback(async (batchData: {
    name: string;
    payment_method: PaymentBatch['payment_method'];
    payment_ids: string[];
    created_by: string;
  }) => {
    try {
      setProcessing(true);
      setError(null);
      
      const batch = await commissionPaymentService.createPaymentBatch(batchData);
      setBatches(prev => [batch, ...prev]);
      
      return batch;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create payment batch';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setProcessing(false);
    }
  }, []);

  // Process payment batch
  const processPaymentBatch = useCallback(async (batchId: string) => {
    try {
      setProcessing(true);
      setError(null);
      
      const processedBatch = await commissionPaymentService.processPaymentBatch(batchId);
      
      setBatches(prev => prev.map(batch => 
        batch.id === batchId ? processedBatch : batch
      ));
      
      // Update payment statuses
      setPayments(prev => prev.map(payment => 
        processedBatch.payments.some(p => p.id === payment.id)
          ? { ...payment, status: 'paid' as const, paid_at: new Date().toISOString() }
          : payment
      ));
      
      return processedBatch;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process payment batch';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setProcessing(false);
    }
  }, []);

  // Create payment dispute
  const createPaymentDispute = useCallback(async (disputeData: Omit<PaymentDispute, 'id' | 'created_at' | 'status'>) => {
    try {
      setProcessing(true);
      setError(null);
      
      const dispute = await commissionPaymentService.createPaymentDispute(disputeData);
      setDisputes(prev => [dispute, ...prev]);
      
      // Update payment status
      setPayments(prev => prev.map(payment => 
        payment.id === disputeData.payment_id 
          ? { ...payment, status: 'disputed' as const }
          : payment
      ));
      
      return dispute;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create dispute';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setProcessing(false);
    }
  }, []);

  // Resolve payment dispute
  const resolvePaymentDispute = useCallback(async (disputeId: string, resolution: {
    status: 'resolved' | 'rejected';
    notes: string;
    amount?: number;
    resolved_by: string;
  }) => {
    try {
      setProcessing(true);
      setError(null);
      
      const resolvedDispute = await commissionPaymentService.resolvePaymentDispute(disputeId, resolution);
      
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId ? resolvedDispute : dispute
      ));
      
      // Update payment status if resolved
      if (resolution.status === 'resolved') {
        setPayments(prev => prev.map(payment => 
          payment.id === resolvedDispute.payment_id 
            ? { ...payment, status: 'paid' as const }
            : payment
        ));
      }
      
      return resolvedDispute;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to resolve dispute';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setProcessing(false);
    }
  }, []);

  // Get event staff
  const getEventStaff = useCallback(async (eventId?: string) => {
    return await fetchEventStaff(eventId);
  }, [fetchEventStaff]);

  // Get staff performance metrics
  const getStaffPerformanceMetrics = useCallback(async (staffId: string, period?: { start: string; end: string }) => {
    try {
      return await commissionPaymentService.getStaffPerformanceMetrics(staffId, period);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch staff metrics';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Generate tax documents
  const generateTaxDocuments = useCallback(async (agentId: string, year: number) => {
    try {
      setProcessing(true);
      setError(null);
      
      const documents = await commissionPaymentService.generateTaxDocuments(agentId, year);
      
      return documents;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate tax documents';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setProcessing(false);
    }
  }, []);

  // Export payment data
  const exportPaymentData = useCallback(async (format: 'csv' | 'excel' | 'pdf', exportFilters?: any) => {
    try {
      await commissionPaymentService.exportPaymentData(organizerId, format, exportFilters || filters);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [organizerId, filters]);

  // Set filters
  const setFilters = useCallback((newFilters: {
    status?: string;
    agent_id?: string;
    date_range?: { start: string; end: string };
  }) => {
    setFiltersState(newFilters);
  }, []);

  // Search payments
  const searchPayments = useCallback((query: string): CommissionPayment[] => {
    if (!query.trim()) return payments;
    
    const searchTerm = query.toLowerCase();
    return payments.filter(payment => 
      payment.agent_name.toLowerCase().includes(searchTerm) ||
      payment.payment_reference?.toLowerCase().includes(searchTerm) ||
      payment.id.toLowerCase().includes(searchTerm)
    );
  }, [payments]);

  // Computed values
  const totalPendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.net_amount, 0);
    
  const totalPaidAmount = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.net_amount, 0);
    
  const totalDisputedAmount = payments
    .filter(p => p.status === 'disputed')
    .reduce((sum, p) => sum + p.net_amount, 0);

  const paymentsSummary = {
    pending: payments.filter(p => p.status === 'pending').length,
    processing: payments.filter(p => p.status === 'processing').length,
    paid: payments.filter(p => p.status === 'paid').length,
    disputed: payments.filter(p => p.status === 'disputed').length
  };

  // Initial load
  useEffect(() => {
    if (organizerId) {
      refreshPayments();
    }
  }, [organizerId, refreshPayments]);

  // Refresh when filters change
  useEffect(() => {
    if (organizerId) {
      fetchPayments();
    }
  }, [filters, fetchPayments, organizerId]);

  return {
    // Data
    payments,
    batches,
    disputes,
    eventStaff,
    selectedPayment,
    
    // Loading states
    loading,
    loadingStaff,
    processing,
    
    // Error state
    error,
    
    // Actions
    refreshPayments,
    markPaymentAsPaid,
    
    // Batch operations
    createPaymentBatch,
    processPaymentBatch,
    
    // Disputes
    createPaymentDispute,
    resolvePaymentDispute,
    
    // Staff management
    getEventStaff,
    getStaffPerformanceMetrics,
    
    // Tax documents
    generateTaxDocuments,
    
    // Export
    exportPaymentData,
    
    // Filters and search
    setFilters,
    searchPayments,
    
    // Computed values
    totalPendingAmount,
    totalPaidAmount,
    totalDisputedAmount,
    paymentsSummary
  };
};