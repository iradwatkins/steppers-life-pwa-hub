// Promotional Store Service for managing promotional products and orders
export interface PromotionalProduct {
  id: string;
  name: string;
  description: string;
  category: 'business_cards' | 'banners' | 'flyers' | 'tickets' | 'wristbands' | 'lawn_signs' | 'merchandise';
  basePrice: number;
  specialPrice?: number; // Exclusive pricing for qualified users
  images: string[];
  specifications: {
    dimensions?: string;
    material?: string;
    colors?: string[];
    quantities?: number[];
    printSides?: 'single' | 'double';
    finishes?: string[];
  };
  customizationOptions: {
    allowCustomArtwork: boolean;
    hasTemplates: boolean;
    textFields?: Array<{
      id: string;
      label: string;
      placeholder: string;
      required: boolean;
      maxLength?: number;
    }>;
    logoUpload?: boolean;
    colorCustomization?: boolean;
  };
  isActive: boolean;
  estimatedDelivery: string; // e.g., "5-7 business days"
  shippingOptions: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDays: number;
  }>;
  tags: string[];
}

export interface ProductOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    customization: {
      text?: Record<string, string>;
      artwork?: string[];
      specifications?: Record<string, any>;
    };
    totalPrice: number;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'production' | 'shipped' | 'delivered' | 'cancelled';
  shippingMethod: 'pickup' | 'standard' | 'express' | 'overnight';
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  };
  pickupLocation?: string;
  orderNotes?: string;
  artworkStatus: 'pending' | 'approved' | 'revision_needed' | 'not_provided';
  artworkFiles: string[];
  orderDate: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'account_credit';
}

export interface UserEligibility {
  userId: string;
  roles: string[];
  isEligible: boolean;
  qualifyingRoles: string[];
  accessLevel: 'basic' | 'premium' | 'vip';
  discountPercentage: number;
  specialPricing: boolean;
}

export interface ArtworkTemplate {
  id: string;
  name: string;
  description: string;
  productCategories: string[];
  previewImage: string;
  templateFile: string;
  designElements: Array<{
    type: 'text' | 'logo' | 'image';
    position: { x: number; y: number };
    size: { width: number; height: number };
    editable: boolean;
  }>;
  isPopular: boolean;
  tags: string[];
}

class PromotionalStoreService {
  private products: PromotionalProduct[] = [];
  private orders: ProductOrder[] = [];
  private templates: ArtworkTemplate[] = [];
  private eligibleRoles = ['promoter', 'instructor', 'business', 'organizer'];
  private chicagoPickupLocation = 'SteppersLife HQ - 123 State St, Chicago, IL 60601';

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock promotional products
    this.products = [
      {
        id: 'prod_001',
        name: 'Professional Business Cards',
        description: 'High-quality business cards with your stepping profile information',
        category: 'business_cards',
        basePrice: 29.99,
        specialPrice: 19.99,
        images: ['/placeholder-business-cards.jpg'],
        specifications: {
          dimensions: '3.5" x 2"',
          material: '16pt cardstock',
          colors: ['Full Color', 'Black & White'],
          quantities: [250, 500, 1000, 2500],
          printSides: 'double',
          finishes: ['Matte', 'Gloss', 'Uncoated']
        },
        customizationOptions: {
          allowCustomArtwork: true,
          hasTemplates: true,
          textFields: [
            { id: 'name', label: 'Name', placeholder: 'Your Name', required: true, maxLength: 50 },
            { id: 'title', label: 'Title', placeholder: 'Stepping Instructor', required: false, maxLength: 30 },
            { id: 'phone', label: 'Phone', placeholder: '(555) 123-4567', required: false, maxLength: 20 },
            { id: 'email', label: 'Email', placeholder: 'email@example.com', required: false, maxLength: 50 },
            { id: 'website', label: 'Website', placeholder: 'www.example.com', required: false, maxLength: 50 }
          ],
          logoUpload: true,
          colorCustomization: true
        },
        isActive: true,
        estimatedDelivery: '5-7 business days',
        shippingOptions: [
          { id: 'pickup', name: 'Chicago Pickup', description: 'Pick up at our Chicago location', price: 0, estimatedDays: 3 },
          { id: 'standard', name: 'Standard Shipping', description: 'USPS Ground', price: 8.99, estimatedDays: 7 },
          { id: 'express', name: 'Express Shipping', description: 'UPS 2-Day', price: 19.99, estimatedDays: 2 }
        ],
        tags: ['business', 'networking', 'professional']
      },
      {
        id: 'prod_002',
        name: 'Event Banner - Standard',
        description: 'Professional vinyl banners for your stepping events',
        category: 'banners',
        basePrice: 89.99,
        specialPrice: 69.99,
        images: ['/placeholder-banner.jpg'],
        specifications: {
          dimensions: '4ft x 2ft',
          material: '13oz vinyl',
          colors: ['Full Color'],
          printSides: 'single',
          finishes: ['Weather Resistant', 'Grommets Included']
        },
        customizationOptions: {
          allowCustomArtwork: true,
          hasTemplates: true,
          textFields: [
            { id: 'event_name', label: 'Event Name', placeholder: 'Your Event Name', required: true, maxLength: 100 },
            { id: 'date', label: 'Date', placeholder: 'Event Date', required: true, maxLength: 50 },
            { id: 'location', label: 'Location', placeholder: 'Event Location', required: true, maxLength: 100 },
            { id: 'website', label: 'Website/Contact', placeholder: 'Contact Info', required: false, maxLength: 50 }
          ],
          logoUpload: true,
          colorCustomization: true
        },
        isActive: true,
        estimatedDelivery: '7-10 business days',
        shippingOptions: [
          { id: 'pickup', name: 'Chicago Pickup', description: 'Pick up at our Chicago location', price: 0, estimatedDays: 5 },
          { id: 'standard', name: 'Standard Shipping', description: 'UPS Ground', price: 15.99, estimatedDays: 10 },
          { id: 'express', name: 'Express Shipping', description: 'UPS 2-Day', price: 35.99, estimatedDays: 2 }
        ],
        tags: ['events', 'marketing', 'outdoor']
      },
      {
        id: 'prod_003',
        name: 'Event Flyers',
        description: 'Full-color flyers to promote your stepping events',
        category: 'flyers',
        basePrice: 24.99,
        specialPrice: 14.99,
        images: ['/placeholder-flyers.jpg'],
        specifications: {
          dimensions: '8.5" x 11"',
          material: '100lb text paper',
          colors: ['Full Color', 'Black & White'],
          quantities: [100, 250, 500, 1000],
          printSides: 'single',
          finishes: ['Gloss', 'Matte']
        },
        customizationOptions: {
          allowCustomArtwork: true,
          hasTemplates: true,
          textFields: [
            { id: 'event_title', label: 'Event Title', placeholder: 'Event Title', required: true, maxLength: 80 },
            { id: 'description', label: 'Description', placeholder: 'Event Description', required: false, maxLength: 200 },
            { id: 'date_time', label: 'Date & Time', placeholder: 'When', required: true, maxLength: 50 },
            { id: 'location', label: 'Location', placeholder: 'Where', required: true, maxLength: 100 },
            { id: 'price', label: 'Price', placeholder: 'Ticket Price', required: false, maxLength: 20 }
          ],
          logoUpload: true,
          colorCustomization: true
        },
        isActive: true,
        estimatedDelivery: '3-5 business days',
        shippingOptions: [
          { id: 'pickup', name: 'Chicago Pickup', description: 'Pick up at our Chicago location', price: 0, estimatedDays: 2 },
          { id: 'standard', name: 'Standard Shipping', description: 'USPS Priority', price: 7.99, estimatedDays: 5 },
          { id: 'express', name: 'Express Shipping', description: 'UPS Next Day', price: 24.99, estimatedDays: 1 }
        ],
        tags: ['events', 'marketing', 'print']
      },
      {
        id: 'prod_004',
        name: 'Event Wristbands',
        description: 'Tyvek wristbands for event admission and identification',
        category: 'wristbands',
        basePrice: 34.99,
        specialPrice: 24.99,
        images: ['/placeholder-wristbands.jpg'],
        specifications: {
          dimensions: '0.75" x 10"',
          material: 'Tyvek',
          colors: ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Black'],
          quantities: [100, 250, 500, 1000, 2500],
          printSides: 'single'
        },
        customizationOptions: {
          allowCustomArtwork: true,
          hasTemplates: false,
          textFields: [
            { id: 'event_name', label: 'Event Name', placeholder: 'Event Name', required: true, maxLength: 30 },
            { id: 'date', label: 'Date', placeholder: 'Date', required: false, maxLength: 20 }
          ],
          logoUpload: false,
          colorCustomization: true
        },
        isActive: true,
        estimatedDelivery: '5-7 business days',
        shippingOptions: [
          { id: 'pickup', name: 'Chicago Pickup', description: 'Pick up at our Chicago location', price: 0, estimatedDays: 3 },
          { id: 'standard', name: 'Standard Shipping', description: 'USPS Priority', price: 9.99, estimatedDays: 7 },
          { id: 'express', name: 'Express Shipping', description: 'UPS 2-Day', price: 19.99, estimatedDays: 2 }
        ],
        tags: ['events', 'admission', 'identification']
      },
      {
        id: 'prod_005',
        name: 'Lawn Signs',
        description: 'Corrugated plastic yard signs for event promotion',
        category: 'lawn_signs',
        basePrice: 19.99,
        specialPrice: 12.99,
        images: ['/placeholder-lawn-signs.jpg'],
        specifications: {
          dimensions: '18" x 24"',
          material: '4mm corrugated plastic',
          colors: ['Full Color'],
          quantities: [1, 5, 10, 25, 50],
          printSides: 'single',
          finishes: ['Weather Resistant', 'Wire Stakes Included']
        },
        customizationOptions: {
          allowCustomArtwork: true,
          hasTemplates: true,
          textFields: [
            { id: 'message', label: 'Main Message', placeholder: 'Your Message', required: true, maxLength: 100 }
          ],
          logoUpload: true,
          colorCustomization: true
        },
        isActive: true,
        estimatedDelivery: '5-7 business days',
        shippingOptions: [
          { id: 'pickup', name: 'Chicago Pickup', description: 'Pick up at our Chicago location', price: 0, estimatedDays: 3 },
          { id: 'standard', name: 'Standard Shipping', description: 'UPS Ground', price: 12.99, estimatedDays: 7 },
          { id: 'express', name: 'Express Shipping', description: 'UPS 2-Day', price: 25.99, estimatedDays: 2 }
        ],
        tags: ['outdoor', 'promotion', 'events']
      }
    ];

    // Mock orders
    this.orders = [
      {
        id: 'order_001',
        userId: 'user_001',
        userName: 'Marcus Johnson',
        userEmail: 'marcus@example.com',
        userRole: 'instructor',
        products: [
          {
            productId: 'prod_001',
            productName: 'Professional Business Cards',
            quantity: 500,
            unitPrice: 19.99,
            customization: {
              text: {
                name: 'Marcus Johnson',
                title: 'Chicago Stepping Instructor',
                phone: '(312) 555-0123',
                email: 'marcus@stepperslife.com'
              }
            },
            totalPrice: 19.99
          }
        ],
        subtotal: 19.99,
        shippingCost: 0,
        tax: 1.60,
        totalAmount: 21.59,
        status: 'processing',
        shippingMethod: 'pickup',
        pickupLocation: this.chicagoPickupLocation,
        orderNotes: 'Please use SteppersLife logo',
        artworkStatus: 'approved',
        artworkFiles: [],
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        paymentStatus: 'paid',
        paymentMethod: 'credit_card'
      }
    ];

    // Mock artwork templates
    this.templates = [
      {
        id: 'template_001',
        name: 'Classic Business Card',
        description: 'Professional business card layout with SteppersLife branding',
        productCategories: ['business_cards'],
        previewImage: '/template-preview-001.jpg',
        templateFile: '/templates/business-card-classic.psd',
        designElements: [
          { type: 'text', position: { x: 20, y: 30 }, size: { width: 200, height: 25 }, editable: true },
          { type: 'logo', position: { x: 250, y: 20 }, size: { width: 80, height: 40 }, editable: false }
        ],
        isPopular: true,
        tags: ['business', 'professional', 'classic']
      },
      {
        id: 'template_002',
        name: 'Event Banner Template',
        description: 'Eye-catching banner design for stepping events',
        productCategories: ['banners'],
        previewImage: '/template-preview-002.jpg',
        templateFile: '/templates/event-banner-standard.psd',
        designElements: [
          { type: 'text', position: { x: 50, y: 50 }, size: { width: 300, height: 60 }, editable: true },
          { type: 'image', position: { x: 400, y: 20 }, size: { width: 150, height: 100 }, editable: true }
        ],
        isPopular: true,
        tags: ['events', 'banner', 'promotional']
      }
    ];
  }

  // User Eligibility
  async checkUserEligibility(userId: string, userRoles: string[]): Promise<UserEligibility> {
    const qualifyingRoles = userRoles.filter(role => this.eligibleRoles.includes(role));
    const isEligible = qualifyingRoles.length > 0;
    
    // Determine access level and discount
    let accessLevel: 'basic' | 'premium' | 'vip' = 'basic';
    let discountPercentage = 0;
    
    if (qualifyingRoles.includes('business')) {
      accessLevel = 'vip';
      discountPercentage = 25;
    } else if (qualifyingRoles.includes('instructor') || qualifyingRoles.includes('promoter')) {
      accessLevel = 'premium';
      discountPercentage = 15;
    } else if (qualifyingRoles.includes('organizer')) {
      accessLevel = 'basic';
      discountPercentage = 10;
    }

    return Promise.resolve({
      userId,
      roles: userRoles,
      isEligible,
      qualifyingRoles,
      accessLevel,
      discountPercentage,
      specialPricing: discountPercentage > 0
    });
  }

  // Product Management
  async getProducts(category?: string): Promise<PromotionalProduct[]> {
    let filtered = this.products.filter(p => p.isActive);
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    return Promise.resolve(filtered);
  }

  async getProduct(productId: string): Promise<PromotionalProduct | null> {
    const product = this.products.find(p => p.id === productId && p.isActive);
    return Promise.resolve(product || null);
  }

  async getProductPrice(productId: string, userEligibility: UserEligibility): Promise<number> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (userEligibility.isEligible && product.specialPrice) {
      const discountedPrice = product.specialPrice * (1 - userEligibility.discountPercentage / 100);
      return Promise.resolve(Math.max(discountedPrice, product.basePrice * 0.5)); // Minimum 50% of base price
    }

    return Promise.resolve(product.basePrice);
  }

  // Template Management
  async getTemplates(productCategory?: string): Promise<ArtworkTemplate[]> {
    let filtered = this.templates;
    
    if (productCategory) {
      filtered = this.templates.filter(t => t.productCategories.includes(productCategory));
    }

    return Promise.resolve(filtered);
  }

  async getTemplate(templateId: string): Promise<ArtworkTemplate | null> {
    const template = this.templates.find(t => t.id === templateId);
    return Promise.resolve(template || null);
  }

  // Order Management
  async createOrder(orderData: {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    products: Array<{
      productId: string;
      quantity: number;
      customization: any;
    }>;
    shippingMethod: 'pickup' | 'standard' | 'express' | 'overnight';
    shippingAddress?: any;
    orderNotes?: string;
    artworkFiles?: string[];
  }): Promise<ProductOrder> {
    const userEligibility = await this.checkUserEligibility(orderData.userId, [orderData.userRole]);
    
    let subtotal = 0;
    const processedProducts = [];

    // Calculate product costs
    for (const item of orderData.products) {
      const product = await this.getProduct(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const unitPrice = await this.getProductPrice(item.productId, userEligibility);
      const totalPrice = unitPrice * item.quantity;
      
      processedProducts.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        customization: item.customization,
        totalPrice
      });

      subtotal += totalPrice;
    }

    // Calculate shipping
    let shippingCost = 0;
    if (orderData.shippingMethod !== 'pickup') {
      // Get shipping cost from first product (simplified)
      const firstProduct = await this.getProduct(orderData.products[0].productId);
      const shippingOption = firstProduct?.shippingOptions.find(opt => opt.id === orderData.shippingMethod);
      shippingCost = shippingOption?.price || 0;
    }

    const tax = (subtotal + shippingCost) * 0.08; // 8% tax
    const totalAmount = subtotal + shippingCost + tax;

    const order: ProductOrder = {
      id: `order_${Date.now()}`,
      userId: orderData.userId,
      userName: orderData.userName,
      userEmail: orderData.userEmail,
      userRole: orderData.userRole,
      products: processedProducts,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      status: 'pending',
      shippingMethod: orderData.shippingMethod,
      shippingAddress: orderData.shippingAddress,
      pickupLocation: orderData.shippingMethod === 'pickup' ? this.chicagoPickupLocation : undefined,
      orderNotes: orderData.orderNotes,
      artworkStatus: orderData.artworkFiles && orderData.artworkFiles.length > 0 ? 'pending' : 'not_provided',
      artworkFiles: orderData.artworkFiles || [],
      orderDate: new Date(),
      paymentStatus: 'pending',
      paymentMethod: 'credit_card'
    };

    this.orders.push(order);
    return Promise.resolve(order);
  }

  async getUserOrders(userId: string): Promise<ProductOrder[]> {
    const userOrders = this.orders.filter(order => order.userId === userId);
    return Promise.resolve(userOrders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()));
  }

  async getOrder(orderId: string): Promise<ProductOrder | null> {
    const order = this.orders.find(o => o.id === orderId);
    return Promise.resolve(order || null);
  }

  async updateOrderStatus(orderId: string, status: ProductOrder['status'], trackingNumber?: string): Promise<ProductOrder> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (status === 'shipped') {
      // Set estimated delivery based on shipping method
      const deliveryDays = order.shippingMethod === 'express' ? 2 : 
                          order.shippingMethod === 'overnight' ? 1 : 7;
      order.estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
    }

    return Promise.resolve(order);
  }

  async updateArtworkStatus(orderId: string, artworkStatus: ProductOrder['artworkStatus']): Promise<ProductOrder> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.artworkStatus = artworkStatus;
    return Promise.resolve(order);
  }

  // Analytics
  async getStoreAnalytics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      orderCount: number;
      revenue: number;
    }>;
    ordersByStatus: Record<string, number>;
    revenueByMonth: Array<{
      month: string;
      revenue: number;
      orders: number;
    }>;
  }> {
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top products
    const productStats = new Map<string, { name: string; count: number; revenue: number }>();
    this.orders.forEach(order => {
      order.products.forEach(product => {
        const existing = productStats.get(product.productId) || {
          name: product.productName,
          count: 0,
          revenue: 0
        };
        existing.count += 1;
        existing.revenue += product.totalPrice;
        productStats.set(product.productId, existing);
      });
    });

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        orderCount: stats.count,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    this.orders.forEach(order => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    // Revenue by month (mock data)
    const revenueByMonth = [
      { month: 'Jan', revenue: 2340, orders: 15 },
      { month: 'Feb', revenue: 3120, orders: 22 },
      { month: 'Mar', revenue: 2890, orders: 18 },
      { month: 'Apr', revenue: 4250, orders: 28 },
      { month: 'May', revenue: 3670, orders: 24 }
    ];

    return Promise.resolve({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      topProducts,
      ordersByStatus,
      revenueByMonth
    });
  }

  async uploadArtwork(orderId: string, files: File[]): Promise<string[]> {
    // Mock file upload - in real implementation would upload to storage
    const uploadedFiles = files.map(file => 
      `/artwork/${orderId}/${file.name}`
    );

    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.artworkFiles.push(...uploadedFiles);
      order.artworkStatus = 'pending';
    }

    return Promise.resolve(uploadedFiles);
  }
}

export const promotionalStoreService = new PromotionalStoreService(); 