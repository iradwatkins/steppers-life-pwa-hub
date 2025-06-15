import { 
  AdZone, 
  DirectUserAd, 
  AdOrder, 
  AdDisplaySettings, 
  AdSenseConfig,
  AdRevenueReport,
  AdAnalytics,
  AdModeration,
  AdFormData,
  AdZoneFormData,
  AdPlacement,
  AdStatus,
  OrderStatus,
  PaymentStatus,
  ModerationStatus,
  ModerationAction
} from '@/types/advertising';

class AdvertisingService {
  private adZones: AdZone[] = [];
  private directUserAds: DirectUserAd[] = [];
  private adOrders: AdOrder[] = [];
  private moderationReports: AdModeration[] = [];
  private displaySettings: AdDisplaySettings;
  private adSenseConfig: AdSenseConfig;

  constructor() {
    this.initializeMockData();
    this.displaySettings = this.getDefaultDisplaySettings();
    this.adSenseConfig = this.getDefaultAdSenseConfig();
  }

  private initializeMockData() {
    // Initialize mock ad zones
    this.adZones = [
      {
        id: 'zone_hero_banner',
        name: 'Hero Banner',
        description: 'Premium hero section placement with full-width display',
        dimensions: { width: 1920, height: 600 },
        placement: AdPlacement.HEADER_BANNER,
        pricing: {
          basePricePerDay: 100,
          isPremium: true,
          weeklyDiscount: 15,
          monthlyDiscount: 25
        },
        isActive: true,
        supportedFormats: ['jpg', 'png', 'webp'],
        maxFileSize: 5,
        isRandomPlacement: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'zone_header_banner',
        name: 'Header Banner',
        description: 'Prime banner placement at the top of all pages',
        dimensions: { width: 1200, height: 90 },
        placement: AdPlacement.HEADER_BANNER,
        pricing: {
          basePricePerDay: 50,
          isPremium: true,
          weeklyDiscount: 10,
          monthlyDiscount: 20
        },
        isActive: true,
        supportedFormats: ['jpg', 'png', 'gif', 'webp'],
        maxFileSize: 2,
        isRandomPlacement: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'zone_sidebar_right',
        name: 'Right Sidebar',
        description: 'Consistent placement in right sidebar across site',
        dimensions: { width: 300, height: 250 },
        placement: AdPlacement.SIDEBAR_RIGHT,
        pricing: {
          basePricePerDay: 25,
          isPremium: false,
          weeklyDiscount: 5,
          monthlyDiscount: 15
        },
        isActive: true,
        supportedFormats: ['jpg', 'png', 'gif', 'webp'],
        maxFileSize: 1,
        isRandomPlacement: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'zone_in_feed',
        name: 'In-Feed Ads',
        description: 'Native ads displayed within event/content feeds',
        dimensions: { width: 600, height: 200 },
        placement: AdPlacement.IN_FEED,
        pricing: {
          basePricePerDay: 35,
          isPremium: false,
          weeklyDiscount: 8,
          monthlyDiscount: 18
        },
        isActive: true,
        supportedFormats: ['jpg', 'png', 'webp'],
        maxFileSize: 1.5,
        isRandomPlacement: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'zone_event_detail_top',
        name: 'Event Detail Top',
        description: 'Premium placement at the top of event detail pages',
        dimensions: { width: 800, height: 150 },
        placement: AdPlacement.EVENT_DETAIL_TOP,
        pricing: {
          basePricePerDay: 45,
          isPremium: true,
          weeklyDiscount: 12,
          monthlyDiscount: 25
        },
        isActive: true,
        supportedFormats: ['jpg', 'png', 'gif', 'webp'],
        maxFileSize: 2,
        isRandomPlacement: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    // Initialize mock direct user ads
    this.directUserAds = [
      {
        id: 'ad_hero_001',
        advertiserId: 'user_business_hero_001',
        advertiserInfo: {
          name: 'Elite Dance Academy',
          email: 'info@elitedanceacademy.com',
          userType: 'business'
        },
        adZoneId: 'zone_hero_banner',
        title: 'Master the Art of Chicago Stepping',
        description: 'Join Elite Dance Academy - Where Passion Meets Precision. Professional instruction, state-of-the-art facilities, and a community that dances as one.',
        creativeUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        clickThroughUrl: 'https://elitedanceacademy.com/chicago-stepping',
        status: AdStatus.RUNNING,
        schedule: {
          startDate: new Date('2024-12-15'),
          endDate: new Date('2025-01-15'),
          duration: 31
        },
        pricing: {
          totalCost: 2325,
          pricePerDay: 75,
          discountApplied: 775
        },
        performance: {
          impressions: 28750,
          clicks: 432,
          clickThroughRate: 1.50,
          totalRevenue: 2325,
          dateRange: {
            start: new Date('2024-12-15'),
            end: new Date('2024-12-19')
          },
          dailyStats: [
            { date: new Date('2024-12-15'), impressions: 5750, clicks: 86, revenue: 75 },
            { date: new Date('2024-12-16'), impressions: 5800, clicks: 88, revenue: 75 },
            { date: new Date('2024-12-17'), impressions: 5700, clicks: 84, revenue: 75 },
            { date: new Date('2024-12-18'), impressions: 5900, clicks: 90, revenue: 75 },
            { date: new Date('2024-12-19'), impressions: 5600, clicks: 84, revenue: 75 }
          ]
        },
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
        approvedAt: new Date('2024-12-12')
      },
      {
        id: 'ad_hero_002',
        advertiserId: 'user_business_hero_002',
        advertiserInfo: {
          name: 'Chicago Step Shoes Co.',
          email: 'sales@chicagostepshoes.com',
          userType: 'business'
        },
        adZoneId: 'zone_hero_banner',
        title: 'Step Up Your Game with Professional Dance Shoes',
        description: 'Discover the perfect blend of comfort, style, and performance. Trusted by professional dancers nationwide.',
        creativeUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        clickThroughUrl: 'https://chicagostepshoes.com/professional-line',
        status: AdStatus.RUNNING,
        schedule: {
          startDate: new Date('2024-12-15'),
          endDate: new Date('2025-01-15'),
          duration: 31
        },
        pricing: {
          totalCost: 2325,
          pricePerDay: 75,
          discountApplied: 775
        },
        performance: {
          impressions: 31200,
          clicks: 468,
          clickThroughRate: 1.50,
          totalRevenue: 2325,
          dateRange: {
            start: new Date('2024-12-15'),
            end: new Date('2024-12-19')
          },
          dailyStats: [
            { date: new Date('2024-12-15'), impressions: 6240, clicks: 94, revenue: 75 },
            { date: new Date('2024-12-16'), impressions: 6300, clicks: 95, revenue: 75 },
            { date: new Date('2024-12-17'), impressions: 6100, clicks: 92, revenue: 75 },
            { date: new Date('2024-12-18'), impressions: 6400, clicks: 96, revenue: 75 },
            { date: new Date('2024-12-19'), impressions: 6160, clicks: 91, revenue: 75 }
          ]
        },
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
        approvedAt: new Date('2024-12-12')
      },
      {
        id: 'ad_001',
        advertiserId: 'user_organizer_001',
        advertiserInfo: {
          name: 'Atlanta Step Masters',
          email: 'info@atlantastepmasters.com',
          userType: 'organizer'
        },
        adZoneId: 'zone_header_banner',
        title: 'Join Atlanta Step Masters - Weekly Classes',
        description: 'Premier stepping instruction with championship-winning instructors',
        creativeUrl: 'https://images.unsplash.com/photo-1574947671515-c8a58abf1d77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        clickThroughUrl: 'https://atlantastepmasters.com/classes',
        status: AdStatus.RUNNING,
        schedule: {
          startDate: new Date('2024-12-15'),
          endDate: new Date('2024-12-29'),
          duration: 14
        },
        pricing: {
          totalCost: 630,
          pricePerDay: 45,
          discountApplied: 70
        },
        performance: {
          impressions: 15420,
          clicks: 234,
          clickThroughRate: 1.52,
          totalRevenue: 630,
          dateRange: {
            start: new Date('2024-12-15'),
            end: new Date('2024-12-19')
          },
          dailyStats: [
            { date: new Date('2024-12-15'), impressions: 3200, clicks: 48, revenue: 45 },
            { date: new Date('2024-12-16'), impressions: 3100, clicks: 52, revenue: 45 },
            { date: new Date('2024-12-17'), impressions: 2950, clicks: 41, revenue: 45 },
            { date: new Date('2024-12-18'), impressions: 3080, clicks: 46, revenue: 45 },
            { date: new Date('2024-12-19'), impressions: 3090, clicks: 47, revenue: 45 }
          ]
        },
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
        approvedAt: new Date('2024-12-12')
      },
      {
        id: 'ad_002',
        advertiserId: 'user_instructor_001',
        advertiserInfo: {
          name: 'Michelle\'s Dance Studio',
          email: 'michelle@michelledance.com',
          userType: 'instructor'
        },
        adZoneId: 'zone_sidebar_right',
        title: 'Private Step Lessons Available',
        description: 'One-on-one instruction for all skill levels',
        creativeUrl: '/mock-ads/michelle-dance-studio-sidebar.jpg',
        clickThroughUrl: 'https://michelledance.com/private-lessons',
        status: AdStatus.APPROVED,
        schedule: {
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          duration: 7
        },
        pricing: {
          totalCost: 162,
          pricePerDay: 24,
          discountApplied: 6
        },
        createdAt: new Date('2024-12-12'),
        updatedAt: new Date('2024-12-18'),
        approvedAt: new Date('2024-12-18')
      },
      {
        id: 'ad_003',
        advertiserId: 'user_business_001',
        advertiserInfo: {
          name: 'StepWear Plus',
          email: 'sales@stepwearplus.com',
          userType: 'business'
        },
        adZoneId: 'zone_in_feed',
        title: 'New Collection: Professional Step Shoes',
        description: 'Premium stepping shoes designed for comfort and performance',
        creativeUrl: '/mock-ads/stepwear-plus-feed.jpg',
        clickThroughUrl: 'https://stepwearplus.com/new-collection',
        status: AdStatus.PENDING_APPROVAL,
        schedule: {
          startDate: new Date('2024-12-22'),
          endDate: new Date('2025-01-05'),
          duration: 14
        },
        pricing: {
          totalCost: 441,
          pricePerDay: 31.5,
          discountApplied: 49
        },
        createdAt: new Date('2024-12-18'),
        updatedAt: new Date('2024-12-18')
      },
      {
        id: 'ad_sidebar_001',
        advertiserId: 'user_business_sidebar_001',
        advertiserInfo: {
          name: 'Step Style Boutique',
          email: 'info@stepstyle.com',
          userType: 'business'
        },
        adZoneId: 'zone_sidebar_right',
        title: 'Fashion Forward Dance Wear',
        description: 'Elegant attire for every step you take',
        creativeUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        clickThroughUrl: 'https://stepstyle.com/collections/dance-wear',
        status: AdStatus.RUNNING,
        schedule: {
          startDate: new Date('2024-12-15'),
          endDate: new Date('2025-01-15'),
          duration: 31
        },
        pricing: {
          totalCost: 930,
          pricePerDay: 30,
          discountApplied: 310
        },
        performance: {
          impressions: 12400,
          clicks: 186,
          clickThroughRate: 1.50,
          totalRevenue: 930,
          dateRange: {
            start: new Date('2024-12-15'),
            end: new Date('2024-12-19')
          },
          dailyStats: [
            { date: new Date('2024-12-15'), impressions: 2480, clicks: 37, revenue: 30 },
            { date: new Date('2024-12-16'), impressions: 2520, clicks: 38, revenue: 30 },
            { date: new Date('2024-12-17'), impressions: 2440, clicks: 37, revenue: 30 },
            { date: new Date('2024-12-18'), impressions: 2560, clicks: 38, revenue: 30 },
            { date: new Date('2024-12-19'), impressions: 2400, clicks: 36, revenue: 30 }
          ]
        },
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
        approvedAt: new Date('2024-12-12')
      },
      {
        id: 'ad_infeed_001',
        advertiserId: 'user_business_infeed_001',
        advertiserInfo: {
          name: 'Rhythm City Events',
          email: 'bookings@rhythmcity.com',
          userType: 'organizer'
        },
        adZoneId: 'zone_in_feed',
        title: 'Monthly Stepping Competition',
        description: 'Win cash prizes and showcase your skills at Rhythm City\'s premier stepping competition',
        creativeUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        clickThroughUrl: 'https://rhythmcity.com/competitions',
        status: AdStatus.RUNNING,
        schedule: {
          startDate: new Date('2024-12-15'),
          endDate: new Date('2025-01-15'),
          duration: 31
        },
        pricing: {
          totalCost: 1240,
          pricePerDay: 40,
          discountApplied: 0
        },
        performance: {
          impressions: 18600,
          clicks: 279,
          clickThroughRate: 1.50,
          totalRevenue: 1240,
          dateRange: {
            start: new Date('2024-12-15'),
            end: new Date('2024-12-19')
          },
          dailyStats: [
            { date: new Date('2024-12-15'), impressions: 3720, clicks: 56, revenue: 40 },
            { date: new Date('2024-12-16'), impressions: 3780, clicks: 57, revenue: 40 },
            { date: new Date('2024-12-17'), impressions: 3660, clicks: 55, revenue: 40 },
            { date: new Date('2024-12-18'), impressions: 3840, clicks: 58, revenue: 40 },
            { date: new Date('2024-12-19'), impressions: 3600, clicks: 53, revenue: 40 }
          ]
        },
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
        approvedAt: new Date('2024-12-12')
      },
      {
        id: 'ad_between_content_001',
        advertiserId: 'user_business_content_001',
        advertiserInfo: {
          name: 'StepFit Nutrition',
          email: 'hello@stepfitnutrition.com',
          userType: 'business'
        },
        adZoneId: 'zone_between_content',
        title: 'Fuel Your Dance with Premium Nutrition',
        description: 'Performance supplements designed specifically for dancers',
        creativeUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        clickThroughUrl: 'https://stepfitnutrition.com/dancer-series',
        status: AdStatus.RUNNING,
        schedule: {
          startDate: new Date('2024-12-15'),
          endDate: new Date('2025-01-15'),
          duration: 31
        },
        pricing: {
          totalCost: 775,
          pricePerDay: 25,
          discountApplied: 0
        },
        performance: {
          impressions: 9300,
          clicks: 140,
          clickThroughRate: 1.50,
          totalRevenue: 775,
          dateRange: {
            start: new Date('2024-12-15'),
            end: new Date('2024-12-19')
          },
          dailyStats: [
            { date: new Date('2024-12-15'), impressions: 1860, clicks: 28, revenue: 25 },
            { date: new Date('2024-12-16'), impressions: 1890, clicks: 28, revenue: 25 },
            { date: new Date('2024-12-17'), impressions: 1830, clicks: 27, revenue: 25 },
            { date: new Date('2024-12-18'), impressions: 1920, clicks: 29, revenue: 25 },
            { date: new Date('2024-12-19'), impressions: 1800, clicks: 28, revenue: 25 }
          ]
        },
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
        approvedAt: new Date('2024-12-12')
      }
    ];

    // Initialize mock ad orders
    this.adOrders = [
      {
        id: 'order_001',
        advertiserId: 'user_organizer_001',
        adZoneId: 'zone_header_banner',
        adDetails: {
          title: 'Join Atlanta Step Masters - Weekly Classes',
          description: 'Premier stepping instruction with championship-winning instructors'
        },
        orderStatus: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.COMPLETED,
        totalAmount: 630,
        paymentMethod: 'stripe',
        paymentIntentId: 'pi_1234567890',
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
        submittedAt: new Date('2024-12-10'),
        approvedAt: new Date('2024-12-12'),
        completedAt: new Date('2024-12-15')
      },
      {
        id: 'order_002',
        advertiserId: 'user_instructor_001',
        adZoneId: 'zone_sidebar_right',
        adDetails: {
          title: 'Private Step Lessons Available',
          description: 'One-on-one instruction for all skill levels'
        },
        orderStatus: OrderStatus.APPROVED,
        paymentStatus: PaymentStatus.COMPLETED,
        totalAmount: 162,
        paymentMethod: 'stripe',
        paymentIntentId: 'pi_0987654321',
        createdAt: new Date('2024-12-12'),
        updatedAt: new Date('2024-12-18'),
        submittedAt: new Date('2024-12-12'),
        approvedAt: new Date('2024-12-18')
      },
      {
        id: 'order_003',
        advertiserId: 'user_business_001',
        adZoneId: 'zone_in_feed',
        adDetails: {
          title: 'New Collection: Professional Step Shoes',
          description: 'Premium stepping shoes designed for comfort and performance'
        },
        orderStatus: OrderStatus.SUBMITTED,
        paymentStatus: PaymentStatus.COMPLETED,
        totalAmount: 441,
        paymentMethod: 'stripe',
        paymentIntentId: 'pi_1122334455',
        createdAt: new Date('2024-12-18'),
        updatedAt: new Date('2024-12-18'),
        submittedAt: new Date('2024-12-18')
      }
    ];

    // Initialize mock moderation reports
    this.moderationReports = [
      {
        id: 'mod_001',
        adId: 'ad_001',
        reportedBy: 'user_community_001',
        reportReason: 'Misleading content claims',
        status: ModerationStatus.APPROVED,
        reviewNotes: 'Claims verified and within acceptable guidelines',
        actionTaken: ModerationAction.APPROVED,
        createdAt: new Date('2024-12-16'),
        resolvedAt: new Date('2024-12-17')
      }
    ];
  }

  private getDefaultDisplaySettings(): AdDisplaySettings {
    return {
      globalAdEnabled: true,
      adSenseEnabled: true,
      directAdsEnabled: true,
      inFeedFrequency: 6,
      maxAdsPerPage: 3,
      excludedPages: [
        '/auth/login',
        '/auth/register',
        '/checkout/*',
        '/payment/*',
        '/legal/*',
        '/profile/edit'
      ],
      loadingStrategy: 'lazy',
      fallbackBehavior: 'adSense'
    };
  }

  private getDefaultAdSenseConfig(): AdSenseConfig {
    return {
      publisherId: 'pub-1234567890123456',
      adUnitIds: {
        'zone_header_banner': 'ca-pub-1234567890123456/1234567890',
        'zone_sidebar_right': 'ca-pub-1234567890123456/0987654321',
        'zone_in_feed': 'ca-pub-1234567890123456/1122334455'
      },
      isEnabled: true,
      fallbackEnabled: true,
      revenueShare: 70,
      lastSyncAt: new Date('2024-12-19')
    };
  }

  // Ad Zone Management
  async getAdZones(): Promise<AdZone[]> {
    return Promise.resolve([...this.adZones]);
  }

  async getAdZone(id: string): Promise<AdZone | null> {
    const zone = this.adZones.find(z => z.id === id);
    return Promise.resolve(zone || null);
  }

  async createAdZone(zoneData: AdZoneFormData): Promise<AdZone> {
    const newZone: AdZone = {
      id: `zone_${Date.now()}`,
      name: zoneData.name,
      description: zoneData.description,
      dimensions: zoneData.dimensions,
      placement: zoneData.placement,
      pricing: {
        basePricePerDay: zoneData.basePricePerDay,
        isPremium: zoneData.isPremium,
        weeklyDiscount: zoneData.isPremium ? 10 : 5,
        monthlyDiscount: zoneData.isPremium ? 20 : 15
      },
      isActive: true,
      supportedFormats: zoneData.supportedFormats,
      maxFileSize: zoneData.maxFileSize,
      isRandomPlacement: zoneData.isRandomPlacement,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.adZones.push(newZone);
    return Promise.resolve(newZone);
  }

  async updateAdZone(id: string, zoneData: Partial<AdZoneFormData>): Promise<AdZone | null> {
    const zoneIndex = this.adZones.findIndex(z => z.id === id);
    if (zoneIndex === -1) return Promise.resolve(null);

    const zone = { ...this.adZones[zoneIndex] };
    if (zoneData.name) zone.name = zoneData.name;
    if (zoneData.description) zone.description = zoneData.description;
    if (zoneData.dimensions) zone.dimensions = zoneData.dimensions;
    if (zoneData.placement) zone.placement = zoneData.placement;
    if (zoneData.basePricePerDay) {
      zone.pricing.basePricePerDay = zoneData.basePricePerDay;
    }
    if (zoneData.isPremium !== undefined) zone.pricing.isPremium = zoneData.isPremium;
    if (zoneData.supportedFormats) zone.supportedFormats = zoneData.supportedFormats;
    if (zoneData.maxFileSize) zone.maxFileSize = zoneData.maxFileSize;
    if (zoneData.isRandomPlacement !== undefined) zone.isRandomPlacement = zoneData.isRandomPlacement;
    
    zone.updatedAt = new Date();
    this.adZones[zoneIndex] = zone;
    
    return Promise.resolve(zone);
  }

  async deleteAdZone(id: string): Promise<boolean> {
    const initialLength = this.adZones.length;
    this.adZones = this.adZones.filter(z => z.id !== id);
    return Promise.resolve(this.adZones.length < initialLength);
  }

  async toggleAdZoneStatus(id: string): Promise<AdZone | null> {
    const zoneIndex = this.adZones.findIndex(z => z.id === id);
    if (zoneIndex === -1) return Promise.resolve(null);

    this.adZones[zoneIndex].isActive = !this.adZones[zoneIndex].isActive;
    this.adZones[zoneIndex].updatedAt = new Date();
    
    return Promise.resolve(this.adZones[zoneIndex]);
  }

  // Direct User Ads Management
  async getDirectUserAds(filters?: {
    status?: AdStatus;
    advertiserId?: string;
    adZoneId?: string;
  }): Promise<DirectUserAd[]> {
    let ads = [...this.directUserAds];

    if (filters?.status) {
      ads = ads.filter(ad => ad.status === filters.status);
    }
    if (filters?.advertiserId) {
      ads = ads.filter(ad => ad.advertiserId === filters.advertiserId);
    }
    if (filters?.adZoneId) {
      ads = ads.filter(ad => ad.adZoneId === filters.adZoneId);
    }

    return Promise.resolve(ads);
  }

  async getDirectUserAd(id: string): Promise<DirectUserAd | null> {
    const ad = this.directUserAds.find(a => a.id === id);
    return Promise.resolve(ad || null);
  }

  async createDirectUserAd(adData: AdFormData, advertiserId: string): Promise<DirectUserAd> {
    const zone = await this.getAdZone(adData.adZoneId);
    if (!zone) throw new Error('Invalid ad zone');

    const duration = adData.schedule.duration;
    const totalCost = this.calculateAdCost(zone, duration);

    const newAd: DirectUserAd = {
      id: `ad_${Date.now()}`,
      advertiserId,
      advertiserInfo: {
        name: 'User Name', // Would come from user service
        email: 'user@example.com', // Would come from user service
        userType: 'organizer' // Would come from user service
      },
      adZoneId: adData.adZoneId,
      title: adData.title,
      description: adData.description,
      creativeUrl: '/placeholder-creative.jpg', // Would be uploaded
      clickThroughUrl: adData.clickThroughUrl,
      status: AdStatus.PENDING_APPROVAL,
      schedule: {
        startDate: adData.schedule.startDate,
        endDate: new Date(adData.schedule.startDate.getTime() + (duration * 24 * 60 * 60 * 1000)),
        duration
      },
      pricing: {
        totalCost,
        pricePerDay: zone.pricing.basePricePerDay,
        discountApplied: totalCost - (zone.pricing.basePricePerDay * duration)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.directUserAds.push(newAd);
    return Promise.resolve(newAd);
  }

  async updateAdStatus(id: string, status: AdStatus, adminNotes?: string): Promise<DirectUserAd | null> {
    const adIndex = this.directUserAds.findIndex(a => a.id === id);
    if (adIndex === -1) return Promise.resolve(null);

    const ad = { ...this.directUserAds[adIndex] };
    ad.status = status;
    ad.updatedAt = new Date();
    
    if (adminNotes) ad.adminNotes = adminNotes;
    
    if (status === AdStatus.APPROVED) {
      ad.approvedAt = new Date();
    } else if (status === AdStatus.REJECTED) {
      ad.rejectedAt = new Date();
      if (adminNotes) ad.rejectionReason = adminNotes;
    }

    this.directUserAds[adIndex] = ad;
    return Promise.resolve(ad);
  }

  private calculateAdCost(zone: AdZone, duration: number): number {
    let totalCost = zone.pricing.basePricePerDay * duration;
    
    // Apply discounts
    if (duration >= 30 && zone.pricing.monthlyDiscount) {
      totalCost = totalCost * (1 - zone.pricing.monthlyDiscount / 100);
    } else if (duration >= 7 && zone.pricing.weeklyDiscount) {
      totalCost = totalCost * (1 - zone.pricing.weeklyDiscount / 100);
    }

    return Math.round(totalCost);
  }

  // Ad Orders Management
  async getAdOrders(filters?: {
    status?: OrderStatus;
    advertiserId?: string;
  }): Promise<AdOrder[]> {
    let orders = [...this.adOrders];

    if (filters?.status) {
      orders = orders.filter(order => order.orderStatus === filters.status);
    }
    if (filters?.advertiserId) {
      orders = orders.filter(order => order.advertiserId === filters.advertiserId);
    }

    return Promise.resolve(orders);
  }

  async createAdOrder(orderData: Partial<AdOrder>): Promise<AdOrder> {
    const newOrder: AdOrder = {
      id: `order_${Date.now()}`,
      advertiserId: orderData.advertiserId || '',
      adZoneId: orderData.adZoneId || '',
      adDetails: orderData.adDetails || {},
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalAmount: orderData.totalAmount || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.adOrders.push(newOrder);
    return Promise.resolve(newOrder);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<AdOrder | null> {
    const orderIndex = this.adOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) return Promise.resolve(null);

    this.adOrders[orderIndex].orderStatus = status;
    this.adOrders[orderIndex].updatedAt = new Date();

    if (status === OrderStatus.APPROVED) {
      this.adOrders[orderIndex].approvedAt = new Date();
    } else if (status === OrderStatus.COMPLETED) {
      this.adOrders[orderIndex].completedAt = new Date();
    }

    return Promise.resolve(this.adOrders[orderIndex]);
  }

  // Display Settings Management
  async getDisplaySettings(): Promise<AdDisplaySettings> {
    return Promise.resolve({ ...this.displaySettings });
  }

  async updateDisplaySettings(settings: Partial<AdDisplaySettings>): Promise<AdDisplaySettings> {
    this.displaySettings = { ...this.displaySettings, ...settings };
    return Promise.resolve(this.displaySettings);
  }

  // AdSense Configuration
  async getAdSenseConfig(): Promise<AdSenseConfig> {
    return Promise.resolve({ ...this.adSenseConfig });
  }

  async updateAdSenseConfig(config: Partial<AdSenseConfig>): Promise<AdSenseConfig> {
    this.adSenseConfig = { ...this.adSenseConfig, ...config };
    this.adSenseConfig.lastSyncAt = new Date();
    return Promise.resolve(this.adSenseConfig);
  }

  // Analytics and Reporting
  async getAdAnalytics(dateRange?: { start: Date; end: Date }): Promise<AdAnalytics> {
    const runningAds = this.directUserAds.filter(ad => ad.status === AdStatus.RUNNING);
    const pendingAds = this.directUserAds.filter(ad => ad.status === AdStatus.PENDING_APPROVAL);

    const totalImpressions = runningAds.reduce((sum, ad) => 
      sum + (ad.performance?.impressions || 0), 0);
    const totalClicks = runningAds.reduce((sum, ad) => 
      sum + (ad.performance?.clicks || 0), 0);
    const totalRevenue = runningAds.reduce((sum, ad) => 
      sum + (ad.performance?.totalRevenue || 0), 0);

    return Promise.resolve({
      overview: {
        totalImpressions,
        totalClicks,
        averageCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        totalRevenue,
        activeAds: runningAds.length,
        pendingAds: pendingAds.length
      },
      performance: {
        topPerformingAds: runningAds
          .filter(ad => ad.performance)
          .sort((a, b) => (b.performance?.clickThroughRate || 0) - (a.performance?.clickThroughRate || 0))
          .slice(0, 5),
        topPerformingZones: this.adZones
          .filter(zone => zone.isActive)
          .sort((a, b) => b.pricing.basePricePerDay - a.pricing.basePricePerDay)
          .slice(0, 5),
        revenueGrowth: 15.5, // Mock percentage
        impressionGrowth: 8.2 // Mock percentage
      },
      trends: {
        daily: this.generateDailyTrends(),
        weekly: this.generateWeeklyTrends(),
        monthly: this.generateMonthlyTrends()
      }
    });
  }

  async getRevenueReport(dateRange: { start: Date; end: Date }): Promise<AdRevenueReport> {
    const directAdsRevenue = 2850;
    const adSenseRevenue = 1240;
    const totalRevenue = directAdsRevenue + adSenseRevenue;

    return Promise.resolve({
      totalRevenue,
      directAdsRevenue,
      adSenseRevenue,
      revenueByZone: {
        'zone_header_banner': 1200,
        'zone_sidebar_right': 650,
        'zone_in_feed': 850,
        'zone_event_detail_top': 1190
      },
      revenueByPeriod: {
        daily: this.generateDailyRevenue(),
        monthly: this.generateMonthlyRevenue()
      },
      topPerformingAds: this.directUserAds
        .filter(ad => ad.performance)
        .sort((a, b) => (b.performance?.totalRevenue || 0) - (a.performance?.totalRevenue || 0))
        .slice(0, 10),
      dateRange
    });
  }

  // Moderation
  async getModerationReports(): Promise<AdModeration[]> {
    return Promise.resolve([...this.moderationReports]);
  }

  async createModerationReport(report: Omit<AdModeration, 'id' | 'createdAt'>): Promise<AdModeration> {
    const newReport: AdModeration = {
      ...report,
      id: `mod_${Date.now()}`,
      createdAt: new Date()
    };

    this.moderationReports.push(newReport);
    return Promise.resolve(newReport);
  }

  async resolveModerationReport(
    id: string, 
    action: ModerationAction, 
    reviewNotes?: string
  ): Promise<AdModeration | null> {
    const reportIndex = this.moderationReports.findIndex(r => r.id === id);
    if (reportIndex === -1) return Promise.resolve(null);

    this.moderationReports[reportIndex].actionTaken = action;
    this.moderationReports[reportIndex].status = action === ModerationAction.APPROVED 
      ? ModerationStatus.APPROVED 
      : ModerationStatus.REJECTED;
    this.moderationReports[reportIndex].reviewNotes = reviewNotes;
    this.moderationReports[reportIndex].resolvedAt = new Date();

    return Promise.resolve(this.moderationReports[reportIndex]);
  }

  // Helper methods for generating mock trend data
  private generateDailyTrends() {
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date,
        impressions: Math.floor(Math.random() * 5000) + 2000,
        clicks: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 500) + 100
      });
    }
    return trends;
  }

  private generateWeeklyTrends() {
    const trends = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekNumber = this.getWeekNumber(date);
      trends.push({
        week: `2024-W${weekNumber.toString().padStart(2, '0')}`,
        impressions: Math.floor(Math.random() * 25000) + 15000,
        clicks: Math.floor(Math.random() * 1000) + 500,
        revenue: Math.floor(Math.random() * 2500) + 1000
      });
    }
    return trends;
  }

  private generateMonthlyTrends() {
    const trends = [];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      trends.push({
        month: months[date.getMonth()],
        year: date.getFullYear(),
        impressions: Math.floor(Math.random() * 100000) + 60000,
        clicks: Math.floor(Math.random() * 5000) + 2000,
        revenue: Math.floor(Math.random() * 10000) + 4000
      });
    }
    return trends;
  }

  private generateDailyRevenue() {
    const revenue = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const directAds = Math.floor(Math.random() * 200) + 50;
      const adSense = Math.floor(Math.random() * 100) + 20;
      revenue.push({
        date,
        directAds,
        adSense,
        total: directAds + adSense
      });
    }
    return revenue;
  }

  private generateMonthlyRevenue() {
    const revenue = [];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const directAds = Math.floor(Math.random() * 5000) + 2000;
      const adSense = Math.floor(Math.random() * 2000) + 800;
      revenue.push({
        month: months[date.getMonth()],
        year: date.getFullYear(),
        directAds,
        adSense,
        total: directAds + adSense
      });
    }
    return revenue;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }
}

export const advertisingService = new AdvertisingService(); 