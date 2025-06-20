import { openDB, IDBPDatabase } from 'idb';

export interface PWAPaymentTransaction {
  id: string;
  eventId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'card' | 'digital_wallet' | 'qr_code' | 'split';
  paymentDetails: PaymentDetails;
  items: PaymentItem[];
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'voided';
  timestamp: string;
  staffId: string;
  receiptNumber: string;
  receiptSent: boolean;
  syncStatus: 'pending' | 'synced' | 'failed';
  refundHistory: RefundRecord[];
  notes?: string;
  fraudAlerts?: FraudAlert[];
}

export interface PaymentDetails {
  cash?: {
    amountTendered: number;
    changeGiven: number;
    drawerSession?: string;
  };
  card?: {
    last4: string;
    cardType: string;
    authCode: string;
    terminalId?: string;
    emvChip: boolean;
    contactless: boolean;
  };
  digitalWallet?: {
    walletType: 'apple_pay' | 'google_pay' | 'samsung_pay';
    deviceId: string;
    transactionId: string;
  };
  qrCode?: {
    qrData: string;
    paymentApp: string;
    transactionId: string;
  };
  split?: {
    payments: Array<{
      method: string;
      amount: number;
      details: any;
    }>;
  };
}

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  category: 'ticket' | 'merchandise' | 'food' | 'beverage' | 'service';
  eventId: string;
}

export interface RefundRecord {
  id: string;
  amount: number;
  reason: string;
  staffId: string;
  timestamp: string;
  refundMethod: 'original' | 'cash' | 'store_credit';
  status: 'pending' | 'completed' | 'failed';
}

export interface FraudAlert {
  id: string;
  type: 'suspicious_amount' | 'velocity_check' | 'location_mismatch' | 'card_issue';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface CashDrawerSession {
  id: string;
  staffId: string;
  eventId: string;
  openingBalance: number;
  currentBalance: number;
  expectedBalance: number;
  status: 'open' | 'closed' | 'reconciling';
  openedAt: string;
  closedAt?: string;
  transactions: string[]; // transaction IDs
  cashCounts: CashCount[];
}

export interface CashCount {
  denomination: string;
  count: number;
  value: number;
}

export interface DailySalesReport {
  date: string;
  eventId: string;
  totalSales: number;
  totalTransactions: number;
  paymentMethodBreakdown: Record<string, { count: number; amount: number }>;
  taxCollected: number;
  tipsCollected: number;
  refundsIssued: number;
  staffPerformance: Record<string, { transactions: number; sales: number }>;
  hourlyBreakdown: Array<{
    hour: string;
    transactions: number;
    sales: number;
  }>;
  topItems: Array<{
    item: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface PaymentSettings {
  taxRate: number;
  tipEnabled: boolean;
  defaultTipPercentages: number[];
  cashDrawerEnabled: boolean;
  receiptPrinting: boolean;
  receiptEmail: boolean;
  receiptSMS: boolean;
  fraudDetection: boolean;
  offlineMode: boolean;
  pciComplianceMode: boolean;
  currencyCode: 'USD';
  receiptFooter?: string;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

class PWAPaymentService {
  private db: IDBPDatabase | null = null;
  private currentCashDrawerSession: CashDrawerSession | null = null;
  private settings: PaymentSettings | null = null;
  private readonly TAX_RATE = 0.08; // 8% default tax rate
  private readonly FRAUD_THRESHOLD_AMOUNT = 500; // $500 fraud threshold
  
  async initDB() {
    if (this.db) return this.db;

    this.db = await openDB('PWAPaymentDB', 1, {
      upgrade(db) {
        // Payment transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('eventId', 'eventId');
          transactionStore.createIndex('staffId', 'staffId');
          transactionStore.createIndex('status', 'status');
          transactionStore.createIndex('timestamp', 'timestamp');
          transactionStore.createIndex('syncStatus', 'syncStatus');
        }

        // Cash drawer sessions store
        if (!db.objectStoreNames.contains('cashDrawerSessions')) {
          const drawerStore = db.createObjectStore('cashDrawerSessions', { keyPath: 'id' });
          drawerStore.createIndex('staffId', 'staffId');
          drawerStore.createIndex('eventId', 'eventId');
          drawerStore.createIndex('status', 'status');
        }

        // Daily sales reports store
        if (!db.objectStoreNames.contains('salesReports')) {
          const reportsStore = db.createObjectStore('salesReports', { keyPath: ['date', 'eventId'] });
          reportsStore.createIndex('date', 'date');
          reportsStore.createIndex('eventId', 'eventId');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Offline sync queue
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('type', 'type');
          syncStore.createIndex('priority', 'priority');
        }
      },
    });

    return this.db;
  }

  async getSettings(): Promise<PaymentSettings> {
    if (this.settings) return this.settings;

    await this.initDB();
    const tx = this.db!.transaction('settings', 'readonly');
    const storedSettings = await tx.store.get('paymentSettings');
    
    this.settings = storedSettings?.value || {
      taxRate: this.TAX_RATE,
      tipEnabled: true,
      defaultTipPercentages: [15, 18, 20, 25],
      cashDrawerEnabled: true,
      receiptPrinting: true,
      receiptEmail: true,
      receiptSMS: false,
      fraudDetection: true,
      offlineMode: true,
      pciComplianceMode: true,
      currencyCode: 'USD' as const
    };

    return this.settings;
  }

  async updateSettings(newSettings: Partial<PaymentSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    this.settings = { ...currentSettings, ...newSettings };
    
    await this.initDB();
    const tx = this.db!.transaction('settings', 'readwrite');
    await tx.store.put({ key: 'paymentSettings', value: this.settings });
  }

  // Transaction Management
  async createTransaction(
    eventId: string,
    items: PaymentItem[],
    customerInfo: {
      name: string;
      email: string;
      phone?: string;
      customerId?: string;
    },
    staffId: string
  ): Promise<PWAPaymentTransaction> {
    const settings = await this.getSettings();
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * settings.taxRate;
    const totalAmount = subtotal + taxAmount;

    const transaction: PWAPaymentTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      customerId: customerInfo.customerId,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      paymentMethod: 'cash', // Will be updated when payment is processed
      paymentDetails: {},
      items,
      subtotal,
      taxAmount,
      tipAmount: 0,
      discountAmount: 0,
      totalAmount,
      status: 'pending',
      timestamp: new Date().toISOString(),
      staffId,
      receiptNumber: this.generateReceiptNumber(),
      receiptSent: false,
      syncStatus: 'pending',
      refundHistory: [],
      fraudAlerts: []
    };

    await this.initDB();
    const tx = this.db!.transaction('transactions', 'readwrite');
    await tx.store.put(transaction);

    return transaction;
  }

  async processCashPayment(
    transactionId: string,
    amountTendered: number,
    tipAmount: number = 0
  ): Promise<PWAPaymentTransaction> {
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    const totalWithTip = transaction.totalAmount + tipAmount;
    
    if (amountTendered < totalWithTip) {
      throw new Error('Insufficient payment amount');
    }

    const changeGiven = amountTendered - totalWithTip;

    const updatedTransaction: PWAPaymentTransaction = {
      ...transaction,
      paymentMethod: 'cash',
      tipAmount,
      totalAmount: totalWithTip,
      paymentDetails: {
        cash: {
          amountTendered,
          changeGiven,
          drawerSession: this.currentCashDrawerSession?.id
        }
      },
      status: 'completed',
      syncStatus: 'pending'
    };

    await this.updateTransaction(updatedTransaction);
    await this.addToCashDrawer(totalWithTip);
    await this.addToSyncQueue({
      type: 'transaction',
      action: 'create',
      data: updatedTransaction,
      priority: 'high'
    });

    return updatedTransaction;
  }

  async processCardPayment(
    transactionId: string,
    cardDetails: {
      last4: string;
      cardType: string;
      authCode: string;
      terminalId?: string;
      emvChip: boolean;
      contactless: boolean;
    },
    tipAmount: number = 0
  ): Promise<PWAPaymentTransaction> {
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    // Fraud detection check
    const fraudAlerts = await this.checkForFraud(transaction, cardDetails);

    const updatedTransaction: PWAPaymentTransaction = {
      ...transaction,
      paymentMethod: 'card',
      tipAmount,
      totalAmount: transaction.totalAmount + tipAmount,
      paymentDetails: {
        card: cardDetails
      },
      status: 'completed',
      syncStatus: 'pending',
      fraudAlerts
    };

    await this.updateTransaction(updatedTransaction);
    await this.addToSyncQueue({
      type: 'transaction',
      action: 'create',
      data: updatedTransaction,
      priority: 'high'
    });

    return updatedTransaction;
  }

  async processDigitalWalletPayment(
    transactionId: string,
    walletDetails: {
      walletType: 'apple_pay' | 'google_pay' | 'samsung_pay';
      deviceId: string;
      transactionId: string;
    },
    tipAmount: number = 0
  ): Promise<PWAPaymentTransaction> {
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    const updatedTransaction: PWAPaymentTransaction = {
      ...transaction,
      paymentMethod: 'digital_wallet',
      tipAmount,
      totalAmount: transaction.totalAmount + tipAmount,
      paymentDetails: {
        digitalWallet: walletDetails
      },
      status: 'completed',
      syncStatus: 'pending'
    };

    await this.updateTransaction(updatedTransaction);
    await this.addToSyncQueue({
      type: 'transaction',
      action: 'create',
      data: updatedTransaction,
      priority: 'high'
    });

    return updatedTransaction;
  }

  async processRefund(
    transactionId: string,
    amount: number,
    reason: string,
    staffId: string,
    refundMethod: 'original' | 'cash' | 'store_credit' = 'original'
  ): Promise<PWAPaymentTransaction> {
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    if (transaction.status !== 'completed') {
      throw new Error('Can only refund completed transactions');
    }

    const totalRefunded = transaction.refundHistory.reduce((sum, refund) => 
      refund.status === 'completed' ? sum + refund.amount : sum, 0
    );
    
    if (totalRefunded + amount > transaction.totalAmount) {
      throw new Error('Refund amount exceeds transaction total');
    }

    const refund: RefundRecord = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      reason,
      staffId,
      timestamp: new Date().toISOString(),
      refundMethod,
      status: 'completed'
    };

    const updatedTransaction: PWAPaymentTransaction = {
      ...transaction,
      refundHistory: [...transaction.refundHistory, refund],
      status: totalRefunded + amount >= transaction.totalAmount ? 'refunded' : 'completed',
      syncStatus: 'pending'
    };

    await this.updateTransaction(updatedTransaction);
    
    // Handle cash drawer adjustment for cash refunds
    if (refundMethod === 'cash' && this.currentCashDrawerSession) {
      await this.removeFromCashDrawer(amount);
    }

    await this.addToSyncQueue({
      type: 'refund',
      action: 'create',
      data: { transactionId, refund },
      priority: 'high'
    });

    return updatedTransaction;
  }

  async voidTransaction(
    transactionId: string,
    reason: string,
    staffId: string
  ): Promise<PWAPaymentTransaction> {
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    if (transaction.status !== 'pending' && transaction.status !== 'processing') {
      throw new Error('Can only void pending or processing transactions');
    }

    const updatedTransaction: PWAPaymentTransaction = {
      ...transaction,
      status: 'voided',
      notes: `Voided by ${staffId}: ${reason}`,
      syncStatus: 'pending'
    };

    await this.updateTransaction(updatedTransaction);
    await this.addToSyncQueue({
      type: 'transaction',
      action: 'void',
      data: { transactionId, reason, staffId },
      priority: 'medium'
    });

    return updatedTransaction;
  }

  // Cash Drawer Management
  async openCashDrawer(
    staffId: string,
    eventId: string,
    openingBalance: number
  ): Promise<CashDrawerSession> {
    if (this.currentCashDrawerSession?.status === 'open') {
      throw new Error('Cash drawer is already open');
    }

    const session: CashDrawerSession = {
      id: `drawer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      staffId,
      eventId,
      openingBalance,
      currentBalance: openingBalance,
      expectedBalance: openingBalance,
      status: 'open',
      openedAt: new Date().toISOString(),
      transactions: [],
      cashCounts: []
    };

    await this.initDB();
    const tx = this.db!.transaction('cashDrawerSessions', 'readwrite');
    await tx.store.put(session);

    this.currentCashDrawerSession = session;
    return session;
  }

  async closeCashDrawer(
    actualCounts: CashCount[],
    notes?: string
  ): Promise<CashDrawerSession> {
    if (!this.currentCashDrawerSession || this.currentCashDrawerSession.status !== 'open') {
      throw new Error('No open cash drawer session');
    }

    const actualBalance = actualCounts.reduce((sum, count) => sum + count.value, 0);
    
    const updatedSession: CashDrawerSession = {
      ...this.currentCashDrawerSession,
      status: 'closed',
      closedAt: new Date().toISOString(),
      currentBalance: actualBalance,
      cashCounts: actualCounts
    };

    await this.initDB();
    const tx = this.db!.transaction('cashDrawerSessions', 'readwrite');
    await tx.store.put(updatedSession);

    this.currentCashDrawerSession = null;
    return updatedSession;
  }

  private async addToCashDrawer(amount: number): Promise<void> {
    if (this.currentCashDrawerSession) {
      this.currentCashDrawerSession.expectedBalance += amount;
      
      await this.initDB();
      const tx = this.db!.transaction('cashDrawerSessions', 'readwrite');
      await tx.store.put(this.currentCashDrawerSession);
    }
  }

  private async removeFromCashDrawer(amount: number): Promise<void> {
    if (this.currentCashDrawerSession) {
      this.currentCashDrawerSession.expectedBalance -= amount;
      
      await this.initDB();
      const tx = this.db!.transaction('cashDrawerSessions', 'readwrite');
      await tx.store.put(this.currentCashDrawerSession);
    }
  }

  // Transaction Queries
  async getTransaction(transactionId: string): Promise<PWAPaymentTransaction | null> {
    await this.initDB();
    const tx = this.db!.transaction('transactions', 'readonly');
    return await tx.store.get(transactionId) || null;
  }

  async getTransactionsByEvent(eventId: string): Promise<PWAPaymentTransaction[]> {
    await this.initDB();
    const tx = this.db!.transaction('transactions', 'readonly');
    const index = tx.store.index('eventId');
    return await index.getAll(eventId);
  }

  async getTransactionsByDateRange(
    startDate: string,
    endDate: string,
    eventId?: string
  ): Promise<PWAPaymentTransaction[]> {
    await this.initDB();
    const tx = this.db!.transaction('transactions', 'readonly');
    const allTransactions = await tx.store.getAll();
    
    return allTransactions.filter(transaction => {
      const transactionDate = transaction.timestamp;
      const matchesDate = transactionDate >= startDate && transactionDate <= endDate;
      const matchesEvent = !eventId || transaction.eventId === eventId;
      return matchesDate && matchesEvent;
    });
  }

  async updateTransaction(transaction: PWAPaymentTransaction): Promise<void> {
    await this.initDB();
    const tx = this.db!.transaction('transactions', 'readwrite');
    await tx.store.put(transaction);
  }

  // Reports and Analytics
  async generateDailySalesReport(
    date: string,
    eventId: string
  ): Promise<DailySalesReport> {
    const startDate = `${date}T00:00:00.000Z`;
    const endDate = `${date}T23:59:59.999Z`;
    
    const transactions = await this.getTransactionsByDateRange(startDate, endDate, eventId);
    const completedTransactions = transactions.filter(t => t.status === 'completed');

    const totalSales = completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalTransactions = completedTransactions.length;

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

    // Tax and tips
    const taxCollected = completedTransactions.reduce((sum, t) => sum + t.taxAmount, 0);
    const tipsCollected = completedTransactions.reduce((sum, t) => sum + t.tipAmount, 0);

    // Refunds
    const refundsIssued = transactions
      .flatMap(t => t.refundHistory)
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    // Staff performance
    const staffPerformance: Record<string, { transactions: number; sales: number }> = {};
    completedTransactions.forEach(transaction => {
      const staffId = transaction.staffId;
      if (!staffPerformance[staffId]) {
        staffPerformance[staffId] = { transactions: 0, sales: 0 };
      }
      staffPerformance[staffId].transactions++;
      staffPerformance[staffId].sales += transaction.totalAmount;
    });

    // Hourly breakdown
    const hourlyBreakdown: Array<{ hour: string; transactions: number; sales: number }> = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = `${date}T${hour.toString().padStart(2, '0')}:00:00.000Z`;
      const hourEnd = `${date}T${hour.toString().padStart(2, '0')}:59:59.999Z`;
      
      const hourTransactions = completedTransactions.filter(t => 
        t.timestamp >= hourStart && t.timestamp <= hourEnd
      );
      
      hourlyBreakdown.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        transactions: hourTransactions.length,
        sales: hourTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
      });
    }

    // Top items
    const itemSales: Record<string, { quantity: number; revenue: number }> = {};
    completedTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = { quantity: 0, revenue: 0 };
        }
        itemSales[item.name].quantity += item.quantity;
        itemSales[item.name].revenue += item.totalPrice;
      });
    });

    const topItems = Object.entries(itemSales)
      .map(([item, data]) => ({ item, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const report: DailySalesReport = {
      date,
      eventId,
      totalSales,
      totalTransactions,
      paymentMethodBreakdown,
      taxCollected,
      tipsCollected,
      refundsIssued,
      staffPerformance,
      hourlyBreakdown,
      topItems
    };

    // Cache the report
    await this.initDB();
    const tx = this.db!.transaction('salesReports', 'readwrite');
    await tx.store.put(report);

    return report;
  }

  // Utility Methods
  private generateReceiptNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `RCP-${timestamp.slice(-8)}-${random}`;
  }

  private async checkForFraud(
    transaction: PWAPaymentTransaction,
    cardDetails: any
  ): Promise<FraudAlert[]> {
    const settings = await this.getSettings();
    if (!settings.fraudDetection) return [];

    const alerts: FraudAlert[] = [];

    // Check for suspicious amount
    if (transaction.totalAmount > this.FRAUD_THRESHOLD_AMOUNT) {
      alerts.push({
        id: `fraud_${Date.now()}`,
        type: 'suspicious_amount',
        severity: 'medium',
        message: `High transaction amount: $${transaction.totalAmount.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    return alerts;
  }

  private async addToSyncQueue(item: any): Promise<void> {
    await this.initDB();
    const tx = this.db!.transaction('syncQueue', 'readwrite');
    await tx.store.add({
      ...item,
      timestamp: new Date().toISOString(),
      attempts: 0
    });
  }

  // Format helpers
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  getCurrentCashDrawerSession(): CashDrawerSession | null {
    return this.currentCashDrawerSession;
  }
}

export const pwaPaymentService = new PWAPaymentService();