export interface PromotionalProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  base_price: number;
  minimum_quantity: number;
  maximum_quantity?: number;
  dimensions?: ProductDimensions;
  materials: string[];
  customization_options: CustomizationOption[];
  templates: ProductTemplate[];
  featured_image: string;
  gallery_images: string[];
  turnaround_days: number;
  shipping_info: ShippingInfo;
  eligible_roles: UserRole[];
  status: 'active' | 'discontinued' | 'coming_soon';
  created_at: string;
  updated_at: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  design_file: string;
  category: 'business_card' | 'flyer' | 'banner' | 'ticket' | 'wristband' | 'sign';
  customizable_fields: CustomizableField[];
  price_modifier: number; // Additional cost for this template
}

export interface CustomizableField {
  id: string;
  name: string;
  type: 'text' | 'image' | 'color' | 'font' | 'size';
  required: boolean;
  max_length?: number;
  allowed_values?: string[];
  default_value?: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'size' | 'color' | 'material' | 'finish' | 'quantity';
  options: CustomizationChoice[];
  required: boolean;
  affects_price: boolean;
}

export interface CustomizationChoice {
  id: string;
  name: string;
  value: string;
  price_modifier: number;
  description?: string;
  preview_image?: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth?: number;
  unit: 'inches' | 'cm';
  weight?: number;
  weight_unit?: 'lbs' | 'kg';
}

export interface ShippingInfo {
  weight: number;
  weight_unit: 'lbs' | 'kg';
  dimensions: ProductDimensions;
  shipping_class: 'standard' | 'oversized' | 'fragile';
  pickup_available: boolean;
  pickup_locations?: PickupLocation[];
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  hours: string;
  instructions?: string;
}

export interface ProductOrder {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  product_id: string;
  product_name: string;
  template_id?: string;
  template_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customizations: OrderCustomization[];
  artwork_submissions: ArtworkSubmission[];
  shipping_method: 'standard' | 'expedited' | 'pickup';
  shipping_address?: ShippingAddress;
  pickup_location_id?: string;
  billing_address: ShippingAddress;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'artwork_review' | 'approved' | 'production' | 'shipped' | 'completed' | 'cancelled';
  artwork_approved: boolean;
  artwork_approved_at?: string;
  artwork_notes?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderCustomization {
  option_id: string;
  option_name: string;
  choice_id: string;
  choice_name: string;
  choice_value: string;
  price_modifier: number;
}

export interface ArtworkSubmission {
  id: string;
  order_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  field_id: string;
  field_name: string;
  uploaded_at: string;
  approved: boolean;
  revision_notes?: string;
}

export interface ShippingAddress {
  name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
}

export type ProductCategory = 
  | 'business_cards'
  | 'flyers'
  | 'banners'
  | 'tickets'
  | 'wristbands'
  | 'lawn_signs'
  | 'posters'
  | 'table_tents'
  | 'stickers'
  | 'brochures';

export type UserRole = 
  | 'instructor'
  | 'event_organizer'
  | 'venue_owner'
  | 'community_leader'
  | 'premium_member';

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  min_price?: number;
  max_price?: number;
  user_role?: UserRole;
  sort_by?: 'name' | 'price' | 'popularity' | 'newest';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateProductOrderData {
  product_id: string;
  template_id?: string;
  quantity: number;
  customizations: {
    option_id: string;
    choice_id: string;
  }[];
  custom_fields: {
    field_id: string;
    value: string;
  }[];
  artwork_files?: File[];
  shipping_method: 'standard' | 'expedited' | 'pickup';
  shipping_address?: Omit<ShippingAddress, 'country'>;
  pickup_location_id?: string;
  billing_address: Omit<ShippingAddress, 'country'>;
}

export interface ProductQuote {
  product_id: string;
  template_id?: string;
  quantity: number;
  base_price: number;
  customization_costs: number;
  template_cost: number;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  turnaround_days: number;
  estimated_delivery: string;
}