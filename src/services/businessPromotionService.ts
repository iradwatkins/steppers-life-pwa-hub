/**
 * BMAD METHOD: Business Promotion Service
 * 
 * Comprehensive business promotion management with epic-gated access controls
 * Handles community promotion, social media integration, and business visibility features
 */

import { supabase } from '@/integrations/supabase/client';
import { bMADValidationService } from './bMADValidationService';
import { apiClient } from './apiClient';

export interface BusinessPromotion {
  id: string;
  business_id: string;
  business_type: 'store' | 'service';
  business_name: string;
  promotion_type: 'featured' | 'community_post' | 'social_media' | 'newsletter' | 'event_sponsorship';
  title: string;
  description: string;
  promotion_content: {
    images?: string[];
    video_url?: string;
    call_to_action?: string;
    special_offer?: string;
    discount_code?: string;
  };
  target_audience: {
    demographics?: string[];
    interests?: string[];
    location_radius?: number;
    user_types?: string[];
  };
  promotion_schedule: {
    start_date: string;
    end_date: string;
    posting_times?: string[];
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  budget: {
    total_budget: number;
    daily_budget?: number;
    cost_per_action?: number;
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    engagement_rate: number;
    cost_per_click: number;
    roi: number;
  };
  status: 'draft' | 'pending' | 'approved' | 'running' | 'paused' | 'completed' | 'rejected';
  created_by: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
}

export interface CommunityPost {
  id: string;
  business_id: string;
  business_type: 'store' | 'service';
  business_name: string;
  post_type: 'announcement' | 'promotion' | 'event' | 'update' | 'showcase';
  content: {
    title: string;
    description: string;
    images?: string[];
    video_url?: string;
    call_to_action?: string;
    external_link?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  visibility: 'public' | 'community' | 'followers' | 'targeted';
  boost_level: 'none' | 'standard' | 'premium' | 'max';
  boost_budget?: number;
  status: 'draft' | 'pending' | 'published' | 'archived' | 'rejected';
  published_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PromotionCampaign {
  id: string;
  business_id: string;
  business_type: 'store' | 'service';
  campaign_name: string;
  campaign_type: 'awareness' | 'traffic' | 'leads' | 'sales' | 'engagement';
  objectives: string[];
  target_metrics: {
    target_impressions?: number;
    target_clicks?: number;
    target_conversions?: number;
    target_roi?: number;
  };
  content_strategy: {
    themes: string[];
    messaging: string[];
    visual_style: string;
    content_calendar: Array<{
      date: string;
      content_type: string;
      title: string;
      platform?: string;
    }>;
  };
  budget_allocation: {
    total_budget: number;
    platform_breakdown: {
      community_posts: number;
      featured_listings: number;
      social_media: number;
      email_newsletter: number;
      event_sponsorship: number;
    };
  };
  performance: {
    total_spent: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    average_cpc: number;
    roi: number;
  };
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PromotionRequest {
  business_id: string;
  business_type: 'store' | 'service';
  promotion_type: 'featured' | 'community_post' | 'social_media' | 'newsletter' | 'event_sponsorship';
  title: string;
  description: string;
  promotion_content: BusinessPromotion['promotion_content'];
  target_audience?: BusinessPromotion['target_audience'];
  promotion_schedule: BusinessPromotion['promotion_schedule'];
  budget: BusinessPromotion['budget'];
}

class BusinessPromotionService {
  private baseUrl = '/api/v1/business-promotion';

  /**
   * Create a new business promotion (BMAD METHOD: Epic-gated access)
   */
  async createPromotion(promotionData: PromotionRequest): Promise<BusinessPromotion> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to create business promotion');
      }

      // BMAD VALIDATION: Check business promotion permissions
      const validation = await bMADValidationService.validateFeatureAccess(
        user.id,
        'promote_business_in_community'
      );

      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ');
        console.error('BMAD: Business promotion creation denied:', errorMessage);
        
        const missingEpics = validation.missingEpics.join(', ');
        throw new Error(
          `Business promotion requires completing these BMAD epics: ${missingEpics}. ` +
          `Current status: ${errorMessage}`
        );
      }

      console.log('BMAD: Business promotion authorized for user:', user.id, 'Completed epics:', validation.completedEpics);

      const response = await apiClient.post(this.baseUrl, {
        ...promotionData,
        created_by: user.id,
        status: 'pending',
        bmad_validation: {
          validated_at: new Date().toISOString(),
          completed_epics: validation.completedEpics,
          user_status: validation.userStatus?.extendedStatuses
        }
      });

      console.log('BMAD: Business promotion created successfully:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating business promotion:', error);
      throw error;
    }
  }

  /**
   * Create a community post (BMAD METHOD: Epic-gated access)
   */
  async createCommunityPost(postData: {
    business_id: string;
    business_type: 'store' | 'service';
    post_type: CommunityPost['post_type'];
    content: CommunityPost['content'];
    visibility: CommunityPost['visibility'];
    boost_level?: CommunityPost['boost_level'];
    boost_budget?: number;
  }): Promise<CommunityPost> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to create community post');
      }

      // BMAD VALIDATION: Check business promotion permissions
      const validation = await bMADValidationService.validateFeatureAccess(
        user.id,
        'promote_business_in_community'
      );

      if (!validation.isValid) {
        throw new Error(
          `Community post denied: ${validation.errors.join(', ')}. ` +
          `Required epics: ${validation.missingEpics.join(', ')}`
        );
      }

      const response = await apiClient.post(`${this.baseUrl}/community-posts`, {
        ...postData,
        created_by: user.id,
        status: postData.boost_level !== 'none' ? 'pending' : 'published',
        engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
        published_at: postData.boost_level === 'none' ? new Date().toISOString() : undefined,
        bmad_validation: {
          validated_at: new Date().toISOString(),
          completed_epics: validation.completedEpics,
          user_status: validation.userStatus?.extendedStatuses
        }
      });

      console.log('BMAD: Community post created successfully:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating community post:', error);
      throw error;
    }
  }

  /**
   * Create a promotion campaign (BMAD METHOD: Advanced promotion validation)
   */
  async createPromotionCampaign(campaignData: {
    business_id: string;
    business_type: 'store' | 'service';
    campaign_name: string;
    campaign_type: PromotionCampaign['campaign_type'];
    objectives: string[];
    target_metrics: PromotionCampaign['target_metrics'];
    content_strategy: PromotionCampaign['content_strategy'];
    budget_allocation: PromotionCampaign['budget_allocation'];
  }): Promise<PromotionCampaign> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to create promotion campaign');
      }

      // BMAD VALIDATION: Check advanced business promotion permissions
      const validation = await bMADValidationService.validateFeatureAccess(
        user.id,
        'promote_business_in_community'
      );

      if (!validation.isValid) {
        throw new Error(
          `Promotion campaign denied: ${validation.errors.join(', ')}. ` +
          `Required epics: ${validation.missingEpics.join(', ')}`
        );
      }

      // Additional validation for large budget campaigns
      if (campaignData.budget_allocation.total_budget > 500) {
        const hasAdvancedStatus = validation.userStatus?.extendedStatuses.includes('verified_business');
        if (!hasAdvancedStatus) {
          throw new Error('Large budget campaigns require verified business status');
        }
      }

      const response = await apiClient.post(`${this.baseUrl}/campaigns`, {
        ...campaignData,
        created_by: user.id,
        status: 'planning',
        performance: {
          total_spent: 0,
          total_impressions: 0,
          total_clicks: 0,
          total_conversions: 0,
          average_cpc: 0,
          roi: 0
        },
        bmad_validation: {
          validated_at: new Date().toISOString(),
          completed_epics: validation.completedEpics,
          user_status: validation.userStatus?.extendedStatuses,
          budget_tier: campaignData.budget_allocation.total_budget > 500 ? 'premium' : 'standard'
        }
      });

      console.log('BMAD: Promotion campaign created successfully:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating promotion campaign:', error);
      throw error;
    }
  }

  /**
   * Get user's business promotions
   */
  async getUserPromotions(userId: string): Promise<BusinessPromotion[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user promotions:', error);
      return [];
    }
  }

  /**
   * Get business community posts
   */
  async getBusinessCommunityPosts(businessId: string, businessType: 'store' | 'service'): Promise<CommunityPost[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/community-posts?business_id=${businessId}&business_type=${businessType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business community posts:', error);
      return [];
    }
  }

  /**
   * Get promotion campaigns
   */
  async getPromotionCampaigns(businessId: string): Promise<PromotionCampaign[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/campaigns?business_id=${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotion campaigns:', error);
      return [];
    }
  }

  /**
   * Approve promotion (admin)
   */
  async approvePromotion(promotionId: string, approvedBy: string): Promise<BusinessPromotion> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${promotionId}/approve`, {
        approved_by: approvedBy
      });

      console.log('BMAD: Business promotion approved:', promotionId);

      return response.data;
    } catch (error) {
      console.error('Error approving promotion:', error);
      throw new Error('Failed to approve promotion');
    }
  }

  /**
   * Reject promotion (admin)
   */
  async rejectPromotion(promotionId: string, reason: string, rejectedBy: string): Promise<BusinessPromotion> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${promotionId}/reject`, {
        rejection_reason: reason,
        rejected_by: rejectedBy
      });

      console.log('BMAD: Business promotion rejected:', promotionId);

      return response.data;
    } catch (error) {
      console.error('Error rejecting promotion:', error);
      throw new Error('Failed to reject promotion');
    }
  }

  /**
   * Get promotion analytics
   */
  async getPromotionAnalytics(promotionId: string): Promise<{
    performance: BusinessPromotion['metrics'];
    audience_breakdown: {
      demographics: Record<string, number>;
      locations: Record<string, number>;
      devices: Record<string, number>;
    };
    content_performance: {
      best_performing_content: string[];
      engagement_by_type: Record<string, number>;
      optimal_posting_times: string[];
    };
    recommendations: string[];
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${promotionId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotion analytics:', error);
      throw new Error('Failed to fetch promotion analytics');
    }
  }

  /**
   * Update promotion status
   */
  async updatePromotionStatus(promotionId: string, status: BusinessPromotion['status']): Promise<BusinessPromotion> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${promotionId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating promotion status:', error);
      throw new Error('Failed to update promotion status');
    }
  }

  /**
   * Get promotion recommendations based on business type and past performance
   */
  async getPromotionRecommendations(businessId: string, businessType: 'store' | 'service'): Promise<{
    recommended_promotions: {
      type: string;
      title: string;
      description: string;
      estimated_reach: number;
      estimated_cost: number;
      success_probability: number;
    }[];
    optimal_budget: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    best_posting_times: string[];
    target_audience_insights: {
      demographics: string[];
      interests: string[];
      behaviors: string[];
    };
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/recommendations?business_id=${businessId}&business_type=${businessType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotion recommendations:', error);
      throw new Error('Failed to fetch promotion recommendations');
    }
  }
}

export const businessPromotionService = new BusinessPromotionService();
export default businessPromotionService;

// BMAD METHOD: Business Promotion Features
// - Epic-gated access for all promotion features
// - Community post creation with engagement tracking
// - Comprehensive promotion campaign management
// - Advanced analytics and performance tracking
// - Budget-based validation and tier restrictions
// - Automated recommendations and optimization
// - Full approval workflow for premium features