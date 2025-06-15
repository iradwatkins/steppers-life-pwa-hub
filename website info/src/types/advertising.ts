export interface AdZone {
  id: string;
  name: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
  };
  placement: AdPlacement;
  pricing: AdPricing;
  isActive: boolean;
  supportedFormats: string[];
  maxFileSize: number; // in MB
  isRandomPlacement: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdPricing {
  basePricePerDay: number;
  isPremium: boolean;
  weeklyDiscount?: number; // percentage
  monthlyDiscount?: number; // percentage
  volumeDiscounts?: {
    minDays: number;
    discountPercent: number;
  }[];
}

export interface DirectUserAd {
  id: string;
  advertiserId: string;
  advertiserInfo: {
    name: string;
    email: string;
    userType: 'organizer' | 'instructor' | 'business' | 'service';
  };
  adZoneId: string;
  title: string;
  description?: string;
  creativeUrl: string;
  clickThroughUrl: string;
  status: AdStatus;
  schedule: AdSchedule;
  pricing: {
    totalCost: number;
    pricePerDay: number;
    discountApplied?: number;
  };
  performance?: AdPerformance;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  adminNotes?: string;
}

export interface AdSchedule {
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  isRecurring?: boolean;
  recurringPattern?: 'weekly' | 'monthly';
}

export interface AdPerformance {
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  totalRevenue: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  dailyStats: DailyAdStats[];
}

export interface DailyAdStats {
  date: Date;
  impressions: number;
  clicks: number;
  revenue: number;
}

export interface AdCampaign {
  id: string;
  advertiserId: string;
  name: string;
  description?: string;
  ads: string[]; // Array of ad IDs
  budget: number;
  spent: number;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  targetAudience?: AdTargeting;
  performance: AdPerformance;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdTargeting {
  demographics?: {
    ageRange?: [number, number];
    gender?: 'male' | 'female' | 'all';
    interests?: string[];
  };
  geographic?: {
    cities?: string[];
    states?: string[];
    radius?: number; // in miles
  };
  behavioral?: {
    eventTypes?: string[];
    previousAttendance?: boolean;
  };
}

export interface AdSenseConfig {
  publisherId: string;
  adUnitIds: {
    [key: string]: string; // zone id -> ad unit id mapping
  };
  isEnabled: boolean;
  fallbackEnabled: boolean;
  revenueShare: number; // percentage
  lastSyncAt?: Date;
}

export interface AdOrder {
  id: string;
  advertiserId: string;
  adZoneId: string;
  adDetails: Partial<DirectUserAd>;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paymentMethod?: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  completedAt?: Date;
}

export interface AdRevenueReport {
  totalRevenue: number;
  directAdsRevenue: number;
  adSenseRevenue: number;
  revenueByZone: {
    [zoneId: string]: number;
  };
  revenueByPeriod: {
    daily: DailyRevenue[];
    monthly: MonthlyRevenue[];
  };
  topPerformingAds: DirectUserAd[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface DailyRevenue {
  date: Date;
  directAds: number;
  adSense: number;
  total: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  directAds: number;
  adSense: number;
  total: number;
}

export interface AdDisplaySettings {
  globalAdEnabled: boolean;
  adSenseEnabled: boolean;
  directAdsEnabled: boolean;
  inFeedFrequency: number; // show ad after every N items
  maxAdsPerPage: number;
  excludedPages: string[];
  loadingStrategy: 'eager' | 'lazy';
  fallbackBehavior: 'hide' | 'placeholder' | 'adSense';
}

export interface AdModeration {
  id: string;
  adId: string;
  reportedBy?: string;
  reportReason: string;
  status: ModerationStatus;
  reviewNotes?: string;
  actionTaken?: ModerationAction;
  createdAt: Date;
  resolvedAt?: Date;
}

// Enums
export enum AdPlacement {
  HEADER_BANNER = 'header_banner',
  SIDEBAR_RIGHT = 'sidebar_right',
  SIDEBAR_LEFT = 'sidebar_left',
  IN_FEED = 'in_feed',
  FOOTER_BANNER = 'footer_banner',
  MODAL_OVERLAY = 'modal_overlay',
  BETWEEN_CONTENT = 'between_content',
  EVENT_DETAIL_TOP = 'event_detail_top',
  EVENT_DETAIL_BOTTOM = 'event_detail_bottom',
  BLOG_POST_TOP = 'blog_post_top',
  BLOG_POST_BOTTOM = 'blog_post_bottom',
  SEARCH_RESULTS = 'search_results'
}

export enum AdStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  UNDER_REVIEW = 'under_review'
}

export enum ModerationAction {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONTENT_WARNING = 'content_warning',
  SUSPENDED = 'suspended',
  REMOVED = 'removed'
}

export interface AdAnalytics {
  overview: {
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    totalRevenue: number;
    activeAds: number;
    pendingAds: number;
  };
  performance: {
    topPerformingAds: DirectUserAd[];
    topPerformingZones: AdZone[];
    revenueGrowth: number; // percentage
    impressionGrowth: number; // percentage
  };
  trends: {
    daily: DailyAdStats[];
    weekly: WeeklyAdStats[];
    monthly: MonthlyAdStats[];
  };
}

export interface WeeklyAdStats {
  week: string; // ISO week format
  impressions: number;
  clicks: number;
  revenue: number;
}

export interface MonthlyAdStats {
  month: string;
  year: number;
  impressions: number;
  clicks: number;
  revenue: number;
}

export interface AdFormData {
  title: string;
  description?: string;
  adZoneId: string;
  clickThroughUrl: string;
  schedule: {
    startDate: Date;
    duration: number;
  };
  creative?: File;
  targetAudience?: AdTargeting;
}

export interface AdZoneFormData {
  name: string;
  description: string;
  placement: AdPlacement;
  dimensions: {
    width: number;
    height: number;
  };
  basePricePerDay: number;
  isPremium: boolean;
  supportedFormats: string[];
  maxFileSize: number;
  isRandomPlacement: boolean;
} 