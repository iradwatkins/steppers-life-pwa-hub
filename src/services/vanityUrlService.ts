/**
 * Vanity URL Service - Epic M.001: Vanity URL System
 * 
 * Service for managing vanity URL requests, approvals, analytics, and routing
 * for organizers and sales agents.
 */

import { apiClient } from './apiClient';
import { trackEvent } from './analyticsService';

export interface VanityURLRequest {
  id: string;
  requestedUrl: string;
  targetUrl: string;
  requestedBy: string;
  userType: 'organizer' | 'sales_agent';
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  rejectionReason?: string;
  purpose?: string;
  clickCount: number;
  isActive: boolean;
  expiryDate?: string;
  metadata?: Record<string, any>;
}

export interface VanityURLAnalytics {
  url: string;
  totalClicks: number;
  uniqueClicks: number;
  clicksByDate: { date: string; clicks: number }[];
  clicksByHour: { hour: number; clicks: number }[];
  topReferrers: { referrer: string; clicks: number }[];
  deviceBreakdown: { device: string; clicks: number }[];
  locationBreakdown: { country: string; clicks: number }[];
  conversionRate?: number;
  bounceRate?: number;
}

export interface URLSuggestion {
  url: string;
  available: boolean;
  reason?: string;
  score?: number;
}

export interface VanityURLRedirect {
  vanityUrl: string;
  targetUrl: string;
  clickId: string;
  userId?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: string;
}

class VanityUrlService {
  private baseUrl = '/api/v1/vanity-urls';
  private analyticsUrl = '/api/v1/vanity-analytics';

  /**
   * Submit a new vanity URL request
   */
  async submitRequest(request: Omit<VanityURLRequest, 'id' | 'status' | 'requestDate' | 'clickCount' | 'isActive'>): Promise<VanityURLRequest> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/requests`, request);
      
      trackEvent('vanity_url_requested', {
        requestedUrl: request.requestedUrl,
        userType: request.userType,
        purpose: request.purpose
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting vanity URL request:', error);
      throw new Error('Failed to submit vanity URL request');
    }
  }

  /**
   * Get all vanity URL requests (admin only)
   */
  async getAllRequests(filters?: {
    status?: string;
    userType?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ requests: VanityURLRequest[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`${this.baseUrl}/requests?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vanity URL requests:', error);
      throw new Error('Failed to fetch vanity URL requests');
    }
  }

  /**
   * Get user's vanity URL requests
   */
  async getUserRequests(userId: string): Promise<VanityURLRequest[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/requests/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user vanity URL requests:', error);
      throw new Error('Failed to fetch user vanity URL requests');
    }
  }

  /**
   * Check if a vanity URL is available
   */
  async checkAvailability(url: string): Promise<{ available: boolean; reason?: string }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/check-availability`, {
        params: { url }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking URL availability:', error);
      throw new Error('Failed to check URL availability');
    }
  }

  /**
   * Generate URL suggestions based on input
   */
  async generateSuggestions(baseUrl: string, userType: 'organizer' | 'sales_agent'): Promise<URLSuggestion[]> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/suggestions`, {
        baseUrl,
        userType
      });
      return response.data;
    } catch (error) {
      console.error('Error generating URL suggestions:', error);
      throw new Error('Failed to generate URL suggestions');
    }
  }

  /**
   * Approve a vanity URL request (admin only)
   */
  async approveRequest(requestId: string, reviewedBy: string): Promise<VanityURLRequest> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/requests/${requestId}/approve`, {
        reviewedBy
      });

      trackEvent('vanity_url_approved', {
        requestId,
        reviewedBy
      });

      return response.data;
    } catch (error) {
      console.error('Error approving vanity URL request:', error);
      throw new Error('Failed to approve vanity URL request');
    }
  }

  /**
   * Reject a vanity URL request (admin only)
   */
  async rejectRequest(requestId: string, reviewedBy: string, reason: string): Promise<VanityURLRequest> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/requests/${requestId}/reject`, {
        reviewedBy,
        reason
      });

      trackEvent('vanity_url_rejected', {
        requestId,
        reviewedBy,
        reason
      });

      return response.data;
    } catch (error) {
      console.error('Error rejecting vanity URL request:', error);
      throw new Error('Failed to reject vanity URL request');
    }
  }

  /**
   * Activate/deactivate a vanity URL
   */
  async toggleUrlStatus(requestId: string, isActive: boolean): Promise<VanityURLRequest> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/requests/${requestId}/toggle`, {
        isActive
      });

      trackEvent('vanity_url_toggled', {
        requestId,
        isActive
      });

      return response.data;
    } catch (error) {
      console.error('Error toggling vanity URL status:', error);
      throw new Error('Failed to toggle vanity URL status');
    }
  }

  /**
   * Resolve a vanity URL to its target (for routing)
   */
  async resolveUrl(vanityPath: string, metadata?: {
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<VanityURLRedirect> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/resolve`, {
        vanityPath,
        metadata
      });

      // Track the click for analytics
      this.trackClick(response.data.clickId, metadata);

      return response.data;
    } catch (error) {
      console.error('Error resolving vanity URL:', error);
      throw new Error('Vanity URL not found or inactive');
    }
  }

  /**
   * Track a click for analytics
   */
  private async trackClick(clickId: string, metadata?: {
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await apiClient.post(`${this.analyticsUrl}/clicks`, {
        clickId,
        ...metadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking vanity URL click:', error);
      // Don't throw error to avoid breaking the redirect
    }
  }

  /**
   * Get analytics for a specific vanity URL
   */
  async getUrlAnalytics(
    vanityUrl: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<VanityURLAnalytics> {
    try {
      const params = new URLSearchParams({ url: vanityUrl });
      if (dateRange) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }

      const response = await apiClient.get(`${this.analyticsUrl}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vanity URL analytics:', error);
      throw new Error('Failed to fetch vanity URL analytics');
    }
  }

  /**
   * Get analytics for all user's vanity URLs
   */
  async getUserAnalytics(
    userId: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<VanityURLAnalytics[]> {
    try {
      const params = new URLSearchParams({ userId });
      if (dateRange) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }

      const response = await apiClient.get(`${this.analyticsUrl}/user?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user vanity URL analytics:', error);
      throw new Error('Failed to fetch user vanity URL analytics');
    }
  }

  /**
   * Get platform-wide vanity URL analytics (admin only)
   */
  async getPlatformAnalytics(
    dateRange?: { startDate: string; endDate: string }
  ): Promise<{
    totalUrls: number;
    activeUrls: number;
    totalClicks: number;
    uniqueClicks: number;
    topUrls: { url: string; clicks: number }[];
    clicksByDate: { date: string; clicks: number }[];
  }> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }

      const response = await apiClient.get(`${this.analyticsUrl}/platform?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching platform vanity URL analytics:', error);
      throw new Error('Failed to fetch platform vanity URL analytics');
    }
  }

  /**
   * Update a vanity URL request
   */
  async updateRequest(
    requestId: string,
    updates: Partial<Pick<VanityURLRequest, 'targetUrl' | 'purpose'>>
  ): Promise<VanityURLRequest> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/requests/${requestId}`, updates);

      trackEvent('vanity_url_updated', {
        requestId,
        updates
      });

      return response.data;
    } catch (error) {
      console.error('Error updating vanity URL request:', error);
      throw new Error('Failed to update vanity URL request');
    }
  }

  /**
   * Delete a vanity URL request (before approval)
   */
  async deleteRequest(requestId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/requests/${requestId}`);

      trackEvent('vanity_url_deleted', {
        requestId
      });
    } catch (error) {
      console.error('Error deleting vanity URL request:', error);
      throw new Error('Failed to delete vanity URL request');
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    format: 'csv' | 'json',
    vanityUrl?: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams({ format });
      if (vanityUrl) params.append('url', vanityUrl);
      if (dateRange) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }

      const response = await apiClient.get(`${this.analyticsUrl}/export?${params}`, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      console.error('Error exporting vanity URL analytics:', error);
      throw new Error('Failed to export vanity URL analytics');
    }
  }

  /**
   * Validate vanity URL format
   */
  validateUrl(url: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!url || url.length < 3) {
      errors.push('URL must be at least 3 characters long');
    }
    
    if (url.length > 50) {
      errors.push('URL must be less than 50 characters');
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(url)) {
      errors.push('URL can only contain letters, numbers, hyphens, and underscores');
    }
    
    if (url.startsWith('-') || url.endsWith('-')) {
      errors.push('URL cannot start or end with a hyphen');
    }
    
    // Reserved words check
    const reservedWords = [
      'www', 'api', 'admin', 'support', 'help', 'about', 'contact',
      'terms', 'privacy', 'login', 'register', 'app', 'mobile'
    ];
    
    if (reservedWords.includes(url.toLowerCase())) {
      errors.push('This URL is reserved and cannot be used');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const vanityUrlService = new VanityUrlService();