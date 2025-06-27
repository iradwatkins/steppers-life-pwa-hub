/**
 * Advertising Service - Epic O.001: Advertising System
 * 
 * Comprehensive advertising management system supporting both Google AdSense
 * integration and direct user ad placements with approval workflows and analytics.
 */

import { apiClient } from './apiClient';

export interface AdZone {
  id: string;
  name: string;
  description: string;
  placement_location: string;
  dimensions: {
    width: number;
    height: number;
  };
  pricing_tier: 'standard' | 'premium' | 'random';
  base_price: number;
  currency: string;
  supported_file_types: string[];
  max_file_size_mb: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectAd {
  id: string;
  advertiser_id: string;
  advertiser_name: string;
  advertiser_email: string;
  zone_id: string;
  zone_name: string;
  title: string;
  description?: string;
  creative_url: string;
  click_through_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'running' | 'paused' | 'completed' | 'expired';
  rejection_reason?: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  total_price: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  payment_transaction_id?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface AdPlacementRequest {
  zone_id: string;
  title: string;
  description?: string;
  click_through_url: string;
  duration_days: number;
  creative_file?: File;
}

export interface AdSenseConfig {
  id: string;
  publisher_id: string;
  is_enabled: boolean;
  ad_units: AdSenseAdUnit[];
  placement_rules: AdSensePlacementRule[];
  created_at: string;
  updated_at: string;
}

export interface AdSenseAdUnit {
  id: string;
  ad_unit_id: string;
  name: string;
  size: string;
  format: 'display' | 'in_feed' | 'in_article' | 'matched_content';
  is_active: boolean;
}

export interface AdSensePlacementRule {
  id: string;
  location: string;
  frequency: number;
  priority: number;
  is_active: boolean;
}

export interface AdPerformanceMetrics {
  ad_id: string;
  period: 'daily' | 'weekly' | 'monthly';
  date_range: {
    start_date: string;
    end_date: string;
  };
  impressions: number;
  clicks: number;
  ctr: number;
  revenue?: number;
  daily_breakdown: {
    date: string;
    impressions: number;
    clicks: number;
    revenue?: number;
  }[];
}

export interface AdSystemSettings {
  id: string;
  max_ads_per_page: number;
  in_feed_frequency: number;
  adsense_enabled: boolean;
  direct_ads_enabled: boolean;
  excluded_pages: string[];
  quality_guidelines: string;
  auto_approve_trusted_advertisers: boolean;
  created_at: string;
  updated_at: string;
}

export interface RevenueReport {
  period: {
    start_date: string;
    end_date: string;
  };
  direct_ads: {
    total_revenue: number;
    total_ads: number;
    active_ads: number;
    pending_ads: number;
  };
  adsense: {
    estimated_revenue: number;
    impressions: number;
    clicks: number;
    ctr: number;
  };
  top_performing_ads: {
    ad_id: string;
    title: string;
    impressions: number;
    clicks: number;
    revenue: number;
  }[];
  revenue_by_zone: {
    zone_id: string;
    zone_name: string;
    revenue: number;
    ad_count: number;
  }[];
}

class AdvertisingService {
  private baseUrl = '/api/v1/advertising';

  // Ad Zone Management
  async getAdZones(): Promise<AdZone[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/zones`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ad zones:', error);
      return this.getMockAdZones();
    }
  }

  async createAdZone(zoneData: Omit<AdZone, 'id' | 'created_at' | 'updated_at'>): Promise<AdZone> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/zones`, zoneData);
      return response.data;
    } catch (error) {
      console.error('Error creating ad zone:', error);
      throw new Error('Failed to create ad zone');
    }
  }

  async updateAdZone(id: string, zoneData: Partial<AdZone>): Promise<AdZone> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/zones/${id}`, zoneData);
      return response.data;
    } catch (error) {
      console.error('Error updating ad zone:', error);
      throw new Error('Failed to update ad zone');
    }
  }

  async deleteAdZone(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/zones/${id}`);
    } catch (error) {
      console.error('Error deleting ad zone:', error);
      throw new Error('Failed to delete ad zone');
    }
  }

  // Direct Ad Management
  async getDirectAds(filters?: {
    status?: string;
    zone_id?: string;
    advertiser_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ ads: DirectAd[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`${this.baseUrl}/direct-ads?${params}`);
      return response.data || { ads: [], total: 0 };
    } catch (error) {
      console.error('Error fetching direct ads:', error);
      return { ads: this.getMockDirectAds(), total: this.getMockDirectAds().length };
    }
  }

  async getUserAds(userId: string): Promise<DirectAd[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/direct-ads/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user ads:', error);
      return this.getMockDirectAds().filter(ad => ad.advertiser_id === userId);
    }
  }

  async submitAdPlacement(placementData: AdPlacementRequest): Promise<DirectAd> {
    try {
      const formData = new FormData();
      formData.append('zone_id', placementData.zone_id);
      formData.append('title', placementData.title);
      formData.append('click_through_url', placementData.click_through_url);
      formData.append('duration_days', placementData.duration_days.toString());
      
      if (placementData.description) {
        formData.append('description', placementData.description);
      }
      
      if (placementData.creative_file) {
        formData.append('creative', placementData.creative_file);
      }

      const response = await apiClient.post(`${this.baseUrl}/direct-ads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting ad placement:', error);
      throw new Error('Failed to submit ad placement');
    }
  }

  async approveAd(adId: string, approvedBy: string): Promise<DirectAd> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/direct-ads/${adId}/approve`, {
        approved_by: approvedBy
      });
      return response.data;
    } catch (error) {
      console.error('Error approving ad:', error);
      throw new Error('Failed to approve ad');
    }
  }

  async rejectAd(adId: string, reason: string, rejectedBy: string): Promise<DirectAd> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/direct-ads/${adId}/reject`, {
        rejection_reason: reason,
        rejected_by: rejectedBy
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting ad:', error);
      throw new Error('Failed to reject ad');
    }
  }

  async pauseAd(adId: string): Promise<DirectAd> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/direct-ads/${adId}/pause`);
      return response.data;
    } catch (error) {
      console.error('Error pausing ad:', error);
      throw new Error('Failed to pause ad');
    }
  }

  async resumeAd(adId: string): Promise<DirectAd> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/direct-ads/${adId}/resume`);
      return response.data;
    } catch (error) {
      console.error('Error resuming ad:', error);
      throw new Error('Failed to resume ad');
    }
  }

  // AdSense Management
  async getAdSenseConfig(): Promise<AdSenseConfig> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/adsense/config`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AdSense config:', error);
      return this.getMockAdSenseConfig();
    }
  }

  async updateAdSenseConfig(config: Partial<AdSenseConfig>): Promise<AdSenseConfig> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/adsense/config`, config);
      return response.data;
    } catch (error) {
      console.error('Error updating AdSense config:', error);
      throw new Error('Failed to update AdSense configuration');
    }
  }

  async enableAdSense(): Promise<AdSenseConfig> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/adsense/enable`);
      return response.data;
    } catch (error) {
      console.error('Error enabling AdSense:', error);
      throw new Error('Failed to enable AdSense');
    }
  }

  async disableAdSense(): Promise<AdSenseConfig> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/adsense/disable`);
      return response.data;
    } catch (error) {
      console.error('Error disabling AdSense:', error);
      throw new Error('Failed to disable AdSense');
    }
  }

  // Performance Analytics
  async getAdPerformance(adId: string, period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<AdPerformanceMetrics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/analytics/performance/${adId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ad performance:', error);
      return this.getMockAdPerformance(adId, period);
    }
  }

  async trackAdImpression(adId: string, metadata?: {
    user_id?: string;
    page_url?: string;
    user_agent?: string;
    ip_address?: string;
  }): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/analytics/impression`, {
        ad_id: adId,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking ad impression:', error);
      // Don't throw error for analytics tracking
    }
  }

  async trackAdClick(adId: string, metadata?: {
    user_id?: string;
    page_url?: string;
    user_agent?: string;
    ip_address?: string;
  }): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/analytics/click`, {
        ad_id: adId,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking ad click:', error);
      // Don't throw error for analytics tracking
    }
  }

  // Revenue Reporting
  async getRevenueReport(dateRange: {
    start_date: string;
    end_date: string;
  }): Promise<RevenueReport> {
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });
      
      const response = await apiClient.get(`${this.baseUrl}/reports/revenue?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      return this.getMockRevenueReport(dateRange);
    }
  }

  // System Settings
  async getSystemSettings(): Promise<AdSystemSettings> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return this.getMockSystemSettings();
    }
  }

  async updateSystemSettings(settings: Partial<AdSystemSettings>): Promise<AdSystemSettings> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw new Error('Failed to update system settings');
    }
  }

  // Utility Methods
  calculateAdPrice(zone: AdZone, durationDays: number): number {
    let basePrice = zone.base_price;
    
    // Apply tier multipliers
    switch (zone.pricing_tier) {
      case 'premium':
        basePrice *= 2.5;
        break;
      case 'random':
        basePrice *= 0.5;
        break;
      default:
        break;
    }
    
    // Apply duration discounts
    let discount = 1;
    if (durationDays >= 30) {
      discount = 0.85; // 15% discount for 30+ days
    } else if (durationDays >= 14) {
      discount = 0.9; // 10% discount for 14+ days
    } else if (durationDays >= 7) {
      discount = 0.95; // 5% discount for 7+ days
    }
    
    return Math.round(basePrice * durationDays * discount * 100) / 100;
  }

  validateCreativeFile(file: File, zone: AdZone): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file type
    if (!zone.supported_file_types.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported. Supported types: ${zone.supported_file_types.join(', ')}`);
    }
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > zone.max_file_size_mb) {
      errors.push(`File size ${fileSizeMB.toFixed(2)}MB exceeds maximum ${zone.max_file_size_mb}MB`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Mock data for development
  private getMockAdZones(): AdZone[] {
    return [
      {
        id: '1',
        name: 'Homepage Top Banner',
        description: 'Premium banner position at the top of the homepage',
        placement_location: 'Homepage Header',
        dimensions: { width: 728, height: 90 },
        pricing_tier: 'premium',
        base_price: 25.00,
        currency: 'USD',
        supported_file_types: ['image/jpeg', 'image/png', 'image/gif'],
        max_file_size_mb: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Event Listing Sidebar',
        description: 'Sidebar ad space on event listing pages',
        placement_location: 'Event Listings Sidebar',
        dimensions: { width: 300, height: 250 },
        pricing_tier: 'standard',
        base_price: 15.00,
        currency: 'USD',
        supported_file_types: ['image/jpeg', 'image/png'],
        max_file_size_mb: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Random Placement',
        description: 'Ads placed randomly throughout the site',
        placement_location: 'Various Locations',
        dimensions: { width: 300, height: 250 },
        pricing_tier: 'random',
        base_price: 8.00,
        currency: 'USD',
        supported_file_types: ['image/jpeg', 'image/png'],
        max_file_size_mb: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private getMockDirectAds(): DirectAd[] {
    return [
      {
        id: '1',
        advertiser_id: 'user123',
        advertiser_name: 'Chicago Dance Studio',
        advertiser_email: 'info@chicagodance.com',
        zone_id: '1',
        zone_name: 'Homepage Top Banner',
        title: 'Chicago Dance Studio - Learn Stepping',
        description: 'Professional stepping classes for all levels',
        creative_url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=728&h=90&fit=crop',
        click_through_url: 'https://chicagodance.com',
        status: 'running',
        start_date: '2024-01-15T00:00:00Z',
        end_date: '2024-02-15T00:00:00Z',
        duration_days: 31,
        total_price: 1937.50,
        currency: 'USD',
        payment_status: 'paid',
        payment_method: 'credit_card',
        payment_transaction_id: 'txn_abc123',
        impressions: 12547,
        clicks: 324,
        ctr: 2.58,
        created_at: '2024-01-10T14:30:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        approved_at: '2024-01-12T09:15:00Z',
        approved_by: 'admin'
      },
      {
        id: '2',
        advertiser_id: 'user456',
        advertiser_name: 'Stepping Shoes Plus',
        advertiser_email: 'sales@steppingshoes.com',
        zone_id: '2',
        zone_name: 'Event Listing Sidebar',
        title: 'Premium Stepping Shoes',
        description: 'High-quality shoes for professional dancers',
        creative_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=250&fit=crop',
        click_through_url: 'https://steppingshoes.com',
        status: 'pending',
        start_date: '2024-02-01T00:00:00Z',
        end_date: '2024-02-14T00:00:00Z',
        duration_days: 14,
        total_price: 189.00,
        currency: 'USD',
        payment_status: 'paid',
        payment_method: 'paypal',
        payment_transaction_id: 'pp_def456',
        impressions: 0,
        clicks: 0,
        ctr: 0,
        created_at: '2024-01-20T16:45:00Z',
        updated_at: '2024-01-20T16:45:00Z'
      }
    ];
  }

  private getMockAdSenseConfig(): AdSenseConfig {
    return {
      id: '1',
      publisher_id: 'pub-1234567890123456',
      is_enabled: true,
      ad_units: [
        {
          id: '1',
          ad_unit_id: 'ca-pub-1234567890123456/1234567890',
          name: 'Homepage Display',
          size: '728x90',
          format: 'display',
          is_active: true
        },
        {
          id: '2',
          ad_unit_id: 'ca-pub-1234567890123456/9876543210',
          name: 'Sidebar Medium Rectangle',
          size: '300x250',
          format: 'display',
          is_active: true
        }
      ],
      placement_rules: [
        {
          id: '1',
          location: 'event_feed',
          frequency: 5,
          priority: 1,
          is_active: true
        },
        {
          id: '2',
          location: 'blog_posts',
          frequency: 3,
          priority: 2,
          is_active: true
        }
      ],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    };
  }

  private getMockAdPerformance(adId: string, period: string): AdPerformanceMetrics {
    return {
      ad_id: adId,
      period: period as any,
      date_range: {
        start_date: '2024-01-15T00:00:00Z',
        end_date: '2024-01-22T00:00:00Z'
      },
      impressions: 12547,
      clicks: 324,
      ctr: 2.58,
      revenue: 25.00,
      daily_breakdown: [
        { date: '2024-01-15', impressions: 1890, clicks: 52, revenue: 3.75 },
        { date: '2024-01-16', impressions: 2105, clicks: 61, revenue: 4.20 },
        { date: '2024-01-17', impressions: 1756, clicks: 38, revenue: 2.85 },
        { date: '2024-01-18', impressions: 1923, clicks: 55, revenue: 4.10 },
        { date: '2024-01-19', impressions: 2234, clicks: 67, revenue: 5.25 },
        { date: '2024-01-20', impressions: 1889, clicks: 42, revenue: 3.15 },
        { date: '2024-01-21', impressions: 1750, clicks: 39, revenue: 2.70 }
      ]
    };
  }

  private getMockRevenueReport(dateRange: any): RevenueReport {
    return {
      period: dateRange,
      direct_ads: {
        total_revenue: 2126.50,
        total_ads: 8,
        active_ads: 3,
        pending_ads: 2
      },
      adsense: {
        estimated_revenue: 487.32,
        impressions: 45678,
        clicks: 892,
        ctr: 1.95
      },
      top_performing_ads: [
        {
          ad_id: '1',
          title: 'Chicago Dance Studio - Learn Stepping',
          impressions: 12547,
          clicks: 324,
          revenue: 1937.50
        },
        {
          ad_id: '2',
          title: 'Premium Stepping Shoes',
          impressions: 5643,
          clicks: 127,
          revenue: 189.00
        }
      ],
      revenue_by_zone: [
        {
          zone_id: '1',
          zone_name: 'Homepage Top Banner',
          revenue: 1937.50,
          ad_count: 1
        },
        {
          zone_id: '2',
          zone_name: 'Event Listing Sidebar',
          revenue: 189.00,
          ad_count: 1
        }
      ]
    };
  }

  private getMockSystemSettings(): AdSystemSettings {
    return {
      id: '1',
      max_ads_per_page: 3,
      in_feed_frequency: 5,
      adsense_enabled: true,
      direct_ads_enabled: true,
      excluded_pages: [
        '/login',
        '/register',
        '/checkout/*',
        '/profile/edit',
        '/terms',
        '/privacy'
      ],
      quality_guidelines: 'Ads must be family-friendly and relevant to our community.',
      auto_approve_trusted_advertisers: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    };
  }
}

export const advertisingService = new AdvertisingService();