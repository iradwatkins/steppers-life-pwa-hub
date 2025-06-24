/**
 * Store Directory Types
 * 
 * Types for the Community Directory - Stores feature (Epic J)
 * Supporting store listings, categories, reviews, and community interaction
 */

export interface Store {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category?: StoreCategory;
  description: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  location_type: 'physical' | 'online' | 'both';
  physical_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  operating_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  images: StoreImage[];
  keywords?: string[];
  tags?: string[];
  
  // Community features
  rating: number;
  review_count: number;
  reviews?: StoreReview[];
  
  // Metadata
  owner_id: string;
  owner_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order: number;
  store_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreImage {
  id: string;
  store_id: string;
  url: string;
  alt_text?: string;
  caption?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface StoreReview {
  id: string;
  store_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title?: string;
  content: string;
  helpful_count: number;
  response?: StoreReviewResponse;
  is_verified_purchase?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface StoreReviewResponse {
  id: string;
  review_id: string;
  store_owner_id: string;
  store_owner_name: string;
  content: string;
  created_at: string;
}

export interface StoreComment {
  id: string;
  store_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  parent_id?: string;
  replies?: StoreComment[];
  like_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateStoreData {
  name: string;
  category_id: string;
  description: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  location_type: 'physical' | 'online' | 'both';
  physical_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  operating_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  keywords?: string[];
  tags?: string[];
}

export interface UpdateStoreData extends Partial<CreateStoreData> {
  id: string;
}

export interface StoreFilters {
  category?: string;
  location?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in miles
  rating_min?: number;
  keyword?: string;
  sort_by?: 'name' | 'rating' | 'review_count' | 'created_at' | 'distance';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface StoreSearchResult {
  stores: Store[];
  categories: StoreCategory[];
  total: number;
  has_more: boolean;
  filters_applied: StoreFilters;
}

export interface CreateStoreReviewData {
  store_id: string;
  rating: number;
  title?: string;
  content: string;
}

export interface CreateStoreCommentData {
  store_id: string;
  content: string;
  parent_id?: string;
}

export interface CreateStoreCategoryData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order: number;
}

export interface StoreStats {
  total_stores: number;
  approved_stores: number;
  pending_stores: number;
  total_reviews: number;
  average_rating: number;
  categories_count: number;
  top_categories: Array<{
    category: StoreCategory;
    store_count: number;
  }>;
  recent_stores: Store[];
  featured_stores: Store[];
  top_rated_stores: Store[];
}

// Geolocation types
export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface NearbyStoresRequest {
  latitude: number;
  longitude: number;
  radius: number; // in miles
  category?: string;
  limit?: number;
}