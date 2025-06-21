import { apiClient } from './apiClient';
import { imageUploadService } from './imageUploadService';
import type { ServiceResponse } from '@/types/ticket';
import type {
  Store,
  Service,
  StoreCategory,
  ServiceCategory,
  CreateStoreData,
  CreateServiceData,
  UpdateStoreData,
  UpdateServiceData,
  CommunityListFilters,
  UserRating,
  UserReview,
  UserComment,
  CategorySuggestion,
  CommunityStats,
  CommunityListing
} from '@/types/community';

export class CommunityService {
  // Store Management
  async getStores(filters?: CommunityListFilters): Promise<ServiceResponse<Store[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/community/stores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Store[]>(endpoint);
  }

  async getStore(id: string): Promise<ServiceResponse<Store>> {
    return apiClient.get<Store>(`/community/stores/${id}`);
  }

  async createStore(data: CreateStoreData): Promise<ServiceResponse<Store>> {
    try {
      // Handle image uploads if present
      let imageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        const uploadResults = await Promise.all(
          data.images.map(image => imageUploadService.uploadImage(image, 'store-images'))
        );
        
        const successfulUploads = uploadResults.filter(result => result.success);
        imageUrls = successfulUploads.map(result => result.data!.url);
      }

      // Remove images from data and include URLs
      const { images, ...storeData } = data;
      const payload = {
        ...storeData,
        image_urls: imageUrls
      };

      return apiClient.post<Store>('/community/stores', payload);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create store'
      };
    }
  }

  async updateStore(data: UpdateStoreData): Promise<ServiceResponse<Store>> {
    try {
      // Handle image uploads if present
      let imageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        const uploadResults = await Promise.all(
          data.images.map(image => imageUploadService.uploadImage(image, 'store-images'))
        );
        
        const successfulUploads = uploadResults.filter(result => result.success);
        imageUrls = successfulUploads.map(result => result.data!.url);
      }

      // Remove images from data and include URLs
      const { id, images, ...storeData } = data;
      const payload = {
        ...storeData,
        ...(imageUrls.length > 0 && { image_urls: imageUrls })
      };

      return apiClient.put<Store>(`/community/stores/${id}`, payload);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update store'
      };
    }
  }

  async deleteStore(id: string): Promise<ServiceResponse<void>> {
    return apiClient.delete<void>(`/community/stores/${id}`);
  }

  // Service Management
  async getServices(filters?: CommunityListFilters): Promise<ServiceResponse<Service[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/community/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Service[]>(endpoint);
  }

  async getService(id: string): Promise<ServiceResponse<Service>> {
    return apiClient.get<Service>(`/community/services/${id}`);
  }

  async createService(data: CreateServiceData): Promise<ServiceResponse<Service>> {
    try {
      // Handle image uploads if present
      let imageUrls: string[] = [];
      let portfolioUrls: string[] = [];
      
      if (data.images && data.images.length > 0) {
        const uploadResults = await Promise.all(
          data.images.map(image => imageUploadService.uploadImage(image, 'service-images'))
        );
        
        const successfulUploads = uploadResults.filter(result => result.success);
        imageUrls = successfulUploads.map(result => result.data!.url);
      }

      if (data.portfolio_images && data.portfolio_images.length > 0) {
        const uploadResults = await Promise.all(
          data.portfolio_images.map(image => imageUploadService.uploadImage(image, 'service-portfolio'))
        );
        
        const successfulUploads = uploadResults.filter(result => result.success);
        portfolioUrls = successfulUploads.map(result => result.data!.url);
      }

      // Remove images from data and include URLs
      const { images, portfolio_images, ...serviceData } = data;
      const payload = {
        ...serviceData,
        image_urls: imageUrls,
        portfolio_urls: portfolioUrls
      };

      return apiClient.post<Service>('/community/services', payload);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create service'
      };
    }
  }

  async updateService(data: UpdateServiceData): Promise<ServiceResponse<Service>> {
    try {
      // Handle image uploads if present
      let imageUrls: string[] = [];
      let portfolioUrls: string[] = [];
      
      if (data.images && data.images.length > 0) {
        const uploadResults = await Promise.all(
          data.images.map(image => imageUploadService.uploadImage(image, 'service-images'))
        );
        
        const successfulUploads = uploadResults.filter(result => result.success);
        imageUrls = successfulUploads.map(result => result.data!.url);
      }

      if (data.portfolio_images && data.portfolio_images.length > 0) {
        const uploadResults = await Promise.all(
          data.portfolio_images.map(image => imageUploadService.uploadImage(image, 'service-portfolio'))
        );
        
        const successfulUploads = uploadResults.filter(result => result.success);
        portfolioUrls = successfulUploads.map(result => result.data!.url);
      }

      // Remove images from data and include URLs
      const { id, images, portfolio_images, ...serviceData } = data;
      const payload = {
        ...serviceData,
        ...(imageUrls.length > 0 && { image_urls: imageUrls }),
        ...(portfolioUrls.length > 0 && { portfolio_urls: portfolioUrls })
      };

      return apiClient.put<Service>(`/community/services/${id}`, payload);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update service'
      };
    }
  }

  async deleteService(id: string): Promise<ServiceResponse<void>> {
    return apiClient.delete<void>(`/community/services/${id}`);
  }

  // Combined Search
  async searchCommunity(filters: CommunityListFilters): Promise<ServiceResponse<CommunityListing[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const endpoint = `/community/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<CommunityListing[]>(endpoint);
  }

  // Category Management
  async getStoreCategories(): Promise<ServiceResponse<StoreCategory[]>> {
    return apiClient.get<StoreCategory[]>('/community/store-categories');
  }

  async getServiceCategories(): Promise<ServiceResponse<ServiceCategory[]>> {
    return apiClient.get<ServiceCategory[]>('/community/service-categories');
  }

  async createStoreCategory(data: Omit<StoreCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<StoreCategory>> {
    return apiClient.post<StoreCategory>('/community/store-categories', data);
  }

  async createServiceCategory(data: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<ServiceCategory>> {
    return apiClient.post<ServiceCategory>('/community/service-categories', data);
  }

  async updateStoreCategory(id: string, data: Partial<StoreCategory>): Promise<ServiceResponse<StoreCategory>> {
    return apiClient.put<StoreCategory>(`/community/store-categories/${id}`, data);
  }

  async updateServiceCategory(id: string, data: Partial<ServiceCategory>): Promise<ServiceResponse<ServiceCategory>> {
    return apiClient.put<ServiceCategory>(`/community/service-categories/${id}`, data);
  }

  async deleteStoreCategory(id: string): Promise<ServiceResponse<void>> {
    return apiClient.delete<void>(`/community/store-categories/${id}`);
  }

  async deleteServiceCategory(id: string): Promise<ServiceResponse<void>> {
    return apiClient.delete<void>(`/community/service-categories/${id}`);
  }

  // Category Suggestions
  async suggestCategory(data: { name: string; type: 'store' | 'service' }): Promise<ServiceResponse<CategorySuggestion>> {
    return apiClient.post<CategorySuggestion>('/community/category-suggestions', data);
  }

  async getCategorySuggestions(): Promise<ServiceResponse<CategorySuggestion[]>> {
    return apiClient.get<CategorySuggestion[]>('/community/category-suggestions');
  }

  async approveCategorySuggestion(id: string, notes?: string): Promise<ServiceResponse<void>> {
    return apiClient.post<void>(`/community/category-suggestions/${id}/approve`, { notes });
  }

  async rejectCategorySuggestion(id: string, notes?: string): Promise<ServiceResponse<void>> {
    return apiClient.post<void>(`/community/category-suggestions/${id}/reject`, { notes });
  }

  // Ratings and Reviews
  async rateStore(storeId: string, rating: number): Promise<ServiceResponse<UserRating>> {
    return apiClient.post<UserRating>(`/community/stores/${storeId}/rate`, { rating });
  }

  async rateService(serviceId: string, rating: number): Promise<ServiceResponse<UserRating>> {
    return apiClient.post<UserRating>(`/community/services/${serviceId}/rate`, { rating });
  }

  async reviewStore(storeId: string, data: { rating: number; title?: string; content: string }): Promise<ServiceResponse<UserReview>> {
    return apiClient.post<UserReview>(`/community/stores/${storeId}/reviews`, data);
  }

  async reviewService(serviceId: string, data: { rating: number; title?: string; content: string }): Promise<ServiceResponse<UserReview>> {
    return apiClient.post<UserReview>(`/community/services/${serviceId}/reviews`, data);
  }

  async getStoreReviews(storeId: string): Promise<ServiceResponse<UserReview[]>> {
    return apiClient.get<UserReview[]>(`/community/stores/${storeId}/reviews`);
  }

  async getServiceReviews(serviceId: string): Promise<ServiceResponse<UserReview[]>> {
    return apiClient.get<UserReview[]>(`/community/services/${serviceId}/reviews`);
  }

  async updateReview(reviewId: string, data: { title?: string; content: string; rating: number }): Promise<ServiceResponse<UserReview>> {
    return apiClient.put<UserReview>(`/community/reviews/${reviewId}`, data);
  }

  async deleteReview(reviewId: string): Promise<ServiceResponse<void>> {
    return apiClient.delete<void>(`/community/reviews/${reviewId}`);
  }

  // Comments
  async commentOnStore(storeId: string, content: string, parentId?: string): Promise<ServiceResponse<UserComment>> {
    return apiClient.post<UserComment>(`/community/stores/${storeId}/comments`, { content, parent_id: parentId });
  }

  async commentOnService(serviceId: string, content: string, parentId?: string): Promise<ServiceResponse<UserComment>> {
    return apiClient.post<UserComment>(`/community/services/${serviceId}/comments`, { content, parent_id: parentId });
  }

  async getStoreComments(storeId: string): Promise<ServiceResponse<UserComment[]>> {
    return apiClient.get<UserComment[]>(`/community/stores/${storeId}/comments`);
  }

  async getServiceComments(serviceId: string): Promise<ServiceResponse<UserComment[]>> {
    return apiClient.get<UserComment[]>(`/community/services/${serviceId}/comments`);
  }

  async updateComment(commentId: string, content: string): Promise<ServiceResponse<UserComment>> {
    return apiClient.put<UserComment>(`/community/comments/${commentId}`, { content });
  }

  async deleteComment(commentId: string): Promise<ServiceResponse<void>> {
    return apiClient.delete<void>(`/community/comments/${commentId}`);
  }

  // Admin Actions
  async approveStore(id: string, notes?: string): Promise<ServiceResponse<Store>> {
    return apiClient.post<Store>(`/community/stores/${id}/approve`, { notes });
  }

  async rejectStore(id: string, reason: string): Promise<ServiceResponse<Store>> {
    return apiClient.post<Store>(`/community/stores/${id}/reject`, { reason });
  }

  async suspendStore(id: string, reason: string): Promise<ServiceResponse<Store>> {
    return apiClient.post<Store>(`/community/stores/${id}/suspend`, { reason });
  }

  async approveService(id: string, notes?: string): Promise<ServiceResponse<Service>> {
    return apiClient.post<Service>(`/community/services/${id}/approve`, { notes });
  }

  async rejectService(id: string, reason: string): Promise<ServiceResponse<Service>> {
    return apiClient.post<Service>(`/community/services/${id}/reject`, { reason });
  }

  async suspendService(id: string, reason: string): Promise<ServiceResponse<Service>> {
    return apiClient.post<Service>(`/community/services/${id}/suspend`, { reason });
  }

  async verifyService(id: string, notes?: string): Promise<ServiceResponse<Service>> {
    return apiClient.post<Service>(`/community/services/${id}/verify`, { notes });
  }

  async featureStore(id: string, durationDays: number): Promise<ServiceResponse<Store>> {
    return apiClient.post<Store>(`/community/stores/${id}/feature`, { duration_days: durationDays });
  }

  async featureService(id: string, durationDays: number): Promise<ServiceResponse<Service>> {
    return apiClient.post<Service>(`/community/services/${id}/feature`, { duration_days: durationDays });
  }

  async unfeatureStore(id: string): Promise<ServiceResponse<Store>> {
    return apiClient.post<Store>(`/community/stores/${id}/unfeature`);
  }

  async unfeatureService(id: string): Promise<ServiceResponse<Service>> {
    return apiClient.post<Service>(`/community/services/${id}/unfeature`);
  }

  // Moderation
  async approveReview(reviewId: string): Promise<ServiceResponse<UserReview>> {
    return apiClient.post<UserReview>(`/community/reviews/${reviewId}/approve`);
  }

  async rejectReview(reviewId: string, reason: string): Promise<ServiceResponse<UserReview>> {
    return apiClient.post<UserReview>(`/community/reviews/${reviewId}/reject`, { reason });
  }

  async approveComment(commentId: string): Promise<ServiceResponse<UserComment>> {
    return apiClient.post<UserComment>(`/community/comments/${commentId}/approve`);
  }

  async rejectComment(commentId: string, reason: string): Promise<ServiceResponse<UserComment>> {
    return apiClient.post<UserComment>(`/community/comments/${commentId}/reject`, { reason });
  }

  // Analytics and Stats
  async getCommunityStats(): Promise<ServiceResponse<CommunityStats>> {
    return apiClient.get<CommunityStats>('/community/stats');
  }

  async incrementViewCount(type: 'store' | 'service', id: string): Promise<ServiceResponse<void>> {
    return apiClient.post<void>(`/community/${type}s/${id}/view`);
  }

  async incrementContactCount(type: 'store' | 'service', id: string): Promise<ServiceResponse<void>> {
    return apiClient.post<void>(`/community/${type}s/${id}/contact`);
  }

  // User's Listings
  async getMyStores(): Promise<ServiceResponse<Store[]>> {
    return apiClient.get<Store[]>('/community/my-stores');
  }

  async getMyServices(): Promise<ServiceResponse<Service[]>> {
    return apiClient.get<Service[]>('/community/my-services');
  }

  async getMyReviews(): Promise<ServiceResponse<UserReview[]>> {
    return apiClient.get<UserReview[]>('/community/my-reviews');
  }

  async getMyComments(): Promise<ServiceResponse<UserComment[]>> {
    return apiClient.get<UserComment[]>('/community/my-comments');
  }
}

export const communityService = new CommunityService();