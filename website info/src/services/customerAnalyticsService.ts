// Customer Analytics & Segmentation Service
// Comprehensive customer analytics and segmentation tools for event organizers

export interface CustomerDemographics {
  customerId: string;
  age: number;
  ageGroup: 'Under 25' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
  location: {
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: { lat: number; lng: number };
  };
  incomeLevel: 'Low' | 'Medium' | 'High' | 'Premium';
  interests: string[];
  occupation?: string;
  education?: string;
  gender?: string;
  registrationDate: string;
}

export interface BehavioralData {
  customerId: string;
  purchaseHistory: {
    totalEvents: number;
    totalSpent: number;
    averageOrderValue: number;
    firstPurchase: string;
    lastPurchase: string;
    favoriteEventTypes: string[];
    preferredPriceRange: { min: number; max: number };
  };
  attendancePatterns: {
    eventsAttended: number;
    noShowRate: number;
    checkInSpeed: 'Early' | 'On Time' | 'Late';
    avgTimeBetweenEvents: number; // days
  };
  engagementLevel: {
    emailOpenRate: number;
    clickThroughRate: number;
    socialMediaInteractions: number;
    reviewsSubmitted: number;
    referralsMade: number;
  };
}

export interface CustomerLifetimeValue {
  customerId: string;
  totalLifetimeValue: number;
  predictedLifetimeValue: number;
  averageOrderValue: number;
  purchaseFrequency: number; // purchases per year
  retentionRate: number;
  churnProbability: number;
  valueSegment: 'High Value' | 'Medium Value' | 'Low Value' | 'At Risk';
  monthsActive: number;
  lastActivity: string;
}

export interface ChurnAnalysis {
  customerId: string;
  churnRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  churnProbability: number;
  daysSinceLastActivity: number;
  factors: {
    decreasedEngagement: boolean;
    priceIncreaseReaction: boolean;
    competitorActivity: boolean;
    serviceIssues: boolean;
    lifecycleStage: string;
  };
  recommendations: string[];
  retentionScore: number;
}

export interface EventPreferences {
  customerId: string;
  preferredCategories: { category: string; preference: number }[];
  preferredLocations: { location: string; frequency: number }[];
  preferredTimeSlots: { timeSlot: string; preference: number }[];
  pricePreferences: {
    sensitivityLevel: 'Low' | 'Medium' | 'High';
    preferredRange: { min: number; max: number };
    promoCodeUsage: number;
  };
  socialPreferences: {
    groupSize: 'Solo' | 'Couple' | 'Small Group' | 'Large Group';
    networkingInterest: number; // 1-10 scale
  };
}

export interface PurchasePattern {
  customerId: string;
  seasonality: {
    peakMonths: string[];
    lowMonths: string[];
    weekdayPreference: string[];
  };
  spendingHabits: {
    impulseBuyer: boolean;
    plannerBuyer: boolean;
    averageAdvanceBooking: number; // days
    bulkPurchaseFrequency: number;
  };
  paymentBehavior: {
    preferredMethods: string[];
    promoCodeUsage: number;
    earlyBirdDiscount: boolean;
  };
}

export interface CustomerFeedback {
  customerId: string;
  sentiment: {
    overall: 'Positive' | 'Neutral' | 'Negative';
    score: number; // -1 to 1
    trends: { month: string; score: number }[];
  };
  reviewData: {
    averageRating: number;
    totalReviews: number;
    topKeywords: string[];
    improvementAreas: string[];
    strengths: string[];
  };
  communicationPreference: {
    frequency: 'High' | 'Medium' | 'Low';
    channels: string[];
    responsiveness: number; // 1-10 scale
  };
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    demographics?: Partial<CustomerDemographics>;
    behavior?: Partial<BehavioralData>;
    clv?: { min: number; max: number };
    churnRisk?: ChurnAnalysis['churnRisk'][];
    preferences?: Partial<EventPreferences>;
  };
  customerCount: number;
  averageValue: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface SegmentationAnalytics {
  totalCustomers: number;
  totalSegments: number;
  topSegments: {
    segment: CustomerSegment;
    revenue: number;
    growth: number;
  }[];
  demographics: {
    ageDistribution: { ageGroup: string; count: number; percentage: number }[];
    locationDistribution: { location: string; count: number; percentage: number }[];
    incomeDistribution: { income: string; count: number; percentage: number }[];
  };
  behavior: {
    engagementLevels: { level: string; count: number; percentage: number }[];
    purchaseFrequency: { frequency: string; count: number; percentage: number }[];
    retentionRates: { segment: string; rate: number }[];
  };
  insights: {
    growingSegments: string[];
    decliningSegments: string[];
    highValueOpportunities: string[];
    retentionConcerns: string[];
  };
}

export interface PersonalizationRecommendation {
  customerId: string;
  recommendedEvents: {
    eventId: string;
    eventTitle: string;
    relevanceScore: number;
    reasons: string[];
  }[];
  marketingMessages: {
    channel: string;
    message: string;
    personalizedElements: string[];
  }[];
  pricingStrategy: {
    recommendedDiscount: number;
    promoCodeSuggestion: string;
    bundleOpportunities: string[];
  };
  engagementStrategy: {
    bestContactTime: string;
    preferredChannels: string[];
    contentTypes: string[];
  };
}

// Customer Analytics Service Implementation
class CustomerAnalyticsService {
  // Mock data for demonstration
  private generateMockCustomerData(): CustomerDemographics[] {
    const interests = ['Dance', 'Fitness', 'Wellness', 'Professional Development', 'Networking', 'Arts', 'Music', 'Technology'];
    const cities = ['San Francisco', 'Los Angeles', 'New York', 'Chicago', 'Austin', 'Seattle', 'Miami', 'Boston'];
    
    return Array.from({ length: 100 }, (_, i) => ({
      customerId: `customer_${i + 1}`,
      age: Math.floor(Math.random() * 50) + 20,
      ageGroup: this.getAgeGroup(Math.floor(Math.random() * 50) + 20),
      location: {
        city: cities[Math.floor(Math.random() * cities.length)],
        state: 'CA',
        country: 'USA',
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        coordinates: { lat: Math.random() * 10 + 35, lng: -(Math.random() * 10 + 115) }
      },
      incomeLevel: ['Low', 'Medium', 'High', 'Premium'][Math.floor(Math.random() * 4)] as any,
      interests: interests.slice(0, Math.floor(Math.random() * 4) + 2),
      occupation: ['Engineer', 'Teacher', 'Artist', 'Manager', 'Consultant'][Math.floor(Math.random() * 5)],
      education: ['Bachelor', 'Master', 'PhD', 'High School'][Math.floor(Math.random() * 4)],
      gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)],
      registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  private getAgeGroup(age: number): CustomerDemographics['ageGroup'] {
    if (age < 25) return 'Under 25';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  }

  private generateBehavioralData(customerId: string): BehavioralData {
    return {
      customerId,
      purchaseHistory: {
        totalEvents: Math.floor(Math.random() * 20) + 1,
        totalSpent: Math.floor(Math.random() * 2000) + 100,
        averageOrderValue: Math.floor(Math.random() * 200) + 50,
        firstPurchase: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000).toISOString(),
        lastPurchase: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        favoriteEventTypes: ['Dance', 'Fitness', 'Wellness'].slice(0, Math.floor(Math.random() * 3) + 1),
        preferredPriceRange: { min: 25, max: 150 }
      },
      attendancePatterns: {
        eventsAttended: Math.floor(Math.random() * 15) + 1,
        noShowRate: Math.random() * 0.2,
        checkInSpeed: ['Early', 'On Time', 'Late'][Math.floor(Math.random() * 3)] as any,
        avgTimeBetweenEvents: Math.floor(Math.random() * 60) + 7
      },
      engagementLevel: {
        emailOpenRate: Math.random() * 0.8 + 0.1,
        clickThroughRate: Math.random() * 0.3 + 0.05,
        socialMediaInteractions: Math.floor(Math.random() * 50),
        reviewsSubmitted: Math.floor(Math.random() * 10),
        referralsMade: Math.floor(Math.random() * 5)
      }
    };
  }

  private calculateCLV(customerId: string, behavioral: BehavioralData): CustomerLifetimeValue {
    const monthsActive = Math.floor(Math.random() * 24) + 3;
    const totalLifetimeValue = behavioral.purchaseHistory.totalSpent;
    const purchaseFrequency = behavioral.purchaseHistory.totalEvents / (monthsActive / 12);
    
    return {
      customerId,
      totalLifetimeValue,
      predictedLifetimeValue: totalLifetimeValue * 1.5,
      averageOrderValue: behavioral.purchaseHistory.averageOrderValue,
      purchaseFrequency,
      retentionRate: Math.random() * 0.4 + 0.6,
      churnProbability: Math.random() * 0.3,
      valueSegment: this.getValueSegment(totalLifetimeValue),
      monthsActive,
      lastActivity: behavioral.purchaseHistory.lastPurchase
    };
  }

  private getValueSegment(clv: number): CustomerLifetimeValue['valueSegment'] {
    if (clv > 1500) return 'High Value';
    if (clv > 800) return 'Medium Value';
    if (clv > 300) return 'Low Value';
    return 'At Risk';
  }

  private analyzeChurn(customerId: string, clv: CustomerLifetimeValue, behavioral: BehavioralData): ChurnAnalysis {
    const daysSinceLastActivity = Math.floor((Date.now() - new Date(clv.lastActivity).getTime()) / (24 * 60 * 60 * 1000));
    const churnProbability = Math.min(daysSinceLastActivity / 90, 0.9);
    
    return {
      customerId,
      churnRisk: this.getChurnRisk(churnProbability),
      churnProbability,
      daysSinceLastActivity,
      factors: {
        decreasedEngagement: behavioral.engagementLevel.emailOpenRate < 0.3,
        priceIncreaseReaction: Math.random() > 0.7,
        competitorActivity: Math.random() > 0.8,
        serviceIssues: Math.random() > 0.9,
        lifecycleStage: 'Active'
      },
      recommendations: this.getRetentionRecommendations(churnProbability),
      retentionScore: Math.floor((1 - churnProbability) * 100)
    };
  }

  private getChurnRisk(probability: number): ChurnAnalysis['churnRisk'] {
    if (probability > 0.7) return 'Critical';
    if (probability > 0.5) return 'High';
    if (probability > 0.3) return 'Medium';
    return 'Low';
  }

  private getRetentionRecommendations(churnProbability: number): string[] {
    if (churnProbability > 0.7) {
      return [
        'Immediate personal outreach',
        'Exclusive discount offer',
        'VIP event invitation',
        'Feedback survey'
      ];
    }
    if (churnProbability > 0.5) {
      return [
        'Targeted email campaign',
        'Loyalty program invitation',
        'Personalized event recommendations'
      ];
    }
    return [
      'Regular engagement',
      'Event reminders',
      'Community building'
    ];
  }

  // Public API methods
  async getCustomerDemographics(eventId: string): Promise<CustomerDemographics[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.generateMockCustomerData();
  }

  async getBehavioralSegmentation(eventId: string): Promise<BehavioralData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const demographics = await this.getCustomerDemographics(eventId);
    return demographics.map(customer => this.generateBehavioralData(customer.customerId));
  }

  async getCustomerLifetimeValues(eventId: string): Promise<CustomerLifetimeValue[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const behavioral = await this.getBehavioralSegmentation(eventId);
    return behavioral.map(data => this.calculateCLV(data.customerId, data));
  }

  async getChurnAnalysis(eventId: string): Promise<ChurnAnalysis[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const clvData = await this.getCustomerLifetimeValues(eventId);
    const behavioral = await this.getBehavioralSegmentation(eventId);
    
    return clvData.map(clv => {
      const behavioralData = behavioral.find(b => b.customerId === clv.customerId)!;
      return this.analyzeChurn(clv.customerId, clv, behavioralData);
    });
  }

  async getEventPreferences(eventId: string): Promise<EventPreferences[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const demographics = await this.getCustomerDemographics(eventId);
    
    return demographics.map(customer => ({
      customerId: customer.customerId,
      preferredCategories: customer.interests.map(interest => ({
        category: interest,
        preference: Math.random() * 0.4 + 0.6
      })),
      preferredLocations: [
        { location: customer.location.city, frequency: Math.floor(Math.random() * 10) + 5 }
      ],
      preferredTimeSlots: [
        { timeSlot: 'Evening', preference: Math.random() * 0.4 + 0.6 },
        { timeSlot: 'Weekend', preference: Math.random() * 0.4 + 0.6 }
      ],
      pricePreferences: {
        sensitivityLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as any,
        preferredRange: { min: 25, max: 150 },
        promoCodeUsage: Math.floor(Math.random() * 5)
      },
      socialPreferences: {
        groupSize: ['Solo', 'Couple', 'Small Group', 'Large Group'][Math.floor(Math.random() * 4)] as any,
        networkingInterest: Math.floor(Math.random() * 10) + 1
      }
    }));
  }

  async getPurchasePatterns(eventId: string): Promise<PurchasePattern[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const demographics = await this.getCustomerDemographics(eventId);
    
    return demographics.map(customer => ({
      customerId: customer.customerId,
      seasonality: {
        peakMonths: ['March', 'June', 'September'],
        lowMonths: ['January', 'February'],
        weekdayPreference: ['Friday', 'Saturday', 'Sunday']
      },
      spendingHabits: {
        impulseBuyer: Math.random() > 0.6,
        plannerBuyer: Math.random() > 0.4,
        averageAdvanceBooking: Math.floor(Math.random() * 30) + 7,
        bulkPurchaseFrequency: Math.floor(Math.random() * 3)
      },
      paymentBehavior: {
        preferredMethods: ['Credit Card', 'PayPal'].slice(0, Math.floor(Math.random() * 2) + 1),
        promoCodeUsage: Math.floor(Math.random() * 5),
        earlyBirdDiscount: Math.random() > 0.5
      }
    }));
  }

  async getCustomerFeedback(eventId: string): Promise<CustomerFeedback[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const demographics = await this.getCustomerDemographics(eventId);
    
    return demographics.map(customer => ({
      customerId: customer.customerId,
      sentiment: {
        overall: ['Positive', 'Neutral', 'Negative'][Math.floor(Math.random() * 3)] as any,
        score: Math.random() * 2 - 1,
        trends: Array.from({ length: 6 }, (_, i) => ({
          month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
          score: Math.random() * 2 - 1
        }))
      },
      reviewData: {
        averageRating: Math.random() * 2 + 3,
        totalReviews: Math.floor(Math.random() * 10) + 1,
        topKeywords: ['Great instructor', 'Good location', 'Fun atmosphere'],
        improvementAreas: ['Parking', 'Sound system'],
        strengths: ['Professional staff', 'Well organized']
      },
      communicationPreference: {
        frequency: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as any,
        channels: ['Email', 'SMS', 'Push'].slice(0, Math.floor(Math.random() * 3) + 1),
        responsiveness: Math.floor(Math.random() * 10) + 1
      }
    }));
  }

  async getCustomerSegments(eventId: string): Promise<CustomerSegment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockSegments: CustomerSegment[] = [
      {
        id: 'segment_1',
        name: 'High-Value Frequent Attendees',
        description: 'Customers with high lifetime value and frequent event attendance',
        criteria: {
          clv: { min: 1000, max: 5000 },
          churnRisk: ['Low', 'Medium']
        },
        customerCount: 25,
        averageValue: 1500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'segment_2',
        name: 'Young Professionals',
        description: 'Age 25-35, high income, frequent networking events',
        criteria: {
          demographics: {
            ageGroup: '25-34',
            incomeLevel: 'High'
          }
        },
        customerCount: 40,
        averageValue: 800,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'segment_3',
        name: 'At-Risk Customers',
        description: 'Customers with high churn probability needing retention efforts',
        criteria: {
          churnRisk: ['High', 'Critical']
        },
        customerCount: 15,
        averageValue: 400,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }
    ];
    
    return mockSegments;
  }

  async getSegmentationAnalytics(eventId: string): Promise<SegmentationAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const segments = await this.getCustomerSegments(eventId);
    
    return {
      totalCustomers: 100,
      totalSegments: segments.length,
      topSegments: segments.map(segment => ({
        segment,
        revenue: segment.averageValue * segment.customerCount,
        growth: Math.random() * 0.3 + 0.05
      })).sort((a, b) => b.revenue - a.revenue),
      demographics: {
        ageDistribution: [
          { ageGroup: 'Under 25', count: 15, percentage: 15 },
          { ageGroup: '25-34', count: 35, percentage: 35 },
          { ageGroup: '35-44', count: 25, percentage: 25 },
          { ageGroup: '45-54', count: 15, percentage: 15 },
          { ageGroup: '55-64', count: 8, percentage: 8 },
          { ageGroup: '65+', count: 2, percentage: 2 }
        ],
        locationDistribution: [
          { location: 'San Francisco', count: 30, percentage: 30 },
          { location: 'Los Angeles', count: 25, percentage: 25 },
          { location: 'New York', count: 20, percentage: 20 },
          { location: 'Chicago', count: 15, percentage: 15 },
          { location: 'Other', count: 10, percentage: 10 }
        ],
        incomeDistribution: [
          { income: 'Premium', count: 20, percentage: 20 },
          { income: 'High', count: 35, percentage: 35 },
          { income: 'Medium', count: 30, percentage: 30 },
          { income: 'Low', count: 15, percentage: 15 }
        ]
      },
      behavior: {
        engagementLevels: [
          { level: 'High', count: 30, percentage: 30 },
          { level: 'Medium', count: 50, percentage: 50 },
          { level: 'Low', count: 20, percentage: 20 }
        ],
        purchaseFrequency: [
          { frequency: 'Weekly', count: 10, percentage: 10 },
          { frequency: 'Monthly', count: 40, percentage: 40 },
          { frequency: 'Quarterly', count: 35, percentage: 35 },
          { frequency: 'Annually', count: 15, percentage: 15 }
        ],
        retentionRates: segments.map(segment => ({
          segment: segment.name,
          rate: Math.random() * 0.3 + 0.7
        }))
      },
      insights: {
        growingSegments: ['Young Professionals', 'High-Value Frequent Attendees'],
        decliningSegments: ['At-Risk Customers'],
        highValueOpportunities: ['Premium Income Segment', 'Frequent Attendees'],
        retentionConcerns: ['At-Risk Customers', 'Low Engagement Group']
      }
    };
  }

  async getPersonalizationRecommendations(customerId: string): Promise<PersonalizationRecommendation> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      customerId,
      recommendedEvents: [
        {
          eventId: 'event_1',
          eventTitle: 'Advanced Salsa Workshop',
          relevanceScore: 0.92,
          reasons: ['Matches dance interest', 'Preferred skill level', 'Favorite instructor']
        },
        {
          eventId: 'event_2',
          eventTitle: 'Professional Networking Mixer',
          relevanceScore: 0.87,
          reasons: ['Age group match', 'Professional development interest', 'Location preference']
        }
      ],
      marketingMessages: [
        {
          channel: 'Email',
          message: 'Based on your love for dance, we think you\'ll enjoy our upcoming Salsa workshop!',
          personalizedElements: ['Interest-based targeting', 'Event recommendation']
        },
        {
          channel: 'SMS',
          message: 'Hey Sarah! Quick reminder about the networking event you favorited 🎉',
          personalizedElements: ['Name personalization', 'Behavior-based targeting']
        }
      ],
      pricingStrategy: {
        recommendedDiscount: 15,
        promoCodeSuggestion: 'LOYAL15',
        bundleOpportunities: ['Dance & Fitness Package', 'Monthly Unlimited Pass']
      },
      engagementStrategy: {
        bestContactTime: 'Tuesday evenings',
        preferredChannels: ['Email', 'SMS'],
        contentTypes: ['Event previews', 'Instructor spotlights', 'Community highlights']
      }
    };
  }

  async createCustomSegment(
    eventId: string,
    name: string,
    description: string,
    criteria: CustomerSegment['criteria']
  ): Promise<CustomerSegment> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: `segment_${Date.now()}`,
      name,
      description,
      criteria,
      customerCount: Math.floor(Math.random() * 50) + 10,
      averageValue: Math.floor(Math.random() * 1000) + 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
  }

  async exportSegment(segmentId: string, format: 'csv' | 'excel' | 'json'): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate export URL
    return `https://api.stepperslife.com/exports/segment_${segmentId}.${format}`;
  }

  async updateSegment(segmentId: string, updates: Partial<CustomerSegment>): Promise<CustomerSegment> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock updated segment
    return {
      id: segmentId,
      name: updates.name || 'Updated Segment',
      description: updates.description || 'Updated description',
      criteria: updates.criteria || {},
      customerCount: Math.floor(Math.random() * 50) + 10,
      averageValue: Math.floor(Math.random() * 1000) + 200,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: updates.isActive ?? true
    };
  }

  async deleteSegment(segmentId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock deletion
  }
}

export const customerAnalyticsService = new CustomerAnalyticsService(); 