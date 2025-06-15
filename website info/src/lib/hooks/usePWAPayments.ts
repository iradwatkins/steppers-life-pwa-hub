import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import pwaPaymentService, {
  PaymentTransaction,
  PaymentMethod,
  PaymentStats,
  PaymentSettings,
  PaymentReceipt,
  PaymentItem
} from '../services/pwaPaymentService';

export interface PaymentFormData {
  amount: number;
  paymentMethodId: string;
  description: string;
  items: PaymentItem[];
  attendeeId?: string;
  discountAmount?: number;
  notes?: string;
  
  // Cash specific
  amountReceived?: number;
  
  // Split payment specific
  splitPayments?: {
    methodId: string;
    amount: number;
  }[];
}

export interface PaymentFilters {
  status?: string;
  paymentMethod?: string;
  dateRange?: { start: string; end: string };
  searchTerm?: string;
}

export interface UsePWAPaymentsReturn {
  // State
  payments: PaymentTransaction[];
  filteredPayments: PaymentTransaction[];
  currentTransaction: PaymentTransaction | null;
  paymentMethods: PaymentMethod[];
  stats: PaymentStats;
  settings: PaymentSettings;
  
  // Loading states
  isProcessing: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  
  // Filters and search
  filters: PaymentFilters;
  setFilters: (filters: PaymentFilters) => void;
  
  // Payment operations
  processPayment: (formData: PaymentFormData) => Promise<PaymentTransaction>;
  processRefund: (transactionId: string, amount: number, reason: string) => Promise<PaymentTransaction>;
  processVoid: (transactionId: string, reason: string) => Promise<void>;
  
  // Transaction management
  getTransaction: (id: string) => PaymentTransaction | undefined;
  setCurrentTransaction: (transaction: PaymentTransaction | null) => void;
  
  // Receipt operations
  generateReceipt: (transactionId: string) => PaymentReceipt | null;
  printReceipt: (receiptId: string) => Promise<void>;
  emailReceipt: (receiptId: string, email: string) => Promise<void>;
  
  // Settings management
  updateSettings: (newSettings: Partial<PaymentSettings>) => void;
  togglePaymentMethod: (methodId: string) => void;
  
  // Utility functions
  formatCurrency: (amount: number) => string;
  calculateTotal: (items: PaymentItem[], discountAmount?: number) => number;
  calculateTax: (amount: number) => number;
  
  // Data refresh
  refreshData: () => void;
  syncTransactions: () => Promise<void>;
  
  // Network status
  isOnline: boolean;
  pendingSyncCount: number;
}

export const usePWAPayments = (eventId?: string): UsePWAPaymentsReturn => {
  // State management
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<PaymentTransaction | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalTransactions: 0,
    totalAmount: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    refundedTransactions: 0,
    cashTransactions: { count: 0, amount: 0 },
    cardTransactions: { count: 0, amount: 0 },
    digitalWalletTransactions: { count: 0, amount: 0 },
    qrCodeTransactions: { count: 0, amount: 0 },
    hourlyVolume: {},
    peakTransactionTime: '12:00',
    averageTransactionAmount: 0,
    pendingSyncTransactions: 0,
    offlineTransactions: 0,
    lastSyncTime: new Date().toISOString()
  });
  const [settings, setSettings] = useState<PaymentSettings>(pwaPaymentService.getSettings());
  
  // Loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Filters and search
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Initialize data
  useEffect(() => {
    loadPaymentData();
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [eventId]);
  
  // Load payment data
  const loadPaymentData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get payments with optional event filter
      const paymentFilters = eventId ? { eventId } : undefined;
      const paymentsData = pwaPaymentService.getPayments(paymentFilters);
      setPayments(paymentsData);
      
      // Get payment methods
      const settingsData = pwaPaymentService.getSettings();
      setPaymentMethods(settingsData.enabledMethods);
      setSettings(settingsData);
      
      // Get stats
      const statsData = pwaPaymentService.getPaymentStats(eventId);
      setStats(statsData);
      
    } catch (error) {
      console.error('Failed to load payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);
  
  // Filter payments based on current filters
  const filteredPayments = payments.filter(payment => {
    if (filters.status && payment.status !== filters.status) {
      return false;
    }
    
    if (filters.paymentMethod && payment.paymentMethod.type !== filters.paymentMethod) {
      return false;
    }
    
    if (filters.dateRange) {
      const paymentDate = new Date(payment.timestamp);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (paymentDate < startDate || paymentDate > endDate) {
        return false;
      }
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        payment.description.toLowerCase().includes(searchLower) ||
        payment.receiptNumber.toLowerCase().includes(searchLower) ||
        payment.id.toLowerCase().includes(searchLower) ||
        (payment.attendeeId && payment.attendeeId.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  // Process payment
  const processPayment = useCallback(async (formData: PaymentFormData): Promise<PaymentTransaction> => {
    try {
      setIsProcessing(true);
      
      // Find selected payment method
      const paymentMethod = paymentMethods.find(m => m.id === formData.paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Invalid payment method selected');
      }
      
      // Prepare payment data
      const paymentData: Partial<PaymentTransaction> = {
        eventId: eventId || 'default-event',
        attendeeId: formData.attendeeId,
        amount: formData.amount,
        paymentMethod,
        description: formData.description,
        items: formData.items,
        discountAmount: formData.discountAmount || 0,
        notes: formData.notes
      };
      
      // Add method-specific data
      if (paymentMethod.type === 'cash' && formData.amountReceived) {
        paymentData.cashDetails = {
          amountReceived: formData.amountReceived,
          change: formData.amountReceived - formData.amount
        };
      }
      
      if (paymentMethod.type === 'split' && formData.splitPayments) {
        paymentData.splitPayments = formData.splitPayments.map(split => {
          const method = paymentMethods.find(m => m.id === split.methodId);
          return {
            method: method!,
            amount: split.amount,
            status: 'pending'
          };
        });
      }
      
      // Process the payment
      const transaction = await pwaPaymentService.processPayment(paymentData);
      
      // Update local state
      await loadPaymentData();
      
      // Show success message
      toast.success(
        `Payment of ${formatCurrency(transaction.totalAmount)} processed successfully!`,
        { duration: 3000 }
      );
      
      return transaction;
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast.error(error instanceof Error ? error.message : 'Payment processing failed');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [paymentMethods, eventId, loadPaymentData]);
  
  // Process refund
  const processRefund = useCallback(async (
    transactionId: string, 
    amount: number, 
    reason: string
  ): Promise<PaymentTransaction> => {
    try {
      setIsProcessing(true);
      
      const refundTransaction = await pwaPaymentService.processRefund(transactionId, amount, reason);
      
      // Update local state
      await loadPaymentData();
      
      toast.success(`Refund of ${formatCurrency(amount)} processed successfully!`);
      
      return refundTransaction;
      
    } catch (error) {
      console.error('Refund processing failed:', error);
      toast.error(error instanceof Error ? error.message : 'Refund processing failed');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [loadPaymentData]);
  
  // Process void (cancel transaction)
  const processVoid = useCallback(async (transactionId: string, reason: string): Promise<void> => {
    try {
      setIsProcessing(true);
      
      // Find the transaction
      const transaction = payments.find(p => p.id === transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      if (transaction.status !== 'pending' && transaction.status !== 'processing') {
        throw new Error('Cannot void completed transactions. Use refund instead.');
      }
      
      // Update transaction status (simulated)
      transaction.status = 'cancelled';
      transaction.notes = (transaction.notes || '') + ` | VOIDED: ${reason}`;
      
      await loadPaymentData();
      
      toast.success('Transaction voided successfully');
      
    } catch (error) {
      console.error('Transaction void failed:', error);
      toast.error(error instanceof Error ? error.message : 'Transaction void failed');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [payments, loadPaymentData]);
  
  // Get specific transaction
  const getTransaction = useCallback((id: string): PaymentTransaction | undefined => {
    return payments.find(p => p.id === id);
  }, [payments]);
  
  // Receipt operations
  const generateReceipt = useCallback((transactionId: string): PaymentReceipt | null => {
    const transaction = getTransaction(transactionId);
    if (!transaction) {
      return null;
    }
    
    // Generate receipt (this would typically call the service)
    return {
      id: `receipt_${Date.now()}`,
      transactionId: transaction.id,
      receiptNumber: transaction.receiptNumber,
      eventName: 'Sample Event',
      timestamp: transaction.timestamp,
      items: transaction.items,
      subtotal: transaction.amount,
      taxAmount: transaction.taxAmount,
      discountAmount: transaction.discountAmount,
      totalAmount: transaction.totalAmount,
      paymentMethod: transaction.paymentMethod,
      staffName: 'Current Staff',
      location: transaction.location || 'Main Entrance'
    };
  }, [getTransaction]);
  
  const printReceipt = useCallback(async (receiptId: string): Promise<void> => {
    try {
      // Simulate printing
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Receipt printed successfully');
    } catch (error) {
      toast.error('Failed to print receipt');
      throw error;
    }
  }, []);
  
  const emailReceipt = useCallback(async (receiptId: string, email: string): Promise<void> => {
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Receipt emailed to ${email}`);
    } catch (error) {
      toast.error('Failed to email receipt');
      throw error;
    }
  }, []);
  
  // Settings management
  const updateSettings = useCallback((newSettings: Partial<PaymentSettings>) => {
    try {
      pwaPaymentService.updateSettings(newSettings);
      setSettings(pwaPaymentService.getSettings());
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    }
  }, []);
  
  const togglePaymentMethod = useCallback((methodId: string) => {
    const updatedMethods = settings.enabledMethods.map(method => 
      method.id === methodId 
        ? { ...method, enabled: !method.enabled }
        : method
    );
    
    updateSettings({ enabledMethods: updatedMethods });
  }, [settings.enabledMethods, updateSettings]);
  
  // Utility functions
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency
    }).format(amount);
  }, [settings.currency]);
  
  const calculateTotal = useCallback((items: PaymentItem[], discountAmount: number = 0): number => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discounted = subtotal - discountAmount;
    const tax = discounted * settings.taxRate;
    return discounted + tax;
  }, [settings.taxRate]);
  
  const calculateTax = useCallback((amount: number): number => {
    return amount * settings.taxRate;
  }, [settings.taxRate]);
  
  // Data refresh
  const refreshData = useCallback(() => {
    loadPaymentData();
  }, [loadPaymentData]);
  
  const syncTransactions = useCallback(async (): Promise<void> => {
    try {
      setIsSyncing(true);
      
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh data after sync
      await loadPaymentData();
      
      toast.success('Transactions synced successfully');
      
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync transactions');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [loadPaymentData]);
  
  // Calculate pending sync count
  const pendingSyncCount = payments.filter(p => p.syncStatus === 'pending_sync').length;
  
  return {
    // State
    payments: filteredPayments,
    filteredPayments,
    currentTransaction,
    paymentMethods: paymentMethods.filter(m => m.enabled),
    stats,
    settings,
    
    // Loading states
    isProcessing,
    isLoading,
    isSyncing,
    
    // Filters and search
    filters,
    setFilters,
    
    // Payment operations
    processPayment,
    processRefund,
    processVoid,
    
    // Transaction management
    getTransaction,
    setCurrentTransaction,
    
    // Receipt operations
    generateReceipt,
    printReceipt,
    emailReceipt,
    
    // Settings management
    updateSettings,
    togglePaymentMethod,
    
    // Utility functions
    formatCurrency,
    calculateTotal,
    calculateTax,
    
    // Data refresh
    refreshData,
    syncTransactions,
    
    // Network status
    isOnline,
    pendingSyncCount
  };
};

export default usePWAPayments; 