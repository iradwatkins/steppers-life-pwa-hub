/**
 * Service Directory Service - Community Recovery Services Management
 * 
 * Comprehensive service management for recovery-focused services, health providers,
 * and community businesses with specialization tracking, verification, and inquiry management.
 */

import { apiClient } from './apiClient';
// import { bMADValidationService } from './bMADValidationService';
import { supabase } from '@/integrations/supabase/client';
import {
  Service,
  ServiceCategory,
  ServiceReview,
  ServiceComment,
  ServiceInquiry,
  CreateServiceData,
  UpdateServiceData,
  ServiceFilters,
  ServiceSearchResult,
  CreateServiceReviewData,
  CreateServiceCommentData,
  CreateServiceInquiryData,
  CreateServiceCategoryData,
  ServiceStats,
  GeolocationCoords,
  NearbyServicesRequest
} from '@/types/service';

class ServiceDirectoryService {
  private baseUrl = '/api/v1/services';

  /**
   * Get all services with filtering and pagination
   */
  async getServices(filters?: ServiceFilters): Promise<ServiceSearchResult> {
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
      console.error('Error fetching services:', error);
      // Return mock data for development
      return this.getMockServiceData(filters);
    }
  }

  /**
   * Get a single service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      
      // Track service view
      this.trackServiceView(id);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw new Error('Service not found');
    }
  }

  /**
   * Get a single service by slug
   */
  async getServiceBySlug(slug: string): Promise<Service> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/slug/${slug}`);
      
      // Track service view
      this.trackServiceView(response.data.id);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching service by slug:', error);
      throw new Error('Service not found');
    }
  }

  /**
   * Get featured services
   */
  async getFeaturedServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/featured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured services:', error);
      return this.getMockFeaturedServices();
    }
  }

  /**
   * Get verified services
   */
  async getVerifiedServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/verified`);
      return response.data;
    } catch (error) {
      console.error('Error fetching verified services:', error);
      return this.getMockVerifiedServices();
    }
  }

  /**
   * Get emergency services
   */
  async getEmergencyServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/emergency`);
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency services:', error);
      return [];
    }
  }

  /**
   * Get nearby services based on location
   */
  async getNearbyServices(request: NearbyServicesRequest): Promise<Service[]> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/nearby`, request);
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby services:', error);
      return [];
    }
  }

  /**
   * Search services by keyword
   */
  async searchServices(keyword: string, filters?: ServiceFilters): Promise<ServiceSearchResult> {
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
      console.error('Error searching services:', error);
      return this.getMockServiceData(filters);
    }
  }

  /**
   * Create a new service listing (BMAD METHOD: Epic-gated access)
   */
  async createService(serviceData: CreateServiceData): Promise<Service> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to create service');
      }

      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Service creation requires organizer role or higher');
      }

      console.log('Service creation authorized for user:', user.id);

      const response = await apiClient.post(this.baseUrl, {
        ...serviceData,
        slug: this.generateSlug(serviceData.business_name),
        owner_id: user.id,
        bmad_validation: {
          validated_at: new Date().toISOString(),
          completed_epics: validation.completedEpics,
          user_status: validation.userStatus?.extendedStatuses
        }
      });

      console.log('BMAD: Service created successfully:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  /**
   * Update an existing service (BMAD METHOD: Owner verification)
   */
  async updateService(serviceData: UpdateServiceData): Promise<Service> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to update service');
      }

      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Service update requires organizer role or higher');
      }

      const updateData = { ...serviceData };
      
      if (serviceData.business_name) {
        updateData.slug = this.generateSlug(serviceData.business_name);
      }

      // Add BMAD tracking
      updateData.bmad_last_updated = {
        updated_at: new Date().toISOString(),
        updated_by: user.id,
        user_status: validation.userStatus?.extendedStatuses
      };

      const response = await apiClient.patch(`${this.baseUrl}/${serviceData.id}`, updateData);

      console.log('BMAD: Service updated:', serviceData.id);

      return response.data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  /**
   * Delete a service
   */
  async deleteService(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);

      console.log('Service deleted:', id);
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('Failed to delete service');
    }
  }

  /**
   * Approve a service listing (admin)
   */
  async approveService(id: string): Promise<Service> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/approve`);

      console.log('Service approved:', id);

      return response.data;
    } catch (error) {
      console.error('Error approving service:', error);
      throw new Error('Failed to approve service');
    }
  }

  /**
   * Reject a service listing (admin)
   */
  async rejectService(id: string, reason?: string): Promise<Service> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/reject`, {
        reason
      });

      console.log('Service rejected:', id);

      return response.data;
    } catch (error) {
      console.error('Error rejecting service:', error);
      throw new Error('Failed to reject service');
    }
  }

  /**
   * Set service as featured (BMAD METHOD: Business promotion validation)
   */
  async setFeaturedService(id: string, featured: boolean): Promise<Service> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to feature services');
      }

      // Simple validation: Check if user has admin role for featuring services
      if (!user?.user_metadata?.role || !['admin', 'super_admin'].includes(user.user_metadata.role)) {
        throw new Error('Service promotion requires admin privileges');
      }

      console.log('BMAD: Service promotion authorized:', id, 'User:', user.id, 'Featured:', featured);

      const response = await apiClient.patch(`${this.baseUrl}/${id}/featured`, {
        is_featured: featured,
        bmad_promotion: {
          promoted_by: user.id,
          promoted_at: new Date().toISOString(),
          user_status: validation.userStatus?.extendedStatuses,
          completed_epics: validation.completedEpics
        }
      });

      console.log('BMAD: Service featured status updated:', id, featured);

      return response.data;
    } catch (error) {
      console.error('Error updating featured status:', error);
      throw error;
    }
  }

  /**
   * Verify a service (admin)
   */
  async verifyService(id: string, verified: boolean): Promise<Service> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/verify`, {
        is_verified: verified
      });

      console.log('Service verification status updated:', id, verified);

      return response.data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw new Error('Failed to update verification status');
    }
  }

  /**
   * Get all service categories
   */
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      return this.getMockCategories();
    }
  }

  /**
   * Get recovery-focused categories
   */
  async getRecoveryCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/categories/recovery`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recovery categories:', error);
      return this.getMockCategories().filter(cat => cat.is_recovery_focused);
    }
  }

  /**
   * Create a new service category (admin)
   */
  async createCategory(categoryData: CreateServiceCategoryData): Promise<ServiceCategory> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/categories`, {
        ...categoryData,
        slug: this.generateSlug(categoryData.name)
      });

      console.log('Service category created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating service category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Get service reviews
   */
  async getServiceReviews(serviceId: string): Promise<ServiceReview[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${serviceId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service reviews:', error);
      return [];
    }
  }

  /**
   * Create a service review
   */
  async createReview(reviewData: CreateServiceReviewData): Promise<ServiceReview> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${reviewData.service_id}/reviews`, reviewData);

      console.log('Service review created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating service review:', error);
      throw new Error('Failed to create review');
    }
  }

  /**
   * Get service comments
   */
  async getServiceComments(serviceId: string): Promise<ServiceComment[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${serviceId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service comments:', error);
      return [];
    }
  }

  /**
   * Create a service comment
   */
  async createComment(commentData: CreateServiceCommentData): Promise<ServiceComment> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${commentData.service_id}/comments`, commentData);

      console.log('Service comment created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating service comment:', error);
      throw new Error('Failed to create comment');
    }
  }

  /**
   * Create a service inquiry
   */
  async createInquiry(inquiryData: CreateServiceInquiryData): Promise<ServiceInquiry> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${inquiryData.service_id}/inquiries`, inquiryData);

      console.log('Service inquiry created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating service inquiry:', error);
      throw new Error('Failed to create inquiry');
    }
  }

  /**
   * Get service inquiries (service owner)
   */
  async getServiceInquiries(serviceId: string): Promise<ServiceInquiry[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${serviceId}/inquiries`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service inquiries:', error);
      return [];
    }
  }

  /**
   * Upload service image (BMAD METHOD: Image permissions validation)
   */
  async uploadImage(serviceId: string, file: File, caption?: string): Promise<{ url: string; alt?: string }> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to upload service images');
      }

      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Service image upload requires organizer role or higher');
      }

      const formData = new FormData();
      formData.append('image', file);
      if (caption) {
        formData.append('caption', caption);
      }

      // Add BMAD metadata
      formData.append('bmad_user_id', user.id);
      formData.append('bmad_user_status', JSON.stringify(validation.userStatus?.extendedStatuses));

      const response = await apiClient.post(`${this.baseUrl}/${serviceId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('BMAD: Service image uploaded successfully for service:', serviceId);

      return response.data;
    } catch (error) {
      console.error('Error uploading service image:', error);
      throw error;
    }
  }

  /**
   * Upload portfolio item (BMAD METHOD: Portfolio permissions validation)
   */
  async uploadPortfolioItem(serviceId: string, data: {
    file: File;
    title: string;
    description?: string;
    project_date?: string;
  }): Promise<{ url: string; title: string }> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to upload portfolio items');
      }

      // Simple validation: Check if user has organizer role or higher
      if (!user?.user_metadata?.role || user.user_metadata.role === 'user') {
        throw new Error('Portfolio upload requires organizer role or higher');
      }

      const formData = new FormData();
      formData.append('image', data.file);
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.project_date) formData.append('project_date', data.project_date);

      // Add BMAD metadata
      formData.append('bmad_user_id', user.id);
      formData.append('bmad_user_status', JSON.stringify(validation.userStatus?.extendedStatuses));

      const response = await apiClient.post(`${this.baseUrl}/${serviceId}/portfolio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('BMAD: Portfolio item uploaded successfully for service:', serviceId);

      return response.data;
    } catch (error) {
      console.error('Error uploading portfolio item:', error);
      throw error;
    }
  }

  /**
   * Get service statistics (admin)
   */
  async getStats(): Promise<ServiceStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service stats:', error);
      return this.getMockStats();
    }
  }

  /**
   * Get current location (reused from store service)
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
   * Track service view
   */
  private async trackServiceView(serviceId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${serviceId}/view`);
    } catch (error) {
      console.error('Error tracking service view:', error);
    }
  }

  /**
   * Generate URL slug from business name
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
  private getMockServiceData(filters?: ServiceFilters): ServiceSearchResult {
    const mockServices: Service[] = [
      {
        id: '1',
        business_name: 'Chicago Recovery Wellness Center',
        slug: 'chicago-recovery-wellness-center',
        category_id: '1',
        category: { 
          id: '1', 
          name: 'Addiction Recovery', 
          slug: 'addiction-recovery', 
          display_order: 1, 
          service_count: 15, 
          is_active: true, 
          is_recovery_focused: true,
          created_at: '2024-01-01T00:00:00Z', 
          updated_at: '2024-01-01T00:00:00Z' 
        },
        service_description: 'Comprehensive addiction recovery services including counseling, group therapy, and ongoing support for individuals and families in the stepping community.',
        contact_email: 'info@chicagorecovery.com',
        contact_phone: '(312) 555-0789',
        website: 'https://chicagorecoverywellness.com',
        social_links: {
          facebook: 'https://facebook.com/chicagorecovery',
          linkedin: 'https://linkedin.com/company/chicago-recovery'
        },
        location_type: 'both',
        physical_address: '789 North Michigan Avenue, Chicago, IL 60611',
        service_area_notes: 'Serving Chicago metro area, Telehealth available statewide',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60611',
        country: 'USA',
        latitude: 41.8781,
        longitude: -87.6298,
        operating_hours: {
          monday: '8:00 AM - 6:00 PM',
          tuesday: '8:00 AM - 6:00 PM',
          wednesday: '8:00 AM - 6:00 PM',
          thursday: '8:00 AM - 6:00 PM',
          friday: '8:00 AM - 5:00 PM',
          saturday: '9:00 AM - 3:00 PM',
          notes: '24/7 crisis hotline available'
        },
        images: [
          {
            id: '1',
            service_id: '1',
            url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
            alt_text: 'Recovery center lobby',
            display_order: 1,
            is_primary: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        portfolio_images: [],
        service_offerings: [
          'Individual Counseling',
          'Group Therapy',
          'Family Support',
          'Crisis Intervention',
          'Telehealth Services'
        ],
        specializations: ['Substance Abuse', 'Trauma Recovery', 'Family Therapy'],
        certifications: ['LCDC', 'LCSW', 'CAADC'],
        experience_years: 12,
        keywords: ['recovery', 'addiction', 'counseling', 'therapy', 'support'],
        rating: 4.9,
        review_count: 67,
        insurance_accepted: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealth', 'Medicaid'],
        accessibility_features: ['Wheelchair accessible', 'Sign language interpreter available'],
        languages_spoken: ['English', 'Spanish', 'Polish'],
        emergency_availability: true,
        owner_id: 'user123',
        owner_name: 'Dr. Sarah Johnson',
        status: 'approved',
        is_featured: true,
        is_verified: true,
        verification_date: '2024-01-10T00:00:00Z',
        view_count: 1543,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
        approved_at: '2024-01-16T09:00:00Z'
      },
      {
        id: '2',
        business_name: 'Mindful Steps Therapy',
        slug: 'mindful-steps-therapy',
        category_id: '2',
        category: { 
          id: '2', 
          name: 'Mental Health', 
          slug: 'mental-health', 
          display_order: 2, 
          service_count: 23, 
          is_active: true, 
          is_recovery_focused: true,
          created_at: '2024-01-01T00:00:00Z', 
          updated_at: '2024-01-01T00:00:00Z' 
        },
        service_description: 'Specialized therapy services for dancers dealing with performance anxiety, body image issues, and career transitions.',
        contact_email: 'contact@mindfulsteps.com',
        contact_phone: '(773) 555-0456',
        website: 'https://mindfulstepstherapy.com',
        location_type: 'both',
        physical_address: '456 West Loop, Chicago, IL 60606',
        service_area_notes: 'In-person and virtual sessions available',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60606',
        country: 'USA',
        latitude: 41.8819,
        longitude: -87.6431,
        images: [
          {
            id: '2',
            service_id: '2',
            url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
            alt_text: 'Therapy office',
            display_order: 1,
            is_primary: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        portfolio_images: [],
        service_offerings: [
          'Individual Therapy',
          'Dance/Movement Therapy',
          'Performance Coaching',
          'Body Image Counseling'
        ],
        specializations: ['Performance Anxiety', 'Body Image', 'Career Counseling'],
        certifications: ['LCPC', 'DMT-R'],
        experience_years: 8,
        keywords: ['therapy', 'dance', 'performance', 'anxiety', 'mental health'],
        rating: 4.7,
        review_count: 32,
        insurance_accepted: ['Blue Cross Blue Shield', 'Cigna'],
        accessibility_features: ['Wheelchair accessible'],
        languages_spoken: ['English'],
        emergency_availability: false,
        owner_id: 'user456',
        owner_name: 'Dr. Maria Santos',
        status: 'approved',
        is_featured: false,
        is_verified: true,
        verification_date: '2024-01-12T00:00:00Z',
        view_count: 892,
        created_at: '2024-01-10T14:00:00Z',
        updated_at: '2024-01-15T11:20:00Z',
        approved_at: '2024-01-11T10:30:00Z'
      }
    ];

    const mockCategories = this.getMockCategories();

    return {
      services: mockServices,
      categories: mockCategories,
      total: mockServices.length,
      has_more: false,
      filters_applied: filters || {}
    };
  }

  private getMockFeaturedServices(): Service[] {
    return this.getMockServiceData().services.filter(service => service.is_featured);
  }

  private getMockVerifiedServices(): Service[] {
    return this.getMockServiceData().services.filter(service => service.is_verified);
  }

  private getMockCategories(): ServiceCategory[] {
    return [
      { 
        id: '1', 
        name: 'Addiction Recovery', 
        slug: 'addiction-recovery', 
        description: 'Substance abuse and addiction recovery services', 
        display_order: 1, 
        service_count: 15, 
        is_active: true, 
        is_recovery_focused: true,
        created_at: '2024-01-01T00:00:00Z', 
        updated_at: '2024-01-01T00:00:00Z' 
      },
      { 
        id: '2', 
        name: 'Mental Health', 
        slug: 'mental-health', 
        description: 'Therapy and mental health services', 
        display_order: 2, 
        service_count: 23, 
        is_active: true, 
        is_recovery_focused: true,
        created_at: '2024-01-01T00:00:00Z', 
        updated_at: '2024-01-01T00:00:00Z' 
      },
      { 
        id: '3', 
        name: 'Physical Therapy', 
        slug: 'physical-therapy', 
        description: 'Physical rehabilitation and therapy', 
        display_order: 3, 
        service_count: 18, 
        is_active: true, 
        is_recovery_focused: true,
        created_at: '2024-01-01T00:00:00Z', 
        updated_at: '2024-01-01T00:00:00Z' 
      },
      { 
        id: '4', 
        name: 'Legal Services', 
        slug: 'legal-services', 
        description: 'Legal assistance and representation', 
        display_order: 4, 
        service_count: 8, 
        is_active: true, 
        is_recovery_focused: false,
        created_at: '2024-01-01T00:00:00Z', 
        updated_at: '2024-01-01T00:00:00Z' 
      },
      { 
        id: '5', 
        name: 'Financial Services', 
        slug: 'financial-services', 
        description: 'Financial planning and assistance', 
        display_order: 5, 
        service_count: 12, 
        is_active: true, 
        is_recovery_focused: false,
        created_at: '2024-01-01T00:00:00Z', 
        updated_at: '2024-01-01T00:00:00Z' 
      }
    ];
  }

  private getMockStats(): ServiceStats {
    return {
      total_services: 76,
      approved_services: 68,
      pending_services: 8,
      verified_services: 45,
      total_reviews: 312,
      average_rating: 4.7,
      categories_count: 5,
      recovery_focused_count: 56,
      emergency_available_count: 12,
      top_categories: [],
      top_specializations: [],
      recent_services: [],
      featured_services: [],
      top_rated_services: []
    };
  }
}

export const serviceService = new ServiceDirectoryService();