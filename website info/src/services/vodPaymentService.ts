// VOD Payment Service for managing VOD subscriptions, payments, and instructor earnings
export interface VODSubscription {
  id: string;
  instructorId: string;
  instructorName: string;
  status: 'active' | 'suspended' | 'cancelled' | 'pending';
  monthlyFee: number; // $40/month default
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  nextBillingDate: Date;
  totalClassesHosted: number;
  totalRevenue: number;
  subscriptionStartDate: Date;
  lastPaymentDate?: Date;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'paypal';
}

export interface VODPurchase {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  vodClassId: string;
  vodClassTitle: string;
  instructorId: string;
  instructorName: string;
  amount: number;
  platformFee: number;
  instructorEarnings: number;
  purchaseDate: Date;
  accessExpiryDate?: Date; // For limited access periods
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  paymentReference: string;
  status: 'completed' | 'pending' | 'refunded' | 'failed';
}

export interface VODPayout {
  id: string;
  instructorId: string;
  instructorName: string;
  amount: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutMethod: 'bank_transfer' | 'paypal' | 'check';
  payoutDate?: Date;
  reference?: string;
  salesCount: number;
  totalRevenue: number;
  platformFees: number;
}

export interface VODSubscriptionConfig {
  monthlyHostingFee: number;
  minimumClassPrice: number;
  platformCommission: number; // Percentage
  introOfferMonths: number;
  introOfferDiscount: number; // Percentage
}

class VODPaymentService {
  private subscriptions: VODSubscription[] = [];
  private purchases: VODPurchase[] = [];
  private payouts: VODPayout[] = [];
  private config: VODSubscriptionConfig = {
    monthlyHostingFee: 40,
    minimumClassPrice: 40,
    platformCommission: 15, // 15% platform fee
    introOfferMonths: 3,
    introOfferDiscount: 50 // 50% off first 3 months
  };

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock subscriptions
    this.subscriptions = [
      {
        id: 'sub_001',
        instructorId: 'instructor_001',
        instructorName: 'Marcus Johnson',
        status: 'active',
        monthlyFee: 40,
        billingCycle: 'monthly',
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        totalClassesHosted: 8,
        totalRevenue: 2340,
        subscriptionStartDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        lastPaymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        paymentMethod: 'credit_card'
      },
      {
        id: 'sub_002',
        instructorId: 'instructor_002',
        instructorName: 'Lisa Davis',
        status: 'active',
        monthlyFee: 40,
        billingCycle: 'monthly',
        nextBillingDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        totalClassesHosted: 12,
        totalRevenue: 4560,
        subscriptionStartDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        lastPaymentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        paymentMethod: 'bank_transfer'
      },
      {
        id: 'sub_003',
        instructorId: 'instructor_003',
        instructorName: 'Carlos Martinez',
        status: 'pending',
        monthlyFee: 20, // Intro offer
        billingCycle: 'monthly',
        nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        totalClassesHosted: 3,
        totalRevenue: 480,
        subscriptionStartDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        paymentMethod: 'paypal'
      }
    ];

    // Mock purchases
    this.purchases = [
      {
        id: 'purchase_001',
        userId: 'user_001',
        userName: 'Sarah Johnson',
        userEmail: 'sarah@example.com',
        vodClassId: 'vod_001',
        vodClassTitle: 'Complete Beginner Stepping Course',
        instructorId: 'instructor_001',
        instructorName: 'Marcus Johnson',
        amount: 49.99,
        platformFee: 7.50,
        instructorEarnings: 42.49,
        purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paymentMethod: 'credit_card',
        paymentReference: 'TXN_ABC123456',
        status: 'completed'
      },
      {
        id: 'purchase_002',
        userId: 'user_002',
        userName: 'Mike Davis',
        userEmail: 'mike@example.com',
        vodClassId: 'vod_002',
        vodClassTitle: 'Advanced Footwork Techniques',
        instructorId: 'instructor_002',
        instructorName: 'Lisa Davis',
        amount: 79.99,
        platformFee: 12.00,
        instructorEarnings: 67.99,
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        paymentMethod: 'paypal',
        paymentReference: 'TXN_DEF789012',
        status: 'completed'
      }
    ];

    // Mock payouts
    this.payouts = [
      {
        id: 'payout_001',
        instructorId: 'instructor_001',
        instructorName: 'Marcus Johnson',
        amount: 1234.56,
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        status: 'completed',
        payoutMethod: 'bank_transfer',
        payoutDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reference: 'PAYOUT_MJ_001',
        salesCount: 28,
        totalRevenue: 1456.78,
        platformFees: 222.22
      }
    ];
  }

  // Subscription Management
  async getInstructorSubscription(instructorId: string): Promise<VODSubscription | null> {
    const subscription = this.subscriptions.find(sub => sub.instructorId === instructorId);
    return Promise.resolve(subscription || null);
  }

  async createVODSubscription(instructorId: string, instructorName: string, paymentMethod: 'credit_card' | 'bank_transfer' | 'paypal'): Promise<VODSubscription> {
    const introOffer = this.config.monthlyHostingFee * (1 - this.config.introOfferDiscount / 100);
    
    const newSubscription: VODSubscription = {
      id: `sub_${Date.now()}`,
      instructorId,
      instructorName,
      status: 'pending',
      monthlyFee: introOffer,
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalClassesHosted: 0,
      totalRevenue: 0,
      subscriptionStartDate: new Date(),
      paymentMethod
    };

    this.subscriptions.push(newSubscription);
    return Promise.resolve(newSubscription);
  }

  async updateSubscriptionStatus(subscriptionId: string, status: VODSubscription['status']): Promise<VODSubscription> {
    const subscription = this.subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = status;
    if (status === 'active') {
      subscription.lastPaymentDate = new Date();
      subscription.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    return Promise.resolve(subscription);
  }

  async processSubscriptionPayment(subscriptionId: string): Promise<boolean> {
    const subscription = this.subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    subscription.lastPaymentDate = new Date();
    subscription.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    subscription.status = 'active';

    // Check if intro period is over
    const subscriptionAge = Date.now() - subscription.subscriptionStartDate.getTime();
    const introEndDate = this.config.introOfferMonths * 30 * 24 * 60 * 60 * 1000;
    
    if (subscriptionAge > introEndDate && subscription.monthlyFee < this.config.monthlyHostingFee) {
      subscription.monthlyFee = this.config.monthlyHostingFee;
    }

    return Promise.resolve(true);
  }

  // VOD Purchase Management
  async purchaseVODClass(
    userId: string,
    userName: string,
    userEmail: string,
    vodClassId: string,
    vodClassTitle: string,
    instructorId: string,
    instructorName: string,
    amount: number,
    paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer'
  ): Promise<VODPurchase> {
    const platformFee = amount * (this.config.platformCommission / 100);
    const instructorEarnings = amount - platformFee;

    const purchase: VODPurchase = {
      id: `purchase_${Date.now()}`,
      userId,
      userName,
      userEmail,
      vodClassId,
      vodClassTitle,
      instructorId,
      instructorName,
      amount,
      platformFee,
      instructorEarnings,
      purchaseDate: new Date(),
      paymentMethod,
      paymentReference: `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'pending'
    };

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    purchase.status = 'completed';
    this.purchases.push(purchase);

    // Update instructor subscription stats
    const subscription = this.subscriptions.find(sub => sub.instructorId === instructorId);
    if (subscription) {
      subscription.totalRevenue += instructorEarnings;
    }

    return Promise.resolve(purchase);
  }

  async getUserPurchases(userId: string): Promise<VODPurchase[]> {
    const userPurchases = this.purchases.filter(purchase => purchase.userId === userId);
    return Promise.resolve(userPurchases);
  }

  async getInstructorSales(instructorId: string, dateRange?: { start: Date; end: Date }): Promise<VODPurchase[]> {
    let sales = this.purchases.filter(purchase => purchase.instructorId === instructorId);
    
    if (dateRange) {
      sales = sales.filter(purchase => 
        purchase.purchaseDate >= dateRange.start && purchase.purchaseDate <= dateRange.end
      );
    }

    return Promise.resolve(sales);
  }

  // Payout Management
  async getInstructorPayouts(instructorId: string): Promise<VODPayout[]> {
    const payouts = this.payouts.filter(payout => payout.instructorId === instructorId);
    return Promise.resolve(payouts);
  }

  async generatePayout(instructorId: string, instructorName: string, periodStart: Date, periodEnd: Date): Promise<VODPayout> {
    const sales = await this.getInstructorSales(instructorId, { start: periodStart, end: periodEnd });
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const platformFees = sales.reduce((sum, sale) => sum + sale.platformFee, 0);
    const instructorEarnings = sales.reduce((sum, sale) => sum + sale.instructorEarnings, 0);

    const payout: VODPayout = {
      id: `payout_${Date.now()}`,
      instructorId,
      instructorName,
      amount: instructorEarnings,
      period: { startDate: periodStart, endDate: periodEnd },
      status: 'pending',
      payoutMethod: 'bank_transfer',
      salesCount: sales.length,
      totalRevenue,
      platformFees
    };

    this.payouts.push(payout);
    return Promise.resolve(payout);
  }

  async processPayout(payoutId: string): Promise<boolean> {
    const payout = this.payouts.find(p => p.id === payoutId);
    if (!payout) {
      throw new Error('Payout not found');
    }

    // Simulate payout processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    payout.status = 'completed';
    payout.payoutDate = new Date();
    payout.reference = `PAYOUT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return Promise.resolve(true);
  }

  // Configuration
  async getVODConfig(): Promise<VODSubscriptionConfig> {
    return Promise.resolve(this.config);
  }

  async updateVODConfig(updates: Partial<VODSubscriptionConfig>): Promise<VODSubscriptionConfig> {
    this.config = { ...this.config, ...updates };
    return Promise.resolve(this.config);
  }

  // Analytics
  async getVODAnalytics(instructorId?: string): Promise<{
    totalRevenue: number;
    totalPurchases: number;
    averageOrderValue: number;
    activeSubscriptions: number;
    monthlyRecurringRevenue: number;
    topSellingClasses: Array<{
      vodClassId: string;
      title: string;
      revenue: number;
      purchases: number;
    }>;
  }> {
    let filteredPurchases = this.purchases;
    let filteredSubscriptions = this.subscriptions;

    if (instructorId) {
      filteredPurchases = this.purchases.filter(p => p.instructorId === instructorId);
      filteredSubscriptions = this.subscriptions.filter(s => s.instructorId === instructorId);
    }

    const totalRevenue = filteredPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    const totalPurchases = filteredPurchases.length;
    const averageOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;
    const activeSubscriptions = filteredSubscriptions.filter(s => s.status === 'active').length;
    const monthlyRecurringRevenue = filteredSubscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, sub) => sum + sub.monthlyFee, 0);

    // Calculate top selling classes
    const classSales = new Map<string, { title: string; revenue: number; purchases: number }>();
    filteredPurchases.forEach(purchase => {
      const existing = classSales.get(purchase.vodClassId) || { 
        title: purchase.vodClassTitle, 
        revenue: 0, 
        purchases: 0 
      };
      existing.revenue += purchase.amount;
      existing.purchases += 1;
      classSales.set(purchase.vodClassId, existing);
    });

    const topSellingClasses = Array.from(classSales.entries())
      .map(([vodClassId, data]) => ({ vodClassId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return Promise.resolve({
      totalRevenue,
      totalPurchases,
      averageOrderValue,
      activeSubscriptions,
      monthlyRecurringRevenue,
      topSellingClasses
    });
  }
}

export const vodPaymentService = new VODPaymentService(); 