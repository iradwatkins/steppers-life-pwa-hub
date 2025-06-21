// Shared interfaces for community listings
export interface BaseLocation {
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_online_only: boolean;
  service_area_notes?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_linkedin?: string;
}

export interface OperatingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  notes?: string;
}

export interface ListingImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface BaseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRating {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number; // 1-5
  created_at: string;
}

export interface UserReview {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface UserComment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  parent_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  replies: UserComment[];
}

// Store-specific types (Epic J)
export interface StoreCategory extends BaseCategory {}

export interface Store {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category: StoreCategory;
  
  // Location & Contact
  location: BaseLocation;
  contact: ContactInfo;
  operating_hours?: OperatingHours;
  
  // Content
  images: ListingImage[];
  keywords: string[];
  
  // User-generated content
  rating_average: number;
  rating_count: number;
  ratings: UserRating[];
  reviews: UserReview[];
  comments: UserComment[];
  
  // Meta
  owner_user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_featured: boolean;
  featured_until?: string;
  created_at: string;
  updated_at: string;
  
  // Analytics
  view_count: number;
  contact_count: number;
}

// Service-specific types (Epic K)
export interface ServiceCategory extends BaseCategory {}

export interface Service {
  id: string;
  business_name: string;
  description: string;
  category_id: string;
  category: ServiceCategory;
  
  // Location & Contact
  location: BaseLocation;
  contact: ContactInfo;
  operating_hours?: OperatingHours;
  
  // Content
  images: ListingImage[];
  portfolio_images: ListingImage[];
  keywords: string[];
  
  // Service-specific fields
  service_types: string[];
  years_experience?: number;
  certifications: string[];
  
  // User-generated content
  rating_average: number;
  rating_count: number;
  ratings: UserRating[];
  reviews: UserReview[];
  comments: UserComment[];
  
  // Meta
  owner_user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_featured: boolean;
  featured_until?: string;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  
  // Analytics
  view_count: number;
  contact_count: number;
}

// Form submission types
export interface CreateStoreData {
  name: string;
  description: string;
  category_id: string;
  category_suggestion?: string;
  
  // Location
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_online_only: boolean;
  
  // Contact
  email?: string;
  phone?: string;
  website?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  
  // Hours
  operating_hours?: OperatingHours;
  
  // Content
  keywords: string[];
  images?: File[];
}

export interface CreateServiceData {
  business_name: string;
  description: string;
  category_id: string;
  category_suggestion?: string;
  
  // Location
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_online_only: boolean;
  service_area_notes?: string;
  
  // Contact
  email?: string;
  phone?: string;
  website?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  
  // Hours
  operating_hours?: OperatingHours;
  
  // Content
  keywords: string[];
  images?: File[];
  portfolio_images?: File[];
  
  // Service-specific
  service_types: string[];
  years_experience?: number;
  certifications: string[];
}

export interface UpdateStoreData extends Partial<CreateStoreData> {
  id: string;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
}

// Search and filtering
export interface CommunityListFilters {
  type?: 'stores' | 'services' | 'all';
  category?: string;
  location?: string;
  city?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  radius_miles?: number;
  search?: string;
  rating_min?: number;
  is_featured?: boolean;
  is_verified?: boolean; // For services only
  sort_by?: 'name' | 'rating' | 'created_at' | 'distance' | 'view_count';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Admin management types
export interface CategorySuggestion {
  id: string;
  suggested_name: string;
  type: 'store' | 'service';
  suggested_by_user_id: string;
  suggested_by_user_name: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationAction {
  id: string;
  target_type: 'store' | 'service' | 'review' | 'comment';
  target_id: string;
  action: 'approve' | 'reject' | 'suspend' | 'feature' | 'unfeature';
  reason?: string;
  admin_user_id: string;
  admin_user_name: string;
  created_at: string;
}

// Combined listing type for unified displays
export type CommunityListing = Store | Service;

// Type guards
export function isStore(listing: CommunityListing): listing is Store {
  return 'name' in listing;
}

export function isService(listing: CommunityListing): listing is Service {
  return 'business_name' in listing;
}

// Analytics and stats
export interface CommunityStats {
  total_stores: number;
  total_services: number;
  total_categories: number;
  total_reviews: number;
  average_rating: number;
  pending_approvals: number;
  category_suggestions: number;
  
  // Top performers
  top_rated_stores: Store[];
  top_rated_services: Service[];
  most_viewed_stores: Store[];
  most_viewed_services: Service[];
  recent_listings: CommunityListing[];
  
  // Category breakdowns
  store_categories: Array<{
    category: StoreCategory;
    count: number;
    average_rating: number;
  }>;
  service_categories: Array<{
    category: ServiceCategory;
    count: number;
    average_rating: number;
  }>;
}