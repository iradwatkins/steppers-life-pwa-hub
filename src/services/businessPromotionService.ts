/**
 * Business Promotion Service - Simplified
 * 
 * Comprehensive business promotion management 
 * Handles community promotion, social media integration, and business visibility features
 */

import { supabase } from '@/integrations/supabase/client';
import { apiClient } from './apiClient';

export interface BusinessPromotion {
  id: string;
  business_id: string;
  business_type: 'store' | 'service';
  business_name: string;
  promotion_type: 'featured' | 'community_post' | 'social_media' | 'newsletter' | 'event_sponsorship';
  title: string;
  description: string;
  target_audience: string[];
  budget_range: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    engagement_rate: number;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CommunityPost {
  id: string;
  business_id: string;
  business_type: 'store' | 'service';
  business_name: string;
  content: string;
  images: string[];
  call_to_action: {
    type: 'visit_store' | 'contact_business' | 'book_service' | 'learn_more';
    text: string;
    url?: string;
  };
  boost_level: 'none' | 'community' | 'featured' | 'sponsored';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  status: 'draft' | 'pending' | 'published' | 'archived';
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PromotionCampaign {
  id: string;
  business_id: string;
  business_type: 'store' | 'service';
  business_name: string;
  campaign_name: string;
  campaign_type: 'awareness' | 'traffic' | 'conversions' | 'engagement';
  channels: ('community' | 'social_media' | 'newsletter' | 'events')[];
  target_demographics: {
    age_range: string;
    interests: string[];
    location_radius: number;
  };
  content: {
    headline: string;
    description: string;
    images: string[];
    call_to_action: string;
  };
  budget: {
    total_budget: number;
    daily_budget: number;
    cost_per_click?: number;
  };
  schedule: {
    start_date: string;
    end_date: string;
    optimal_times: string[];
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost_per_conversion: number;
    roi: number;
  };
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
  created_by: string;
}

class BusinessPromotionService {
  private baseUrl = '/api/v1/business-promotion';

  /**
   * Create a new business promotion
   */
  async createPromotion(promotionData: Omit<BusinessPromotion, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'metrics'>): Promise<BusinessPromotion> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to create business promotion');
      }

      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Business promotion requires organizer role or higher');
      }

      console.log('Business promotion authorized for user:', user.id);

      const response = await apiClient.post(this.baseUrl, {
        ...promotionData,
        created_by: user.id,
        metrics: { impressions: 0, clicks: 0, conversions: 0, engagement_rate: 0 }
      });

      console.log('Business promotion created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating business promotion:', error);
      throw error;
    }
  }

  /**
   * Create a community post for business promotion
   */
  async createCommunityPost(postData: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'engagement'>): Promise<CommunityPost> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to create community post');
      }

      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Community post creation requires organizer role or higher');
      }

      const response = await apiClient.post(`${this.baseUrl}/community-posts`, {
        ...postData,
        created_by: user.id,
        status: postData.boost_level !== 'none' ? 'pending' : 'published',
        engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
        published_at: postData.boost_level === 'none' ? new Date().toISOString() : undefined
      });

      console.log('Community post created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating community post:', error);
      throw error;
    }
  }

  /**
   * Create a promotion campaign
   */
  async createPromotionCampaign(campaignData: Omit<PromotionCampaign, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'performance'>): Promise<PromotionCampaign> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to create promotion campaign');
      }

      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Promotion campaign creation requires organizer role or higher');
      }

      const response = await apiClient.post(`${this.baseUrl}/campaigns`, {
        ...campaignData,
        created_by: user.id,
        performance: { impressions: 0, clicks: 0, conversions: 0, cost_per_conversion: 0, roi: 0 }
      });

      console.log('Promotion campaign created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating promotion campaign:', error);
      throw error;
    }
  }

  // Add other methods as needed...
}

export const businessPromotionService = new BusinessPromotionService();
export default businessPromotionService;