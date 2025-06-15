import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import backendPaymentService, { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentConfirmation,
  PaymentProvider_Info,
  PayoutRequest,
  BatchPayoutRequest
} from '@/services/backendPaymentService';

export interface UsePaymentState {
  loading: boolean;
  error: string | null;
}

/**
 * Hook for processing payments
 */
export const usePaymentProcessing = () => {
  const [state, setState] = useState<UsePaymentState>({
    loading: false,
    error: null,
  });

  const processPayment = async (ticketId: string, paymentData: PaymentRequest): Promise<PaymentResponse | null> => {
    try {
      setState({ loading: true, error: null });
      const response = await backendPaymentService.processPayment(ticketId, paymentData);
      setState({ loading: false, error: null });
      
      if (response.status === 'completed') {
        toast.success('Payment processed successfully');
      } else if (response.status === 'pending') {
        toast.info('Payment is being processed');
      }
      
      return response;
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      const errorMessage = error.message || 'Payment processing failed';
      setState({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  };

  const confirmPayment = async (paymentId: string, confirmationData: PaymentConfirmation): Promise<boolean> => {
    try {
      setState({ loading: true, error: null });
      await backendPaymentService.confirmPayment(paymentId, confirmationData);
      setState({ loading: false, error: null });
      toast.success('Payment confirmed successfully');
      return true;
    } catch (error: any) {
      console.error('Payment confirmation failed:', error);
      const errorMessage = error.message || 'Payment confirmation failed';
      setState({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const cancelPayment = async (paymentId: string): Promise<boolean> => {
    try {
      setState({ loading: true, error: null });
      await backendPaymentService.cancelPayment(paymentId);
      setState({ loading: false, error: null });
      toast.success('Payment cancelled successfully');
      return true;
    } catch (error: any) {
      console.error('Payment cancellation failed:', error);
      const errorMessage = error.message || 'Payment cancellation failed';
      setState({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    ...state,
    processPayment,
    confirmPayment,
    cancelPayment,
  };
};

/**
 * Hook for managing payment providers
 */
export const usePaymentProviders = () => {
  const [providers, setProviders] = useState<PaymentProvider_Info[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const providerList = await backendPaymentService.getPaymentProviders();
      setProviders(providerList);
    } catch (error: any) {
      console.error('Failed to fetch payment providers:', error);
      setError(error.message || 'Failed to fetch payment providers');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshProviders = () => {
    fetchProviders();
  };

  // Auto-fetch on hook initialization
  useState(() => {
    fetchProviders();
  });

  return {
    providers,
    loading,
    error,
    refreshProviders,
  };
};

/**
 * Hook for payment history and tracking
 */
export const usePaymentHistory = () => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const paymentHistory = await backendPaymentService.getPaymentHistory();
      setPayments(paymentHistory);
    } catch (error: any) {
      console.error('Failed to fetch payment history:', error);
      setError(error.message || 'Failed to fetch payment history');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = async (paymentId: string): Promise<PaymentResponse | null> => {
    try {
      return await backendPaymentService.getPaymentStatus(paymentId);
    } catch (error: any) {
      console.error('Failed to get payment status:', error);
      toast.error(error.message || 'Failed to get payment status');
      return null;
    }
  };

  const refreshHistory = () => {
    fetchPaymentHistory();
  };

  return {
    payments,
    loading,
    error,
    fetchPaymentHistory,
    getPaymentStatus,
    refreshHistory,
  };
};

/**
 * Hook for payout management (organizers)
 */
export const usePayoutManagement = () => {
  const [loading, setLoading] = useState(false);

  const requestPayout = async (payoutData: PayoutRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await backendPaymentService.requestPayout(payoutData);
      toast.success('Payout requested successfully');
      return true;
    } catch (error: any) {
      console.error('Payout request failed:', error);
      toast.error(error.message || 'Payout request failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestBatchPayout = async (batchData: BatchPayoutRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await backendPaymentService.requestBatchPayout(batchData);
      toast.success('Batch payout requested successfully');
      return true;
    } catch (error: any) {
      console.error('Batch payout request failed:', error);
      toast.error(error.message || 'Batch payout request failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPayoutHistory = async (): Promise<any[] | null> => {
    try {
      setLoading(true);
      const history = await backendPaymentService.getPayoutHistory();
      return history;
    } catch (error: any) {
      console.error('Failed to fetch payout history:', error);
      toast.error(error.message || 'Failed to fetch payout history');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    requestPayout,
    requestBatchPayout,
    getPayoutHistory,
  };
};