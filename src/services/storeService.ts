/**
 * Store Service - Community Directory Management
 * 
 * Comprehensive store service for managing store listings, categories, reviews, and community features
 * with geolocation support, search functionality, and admin moderation capabilities.
 */

import { apiClient } from './apiClient';
import { supabase } from '@/integrations/supabase/client';
import {
  Store,
  StoreCategory,
  StoreReview,
  StoreComment,
  CreateStoreData,
  UpdateStoreData,
  StoreFilters,
  StoreSearchResult,
  CreateStoreReviewData,
  CreateStoreCommentData,
  CreateStoreCategoryData,
  StoreStats,
  GeolocationCoords,
  NearbyStoresRequest
} from '@/types/store';

class StoreService {
  private baseUrl = '/api/v1/stores';

  /**
   * Get all stores with filtering and pagination
   */
  async getStores(filters?: StoreFilters): Promise<StoreSearchResult> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`${this.baseUrl}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      // Return mock data for development
      return this.getMockStoreData(filters);
    }
  }

  /**
   * Get a single store by ID
   */
  async getStoreById(id: string): Promise<Store> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      
      // Track store view
      this.trackStoreView(id);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching store:', error);
      throw new Error('Store not found');
    }
  }

  /**
   * Get a single store by slug
   */
  async getStoreBySlug(slug: string): Promise<Store> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/slug/${slug}`);
      
      // Track store view
      this.trackStoreView(response.data.id);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching store by slug:', error);
      throw new Error('Store not found');
    }
  }

  /**
   * Get featured stores
   */
  async getFeaturedStores(): Promise<Store[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/featured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured stores:', error);
      return this.getMockFeaturedStores();
    }
  }

  /**
   * Get nearby stores based on location
   */
  async getNearbyStores(request: NearbyStoresRequest): Promise<Store[]> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/nearby`, request);
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby stores:', error);
      return [];
    }
  }

  /**
   * Search stores by keyword
   */
  async searchStores(keyword: string, filters?: StoreFilters): Promise<StoreSearchResult> {
    try {
      const params = new URLSearchParams({ keyword });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`${this.baseUrl}/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching stores:', error);
      return this.getMockStoreData(filters);
    }
  }

  /**
   * Create a new store listing (BMAD METHOD: Epic-gated access)
   */
  async createStore(storeData: CreateStoreData): Promise<Store> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to create store');
      }

      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Store creation requires organizer role or higher');
      }

      console.log('Store creation authorized for user:', user.id);

      const response = await apiClient.post(this.baseUrl, {
        ...storeData,
        slug: this.generateSlug(storeData.name),
        owner_id: user.id,
        bmad_validation: {
          validated_at: new Date().toISOString(),
          completed_epics: validation.completedEpics,
          user_status: validation.userStatus?.extendedStatuses
        }
      });

      console.log('BMAD: Store created successfully:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  /**
   * Update an existing store (BMAD METHOD: Owner verification)
   */
  async updateStore(storeData: UpdateStoreData): Promise<Store> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to update store');
      }

      // BMAD VALIDATION: Verify user can manage business listings
      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Store update requires organizer role or higher');
      }

      const updateData = { ...storeData };
      
      if (storeData.name) {
        updateData.slug = this.generateSlug(storeData.name);
      }

      // Add tracking
      updateData.last_updated = new Date().toISOString();

      const response = await apiClient.patch(`${this.baseUrl}/${storeData.id}`, updateData);

      console.log('BMAD: Store updated:', storeData.id);

      return response.data;
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  }

  /**
   * Delete a store
   */
  async deleteStore(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);

      console.log('Store deleted:', id);
    } catch (error) {
      console.error('Error deleting store:', error);
      throw new Error('Failed to delete store');
    }
  }

  /**
   * Approve a store listing (admin)
   */
  async approveStore(id: string): Promise<Store> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/approve`);

      console.log('Store approved:', id);

      return response.data;
    } catch (error) {
      console.error('Error approving store:', error);
      throw new Error('Failed to approve store');
    }
  }

  /**
   * Reject a store listing (admin)
   */
  async rejectStore(id: string, reason?: string): Promise<Store> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/reject`, {
        reason
      });

      console.log('Store rejected:', id);

      return response.data;
    } catch (error) {
      console.error('Error rejecting store:', error);
      throw new Error('Failed to reject store');
    }
  }

  /**
   * Set store as featured (BMAD METHOD: Business promotion validation)
   */
  async setFeaturedStore(id: string, featured: boolean): Promise<Store> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to feature stores');
      }

      // Simple validation: Check if user has admin role for featuring stores
      if (!user?.user_metadata?.role || !['admin', 'super_admin'].includes(user.user_metadata.role)) {
        throw new Error('Store promotion requires admin privileges');
      }

      console.log('Store promotion authorized:', id, 'User:', user.id, 'Featured:', featured);

      const response = await apiClient.patch(`${this.baseUrl}/${id}/featured`, {
        is_featured: featured,
        promoted_by: user.id,
        promoted_at: new Date().toISOString()
      });

      console.log('BMAD: Store featured status updated:', id, featured);

      return response.data;
    } catch (error) {
      console.error('Error updating featured status:', error);
      throw error;
    }
  }

  /**
   * Get all store categories
   */
  async getCategories(): Promise<StoreCategory[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching store categories:', error);
      return this.getMockCategories();
    }
  }

  /**
   * Create a new store category (admin)
   */
  async createCategory(categoryData: CreateStoreCategoryData): Promise<StoreCategory> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/categories`, {
        ...categoryData,
        slug: this.generateSlug(categoryData.name)
      });

      console.log('Store category created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating store category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Get store reviews
   */
  async getStoreReviews(storeId: string): Promise<StoreReview[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${storeId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching store reviews:', error);
      return [];
    }
  }

  /**
   * Create a store review
   */
  async createReview(reviewData: CreateStoreReviewData): Promise<StoreReview> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${reviewData.store_id}/reviews`, reviewData);

      console.log('Store review created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating store review:', error);
      throw new Error('Failed to create review');
    }
  }

  /**
   * Get store comments
   */
  async getStoreComments(storeId: string): Promise<StoreComment[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${storeId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching store comments:', error);
      return [];
    }
  }

  /**
   * Create a store comment
   */
  async createComment(commentData: CreateStoreCommentData): Promise<StoreComment> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${commentData.store_id}/comments`, commentData);

      console.log('Store comment created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating store comment:', error);
      throw new Error('Failed to create comment');
    }
  }

  /**
   * Upload store image (BMAD METHOD: Image permissions validation)
   */
  async uploadImage(storeId: string, file: File, caption?: string): Promise<{ url: string; alt?: string }> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to upload store images');
      }

      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Store image upload requires organizer role or higher');
      }

      const formData = new FormData();
      formData.append('image', file);
      if (caption) {
        formData.append('caption', caption);
      }

      // Add metadata
      formData.append('user_id', user.id);

      const response = await apiClient.post(`${this.baseUrl}/${storeId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('BMAD: Store image uploaded successfully for store:', storeId);

      return response.data;
    } catch (error) {
      console.error('Error uploading store image:', error);
      throw error;
    }
  }

  /**
   * Get store statistics (admin)
   */
  async getStats(): Promise<StoreStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching store stats:', error);
      return this.getMockStats();
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<GeolocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Track store view
   */
  private async trackStoreView(storeId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${storeId}/view`);
    } catch (error) {
      console.error('Error tracking store view:', error);
    }
  }

  /**
   * Generate URL slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Mock data for development
   */
  private getMockStoreData(filters?: StoreFilters): StoreSearchResult {
    const mockStores: Store[] = [
      {
        id: '1',
        name: 'StepStyle Boutique',
        slug: 'stepstyle-boutique',
        category_id: '1',
        category: { id: '1', name: 'Clothing & Apparel', slug: 'clothing-apparel', display_order: 1, store_count: 12, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        description: 'Premium stepping attire and accessories for the modern dancer. From elegant outfits to comfortable practice wear.',
        contact_email: 'info@stepstyle.com',
        contact_phone: '(312) 555-0123',
        website: 'https://stepstyle.com',
        social_links: {
          instagram: 'https://instagram.com/stepstyle',
          facebook: 'https://facebook.com/stepstyle'
        },
        location_type: 'both',
        physical_address: '123 Michigan Avenue, Chicago, IL 60611',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60611',
        country: 'USA',
        latitude: 41.8781,
        longitude: -87.6298,
        operating_hours: {
          monday: '10:00 AM - 8:00 PM',
          tuesday: '10:00 AM - 8:00 PM',
          wednesday: '10:00 AM - 8:00 PM',
          thursday: '10:00 AM - 8:00 PM',
          friday: '10:00 AM - 9:00 PM',
          saturday: '10:00 AM - 9:00 PM',
          sunday: '12:00 PM - 6:00 PM'
        },
        images: [
          {
            id: '1',
            store_id: '1',
            url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
            alt_text: 'StepStyle Boutique storefront',
            display_order: 1,
            is_primary: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        keywords: ['stepping', 'fashion', 'dance wear', 'chicago'],
        rating: 4.8,
        review_count: 47,
        owner_id: 'user123',
        owner_name: 'Maria Rodriguez',
        status: 'approved',
        is_featured: true,
        view_count: 1247,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
        approved_at: '2024-01-16T09:00:00Z'
      },
      {
        id: '2',
        name: 'Chicago Step Academy Pro Shop',
        slug: 'chicago-step-academy-pro-shop',
        category_id: '2',
        category: { id: '2', name: 'Dance Equipment', slug: 'dance-equipment', display_order: 2, store_count: 8, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        description: 'Professional dance equipment, shoes, and accessories for serious steppers. Quality gear for practice and performance.',
        contact_email: 'proshop@chicagostep.com',
        contact_phone: '(773) 555-0456',
        website: 'https://chicagostepacademy.com/shop',
        location_type: 'physical',
        physical_address: '456 South State Street, Chicago, IL 60605',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60605',
        country: 'USA',
        latitude: 41.8711,
        longitude: -87.6278,
        images: [
          {
            id: '2',
            store_id: '2',
            url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800',
            alt_text: 'Dance equipment and shoes',
            display_order: 1,
            is_primary: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        keywords: ['dance shoes', 'equipment', 'professional', 'academy'],
        rating: 4.6,
        review_count: 32,
        owner_id: 'user456',
        owner_name: 'James Wilson',
        status: 'approved',
        is_featured: false,
        view_count: 892,
        created_at: '2024-01-10T14:00:00Z',
        updated_at: '2024-01-15T11:20:00Z',
        approved_at: '2024-01-11T10:30:00Z'
      }
    ];

    const mockCategories = this.getMockCategories();

    return {
      stores: mockStores,
      categories: mockCategories,
      total: mockStores.length,
      has_more: false,
      filters_applied: filters || {}
    };
  }

  private getMockFeaturedStores(): Store[] {
    return this.getMockStoreData().stores.filter(store => store.is_featured);
  }

  private getMockCategories(): StoreCategory[] {
    return [
      { id: '1', name: 'Clothing & Apparel', slug: 'clothing-apparel', description: 'Fashion and dance wear', display_order: 1, store_count: 12, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'Dance Equipment', slug: 'dance-equipment', description: 'Shoes, accessories, and gear', display_order: 2, store_count: 8, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'Music & Audio', slug: 'music-audio', description: 'Sound equipment and music', display_order: 3, store_count: 5, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'Event Services', slug: 'event-services', description: 'Event planning and services', display_order: 4, store_count: 15, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '5', name: 'Health & Wellness', slug: 'health-wellness', description: 'Recovery and wellness services', display_order: 5, store_count: 7, is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ];
  }

  private getMockStats(): StoreStats {
    return {
      total_stores: 47,
      approved_stores: 42,
      pending_stores: 5,
      total_reviews: 234,
      average_rating: 4.6,
      categories_count: 5,
      top_categories: [],
      recent_stores: [],
      featured_stores: [],
      top_rated_stores: []
    };
  }
}

export const storeService = new StoreService();