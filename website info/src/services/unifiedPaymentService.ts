// Unified Payment and Payout Service for all platform transactions
export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit_card' | 'bank_transfer' | 'paypal' | 'apple_pay' | 'google_pay';
  isDefault: boolean;
  details: {
    // Credit Card
    cardLast4?: string;
    cardBrand?: string;
    cardExpiry?: string;
    // Bank Transfer
    bankName?: string;
    accountLast4?: string;
    routingNumber?: string;
    // PayPal
    paypalEmail?: string;
    // Digital Wallets
    walletId?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'charge' | 'refund' | 'payout' | 'transfer';
  category: 'vod_purchase' | 'event_ticket' | 'promotional_product' | 'tshirt_sale' | 'subscription' | 'other';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  paymentMethodId?: string;
  paymentReference: string; // External payment processor reference
  description: string;
  metadata: Record<string, any>;
  processingFee: number;
  netAmount: number;
  createdAt: Date;
  processedAt?: Date;
  failureReason?: string;
  relatedTransactionId?: string; // For refunds, links to original transaction
}

export interface PayoutAccount {
  id: string;
  userId: string;
  type: 'bank_account' | 'paypal' | 'debit_card';
  details: {
    // Bank Account
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string; // Encrypted/masked
    routingNumber?: string;
    accountType?: 'checking' | 'savings';
    // PayPal
    paypalEmail?: string;
    // Debit Card
    cardLast4?: string;
    cardBrand?: string;
  };
  isDefault: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'requires_action';
  createdAt: Date;
  verifiedAt?: Date;
  failureReason?: string;
}

export interface Payout {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payoutAccountId: string;
  category: 'vod_earnings' | 'tshirt_earnings' | 'event_revenue' | 'commission' | 'affiliate' | 'other';
  period: {
    startDate: Date;
    endDate: Date;
  };
  transactionIds: string[]; // Transactions included in this payout
  processingFee: number;
  netAmount: number;
  payoutReference?: string; // External payout processor reference
  scheduledFor?: Date;
  processedAt?: Date;
  failureReason?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface PaymentConfig {
  processors: {
    stripe: {
      enabled: boolean;
      publicKey: string;
      webhookSecret: string;
    };
    paypal: {
      enabled: boolean;
      clientId: string;
      webhookId: string;
    };
    square: {
      enabled: boolean;
      applicationId: string;
      locationId: string;
    };
  };
  fees: {
    creditCard: number; // Percentage
    bankTransfer: number; // Fixed amount
    paypal: number; // Percentage
    digitalWallet: number; // Percentage
  };
  limits: {
    dailyTransactionLimit: number;
    monthlyTransactionLimit: number;
    singleTransactionLimit: number;
    minimumPayout: number;
    maximumPayout: number;
  };
  payoutSchedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // For weekly (0-6)
    dayOfMonth?: number; // For monthly (1-31)
    cutoffTime: string; // "16:00"
    timezone: string;
  };
}

class UnifiedPaymentService {
  private paymentMethods: PaymentMethod[] = [];
  private transactions: Transaction[] = [];
  private payoutAccounts: PayoutAccount[] = [];
  private payouts: Payout[] = [];
  private config: PaymentConfig = {
    processors: {
      stripe: {
        enabled: true,
        publicKey: 'pk_test_mock_stripe_key',
        webhookSecret: 'whsec_mock_webhook_secret'
      },
      paypal: {
        enabled: true,
        clientId: 'mock_paypal_client_id',
        webhookId: 'mock_webhook_id'
      },
      square: {
        enabled: false,
        applicationId: 'mock_square_app_id',
        locationId: 'mock_location_id'
      }
    },
    fees: {
      creditCard: 2.9, // 2.9%
      bankTransfer: 0.50, // $0.50
      paypal: 3.49, // 3.49%
      digitalWallet: 2.9 // 2.9%
    },
    limits: {
      dailyTransactionLimit: 10000,
      monthlyTransactionLimit: 100000,
      singleTransactionLimit: 5000,
      minimumPayout: 25,
      maximumPayout: 25000
    },
    payoutSchedule: {
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      cutoffTime: '16:00',
      timezone: 'America/Chicago'
    }
  };

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock payment methods
    this.paymentMethods = [
      {
        id: 'pm_001',
        userId: 'user_001',
        type: 'credit_card',
        isDefault: true,
        details: {
          cardLast4: '4242',
          cardBrand: 'Visa',
          cardExpiry: '12/25'
        },
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'pm_002',
        userId: 'user_002',
        type: 'paypal',
        isDefault: true,
        details: {
          paypalEmail: 'user@example.com'
        },
        isActive: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    ];

    // Mock transactions
    this.transactions = [
      {
        id: 'txn_001',
        userId: 'user_001',
        type: 'charge',
        category: 'vod_purchase',
        amount: 49.99,
        currency: 'USD',
        status: 'completed',
        paymentMethodId: 'pm_001',
        paymentReference: 'ch_mock_stripe_123',
        description: 'VOD Class: Complete Beginner Stepping Course',
        metadata: {
          vodClassId: 'vod_001',
          instructorId: 'instructor_001'
        },
        processingFee: 1.73,
        netAmount: 48.26,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30000)
      },
      {
        id: 'txn_002',
        userId: 'user_002',
        type: 'charge',
        category: 'tshirt_sale',
        amount: 35.00,
        currency: 'USD',
        status: 'completed',
        paymentMethodId: 'pm_002',
        paymentReference: 'pp_mock_paypal_456',
        description: 'T-Shirt: Instructor Signature Series - Size L',
        metadata: {
          listingId: 'listing_001',
          instructorId: 'instructor_001',
          size: 'L',
          color: 'Black'
        },
        processingFee: 1.22,
        netAmount: 33.78,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45000)
      },
      {
        id: 'txn_003',
        userId: 'user_001',
        type: 'charge',
        category: 'promotional_product',
        amount: 21.59,
        currency: 'USD',
        status: 'completed',
        paymentMethodId: 'pm_001',
        paymentReference: 'ch_mock_stripe_789',
        description: 'Professional Business Cards - 500 quantity',
        metadata: {
          orderId: 'order_001',
          productId: 'prod_001',
          quantity: 500
        },
        processingFee: 0.93,
        netAmount: 20.66,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20000)
      }
    ];

    // Mock payout accounts
    this.payoutAccounts = [
      {
        id: 'pa_001',
        userId: 'instructor_001',
        type: 'bank_account',
        details: {
          bankName: 'Chase Bank',
          accountHolderName: 'Marcus Johnson',
          accountNumber: '****7890',
          routingNumber: '021000021',
          accountType: 'checking'
        },
        isDefault: true,
        isVerified: true,
        verificationStatus: 'verified',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        verifiedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'pa_002',
        userId: 'instructor_002',
        type: 'paypal',
        details: {
          paypalEmail: 'instructor@example.com'
        },
        isDefault: true,
        isVerified: true,
        verificationStatus: 'verified',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        verifiedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      }
    ];

    // Mock payouts
    this.payouts = [
      {
        id: 'payout_001',
        userId: 'instructor_001',
        userName: 'Marcus Johnson',
        userRole: 'instructor',
        amount: 1250.00,
        currency: 'USD',
        status: 'completed',
        payoutAccountId: 'pa_001',
        category: 'vod_earnings',
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        transactionIds: ['txn_001'],
        processingFee: 5.00,
        netAmount: 1245.00,
        payoutReference: 'po_mock_stripe_123',
        processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        metadata: {
          totalSales: 25,
          salesAmount: 1500.00,
          platformFee: 250.00
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  // Payment Methods Management
  async addPaymentMethod(userId: string, paymentMethodData: Omit<PaymentMethod, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> {
    // If this is the user's first payment method, make it default
    const existingMethods = this.paymentMethods.filter(pm => pm.userId === userId);
    const isFirstMethod = existingMethods.length === 0;

    const paymentMethod: PaymentMethod = {
      ...paymentMethodData,
      id: `pm_${Date.now()}`,
      userId,
      isDefault: isFirstMethod || paymentMethodData.isDefault,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // If this is being set as default, unset others
    if (paymentMethod.isDefault) {
      this.paymentMethods.forEach(pm => {
        if (pm.userId === userId) {
          pm.isDefault = false;
        }
      });
    }

    this.paymentMethods.push(paymentMethod);
    return Promise.resolve(paymentMethod);
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const methods = this.paymentMethods.filter(pm => pm.userId === userId && pm.isActive);
    return Promise.resolve(methods);
  }

  async updatePaymentMethod(paymentMethodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const method = this.paymentMethods.find(pm => pm.id === paymentMethodId);
    if (!method) {
      throw new Error('Payment method not found');
    }

    Object.assign(method, updates, { updatedAt: new Date() });

    // Handle default payment method logic
    if (updates.isDefault && updates.isDefault !== method.isDefault) {
      this.paymentMethods.forEach(pm => {
        if (pm.userId === method.userId && pm.id !== paymentMethodId) {
          pm.isDefault = false;
        }
      });
    }

    return Promise.resolve(method);
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    const methodIndex = this.paymentMethods.findIndex(pm => pm.id === paymentMethodId);
    if (methodIndex === -1) {
      return Promise.resolve(false);
    }

    const method = this.paymentMethods[methodIndex];
    method.isActive = false;

    // If this was the default method, set another as default
    if (method.isDefault) {
      const otherMethods = this.paymentMethods.filter(pm => pm.userId === method.userId && pm.isActive && pm.id !== paymentMethodId);
      if (otherMethods.length > 0) {
        otherMethods[0].isDefault = true;
      }
    }

    return Promise.resolve(true);
  }

  // Transaction Processing
  async processPayment(paymentData: {
    userId: string;
    amount: number;
    currency: string;
    category: Transaction['category'];
    description: string;
    paymentMethodId?: string;
    metadata?: Record<string, any>;
  }): Promise<Transaction> {
    const { userId, amount, currency, category, description, paymentMethodId, metadata = {} } = paymentData;

    // Get payment method
    let paymentMethod: PaymentMethod | undefined;
    if (paymentMethodId) {
      paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
    } else {
      // Use default payment method
      paymentMethod = this.paymentMethods.find(pm => pm.userId === userId && pm.isDefault && pm.isActive);
    }

    if (!paymentMethod) {
      throw new Error('No valid payment method found');
    }

    // Calculate processing fee
    let feeRate = this.config.fees.creditCard;
    switch (paymentMethod.type) {
      case 'paypal':
        feeRate = this.config.fees.paypal;
        break;
      case 'bank_transfer':
        feeRate = this.config.fees.bankTransfer;
        break;
      case 'apple_pay':
      case 'google_pay':
        feeRate = this.config.fees.digitalWallet;
        break;
    }

    const processingFee = paymentMethod.type === 'bank_transfer' ? feeRate : (amount * feeRate / 100);
    const netAmount = amount - processingFee;

    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      userId,
      type: 'charge',
      category,
      amount,
      currency,
      status: 'pending',
      paymentMethodId: paymentMethod.id,
      paymentReference: `${paymentMethod.type}_mock_${Math.random().toString(36).substr(2, 9)}`,
      description,
      metadata,
      processingFee,
      netAmount,
      createdAt: new Date()
    };

    this.transactions.push(transaction);

    // Simulate payment processing
    setTimeout(() => {
      const storedTransaction = this.transactions.find(t => t.id === transaction.id);
      if (storedTransaction) {
        // Simulate 95% success rate
        if (Math.random() < 0.95) {
          storedTransaction.status = 'completed';
          storedTransaction.processedAt = new Date();
        } else {
          storedTransaction.status = 'failed';
          storedTransaction.failureReason = 'Payment declined by bank';
        }
      }
    }, 2000);

    return Promise.resolve(transaction);
  }

  async refundTransaction(transactionId: string, amount?: number, reason?: string): Promise<Transaction> {
    const originalTransaction = this.transactions.find(t => t.id === transactionId);
    if (!originalTransaction) {
      throw new Error('Original transaction not found');
    }

    if (originalTransaction.status !== 'completed') {
      throw new Error('Cannot refund a transaction that is not completed');
    }

    const refundAmount = amount || originalTransaction.amount;
    if (refundAmount > originalTransaction.amount) {
      throw new Error('Refund amount cannot exceed original transaction amount');
    }

    const refundTransaction: Transaction = {
      id: `txn_refund_${Date.now()}`,
      userId: originalTransaction.userId,
      type: 'refund',
      category: originalTransaction.category,
      amount: -refundAmount, // Negative amount for refund
      currency: originalTransaction.currency,
      status: 'processing',
      paymentMethodId: originalTransaction.paymentMethodId,
      paymentReference: `refund_${originalTransaction.paymentReference}`,
      description: `Refund: ${originalTransaction.description}${reason ? ` - ${reason}` : ''}`,
      metadata: {
        ...originalTransaction.metadata,
        refundReason: reason,
        originalTransactionId: transactionId
      },
      processingFee: 0, // No fee for refunds
      netAmount: -refundAmount,
      relatedTransactionId: transactionId,
      createdAt: new Date()
    };

    this.transactions.push(refundTransaction);

    // Simulate refund processing
    setTimeout(() => {
      const storedRefund = this.transactions.find(t => t.id === refundTransaction.id);
      if (storedRefund) {
        storedRefund.status = 'completed';
        storedRefund.processedAt = new Date();
      }
    }, 1500);

    return Promise.resolve(refundTransaction);
  }

  async getUserTransactions(userId: string, filters?: {
    category?: Transaction['category'];
    type?: Transaction['type'];
    status?: Transaction['status'];
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): Promise<Transaction[]> {
    let transactions = this.transactions.filter(t => t.userId === userId);

    if (filters) {
      if (filters.category) {
        transactions = transactions.filter(t => t.category === filters.category);
      }
      if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
      }
      if (filters.status) {
        transactions = transactions.filter(t => t.status === filters.status);
      }
      if (filters.dateRange) {
        transactions = transactions.filter(t => 
          t.createdAt >= filters.dateRange!.start && t.createdAt <= filters.dateRange!.end
        );
      }
    }

    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.limit) {
      transactions = transactions.slice(0, filters.limit);
    }

    return Promise.resolve(transactions);
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    const transaction = this.transactions.find(t => t.id === transactionId);
    return Promise.resolve(transaction || null);
  }

  // Payout Account Management
  async addPayoutAccount(userId: string, accountData: Omit<PayoutAccount, 'id' | 'userId' | 'createdAt'>): Promise<PayoutAccount> {
    const existingAccounts = this.payoutAccounts.filter(pa => pa.userId === userId);
    const isFirstAccount = existingAccounts.length === 0;

    const payoutAccount: PayoutAccount = {
      ...accountData,
      id: `pa_${Date.now()}`,
      userId,
      isDefault: isFirstAccount || accountData.isDefault,
      createdAt: new Date()
    };

    // If this is being set as default, unset others
    if (payoutAccount.isDefault) {
      this.payoutAccounts.forEach(pa => {
        if (pa.userId === userId) {
          pa.isDefault = false;
        }
      });
    }

    this.payoutAccounts.push(payoutAccount);

    // Simulate verification process
    setTimeout(() => {
      const storedAccount = this.payoutAccounts.find(pa => pa.id === payoutAccount.id);
      if (storedAccount) {
        // Simulate 90% verification success rate
        if (Math.random() < 0.9) {
          storedAccount.isVerified = true;
          storedAccount.verificationStatus = 'verified';
          storedAccount.verifiedAt = new Date();
        } else {
          storedAccount.verificationStatus = 'failed';
          storedAccount.failureReason = 'Unable to verify account details';
        }
      }
    }, 3000);

    return Promise.resolve(payoutAccount);
  }

  async getUserPayoutAccounts(userId: string): Promise<PayoutAccount[]> {
    const accounts = this.payoutAccounts.filter(pa => pa.userId === userId);
    return Promise.resolve(accounts);
  }

  async updatePayoutAccount(accountId: string, updates: Partial<PayoutAccount>): Promise<PayoutAccount> {
    const account = this.payoutAccounts.find(pa => pa.id === accountId);
    if (!account) {
      throw new Error('Payout account not found');
    }

    Object.assign(account, updates);

    // Handle default account logic
    if (updates.isDefault && updates.isDefault !== account.isDefault) {
      this.payoutAccounts.forEach(pa => {
        if (pa.userId === account.userId && pa.id !== accountId) {
          pa.isDefault = false;
        }
      });
    }

    return Promise.resolve(account);
  }

  // Payout Processing
  async createPayout(payoutData: {
    userId: string;
    userName: string;
    userRole: string;
    amount: number;
    currency: string;
    category: Payout['category'];
    period: { startDate: Date; endDate: Date };
    transactionIds: string[];
    payoutAccountId?: string;
    metadata?: Record<string, any>;
  }): Promise<Payout> {
    const { userId, amount, payoutAccountId, metadata = {} } = payoutData;

    // Get payout account
    let payoutAccount: PayoutAccount | undefined;
    if (payoutAccountId) {
      payoutAccount = this.payoutAccounts.find(pa => pa.id === payoutAccountId);
    } else {
      // Use default payout account
      payoutAccount = this.payoutAccounts.find(pa => pa.userId === userId && pa.isDefault && pa.isVerified);
    }

    if (!payoutAccount) {
      throw new Error('No valid payout account found');
    }

    if (!payoutAccount.isVerified) {
      throw new Error('Payout account is not verified');
    }

    if (amount < this.config.limits.minimumPayout) {
      throw new Error(`Minimum payout amount is $${this.config.limits.minimumPayout}`);
    }

    if (amount > this.config.limits.maximumPayout) {
      throw new Error(`Maximum payout amount is $${this.config.limits.maximumPayout}`);
    }

    // Calculate processing fee (flat fee for payouts)
    const processingFee = payoutAccount.type === 'bank_account' ? 0.25 : 1.00;
    const netAmount = amount - processingFee;

    const payout: Payout = {
      ...payoutData,
      id: `payout_${Date.now()}`,
      status: 'pending',
      payoutAccountId: payoutAccount.id,
      processingFee,
      netAmount,
      metadata,
      createdAt: new Date()
    };

    this.payouts.push(payout);

    // Auto-schedule payout based on config
    setTimeout(() => {
      this.processPayout(payout.id);
    }, 5000); // Simulate 5 second processing delay

    return Promise.resolve(payout);
  }

  async processPayout(payoutId: string): Promise<Payout> {
    const payout = this.payouts.find(p => p.id === payoutId);
    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== 'pending') {
      throw new Error('Payout cannot be processed in current status');
    }

    payout.status = 'processing';

    // Simulate payout processing
    setTimeout(() => {
      const storedPayout = this.payouts.find(p => p.id === payoutId);
      if (storedPayout) {
        // Simulate 98% success rate
        if (Math.random() < 0.98) {
          storedPayout.status = 'completed';
          storedPayout.processedAt = new Date();
          storedPayout.payoutReference = `po_${Math.random().toString(36).substr(2, 9)}`;
        } else {
          storedPayout.status = 'failed';
          storedPayout.failureReason = 'Bank account temporarily unavailable';
        }
      }
    }, 3000);

    return Promise.resolve(payout);
  }

  async getUserPayouts(userId: string, filters?: {
    category?: Payout['category'];
    status?: Payout['status'];
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): Promise<Payout[]> {
    let payouts = this.payouts.filter(p => p.userId === userId);

    if (filters) {
      if (filters.category) {
        payouts = payouts.filter(p => p.category === filters.category);
      }
      if (filters.status) {
        payouts = payouts.filter(p => p.status === filters.status);
      }
      if (filters.dateRange) {
        payouts = payouts.filter(p => 
          p.createdAt >= filters.dateRange!.start && p.createdAt <= filters.dateRange!.end
        );
      }
    }

    payouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.limit) {
      payouts = payouts.slice(0, filters.limit);
    }

    return Promise.resolve(payouts);
  }

  async getPayout(payoutId: string): Promise<Payout | null> {
    const payout = this.payouts.find(p => p.id === payoutId);
    return Promise.resolve(payout || null);
  }

  // Analytics and Reporting
  async getPaymentAnalytics(userId?: string, dateRange?: { start: Date; end: Date }): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    processingFees: number;
    netRevenue: number;
    transactionsByCategory: Array<{ category: string; count: number; amount: number }>;
    transactionsByMethod: Array<{ method: string; count: number; amount: number }>;
    refundRate: number;
    failureRate: number;
  }> {
    let transactions = this.transactions.filter(t => t.type === 'charge');

    if (userId) {
      transactions = transactions.filter(t => t.userId === userId);
    }

    if (dateRange) {
      transactions = transactions.filter(t => 
        t.createdAt >= dateRange.start && t.createdAt <= dateRange.end
      );
    }

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = transactions.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const processingFees = transactions.reduce((sum, t) => sum + t.processingFee, 0);
    const netRevenue = totalRevenue - processingFees;

    // Calculate refund rate
    const refunds = this.transactions.filter(t => t.type === 'refund');
    const refundAmount = Math.abs(refunds.reduce((sum, t) => sum + t.amount, 0));
    const refundRate = totalRevenue > 0 ? refundAmount / totalRevenue : 0;

    // Calculate failure rate
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;
    const failureRate = totalTransactions > 0 ? failedTransactions / totalTransactions : 0;

    // Group by category
    const categoryStats = new Map<string, { count: number; amount: number }>();
    transactions.forEach(t => {
      const existing = categoryStats.get(t.category) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += t.amount;
      categoryStats.set(t.category, existing);
    });

    const transactionsByCategory = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }));

    // Group by payment method
    const methodStats = new Map<string, { count: number; amount: number }>();
    transactions.forEach(t => {
      const method = this.paymentMethods.find(pm => pm.id === t.paymentMethodId);
      const methodType = method?.type || 'unknown';
      const existing = methodStats.get(methodType) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += t.amount;
      methodStats.set(methodType, existing);
    });

    const transactionsByMethod = Array.from(methodStats.entries())
      .map(([method, stats]) => ({ method, ...stats }));

    return Promise.resolve({
      totalRevenue,
      totalTransactions,
      averageTransactionValue,
      processingFees,
      netRevenue,
      transactionsByCategory,
      transactionsByMethod,
      refundRate,
      failureRate
    });
  }

  async getPayoutAnalytics(userId?: string, dateRange?: { start: Date; end: Date }): Promise<{
    totalPayouts: number;
    totalAmount: number;
    averagePayoutAmount: number;
    processingFees: number;
    netAmount: number;
    payoutsByCategory: Array<{ category: string; count: number; amount: number }>;
    successRate: number;
    pendingAmount: number;
  }> {
    let payouts = this.payouts;

    if (userId) {
      payouts = payouts.filter(p => p.userId === userId);
    }

    if (dateRange) {
      payouts = payouts.filter(p => 
        p.createdAt >= dateRange.start && p.createdAt <= dateRange.end
      );
    }

    const totalPayouts = payouts.length;
    const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
    const averagePayoutAmount = totalPayouts > 0 ? totalAmount / totalPayouts : 0;
    const processingFees = payouts.reduce((sum, p) => sum + p.processingFee, 0);
    const netAmount = totalAmount - processingFees;

    const completedPayouts = payouts.filter(p => p.status === 'completed').length;
    const successRate = totalPayouts > 0 ? completedPayouts / totalPayouts : 0;

    const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'processing');
    const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    // Group by category
    const categoryStats = new Map<string, { count: number; amount: number }>();
    payouts.forEach(p => {
      const existing = categoryStats.get(p.category) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += p.amount;
      categoryStats.set(p.category, existing);
    });

    const payoutsByCategory = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }));

    return Promise.resolve({
      totalPayouts,
      totalAmount,
      averagePayoutAmount,
      processingFees,
      netAmount,
      payoutsByCategory,
      successRate,
      pendingAmount
    });
  }

  // Configuration
  async getPaymentConfig(): Promise<PaymentConfig> {
    return Promise.resolve(this.config);
  }

  async updatePaymentConfig(updates: Partial<PaymentConfig>): Promise<PaymentConfig> {
    this.config = { ...this.config, ...updates };
    return Promise.resolve(this.config);
  }

  // Utility Methods
  async validatePaymentAmount(amount: number, userId: string): Promise<boolean> {
    if (amount <= 0) return false;
    if (amount > this.config.limits.singleTransactionLimit) return false;

    // Check daily and monthly limits
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyTransactions = this.transactions.filter(t => 
      t.userId === userId && 
      t.type === 'charge' && 
      t.status === 'completed' &&
      t.createdAt >= dayStart
    );

    const monthlyTransactions = this.transactions.filter(t => 
      t.userId === userId && 
      t.type === 'charge' && 
      t.status === 'completed' &&
      t.createdAt >= monthStart
    );

    const dailyTotal = dailyTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthlyTotal = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    return (dailyTotal + amount) <= this.config.limits.dailyTransactionLimit &&
           (monthlyTotal + amount) <= this.config.limits.monthlyTransactionLimit;
  }

  async estimateProcessingFee(amount: number, paymentMethodType: PaymentMethod['type']): Promise<number> {
    switch (paymentMethodType) {
      case 'bank_transfer':
        return this.config.fees.bankTransfer;
      case 'paypal':
        return amount * this.config.fees.paypal / 100;
      case 'apple_pay':
      case 'google_pay':
        return amount * this.config.fees.digitalWallet / 100;
      default:
        return amount * this.config.fees.creditCard / 100;
    }
  }
}

export const unifiedPaymentService = new UnifiedPaymentService(); 