/**
 * Service Directory Types
 * 
 * Types for the Community Directory - Services feature (Epic K)
 * Supporting service provider listings, categories, reviews, and recovery-focused services
 */

export interface Service {
  id: string;
  business_name: string;
  slug: string;
  category_id: string;
  category?: ServiceCategory;
  service_description: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  location_type: 'physical' | 'online' | 'mobile' | 'both';
  physical_address?: string;
  service_area_notes?: string;
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
    notes?: string;
  };
  images: ServiceImage[];
  portfolio_images?: ServicePortfolio[];
  service_offerings: string[];
  specializations?: string[];
  certifications?: string[];
  experience_years?: number;
  keywords?: string[];
  tags?: string[];
  
  // Community features
  rating: number;
  review_count: number;
  reviews?: ServiceReview[];
  
  // Recovery-focused features
  insurance_accepted?: string[];
  accessibility_features?: string[];
  languages_spoken?: string[];
  emergency_availability?: boolean;
  
  // Metadata
  owner_id: string;
  owner_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_featured: boolean;
  is_verified: boolean;
  verification_date?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order: number;
  service_count: number;
  is_active: boolean;
  is_recovery_focused: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceImage {
  id: string;
  service_id: string;
  url: string;
  alt_text?: string;
  caption?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ServicePortfolio {
  id: string;
  service_id: string;
  title: string;
  description?: string;
  url: string;
  alt_text?: string;
  display_order: number;
  project_date?: string;
  created_at: string;
}

export interface ServiceReview {
  id: string;
  service_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title?: string;
  content: string;
  service_used?: string;
  helpful_count: number;
  response?: ServiceReviewResponse;
  is_verified_booking?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ServiceReviewResponse {
  id: string;
  review_id: string;
  service_owner_id: string;
  service_owner_name: string;
  content: string;
  created_at: string;
}

export interface ServiceComment {
  id: string;
  service_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  parent_id?: string;
  replies?: ServiceComment[];
  like_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ServiceInquiry {
  id: string;
  service_id: string;
  inquirer_id: string;
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone?: string;
  service_requested: string;
  message: string;
  preferred_contact_method: 'email' | 'phone' | 'either';
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateServiceData {
  business_name: string;
  category_id: string;
  service_description: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  location_type: 'physical' | 'online' | 'mobile' | 'both';
  physical_address?: string;
  service_area_notes?: string;
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
    notes?: string;
  };
  service_offerings: string[];
  specializations?: string[];
  certifications?: string[];
  experience_years?: number;
  keywords?: string[];
  tags?: string[];
  insurance_accepted?: string[];
  accessibility_features?: string[];
  languages_spoken?: string[];
  emergency_availability?: boolean;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
}

export interface ServiceFilters {
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
  service_offering?: string;
  specialization?: string;
  insurance?: string;
  emergency_available?: boolean;
  verified_only?: boolean;
  sort_by?: 'business_name' | 'rating' | 'review_count' | 'created_at' | 'distance' | 'experience_years';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface ServiceSearchResult {
  services: Service[];
  categories: ServiceCategory[];
  total: number;
  has_more: boolean;
  filters_applied: ServiceFilters;
}

export interface CreateServiceReviewData {
  service_id: string;
  rating: number;
  title?: string;
  content: string;
  service_used?: string;
}

export interface CreateServiceCommentData {
  service_id: string;
  content: string;
  parent_id?: string;
}

export interface CreateServiceInquiryData {
  service_id: string;
  service_requested: string;
  message: string;
  preferred_contact_method: 'email' | 'phone' | 'either';
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
}

export interface CreateServiceCategoryData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order: number;
  is_recovery_focused: boolean;
}

export interface ServiceStats {
  total_services: number;
  approved_services: number;
  pending_services: number;
  verified_services: number;
  total_reviews: number;
  average_rating: number;
  categories_count: number;
  recovery_focused_count: number;
  emergency_available_count: number;
  top_categories: Array<{
    category: ServiceCategory;
    service_count: number;
  }>;
  top_specializations: Array<{
    specialization: string;
    count: number;
  }>;
  recent_services: Service[];
  featured_services: Service[];
  top_rated_services: Service[];
}

// Geolocation types (reused from store)
export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface NearbyServicesRequest {
  latitude: number;
  longitude: number;
  radius: number; // in miles
  category?: string;
  service_offering?: string;
  emergency_only?: boolean;
  limit?: number;
}