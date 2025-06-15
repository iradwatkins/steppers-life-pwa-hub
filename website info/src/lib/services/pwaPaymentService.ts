// PWA Payment Processing Service
// Handles on-site payment processing with offline capabilities

export interface PaymentMethod {
  id: string;
  type: 'cash' | 'card' | 'digital_wallet' | 'qr_code' | 'split';
  name: string;
  icon: string;
  enabled: boolean;
  processingFee?: number;
}

export interface PaymentTransaction {
  id: string;
  eventId: string;
  attendeeId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  timestamp: string;
  description: string;
  receiptNumber: string;
  
  // Payment method specific data
  cardDetails?: {
    last4: string;
    brand: string;
    transactionId: string;
  };
  cashDetails?: {
    amountReceived: number;
    change: number;
    denomination?: { [key: string]: number };
  };
  digitalWalletDetails?: {
    walletType: 'apple_pay' | 'google_pay' | 'samsung_pay';
    transactionId: string;
  };
  qrCodeDetails?: {
    qrCodeId: string;
    scanTimestamp: string;
  };
  
  // Split payment details
  splitPayments?: {
    method: PaymentMethod;
    amount: number;
    status: string;
  }[];
  
  // Receipt and record keeping
  items: PaymentItem[];
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Metadata
  staffId: string;
  deviceId: string;
  location?: string;
  notes?: string;
  refundReason?: string;
  
  // Offline handling
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed';
  offlineTimestamp?: string;
}

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  taxRate: number;
  discountAmount?: number;
}

export interface PaymentQueue {
  id: string;
  transactions: PaymentTransaction[];
  totalAmount: number;
  status: 'active' | 'processing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReceipt {
  id: string;
  transactionId: string;
  receiptNumber: string;
  eventName: string;
  timestamp: string;
  items: PaymentItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  staffName: string;
  location: string;
  
  // Digital receipt options
  emailSent?: boolean;
  smsSent?: boolean;
  printedAt?: string;
}

export interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  
  // By payment method
  cashTransactions: { count: number; amount: number };
  cardTransactions: { count: number; amount: number };
  digitalWalletTransactions: { count: number; amount: number };
  qrCodeTransactions: { count: number; amount: number };
  
  // Time-based stats
  hourlyVolume: { [hour: string]: number };
  peakTransactionTime: string;
  averageTransactionAmount: number;
  
  // Queue management
  pendingSyncTransactions: number;
  offlineTransactions: number;
  lastSyncTime: string;
}

export interface PaymentSettings {
  enabledMethods: PaymentMethod[];
  cashDrawerEnabled: boolean;
  receiptPrinterEnabled: boolean;
  offlineMode: boolean;
  autoSyncInterval: number;
  requireSignature: boolean;
  maximumCashAmount: number;
  taxRate: number;
  currency: string;
  receiptFooter: string;
}

class PWAPaymentService {
  private payments: PaymentTransaction[] = [];
  private queue: PaymentQueue[] = [];
  private receipts: PaymentReceipt[] = [];
  private settings: PaymentSettings;
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.settings = this.getDefaultSettings();
    this.initializeService();
    this.setupOfflineHandling();
    this.generateMockData();
  }

  private getDefaultSettings(): PaymentSettings {
    return {
      enabledMethods: [
        {
          id: 'cash',
          type: 'cash',
          name: 'Cash',
          icon: '💵',
          enabled: true
        },
        {
          id: 'card',
          type: 'card',
          name: 'Credit/Debit Card',
          icon: '💳',
          enabled: true,
          processingFee: 0.029
        },
        {
          id: 'apple_pay',
          type: 'digital_wallet',
          name: 'Apple Pay',
          icon: '🍎',
          enabled: true,
          processingFee: 0.015
        },
        {
          id: 'google_pay',
          type: 'digital_wallet',
          name: 'Google Pay',
          icon: '🔍',
          enabled: true,
          processingFee: 0.015
        },
        {
          id: 'qr_code',
          type: 'qr_code',
          name: 'QR Code Payment',
          icon: '📱',
          enabled: true,
          processingFee: 0.01
        }
      ],
      cashDrawerEnabled: true,
      receiptPrinterEnabled: true,
      offlineMode: true,
      autoSyncInterval: 30000, // 30 seconds
      requireSignature: false,
      maximumCashAmount: 1000,
      taxRate: 0.08,
      currency: 'USD',
      receiptFooter: 'Thank you for your business!'
    };
  }

  private initializeService(): void {
    // Load cached data
    this.loadCachedData();
    
    // Setup auto-sync
    if (this.settings.autoSyncInterval > 0) {
      this.setupAutoSync();
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingTransactions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupOfflineHandling(): void {
    // Enable offline capabilities
    if (this.settings.offlineMode) {
      // Cache payment methods and settings
      this.cacheData();
    }
  }

  private setupAutoSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingTransactions();
      }
    }, this.settings.autoSyncInterval);
  }

  // Payment Processing Methods
  async processPayment(paymentData: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const transaction: PaymentTransaction = {
      id: this.generateTransactionId(),
      eventId: paymentData.eventId || 'default-event',
      attendeeId: paymentData.attendeeId,
      amount: paymentData.amount || 0,
      currency: this.settings.currency,
      paymentMethod: paymentData.paymentMethod || this.settings.enabledMethods[0],
      status: 'processing',
      timestamp: new Date().toISOString(),
      description: paymentData.description || 'Event Payment',
      receiptNumber: this.generateReceiptNumber(),
      items: paymentData.items || [],
      taxAmount: this.calculateTax(paymentData.amount || 0),
      discountAmount: paymentData.discountAmount || 0,
      totalAmount: this.calculateTotal(paymentData.amount || 0, paymentData.discountAmount || 0),
      staffId: paymentData.staffId || 'current-staff',
      deviceId: this.getDeviceId(),
      syncStatus: this.isOnline ? 'synced' : 'pending_sync',
      ...(paymentData as any)
    };

    try {
      // Process based on payment method
      const processedTransaction = await this.processPaymentByMethod(transaction);
      
      // Add to payments array
      this.payments.push(processedTransaction);
      
      // Generate receipt
      const receipt = this.generateReceipt(processedTransaction);
      this.receipts.push(receipt);
      
      // Cache the transaction
      this.cacheData();
      
      // Sync if online
      if (this.isOnline) {
        await this.syncTransaction(processedTransaction);
      }

      return processedTransaction;
    } catch (error) {
      transaction.status = 'failed';
      this.payments.push(transaction);
      this.cacheData();
      throw error;
    }
  }

  private async processPaymentByMethod(transaction: PaymentTransaction): Promise<PaymentTransaction> {
    switch (transaction.paymentMethod.type) {
      case 'cash':
        return this.processCashPayment(transaction);
      case 'card':
        return await this.processCardPayment(transaction);
      case 'digital_wallet':
        return await this.processDigitalWalletPayment(transaction);
      case 'qr_code':
        return await this.processQRCodePayment(transaction);
      case 'split':
        return await this.processSplitPayment(transaction);
      default:
        throw new Error(`Unsupported payment method: ${transaction.paymentMethod.type}`);
    }
  }

  private processCashPayment(transaction: PaymentTransaction): PaymentTransaction {
    // Simulate cash payment processing
    const amountReceived = transaction.amount + 5; // Example: customer gives more
    const change = amountReceived - transaction.amount;
    
    transaction.cashDetails = {
      amountReceived,
      change,
      denomination: {
        '20': 2,
        '10': 0,
        '5': 1,
        '1': 0
      }
    };
    
    transaction.status = 'completed';
    return transaction;
  }

  private async processCardPayment(transaction: PaymentTransaction): Promise<PaymentTransaction> {
    // Simulate card payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        transaction.cardDetails = {
          last4: '1234',
          brand: 'Visa',
          transactionId: `card_${Date.now()}`
        };
        transaction.status = 'completed';
        resolve(transaction);
      }, 2000); // Simulate processing time
    });
  }

  private async processDigitalWalletPayment(transaction: PaymentTransaction): Promise<PaymentTransaction> {
    // Simulate digital wallet payment
    return new Promise((resolve) => {
      setTimeout(() => {
        transaction.digitalWalletDetails = {
          walletType: transaction.paymentMethod.id === 'apple_pay' ? 'apple_pay' : 'google_pay',
          transactionId: `wallet_${Date.now()}`
        };
        transaction.status = 'completed';
        resolve(transaction);
      }, 1500);
    });
  }

  private async processQRCodePayment(transaction: PaymentTransaction): Promise<PaymentTransaction> {
    // Simulate QR code payment
    return new Promise((resolve) => {
      setTimeout(() => {
        transaction.qrCodeDetails = {
          qrCodeId: `qr_${Date.now()}`,
          scanTimestamp: new Date().toISOString()
        };
        transaction.status = 'completed';
        resolve(transaction);
      }, 1000);
    });
  }

  private async processSplitPayment(transaction: PaymentTransaction): Promise<PaymentTransaction> {
    // Handle split payments
    if (transaction.splitPayments) {
      for (const split of transaction.splitPayments) {
        // Process each split payment
        split.status = 'completed';
      }
    }
    transaction.status = 'completed';
    return transaction;
  }

  // Refund Methods
  async processRefund(transactionId: string, amount: number, reason: string): Promise<PaymentTransaction> {
    const originalTransaction = this.payments.find(p => p.id === transactionId);
    if (!originalTransaction) {
      throw new Error('Transaction not found');
    }

    const refundTransaction: PaymentTransaction = {
      ...originalTransaction,
      id: this.generateTransactionId(),
      amount: -amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      receiptNumber: this.generateReceiptNumber(),
      refundReason: reason,
      description: `Refund: ${originalTransaction.description}`,
      syncStatus: this.isOnline ? 'synced' : 'pending_sync'
    };

    // Update original transaction
    originalTransaction.status = 'refunded';
    
    this.payments.push(refundTransaction);
    this.cacheData();

    return refundTransaction;
  }

  // Receipt Generation
  private generateReceipt(transaction: PaymentTransaction): PaymentReceipt {
    return {
      id: `receipt_${Date.now()}`,
      transactionId: transaction.id,
      receiptNumber: transaction.receiptNumber,
      eventName: 'Sample Event', // Would come from event data
      timestamp: transaction.timestamp,
      items: transaction.items,
      subtotal: transaction.amount,
      taxAmount: transaction.taxAmount,
      discountAmount: transaction.discountAmount,
      totalAmount: transaction.totalAmount,
      paymentMethod: transaction.paymentMethod,
      staffName: 'Staff Member', // Would come from staff data
      location: transaction.location || 'Main Entrance'
    };
  }

  // Data Management
  getPayments(filters?: {
    eventId?: string;
    status?: string;
    paymentMethod?: string;
    dateRange?: { start: string; end: string };
  }): PaymentTransaction[] {
    let filtered = [...this.payments];

    if (filters) {
      if (filters.eventId) {
        filtered = filtered.filter(p => p.eventId === filters.eventId);
      }
      if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      if (filters.paymentMethod) {
        filtered = filtered.filter(p => p.paymentMethod.type === filters.paymentMethod);
      }
      if (filters.dateRange) {
        filtered = filtered.filter(p => 
          p.timestamp >= filters.dateRange!.start && 
          p.timestamp <= filters.dateRange!.end
        );
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getPaymentStats(eventId?: string): PaymentStats {
    const payments = eventId ? 
      this.payments.filter(p => p.eventId === eventId) : 
      this.payments;

    const successful = payments.filter(p => p.status === 'completed');
    const failed = payments.filter(p => p.status === 'failed');
    const refunded = payments.filter(p => p.status === 'refunded');

    const cash = successful.filter(p => p.paymentMethod.type === 'cash');
    const card = successful.filter(p => p.paymentMethod.type === 'card');
    const digitalWallet = successful.filter(p => p.paymentMethod.type === 'digital_wallet');
    const qrCode = successful.filter(p => p.paymentMethod.type === 'qr_code');

    return {
      totalTransactions: payments.length,
      totalAmount: successful.reduce((sum, p) => sum + p.totalAmount, 0),
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      refundedTransactions: refunded.length,
      
      cashTransactions: {
        count: cash.length,
        amount: cash.reduce((sum, p) => sum + p.totalAmount, 0)
      },
      cardTransactions: {
        count: card.length,
        amount: card.reduce((sum, p) => sum + p.totalAmount, 0)
      },
      digitalWalletTransactions: {
        count: digitalWallet.length,
        amount: digitalWallet.reduce((sum, p) => sum + p.totalAmount, 0)
      },
      qrCodeTransactions: {
        count: qrCode.length,
        amount: qrCode.reduce((sum, p) => sum + p.totalAmount, 0)
      },
      
      hourlyVolume: this.calculateHourlyVolume(successful),
      peakTransactionTime: this.calculatePeakTime(successful),
      averageTransactionAmount: successful.length > 0 ? 
        successful.reduce((sum, p) => sum + p.totalAmount, 0) / successful.length : 0,
      
      pendingSyncTransactions: payments.filter(p => p.syncStatus === 'pending_sync').length,
      offlineTransactions: payments.filter(p => p.offlineTimestamp).length,
      lastSyncTime: new Date().toISOString()
    };
  }

  // Utility Methods
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReceiptNumber(): string {
    return `RCP${Date.now().toString().slice(-8)}`;
  }

  private getDeviceId(): string {
    return localStorage.getItem('deviceId') || 'device_' + Math.random().toString(36).substr(2, 9);
  }

  private calculateTax(amount: number): number {
    return amount * this.settings.taxRate;
  }

  private calculateTotal(amount: number, discount: number): number {
    const subtotal = amount - discount;
    return subtotal + this.calculateTax(subtotal);
  }

  private calculateHourlyVolume(transactions: PaymentTransaction[]): { [hour: string]: number } {
    const hourlyVolume: { [hour: string]: number } = {};
    
    transactions.forEach(transaction => {
      const hour = new Date(transaction.timestamp).getHours().toString().padStart(2, '0');
      hourlyVolume[hour] = (hourlyVolume[hour] || 0) + transaction.totalAmount;
    });
    
    return hourlyVolume;
  }

  private calculatePeakTime(transactions: PaymentTransaction[]): string {
    const hourlyCount: { [hour: string]: number } = {};
    
    transactions.forEach(transaction => {
      const hour = new Date(transaction.timestamp).getHours().toString().padStart(2, '0');
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    });
    
    const peakHour = Object.entries(hourlyCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    return peakHour ? `${peakHour[0]}:00` : '12:00';
  }

  // Offline and Sync Methods
  private async syncPendingTransactions(): Promise<void> {
    const pendingTransactions = this.payments.filter(p => p.syncStatus === 'pending_sync');
    
    for (const transaction of pendingTransactions) {
      try {
        await this.syncTransaction(transaction);
        transaction.syncStatus = 'synced';
      } catch (error) {
        transaction.syncStatus = 'sync_failed';
        console.error('Failed to sync transaction:', transaction.id, error);
      }
    }
    
    this.cacheData();
  }

  private async syncTransaction(transaction: PaymentTransaction): Promise<void> {
    // Simulate API call to sync transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Transaction synced:', transaction.id);
        resolve();
      }, 500);
    });
  }

  private cacheData(): void {
    try {
      localStorage.setItem('pwa_payments', JSON.stringify(this.payments));
      localStorage.setItem('pwa_receipts', JSON.stringify(this.receipts));
      localStorage.setItem('pwa_payment_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to cache payment data:', error);
    }
  }

  private loadCachedData(): void {
    try {
      const cachedPayments = localStorage.getItem('pwa_payments');
      const cachedReceipts = localStorage.getItem('pwa_receipts');
      const cachedSettings = localStorage.getItem('pwa_payment_settings');

      if (cachedPayments) {
        this.payments = JSON.parse(cachedPayments);
      }
      if (cachedReceipts) {
        this.receipts = JSON.parse(cachedReceipts);
      }
      if (cachedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(cachedSettings) };
      }
    } catch (error) {
      console.error('Failed to load cached payment data:', error);
    }
  }

  // Settings Management
  updateSettings(newSettings: Partial<PaymentSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.cacheData();
    
    // Restart auto-sync if interval changed
    if (newSettings.autoSyncInterval !== undefined) {
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }
      if (newSettings.autoSyncInterval > 0) {
        this.setupAutoSync();
      }
    }
  }

  getSettings(): PaymentSettings {
    return { ...this.settings };
  }

  // Mock Data Generation
  private generateMockData(): void {
    const mockPayments: PaymentTransaction[] = [
      {
        id: 'txn_1',
        eventId: 'event-123',
        attendeeId: 'att-1',
        amount: 45.00,
        currency: 'USD',
        paymentMethod: this.settings.enabledMethods.find(m => m.type === 'cash')!,
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        description: 'Event Ticket',
        receiptNumber: 'RCP00001',
        items: [
          {
            id: 'item1',
            name: 'General Admission',
            quantity: 1,
            unitPrice: 45.00,
            totalPrice: 45.00,
            category: 'Tickets',
            taxRate: 0.08
          }
        ],
        taxAmount: 3.60,
        discountAmount: 0,
        totalAmount: 48.60,
        staffId: 'staff-1',
        deviceId: this.getDeviceId(),
        syncStatus: 'synced',
        cashDetails: {
          amountReceived: 50.00,
          change: 1.40
        }
      },
      {
        id: 'txn_2',
        eventId: 'event-123',
        amount: 75.00,
        currency: 'USD',
        paymentMethod: this.settings.enabledMethods.find(m => m.type === 'card')!,
        status: 'completed',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        description: 'VIP Ticket + Merchandise',
        receiptNumber: 'RCP00002',
        items: [
          {
            id: 'item2',
            name: 'VIP Ticket',
            quantity: 1,
            unitPrice: 65.00,
            totalPrice: 65.00,
            category: 'Tickets',
            taxRate: 0.08
          },
          {
            id: 'item3',
            name: 'Event T-Shirt',
            quantity: 1,
            unitPrice: 10.00,
            totalPrice: 10.00,
            category: 'Merchandise',
            taxRate: 0.08
          }
        ],
        taxAmount: 6.00,
        discountAmount: 0,
        totalAmount: 81.00,
        staffId: 'staff-1',
        deviceId: this.getDeviceId(),
        syncStatus: 'synced',
        cardDetails: {
          last4: '4567',
          brand: 'Mastercard',
          transactionId: 'card_1234567890'
        }
      }
    ];

    this.payments = mockPayments;
    this.receipts = mockPayments.map(p => this.generateReceipt(p));
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    window.removeEventListener('online', this.syncPendingTransactions);
    window.removeEventListener('offline', () => this.isOnline = false);
  }
}

// Export singleton instance
export const pwaPaymentService = new PWAPaymentService();
export default pwaPaymentService; 