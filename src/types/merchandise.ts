export interface MerchandiseItem {
  id: string;
  instructor_id: string;
  instructor_name: string;
  instructor_avatar?: string;
  name: string;
  description: string;
  category: MerchandiseCategory;
  base_price: number;
  instructor_commission_rate: number; // Percentage (e.g., 25 for 25%)
  platform_fee_rate: number; // Percentage (e.g., 10 for 10%)
  design_images: DesignImage[];
  product_options: ProductOption[];
  featured_image: string;
  gallery_images: string[];
  status: 'draft' | 'pending_approval' | 'approved' | 'suspended' | 'discontinued';
  featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  total_sales: number;
  total_revenue: number;
  avg_rating: number;
  review_count: number;
}

export interface DesignImage {
  id: string;
  url: string;
  alt_text?: string;
  design_type: 'front' | 'back' | 'sleeve' | 'mockup' | 'lifestyle';
  is_primary: boolean;
}

export interface ProductOption {
  id: string;
  type: 'size' | 'color' | 'style' | 'material';
  name: string;
  values: ProductOptionValue[];
  required: boolean;
}

export interface ProductOptionValue {
  id: string;
  name: string;
  value: string;
  price_modifier: number;
  inventory_count?: number;
  sku?: string;
  color_hex?: string; // For color options
  size_chart?: SizeChart; // For size options
}

export interface SizeChart {
  measurements: SizeMeasurement[];
  guide_image?: string;
  notes?: string;
}

export interface SizeMeasurement {
  size: string;
  chest?: number;
  waist?: number;
  length?: number;
  sleeve?: number;
  unit: 'inches' | 'cm';
}

export interface MerchandiseOrder {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  instructor_id: string;
  instructor_name: string;
  merchandise_id: string;
  merchandise_name: string;
  quantity: number;
  selected_options: SelectedOption[];
  unit_price: number;
  total_price: number;
  instructor_commission: number;
  platform_fee: number;
  shipping_cost: number;
  tax_amount: number;
  grand_total: number;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  fulfillment_status: 'pending' | 'processing' | 'printed' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface SelectedOption {
  option_id: string;
  option_type: string;
  option_name: string;
  value_id: string;
  value_name: string;
  value: string;
  price_modifier: number;
}

export interface InstructorMerchandiseStats {
  instructor_id: string;
  total_items: number;
  active_items: number;
  total_orders: number;
  total_revenue: number;
  total_commission: number;
  pending_commission: number;
  this_month_revenue: number;
  this_month_commission: number;
  top_selling_item?: {
    id: string;
    name: string;
    total_sales: number;
    revenue: number;
  };
  recent_orders: MerchandiseOrder[];
}

export interface CommissionPayout {
  id: string;
  instructor_id: string;
  instructor_name: string;
  period_start: string;
  period_end: string;
  total_orders: number;
  gross_revenue: number;
  commission_rate: number;
  commission_amount: number;
  platform_fees: number;
  processing_fees: number;
  adjustments: number;
  net_payout: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  payment_method: 'bank_transfer' | 'paypal' | 'stripe';
  payment_reference?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MerchandiseReview {
  id: string;
  merchandise_id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title?: string;
  content: string;
  images?: ReviewImage[];
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewImage {
  id: string;
  url: string;
  alt_text?: string;
}

export type MerchandiseCategory = 
  | 'tshirts'
  | 'hoodies'
  | 'tank_tops'
  | 'polo_shirts'
  | 'sweatshirts'
  | 'hats'
  | 'accessories'
  | 'activewear';

export interface MerchandiseFilters {
  search?: string;
  category?: MerchandiseCategory;
  instructor_id?: string;
  min_price?: number;
  max_price?: number;
  sizes?: string[];
  colors?: string[];
  featured_only?: boolean;
  sort_by?: 'popularity' | 'price' | 'newest' | 'rating' | 'name';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateMerchandiseData {
  name: string;
  description: string;
  category: MerchandiseCategory;
  base_price: number;
  design_files: File[];
  design_descriptions: {
    file_index: number;
    design_type: 'front' | 'back' | 'sleeve' | 'mockup' | 'lifestyle';
    alt_text?: string;
  }[];
  product_options: Omit<ProductOption, 'id'>[];
  tags: string[];
  featured_image_index?: number;
}

export interface MerchandiseQuote {
  merchandise_id: string;
  quantity: number;
  selected_options: {
    option_id: string;
    value_id: string;
  }[];
  base_price: number;
  option_modifications: number;
  subtotal: number;
  instructor_commission: number;
  platform_fee: number;
  tax_estimate: number;
  shipping_estimate: number;
  total_estimate: number;
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