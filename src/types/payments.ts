export interface VODPurchase {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  vod_class_id: string;
  vod_class_title: string;
  instructor_id: string;
  instructor_name: string;
  purchase_price: number;
  instructor_commission: number;
  instructor_commission_rate: number; // Percentage (e.g., 70 for 70%)
  platform_fee: number;
  platform_fee_rate: number; // Percentage (e.g., 30 for 30%)
  processing_fee: number;
  payment_method: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';
  payment_intent_id: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  access_granted_at?: string;
  access_expires_at?: string; // For rental-style access
  purchase_type: 'lifetime' | 'rental' | 'subscription';
  created_at: string;
  updated_at: string;
}

export interface InstructorPayout {
  id: string;
  instructor_id: string;
  instructor_name: string;
  payout_period: 'weekly' | 'biweekly' | 'monthly';
  period_start_date: string;
  period_end_date: string;
  total_purchases: number;
  gross_revenue: number;
  total_commission: number;
  platform_fees_deducted: number;
  processing_fees_deducted: number;
  tax_withholding?: number;
  net_payout_amount: number;
  payout_method: 'bank_transfer' | 'paypal' | 'stripe_express';
  payout_account_id: string;
  payout_status: 'pending' | 'processing' | 'completed' | 'failed' | 'on_hold';
  payout_reference?: string;
  processed_at?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutSchedule {
  instructor_id: string;
  payout_frequency: 'weekly' | 'biweekly' | 'monthly';
  payout_day: number; // Day of week (0-6) for weekly, day of month (1-31) for monthly
  minimum_payout_amount: number;
  auto_payout_enabled: boolean;
  payout_method: 'bank_transfer' | 'paypal' | 'stripe_express';
  payout_account_details: PayoutAccountDetails;
  tax_information?: TaxInformation;
  created_at: string;
  updated_at: string;
}

export interface PayoutAccountDetails {
  account_type: 'bank_transfer' | 'paypal' | 'stripe_express';
  account_id: string;
  account_name: string;
  masked_account_info: string; // e.g., "****1234" for bank accounts
  verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected' | 'requires_documents';
  last_verified_at?: string;
}

export interface TaxInformation {
  tax_id_type: 'ssn' | 'ein' | 'itin';
  tax_id_masked: string; // e.g., "***-**-1234"
  business_type: 'individual' | 'llc' | 'corporation' | 'partnership';
  tax_classification: string;
  w9_form_url?: string;
  tax_withholding_rate?: number;
  backup_withholding_required: boolean;
}

export interface VODAccessControl {
  id: string;
  user_id: string;
  vod_class_id: string;
  purchase_id: string;
  access_type: 'lifetime' | 'rental' | 'subscription';
  access_granted_at: string;
  access_expires_at?: string;
  total_watch_time_seconds: number;
  watch_sessions: WatchSession[];
  download_enabled: boolean;
  download_count: number;
  max_downloads?: number;
  sharing_enabled: boolean;
  quality_access: VideoQuality[];
  created_at: string;
  updated_at: string;
}

export interface WatchSession {
  id: string;
  user_id: string;
  vod_class_id: string;
  session_start: string;
  session_end?: string;
  watch_duration_seconds: number;
  video_position_seconds: number;
  completed_percentage: number;
  device_type: 'mobile' | 'tablet' | 'desktop' | 'tv';
  ip_address: string;
  user_agent: string;
}

export interface VideoQuality {
  resolution: '360p' | '480p' | '720p' | '1080p' | '4k';
  bitrate: number;
  file_size_mb: number;
  available: boolean;
}

export interface PaymentIntent {
  id: string;
  user_id: string;
  vod_class_id: string;
  amount: number;
  currency: 'usd';
  payment_method_types: string[];
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  metadata: {
    vod_class_id: string;
    instructor_id: string;
    purchase_type: string;
  };
  created_at: string;
  updated_at: string;
}

export interface RefundRequest {
  id: string;
  purchase_id: string;
  user_id: string;
  instructor_id: string;
  refund_amount: number;
  refund_reason: 'customer_request' | 'instructor_cancellation' | 'technical_issue' | 'content_violation' | 'chargeback';
  refund_type: 'full' | 'partial';
  customer_reason?: string;
  admin_notes?: string;
  status: 'pending' | 'approved' | 'denied' | 'processed' | 'failed';
  processed_at?: string;
  refund_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface RevenueReport {
  instructor_id: string;
  report_period: string; // YYYY-MM format
  total_purchases: number;
  total_revenue: number;
  total_commission: number;
  platform_fees: number;
  processing_fees: number;
  refunds_amount: number;
  net_earnings: number;
  top_selling_classes: {
    vod_class_id: string;
    title: string;
    purchases: number;
    revenue: number;
  }[];
  daily_breakdown: {
    date: string;
    purchases: number;
    revenue: number;
    commission: number;
  }[];
  payout_summary: {
    payouts_received: number;
    total_payout_amount: number;
    pending_payout_amount: number;
  };
}

export interface CreateVODPurchaseData {
  vod_class_id: string;
  purchase_type: 'lifetime' | 'rental';
  payment_method_id?: string;
  use_saved_payment_method?: boolean;
  promotional_code?: string;
}

export interface ProcessPaymentData {
  payment_intent_id: string;
  payment_method_id: string;
  billing_details?: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

export interface PayoutEarnings {
  instructor_id: string;
  total_pending_amount: number;
  total_available_amount: number;
  next_payout_date: string;
  last_payout_amount?: number;
  last_payout_date?: string;
  current_period_earnings: number;
  current_period_purchases: number;
  lifetime_earnings: number;
  lifetime_purchases: number;
}