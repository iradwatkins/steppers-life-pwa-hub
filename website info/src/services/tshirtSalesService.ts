// T-Shirt Sales Service for managing instructor merchandise sales
export interface TShirtDesign {
  id: string;
  name: string;
  description: string;
  category: 'classic' | 'premium' | 'special_edition' | 'custom';
  designImageUrl: string;
  mockupImages: string[];
  availableSizes: string[];
  availableColors: Array<{
    name: string;
    hex: string;
    stockLevel: number;
  }>;
  baseCost: number; // Platform cost for the shirt
  suggestedRetailPrice: number;
  isActive: boolean;
  tags: string[];
  printMethod: 'screen_print' | 'dtg' | 'vinyl' | 'embroidery';
}

export interface InstructorTShirtListing {
  id: string;
  instructorId: string;
  instructorName: string;
  designId: string;
  designName: string;
  retailPrice: number;
  platformPortion: number; // Fixed amount that goes to platform
  instructorPortion: number; // Calculated: retailPrice - platformPortion
  isActive: boolean;
  totalSold: number;
  totalRevenue: number;
  customization?: {
    instructorName?: boolean;
    customText?: string;
    logoUpload?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TShirtOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  instructorId: string;
  instructorName: string;
  listingId: string;
  designId: string;
  designName: string;
  quantity: number;
  size: string;
  color: string;
  unitPrice: number;
  totalPrice: number;
  platformRevenue: number;
  instructorRevenue: number;
  status: 'pending' | 'confirmed' | 'production' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  shippingMethod: 'standard' | 'express' | 'overnight';
  shippingCost: number;
  trackingNumber?: string;
  orderDate: Date;
  estimatedDelivery?: Date;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference: string;
  orderNotes?: string;
}

export interface InstructorPayout {
  id: string;
  instructorId: string;
  instructorName: string;
  amount: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
  ordersIncluded: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutMethod: 'bank_transfer' | 'paypal' | 'check';
  payoutDate?: Date;
  reference?: string;
  totalOrders: number;
  totalItemsSold: number;
}

export interface TShirtConfig {
  defaultPlatformPortion: number;
  minimumRetailPrice: number;
  maximumRetailPrice: number;
  shippingRates: {
    standard: number;
    express: number;
    overnight: number;
  };
  taxRate: number;
}

class TShirtSalesService {
  private designs: TShirtDesign[] = [];
  private instructorListings: InstructorTShirtListing[] = [];
  private orders: TShirtOrder[] = [];
  private payouts: InstructorPayout[] = [];
  private config: TShirtConfig = {
    defaultPlatformPortion: 10, // $10 goes to platform
    minimumRetailPrice: 20,
    maximumRetailPrice: 100,
    shippingRates: {
      standard: 6.99,
      express: 12.99,
      overnight: 24.99
    },
    taxRate: 0.08 // 8%
  };

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock T-shirt designs
    this.designs = [
      {
        id: 'design_001',
        name: 'SteppersLife Classic Logo',
        description: 'The iconic SteppersLife logo on a comfortable cotton tee',
        category: 'classic',
        designImageUrl: '/designs/stepperslife-classic.png',
        mockupImages: [
          '/mockups/classic-black.jpg',
          '/mockups/classic-white.jpg',
          '/mockups/classic-navy.jpg'
        ],
        availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        availableColors: [
          { name: 'Black', hex: '#000000', stockLevel: 100 },
          { name: 'White', hex: '#FFFFFF', stockLevel: 100 },
          { name: 'Navy', hex: '#001f3f', stockLevel: 75 },
          { name: 'Red', hex: '#FF4136', stockLevel: 50 },
          { name: 'Royal Blue', hex: '#0074D9', stockLevel: 60 }
        ],
        baseCost: 8.50,
        suggestedRetailPrice: 25.00,
        isActive: true,
        tags: ['classic', 'logo', 'stepping'],
        printMethod: 'screen_print'
      },
      {
        id: 'design_002',
        name: 'Chicago Stepping Heritage',
        description: 'Celebrate the rich heritage of Chicago stepping culture',
        category: 'premium',
        designImageUrl: '/designs/chicago-heritage.png',
        mockupImages: [
          '/mockups/heritage-black.jpg',
          '/mockups/heritage-vintage.jpg'
        ],
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        availableColors: [
          { name: 'Black', hex: '#000000', stockLevel: 80 },
          { name: 'Vintage Black', hex: '#2C2C2C', stockLevel: 60 },
          { name: 'Charcoal', hex: '#36454F', stockLevel: 40 }
        ],
        baseCost: 12.00,
        suggestedRetailPrice: 35.00,
        isActive: true,
        tags: ['heritage', 'chicago', 'premium'],
        printMethod: 'dtg'
      },
      {
        id: 'design_003',
        name: 'Instructor Signature Series',
        description: 'Customizable design for stepping instructors',
        category: 'custom',
        designImageUrl: '/designs/instructor-signature.png',
        mockupImages: [
          '/mockups/instructor-black.jpg',
          '/mockups/instructor-navy.jpg',
          '/mockups/instructor-red.jpg'
        ],
        availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        availableColors: [
          { name: 'Black', hex: '#000000', stockLevel: 120 },
          { name: 'Navy', hex: '#001f3f', stockLevel: 100 },
          { name: 'Red', hex: '#FF4136', stockLevel: 80 },
          { name: 'White', hex: '#FFFFFF', stockLevel: 90 }
        ],
        baseCost: 10.00,
        suggestedRetailPrice: 30.00,
        isActive: true,
        tags: ['instructor', 'custom', 'signature'],
        printMethod: 'screen_print'
      },
      {
        id: 'design_004',
        name: 'Step Your Way Up',
        description: 'Motivational design for stepping enthusiasts',
        category: 'classic',
        designImageUrl: '/designs/step-your-way-up.png',
        mockupImages: [
          '/mockups/motivational-black.jpg',
          '/mockups/motivational-blue.jpg'
        ],
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        availableColors: [
          { name: 'Black', hex: '#000000', stockLevel: 70 },
          { name: 'Royal Blue', hex: '#0074D9', stockLevel: 55 },
          { name: 'Purple', hex: '#B10DC9', stockLevel: 45 }
        ],
        baseCost: 9.00,
        suggestedRetailPrice: 28.00,
        isActive: true,
        tags: ['motivational', 'stepping', 'inspiration'],
        printMethod: 'vinyl'
      }
    ];

    // Mock instructor listings
    this.instructorListings = [
      {
        id: 'listing_001',
        instructorId: 'instructor_001',
        instructorName: 'Marcus Johnson',
        designId: 'design_003',
        designName: 'Instructor Signature Series',
        retailPrice: 35.00,
        platformPortion: 10.00,
        instructorPortion: 25.00,
        isActive: true,
        totalSold: 45,
        totalRevenue: 1125.00,
        customization: {
          instructorName: true,
          customText: 'Learn with Marcus',
          logoUpload: '/instructor-logos/marcus-logo.png'
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'listing_002',
        instructorId: 'instructor_002',
        instructorName: 'Lisa Davis',
        designId: 'design_001',
        designName: 'SteppersLife Classic Logo',
        retailPrice: 30.00,
        platformPortion: 10.00,
        instructorPortion: 20.00,
        isActive: true,
        totalSold: 28,
        totalRevenue: 560.00,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'listing_003',
        instructorId: 'instructor_003',
        instructorName: 'Carlos Martinez',
        designId: 'design_002',
        designName: 'Chicago Stepping Heritage',
        retailPrice: 40.00,
        platformPortion: 10.00,
        instructorPortion: 30.00,
        isActive: true,
        totalSold: 18,
        totalRevenue: 540.00,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    // Mock orders
    this.orders = [
      {
        id: 'tshirt_order_001',
        customerId: 'customer_001',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com',
        instructorId: 'instructor_001',
        instructorName: 'Marcus Johnson',
        listingId: 'listing_001',
        designId: 'design_003',
        designName: 'Instructor Signature Series',
        quantity: 2,
        size: 'L',
        color: 'Black',
        unitPrice: 35.00,
        totalPrice: 70.00,
        platformRevenue: 20.00,
        instructorRevenue: 50.00,
        status: 'delivered',
        shippingAddress: {
          name: 'Sarah Johnson',
          address: '123 Main St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
          phone: '(555) 123-4567'
        },
        shippingMethod: 'standard',
        shippingCost: 6.99,
        trackingNumber: 'TRK123456789',
        orderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        paymentStatus: 'paid',
        paymentReference: 'PAY_ABC123456'
      },
      {
        id: 'tshirt_order_002',
        customerId: 'customer_002',
        customerName: 'Mike Davis',
        customerEmail: 'mike@example.com',
        instructorId: 'instructor_002',
        instructorName: 'Lisa Davis',
        listingId: 'listing_002',
        designId: 'design_001',
        designName: 'SteppersLife Classic Logo',
        quantity: 1,
        size: 'M',
        color: 'Navy',
        unitPrice: 30.00,
        totalPrice: 30.00,
        platformRevenue: 10.00,
        instructorRevenue: 20.00,
        status: 'shipped',
        shippingAddress: {
          name: 'Mike Davis',
          address: '456 Oak Ave',
          city: 'Atlanta',
          state: 'GA',
          zipCode: '30309',
          country: 'USA'
        },
        shippingMethod: 'express',
        shippingCost: 12.99,
        trackingNumber: 'TRK987654321',
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        paymentStatus: 'paid',
        paymentReference: 'PAY_DEF789012'
      }
    ];

    // Mock payouts
    this.payouts = [
      {
        id: 'payout_tshirt_001',
        instructorId: 'instructor_001',
        instructorName: 'Marcus Johnson',
        amount: 750.00,
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        ordersIncluded: ['tshirt_order_001'],
        status: 'completed',
        payoutMethod: 'bank_transfer',
        payoutDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reference: 'PAYOUT_TS_MJ_001',
        totalOrders: 30,
        totalItemsSold: 45
      }
    ];
  }

  // Design Management
  async getAvailableDesigns(): Promise<TShirtDesign[]> {
    return Promise.resolve(this.designs.filter(d => d.isActive));
  }

  async getDesign(designId: string): Promise<TShirtDesign | null> {
    const design = this.designs.find(d => d.id === designId && d.isActive);
    return Promise.resolve(design || null);
  }

  async getDesignsByCategory(category: TShirtDesign['category']): Promise<TShirtDesign[]> {
    const designs = this.designs.filter(d => d.isActive && d.category === category);
    return Promise.resolve(designs);
  }

  // Instructor Listing Management
  async createInstructorListing(data: {
    instructorId: string;
    instructorName: string;
    designId: string;
    retailPrice: number;
    customization?: {
      instructorName?: boolean;
      customText?: string;
      logoUpload?: string;
    };
  }): Promise<InstructorTShirtListing> {
    const design = await this.getDesign(data.designId);
    if (!design) {
      throw new Error('Design not found');
    }

    if (data.retailPrice < this.config.minimumRetailPrice || data.retailPrice > this.config.maximumRetailPrice) {
      throw new Error(`Retail price must be between $${this.config.minimumRetailPrice} and $${this.config.maximumRetailPrice}`);
    }

    const listing: InstructorTShirtListing = {
      id: `listing_${Date.now()}`,
      instructorId: data.instructorId,
      instructorName: data.instructorName,
      designId: data.designId,
      designName: design.name,
      retailPrice: data.retailPrice,
      platformPortion: this.config.defaultPlatformPortion,
      instructorPortion: data.retailPrice - this.config.defaultPlatformPortion,
      isActive: true,
      totalSold: 0,
      totalRevenue: 0,
      customization: data.customization,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.instructorListings.push(listing);
    return Promise.resolve(listing);
  }

  async getInstructorListings(instructorId: string): Promise<InstructorTShirtListing[]> {
    const listings = this.instructorListings.filter(l => l.instructorId === instructorId);
    return Promise.resolve(listings);
  }

  async getAllActiveListings(): Promise<InstructorTShirtListing[]> {
    const listings = this.instructorListings.filter(l => l.isActive);
    return Promise.resolve(listings);
  }

  async getListing(listingId: string): Promise<InstructorTShirtListing | null> {
    const listing = this.instructorListings.find(l => l.id === listingId);
    return Promise.resolve(listing || null);
  }

  async updateListingPrice(listingId: string, newPrice: number): Promise<InstructorTShirtListing> {
    const listing = this.instructorListings.find(l => l.id === listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    if (newPrice < this.config.minimumRetailPrice || newPrice > this.config.maximumRetailPrice) {
      throw new Error(`Retail price must be between $${this.config.minimumRetailPrice} and $${this.config.maximumRetailPrice}`);
    }

    listing.retailPrice = newPrice;
    listing.instructorPortion = newPrice - this.config.defaultPlatformPortion;
    listing.updatedAt = new Date();

    return Promise.resolve(listing);
  }

  async toggleListingStatus(listingId: string): Promise<InstructorTShirtListing> {
    const listing = this.instructorListings.find(l => l.id === listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    listing.isActive = !listing.isActive;
    listing.updatedAt = new Date();

    return Promise.resolve(listing);
  }

  // Order Management
  async createOrder(orderData: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    listingId: string;
    quantity: number;
    size: string;
    color: string;
    shippingAddress: any;
    shippingMethod: 'standard' | 'express' | 'overnight';
    orderNotes?: string;
  }): Promise<TShirtOrder> {
    const listing = await this.getListing(orderData.listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    const design = await this.getDesign(listing.designId);
    if (!design) {
      throw new Error('Design not found');
    }

    // Check stock availability
    const colorStock = design.availableColors.find(c => c.name === orderData.color);
    if (!colorStock || colorStock.stockLevel < orderData.quantity) {
      throw new Error('Insufficient stock for selected color');
    }

    const unitPrice = listing.retailPrice;
    const totalPrice = unitPrice * orderData.quantity;
    const shippingCost = this.config.shippingRates[orderData.shippingMethod];
    const platformRevenue = listing.platformPortion * orderData.quantity;
    const instructorRevenue = listing.instructorPortion * orderData.quantity;

    const order: TShirtOrder = {
      id: `tshirt_order_${Date.now()}`,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      instructorId: listing.instructorId,
      instructorName: listing.instructorName,
      listingId: orderData.listingId,
      designId: listing.designId,
      designName: listing.designName,
      quantity: orderData.quantity,
      size: orderData.size,
      color: orderData.color,
      unitPrice,
      totalPrice,
      platformRevenue,
      instructorRevenue,
      status: 'pending',
      shippingAddress: orderData.shippingAddress,
      shippingMethod: orderData.shippingMethod,
      shippingCost,
      orderDate: new Date(),
      paymentStatus: 'pending',
      paymentReference: `PAY_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      orderNotes: orderData.orderNotes
    };

    this.orders.push(order);

    // Update stock levels
    colorStock.stockLevel -= orderData.quantity;

    // Update listing stats
    listing.totalSold += orderData.quantity;
    listing.totalRevenue += instructorRevenue;

    return Promise.resolve(order);
  }

  async getCustomerOrders(customerId: string): Promise<TShirtOrder[]> {
    const orders = this.orders.filter(o => o.customerId === customerId);
    return Promise.resolve(orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()));
  }

  async getInstructorOrders(instructorId: string): Promise<TShirtOrder[]> {
    const orders = this.orders.filter(o => o.instructorId === instructorId);
    return Promise.resolve(orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()));
  }

  async getOrder(orderId: string): Promise<TShirtOrder | null> {
    const order = this.orders.find(o => o.id === orderId);
    return Promise.resolve(order || null);
  }

  async updateOrderStatus(orderId: string, status: TShirtOrder['status'], trackingNumber?: string): Promise<TShirtOrder> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (status === 'shipped') {
      const deliveryDays = order.shippingMethod === 'overnight' ? 1 :
                          order.shippingMethod === 'express' ? 2 : 7;
      order.estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
    }

    return Promise.resolve(order);
  }

  async processPayment(orderId: string): Promise<boolean> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    order.paymentStatus = 'paid';
    order.status = 'confirmed';

    return Promise.resolve(true);
  }

  // Payout Management
  async generateInstructorPayout(instructorId: string, periodStart: Date, periodEnd: Date): Promise<InstructorPayout> {
    const orders = this.orders.filter(o => 
      o.instructorId === instructorId &&
      o.paymentStatus === 'paid' &&
      o.orderDate >= periodStart &&
      o.orderDate <= periodEnd
    );

    const totalAmount = orders.reduce((sum, order) => sum + order.instructorRevenue, 0);
    const totalOrders = orders.length;
    const totalItemsSold = orders.reduce((sum, order) => sum + order.quantity, 0);

    const payout: InstructorPayout = {
      id: `payout_tshirt_${Date.now()}`,
      instructorId,
      instructorName: orders[0]?.instructorName || 'Unknown',
      amount: totalAmount,
      period: { startDate: periodStart, endDate: periodEnd },
      ordersIncluded: orders.map(o => o.id),
      status: 'pending',
      payoutMethod: 'bank_transfer',
      totalOrders,
      totalItemsSold
    };

    this.payouts.push(payout);
    return Promise.resolve(payout);
  }

  async getInstructorPayouts(instructorId: string): Promise<InstructorPayout[]> {
    const payouts = this.payouts.filter(p => p.instructorId === instructorId);
    return Promise.resolve(payouts);
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
    payout.reference = `PAYOUT_TS_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return Promise.resolve(true);
  }

  // Analytics
  async getInstructorAnalytics(instructorId: string): Promise<{
    totalRevenue: number;
    totalItemsSold: number;
    totalOrders: number;
    averageOrderValue: number;
    topSellingDesigns: Array<{
      designId: string;
      designName: string;
      itemsSold: number;
      revenue: number;
    }>;
    recentOrders: TShirtOrder[];
    monthlySales: Array<{
      month: string;
      revenue: number;
      itemsSold: number;
    }>;
  }> {
    const orders = this.orders.filter(o => o.instructorId === instructorId && o.paymentStatus === 'paid');
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.instructorRevenue, 0);
    const totalItemsSold = orders.reduce((sum, order) => sum + order.quantity, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top selling designs
    const designStats = new Map<string, { name: string; itemsSold: number; revenue: number }>();
    orders.forEach(order => {
      const existing = designStats.get(order.designId) || {
        name: order.designName,
        itemsSold: 0,
        revenue: 0
      };
      existing.itemsSold += order.quantity;
      existing.revenue += order.instructorRevenue;
      designStats.set(order.designId, existing);
    });

    const topSellingDesigns = Array.from(designStats.entries())
      .map(([designId, stats]) => ({ designId, ...stats }))
      .sort((a, b) => b.itemsSold - a.itemsSold)
      .slice(0, 5);

    const recentOrders = orders
      .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
      .slice(0, 10);

    // Mock monthly sales data
    const monthlySales = [
      { month: 'Jan', revenue: 450, itemsSold: 18 },
      { month: 'Feb', revenue: 620, itemsSold: 25 },
      { month: 'Mar', revenue: 380, itemsSold: 15 },
      { month: 'Apr', revenue: 750, itemsSold: 30 },
      { month: 'May', revenue: 590, itemsSold: 24 }
    ];

    return Promise.resolve({
      totalRevenue,
      totalItemsSold,
      totalOrders,
      averageOrderValue,
      topSellingDesigns,
      recentOrders,
      monthlySales
    });
  }

  async getPlatformAnalytics(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalInstructors: number;
    averageOrderValue: number;
    topInstructors: Array<{
      instructorId: string;
      instructorName: string;
      totalSales: number;
      totalRevenue: number;
    }>;
    topDesigns: Array<{
      designId: string;
      designName: string;
      totalSold: number;
      revenue: number;
    }>;
  }> {
    const paidOrders = this.orders.filter(o => o.paymentStatus === 'paid');
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.platformRevenue, 0);
    const totalOrders = paidOrders.length;
    const totalInstructors = new Set(this.instructorListings.map(l => l.instructorId)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top instructors
    const instructorStats = new Map<string, { name: string; sales: number; revenue: number }>();
    paidOrders.forEach(order => {
      const existing = instructorStats.get(order.instructorId) || {
        name: order.instructorName,
        sales: 0,
        revenue: 0
      };
      existing.sales += order.quantity;
      existing.revenue += order.platformRevenue;
      instructorStats.set(order.instructorId, existing);
    });

    const topInstructors = Array.from(instructorStats.entries())
      .map(([instructorId, stats]) => ({
        instructorId,
        instructorName: stats.name,
        totalSales: stats.sales,
        totalRevenue: stats.revenue
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Calculate top designs
    const designStats = new Map<string, { name: string; sold: number; revenue: number }>();
    paidOrders.forEach(order => {
      const existing = designStats.get(order.designId) || {
        name: order.designName,
        sold: 0,
        revenue: 0
      };
      existing.sold += order.quantity;
      existing.revenue += order.platformRevenue;
      designStats.set(order.designId, existing);
    });

    const topDesigns = Array.from(designStats.entries())
      .map(([designId, stats]) => ({
        designId,
        designName: stats.name,
        totalSold: stats.sold,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    return Promise.resolve({
      totalRevenue,
      totalOrders,
      totalInstructors,
      averageOrderValue,
      topInstructors,
      topDesigns
    });
  }

  // Configuration
  async getTShirtConfig(): Promise<TShirtConfig> {
    return Promise.resolve(this.config);
  }

  async updateTShirtConfig(updates: Partial<TShirtConfig>): Promise<TShirtConfig> {
    this.config = { ...this.config, ...updates };
    return Promise.resolve(this.config);
  }
}

export const tshirtSalesService = new TShirtSalesService(); 