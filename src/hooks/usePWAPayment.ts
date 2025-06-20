import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  pwaPaymentService, 
  PWAPaymentTransaction,
  PaymentItem,
  CashDrawerSession,
  DailySalesReport,
  PaymentSettings,
  CashCount
} from '../services/pwaPaymentService';

interface UsePWAPaymentState {
  currentTransaction: PWAPaymentTransaction | null;
  transactions: PWAPaymentTransaction[];
  cashDrawerSession: CashDrawerSession | null;
  dailyReport: DailySalesReport | null;
  settings: PaymentSettings | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
}

interface NewTransactionData {
  eventId: string;
  items: PaymentItem[];
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    customerId?: string;
  };
  staffId: string;
}

interface CashPaymentData {
  amountTendered: number;
  tipAmount?: number;
}

interface CardPaymentData {
  last4: string;
  cardType: string;
  authCode: string;
  terminalId?: string;
  emvChip: boolean;
  contactless: boolean;
  tipAmount?: number;
}

interface DigitalWalletPaymentData {
  walletType: 'apple_pay' | 'google_pay' | 'samsung_pay';
  deviceId: string;
  transactionId: string;
  tipAmount?: number;
}

interface RefundData {
  transactionId: string;
  amount: number;
  reason: string;
  staffId: string;
  refundMethod?: 'original' | 'cash' | 'store_credit';
}

interface UsePWAPaymentActions {
  // Transaction Management
  createTransaction: (data: NewTransactionData) => Promise<PWAPaymentTransaction>;
  processCashPayment: (transactionId: string, data: CashPaymentData) => Promise<PWAPaymentTransaction>;
  processCardPayment: (transactionId: string, data: CardPaymentData) => Promise<PWAPaymentTransaction>;
  processDigitalWalletPayment: (transactionId: string, data: DigitalWalletPaymentData) => Promise<PWAPaymentTransaction>;
  processRefund: (data: RefundData) => Promise<PWAPaymentTransaction>;
  voidTransaction: (transactionId: string, reason: string, staffId: string) => Promise<PWAPaymentTransaction>;
  
  // Cash Drawer Management
  openCashDrawer: (staffId: string, eventId: string, openingBalance: number) => Promise<CashDrawerSession>;
  closeCashDrawer: (actualCounts: CashCount[], notes?: string) => Promise<CashDrawerSession>;
  
  // Data Loading
  loadTransactions: (eventId: string) => Promise<void>;
  loadTransactionsByDateRange: (startDate: string, endDate: string, eventId?: string) => Promise<void>;
  generateDailyReport: (date: string, eventId: string) => Promise<DailySalesReport>;
  refreshData: () => Promise<void>;
  
  // Settings
  updateSettings: (newSettings: Partial<PaymentSettings>) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  clearCurrentTransaction: () => void;
  formatCurrency: (amount: number) => string;
  calculateTax: (amount: number) => number;
  calculateTotal: (items: PaymentItem[], tipAmount?: number, discountAmount?: number) => {
    subtotal: number;
    taxAmount: number;
    total: number;
  };
}

export interface UsePWAPaymentReturn extends UsePWAPaymentState, UsePWAPaymentActions {
  // Computed values
  todaysSales: number;
  todaysTransactionCount: number;
  averageTransactionValue: number;
  cashDrawerBalance: number;
  pendingTransactions: PWAPaymentTransaction[];
  recentTransactions: PWAPaymentTransaction[];
  paymentMethodBreakdown: Record<string, { count: number; amount: number }>;
  topStaffPerformers: Array<{ staffId: string; transactions: number; sales: number }>;
}

export const usePWAPayment = (eventId: string): UsePWAPaymentReturn => {
  const [state, setState] = useState<UsePWAPaymentState>({
    currentTransaction: null,
    transactions: [],
    cashDrawerSession: null,
    dailyReport: null,
    settings: null,
    loading: true,
    error: null,
    isOnline: navigator.onLine
  });

  const mountedRef = useRef(true);

  // Online/offline status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast.success('Connection restored');
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

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Load settings
        const settings = await pwaPaymentService.getSettings();
        
        // Load current cash drawer session
        const cashDrawerSession = pwaPaymentService.getCurrentCashDrawerSession();
        
        // Load transactions for today
        const today = new Date().toISOString().split('T')[0];
        const transactions = await pwaPaymentService.getTransactionsByDateRange(
          `${today}T00:00:00.000Z`,
          `${today}T23:59:59.999Z`,
          eventId
        );

        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            settings,
            cashDrawerSession,
            transactions,
            loading: false
          }));
        }
      } catch (error) {
        console.error('Failed to load initial payment data:', error);
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load payment data'
          }));
        }
      }
    };

    if (eventId) {
      loadInitialData();
    }
  }, [eventId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Transaction Management Actions
  const createTransaction = useCallback(async (data: NewTransactionData): Promise<PWAPaymentTransaction> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const transaction = await pwaPaymentService.createTransaction(
        data.eventId,
        data.items,
        data.customerInfo,
        data.staffId
      );
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          currentTransaction: transaction,
          transactions: [transaction, ...prev.transactions],
          loading: false
        }));
      }
      
      toast.success('Transaction created');
      return transaction;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction';
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const processCashPayment = useCallback(async (
    transactionId: string, 
    data: CashPaymentData
  ): Promise<PWAPaymentTransaction> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const transaction = await pwaPaymentService.processCashPayment(
        transactionId,
        data.amountTendered,
        data.tipAmount
      );
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          currentTransaction: transaction,
          transactions: prev.transactions.map(t => 
            t.id === transactionId ? transaction : t
          ),
          loading: false
        }));
      }
      
      toast.success('Cash payment processed');
      return transaction;
    } catch (error) {
      console.error('Failed to process cash payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process cash payment';
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const processCardPayment = useCallback(async (
    transactionId: string,
    data: CardPaymentData
  ): Promise<PWAPaymentTransaction> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const transaction = await pwaPaymentService.processCardPayment(
        transactionId,
        {
          last4: data.last4,
          cardType: data.cardType,
          authCode: data.authCode,
          terminalId: data.terminalId,
          emvChip: data.emvChip,
          contactless: data.contactless
        },
        data.tipAmount
      );
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          currentTransaction: transaction,
          transactions: prev.transactions.map(t => 
            t.id === transactionId ? transaction : t
          ),
          loading: false
        }));
      }
      
      toast.success('Card payment processed');
      return transaction;
    } catch (error) {
      console.error('Failed to process card payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process card payment';
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const processDigitalWalletPayment = useCallback(async (
    transactionId: string,
    data: DigitalWalletPaymentData
  ): Promise<PWAPaymentTransaction> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const transaction = await pwaPaymentService.processDigitalWalletPayment(
        transactionId,
        {
          walletType: data.walletType,
          deviceId: data.deviceId,
          transactionId: data.transactionId
        },
        data.tipAmount
      );
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          currentTransaction: transaction,
          transactions: prev.transactions.map(t => 
            t.id === transactionId ? transaction : t
          ),
          loading: false
        }));
      }
      
      toast.success('Digital wallet payment processed');
      return transaction;
    } catch (error) {
      console.error('Failed to process digital wallet payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process digital wallet payment';
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const processRefund = useCallback(async (data: RefundData): Promise<PWAPaymentTransaction> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const transaction = await pwaPaymentService.processRefund(
        data.transactionId,
        data.amount,
        data.reason,
        data.staffId,
        data.refundMethod
      );
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => 
            t.id === data.transactionId ? transaction : t
          ),
          loading: false
        }));
      }
      
      toast.success('Refund processed');
      return transaction;
    } catch (error) {
      console.error('Failed to process refund:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process refund';
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const voidTransaction = useCallback(async (
    transactionId: string,
    reason: string,
    staffId: string
  ): Promise<PWAPaymentTransaction> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const transaction = await pwaPaymentService.voidTransaction(transactionId, reason, staffId);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => 
            t.id === transactionId ? transaction : t
          ),
          loading: false
        }));
      }
      
      toast.success('Transaction voided');
      return transaction;
    } catch (error) {
      console.error('Failed to void transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to void transaction';
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Cash Drawer Management
  const openCashDrawer = useCallback(async (
    staffId: string,
    eventId: string,
    openingBalance: number
  ): Promise<CashDrawerSession> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const session = await pwaPaymentService.openCashDrawer(staffId, eventId, openingBalance);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          cashDrawerSession: session,
          loading: false
        }));
      }
      
      toast.success('Cash drawer opened');
      return session;
    } catch (error) {
      console.error('Failed to open cash drawer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to open cash drawer';
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const closeCashDrawer = useCallback(async (
    actualCounts: CashCount[],
    notes?: string
  ): Promise<CashDrawerSession> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const session = await pwaPaymentService.closeCashDrawer(actualCounts, notes);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          cashDrawerSession: session,
          loading: false
        }));
      }
      
      toast.success('Cash drawer closed');
      return session;
    } catch (error) {
      console.error('Failed to close cash drawer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to close cash drawer';
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Data Loading
  const loadTransactions = useCallback(async (eventId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const transactions = await pwaPaymentService.getTransactionsByEvent(eventId);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          transactions,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load transactions'
        }));
      }
    }
  }, []);

  const loadTransactionsByDateRange = useCallback(async (
    startDate: string,
    endDate: string,
    eventId?: string
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const transactions = await pwaPaymentService.getTransactionsByDateRange(
        startDate,
        endDate,
        eventId
      );
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          transactions,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Failed to load transactions by date range:', error);
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load transactions'
        }));
      }
    }
  }, []);

  const generateDailyReport = useCallback(async (
    date: string,
    eventId: string
  ): Promise<DailySalesReport> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const report = await pwaPaymentService.generateDailySalesReport(date, eventId);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          dailyReport: report,
          loading: false
        }));
      }
      
      return report;
    } catch (error) {
      console.error('Failed to generate daily report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate daily report';
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      throw error;
    }
  }, []);

  const refreshData = useCallback(async (): Promise<void> => {
    if (eventId) {
      await loadTransactions(eventId);
    }
  }, [eventId, loadTransactions]);

  // Settings
  const updateSettings = useCallback(async (newSettings: Partial<PaymentSettings>): Promise<void> => {
    try {
      await pwaPaymentService.updateSettings(newSettings);
      const updatedSettings = await pwaPaymentService.getSettings();
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, settings: updatedSettings }));
      }
      
      toast.success('Settings updated');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    }
  }, []);

  // Utilities
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearCurrentTransaction = useCallback(() => {
    setState(prev => ({ ...prev, currentTransaction: null }));
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return pwaPaymentService.formatCurrency(amount);
  }, []);

  const calculateTax = useCallback((amount: number): number => {
    return amount * (state.settings?.taxRate || 0.08);
  }, [state.settings?.taxRate]);

  const calculateTotal = useCallback((
    items: PaymentItem[],
    tipAmount: number = 0,
    discountAmount: number = 0
  ) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0) - discountAmount;
    const taxAmount = calculateTax(subtotal);
    const total = subtotal + taxAmount + tipAmount;
    
    return { subtotal, taxAmount, total };
  }, [calculateTax]);

  // Computed values
  const completedTransactions = state.transactions.filter(t => t.status === 'completed');
  
  const todaysSales = completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const todaysTransactionCount = completedTransactions.length;
  const averageTransactionValue = todaysTransactionCount > 0 ? todaysSales / todaysTransactionCount : 0;
  const cashDrawerBalance = state.cashDrawerSession?.expectedBalance || 0;
  const pendingTransactions = state.transactions.filter(t => t.status === 'pending');
  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // Payment method breakdown
  const paymentMethodBreakdown: Record<string, { count: number; amount: number }> = {};
  completedTransactions.forEach(transaction => {
    const method = transaction.paymentMethod;
    if (!paymentMethodBreakdown[method]) {
      paymentMethodBreakdown[method] = { count: 0, amount: 0 };
    }
    paymentMethodBreakdown[method].count++;
    paymentMethodBreakdown[method].amount += transaction.totalAmount;
  });

  // Top staff performers
  const staffPerformance: Record<string, { transactions: number; sales: number }> = {};
  completedTransactions.forEach(transaction => {
    const staffId = transaction.staffId;
    if (!staffPerformance[staffId]) {
      staffPerformance[staffId] = { transactions: 0, sales: 0 };
    }
    staffPerformance[staffId].transactions++;
    staffPerformance[staffId].sales += transaction.totalAmount;
  });

  const topStaffPerformers = Object.entries(staffPerformance)
    .map(([staffId, data]) => ({ staffId, ...data }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return {
    // State
    currentTransaction: state.currentTransaction,
    transactions: state.transactions,
    cashDrawerSession: state.cashDrawerSession,
    dailyReport: state.dailyReport,
    settings: state.settings,
    loading: state.loading,
    error: state.error,
    isOnline: state.isOnline,

    // Actions
    createTransaction,
    processCashPayment,
    processCardPayment,
    processDigitalWalletPayment,
    processRefund,
    voidTransaction,
    openCashDrawer,
    closeCashDrawer,
    loadTransactions,
    loadTransactionsByDateRange,
    generateDailyReport,
    refreshData,
    updateSettings,
    clearError,
    clearCurrentTransaction,
    formatCurrency,
    calculateTax,
    calculateTotal,

    // Computed values
    todaysSales,
    todaysTransactionCount,
    averageTransactionValue,
    cashDrawerBalance,
    pendingTransactions,
    recentTransactions,
    paymentMethodBreakdown,
    topStaffPerformers
  };
};