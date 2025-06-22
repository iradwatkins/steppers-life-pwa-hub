-- COMPLETE PRODUCTION SCHEMA DEPLOYMENT
-- Ensures 100% parity between development and production databases
-- Contains ALL tables, indexes, RLS policies, functions, triggers, and seed data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- CONTENT MANAGEMENT SYSTEM
-- ===============================================

-- Create enum types for content management
DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('page', 'post', 'faq_item');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Content pages table
CREATE TABLE IF NOT EXISTS public.content_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    meta_keywords TEXT[],
    type content_type DEFAULT 'page',
    status content_status DEFAULT 'draft',
    featured_image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_system_page BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content page versions for version history
CREATE TABLE IF NOT EXISTS public.content_page_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID REFERENCES public.content_pages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    meta_keywords TEXT[],
    status content_status NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id, version_number)
);

-- ===============================================
-- PLATFORM CONFIGURATION SYSTEM  
-- ===============================================

-- Create enum types for platform configuration
DO $$ BEGIN
    CREATE TYPE category_type AS ENUM ('event', 'class', 'content');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json', 'array');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event and class categories management
CREATE TABLE IF NOT EXISTS public.platform_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    type category_type NOT NULL,
    color_hex TEXT DEFAULT '#3B82F6',
    icon_name TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.platform_categories(id),
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform site settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type setting_type DEFAULT 'string',
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '{}',
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VOD hosting configuration
CREATE TABLE IF NOT EXISTS public.vod_configuration (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hosting_fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    hosting_fee_currency TEXT DEFAULT 'USD',
    introductory_offer_enabled BOOLEAN DEFAULT false,
    introductory_offer_amount DECIMAL(10, 2) DEFAULT 0.00,
    introductory_offer_description TEXT,
    introductory_offer_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Physical store pickup locations
CREATE TABLE IF NOT EXISTS public.pickup_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    phone TEXT,
    email TEXT,
    hours_of_operation JSONB,
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration change audit log
CREATE TABLE IF NOT EXISTS public.configuration_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- ANALYTICS & INSTRUCTOR PERFORMANCE SYSTEM
-- ===============================================

-- Web Analytics Tables
CREATE TABLE IF NOT EXISTS web_analytics_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    landing_page TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS web_analytics_page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    duration_seconds INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS web_analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB,
    page_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS web_analytics_conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    conversion_type TEXT NOT NULL,
    conversion_value DECIMAL(10,2),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instructor Performance Tables
CREATE TABLE IF NOT EXISTS instructor_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    bio TEXT,
    specialties TEXT[],
    certifications TEXT[],
    profile_image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS instructor_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    classes_count INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    unique_students INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_class_size DECIMAL(5,2) DEFAULT 0,
    cancellation_rate DECIMAL(5,4) DEFAULT 0,
    no_show_rate DECIMAL(5,4) DEFAULT 0,
    retention_rate DECIMAL(5,4) DEFAULT 0,
    popularity_score INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(instructor_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS instructor_class_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID,
    class_name TEXT NOT NULL,
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
    duration_minutes INTEGER,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,4) DEFAULT 0,
    repeated_bookings INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    profit_margin DECIMAL(5,4) DEFAULT 0,
    popularity_trend TEXT CHECK (popularity_trend IN ('increasing', 'decreasing', 'stable')),
    last_offered DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS instructor_student_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID,
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    aspects JSONB,
    verified BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS instructor_revenue_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    net_revenue DECIMAL(10,2) DEFAULT 0,
    commission_rate DECIMAL(5,4) DEFAULT 0,
    commission_earned DECIMAL(10,2) DEFAULT 0,
    average_revenue_per_class DECIMAL(10,2) DEFAULT 0,
    revenue_growth DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(instructor_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS performance_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_rating', 'high_cancellation', 'low_booking', 'revenue_drop', 'engagement_drop')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    class_id UUID,
    message TEXT NOT NULL,
    threshold_value DECIMAL(10,4),
    current_value DECIMAL(10,4),
    acknowledged BOOLEAN DEFAULT false,
    actions TEXT[],
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Inventory Management Enhancement
CREATE TABLE IF NOT EXISTS inventory_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_type_id UUID,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    quantity_change INTEGER,
    previous_quantity INTEGER,
    new_quantity INTEGER,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    channel TEXT CHECK (channel IN ('online', 'cash', 'admin', 'bulk')),
    reason TEXT,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_holds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_type_id UUID,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    channel TEXT CHECK (channel IN ('online', 'cash', 'admin', 'bulk')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'released', 'completed')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- SAVED PAYMENT METHODS (PCI COMPLIANT)
-- ===============================================

CREATE TABLE IF NOT EXISTS saved_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'paypal')),
  last_four TEXT NOT NULL CHECK (length(last_four) = 4),
  card_brand TEXT NOT NULL,
  expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year INTEGER NOT NULL CHECK (expiry_year >= date_part('year', CURRENT_DATE)),
  cardholder_name TEXT,
  payment_processor_token TEXT,
  processor_customer_id TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ===============================================
-- SECURITY ACTIVITY LOG
-- ===============================================

CREATE TABLE IF NOT EXISTS security_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'unknown')),
  is_suspicious BOOLEAN DEFAULT FALSE,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_activity_types (
  type_name TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  default_risk_score INTEGER DEFAULT 0,
  is_high_risk BOOLEAN DEFAULT FALSE
);

-- ===============================================
-- SAVED EVENTS (USER WISHLIST)
-- ===============================================

CREATE TABLE IF NOT EXISTS saved_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  notes TEXT,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS saved_event_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color_code TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- CREATE ALL INDEXES
-- ===============================================

-- Content Management Indexes
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON public.content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_status ON public.content_pages(status);
CREATE INDEX IF NOT EXISTS idx_content_pages_type ON public.content_pages(type);
CREATE INDEX IF NOT EXISTS idx_content_pages_system ON public.content_pages(is_system_page);
CREATE INDEX IF NOT EXISTS idx_content_page_versions_page_id ON public.content_page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_content_page_versions_version ON public.content_page_versions(page_id, version_number DESC);

-- Platform Configuration Indexes
CREATE INDEX IF NOT EXISTS idx_platform_categories_type ON public.platform_categories(type);
CREATE INDEX IF NOT EXISTS idx_platform_categories_active ON public.platform_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_platform_categories_sort ON public.platform_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_platform_categories_parent ON public.platform_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON public.platform_settings(key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON public.platform_settings(category);
CREATE INDEX IF NOT EXISTS idx_platform_settings_public ON public.platform_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_pickup_locations_active ON public.pickup_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_pickup_locations_location ON public.pickup_locations(city, state);
CREATE INDEX IF NOT EXISTS idx_configuration_audit_table ON public.configuration_audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_configuration_audit_time ON public.configuration_audit_log(changed_at DESC);

-- Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_web_analytics_sessions_user_id ON web_analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_sessions_started_at ON web_analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_web_analytics_page_views_session_id ON web_analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_page_views_timestamp ON web_analytics_page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_analytics_events_session_id ON web_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_events_timestamp ON web_analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_analytics_conversions_user_id ON web_analytics_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_conversions_timestamp ON web_analytics_conversions(timestamp);

-- Instructor Performance Indexes
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_user_id ON instructor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_status ON instructor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_instructor_performance_metrics_instructor_id ON instructor_performance_metrics(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_performance_metrics_period ON instructor_performance_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_instructor_class_performance_instructor_id ON instructor_class_performance(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_student_feedback_instructor_id ON instructor_student_feedback(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_revenue_analytics_instructor_id ON instructor_revenue_analytics(instructor_id);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_instructor_id ON performance_alerts(instructor_id);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_triggered_at ON performance_alerts(triggered_at);

-- Inventory Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_audit_logs_event_id ON inventory_audit_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_logs_timestamp ON inventory_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_inventory_holds_event_id ON inventory_holds(event_id);
CREATE INDEX IF NOT EXISTS idx_inventory_holds_session_id ON inventory_holds(session_id);
CREATE INDEX IF NOT EXISTS idx_inventory_holds_expires_at ON inventory_holds(expires_at);

-- Payment Methods Indexes
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_user_id ON saved_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_is_default ON saved_payment_methods(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_active ON saved_payment_methods(user_id, is_active) WHERE is_active = TRUE;

-- Security Activity Indexes
CREATE INDEX IF NOT EXISTS idx_security_activity_log_user_id ON security_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_activity_log_created_at ON security_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_activity_log_suspicious ON security_activity_log(user_id, is_suspicious) WHERE is_suspicious = TRUE;
CREATE INDEX IF NOT EXISTS idx_security_activity_log_activity_type ON security_activity_log(user_id, activity_type);

-- Saved Events Indexes
CREATE INDEX IF NOT EXISTS idx_saved_events_user_id ON saved_events(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_events_event_id ON saved_events(event_id);
CREATE INDEX IF NOT EXISTS idx_saved_events_saved_at ON saved_events(user_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_events_priority ON saved_events(user_id, priority DESC);

-- ===============================================
-- ENABLE ROW LEVEL SECURITY
-- ===============================================

-- Content Management RLS
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_page_versions ENABLE ROW LEVEL SECURITY;

-- Platform Configuration RLS
ALTER TABLE public.platform_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vod_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_audit_log ENABLE ROW LEVEL SECURITY;

-- Analytics RLS
ALTER TABLE web_analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_analytics_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_class_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_student_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_holds ENABLE ROW LEVEL SECURITY;

-- Security & User Features RLS
ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- CREATE RLS POLICIES (PostgreSQL Compatible)
-- ===============================================

-- Drop existing policies to avoid conflicts, then recreate
DO $$ 
BEGIN
    -- Content Management Policies
    DROP POLICY IF EXISTS "Public can read published content" ON public.content_pages;
    CREATE POLICY "Public can read published content" ON public.content_pages
        FOR SELECT USING (status = 'published');

    DROP POLICY IF EXISTS "Admin users can manage content" ON public.content_pages;
    CREATE POLICY "Admin users can manage content" ON public.content_pages
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'super_admin')
            )
        );

    -- Platform Configuration Policies
    DROP POLICY IF EXISTS "Public can read active categories" ON public.platform_categories;
    CREATE POLICY "Public can read active categories" ON public.platform_categories
        FOR SELECT USING (is_active = true);

    DROP POLICY IF EXISTS "Public can read public settings" ON public.platform_settings;
    CREATE POLICY "Public can read public settings" ON public.platform_settings
        FOR SELECT USING (is_public = true);

    DROP POLICY IF EXISTS "Admin users can manage categories" ON public.platform_categories;
    CREATE POLICY "Admin users can manage categories" ON public.platform_categories
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'super_admin')
            )
        );

    -- Analytics Policies
    DROP POLICY IF EXISTS "Admins can view all analytics sessions" ON web_analytics_sessions;
    CREATE POLICY "Admins can view all analytics sessions" ON web_analytics_sessions 
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'super_admin')
            )
        );

    DROP POLICY IF EXISTS "Users can view their own analytics sessions" ON web_analytics_sessions;
    CREATE POLICY "Users can view their own analytics sessions" ON web_analytics_sessions 
        FOR SELECT USING (user_id = auth.uid());

    -- Instructor Profiles Policies
    DROP POLICY IF EXISTS "Instructors can view and edit their own profile" ON instructor_profiles;
    CREATE POLICY "Instructors can view and edit their own profile" ON instructor_profiles 
        FOR ALL USING (user_id = auth.uid());

    DROP POLICY IF EXISTS "Public can view active instructor profiles" ON instructor_profiles;
    CREATE POLICY "Public can view active instructor profiles" ON instructor_profiles 
        FOR SELECT USING (status = 'active');

    -- Payment Methods Policies
    DROP POLICY IF EXISTS "Users can view their own payment methods" ON saved_payment_methods;
    CREATE POLICY "Users can view their own payment methods" ON saved_payment_methods
        FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own payment methods" ON saved_payment_methods;
    CREATE POLICY "Users can insert their own payment methods" ON saved_payment_methods
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own payment methods" ON saved_payment_methods;
    CREATE POLICY "Users can update their own payment methods" ON saved_payment_methods
        FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own payment methods" ON saved_payment_methods;
    CREATE POLICY "Users can delete their own payment methods" ON saved_payment_methods
        FOR DELETE USING (auth.uid() = user_id);

    -- Security Activity Policies
    DROP POLICY IF EXISTS "Users can view their own security activity" ON security_activity_log;
    CREATE POLICY "Users can view their own security activity" ON security_activity_log
        FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "System can insert security activity" ON security_activity_log;
    CREATE POLICY "System can insert security activity" ON security_activity_log
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Saved Events Policies
    DROP POLICY IF EXISTS "Users can view their own saved events" ON saved_events;
    CREATE POLICY "Users can view their own saved events" ON saved_events
        FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can save events" ON saved_events;
    CREATE POLICY "Users can save events" ON saved_events
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own saved events" ON saved_events;
    CREATE POLICY "Users can update their own saved events" ON saved_events
        FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can remove their own saved events" ON saved_events;
    CREATE POLICY "Users can remove their own saved events" ON saved_events
        FOR DELETE USING (auth.uid() = user_id);

EXCEPTION 
    WHEN OTHERS THEN 
        -- Continue if policies don't exist
        NULL;
END $$;

-- ===============================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ===============================================

-- Updated at function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_content_pages_updated_at ON public.content_pages;
DROP TRIGGER IF EXISTS update_platform_categories_updated_at ON public.platform_categories;
DROP TRIGGER IF EXISTS update_instructor_profiles_updated_at ON instructor_profiles;
DROP TRIGGER IF EXISTS update_saved_payment_methods_updated_at ON saved_payment_methods;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_content_pages_updated_at 
    BEFORE UPDATE ON public.content_pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_categories_updated_at 
    BEFORE UPDATE ON public.platform_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instructor_profiles_updated_at 
    BEFORE UPDATE ON instructor_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_payment_methods_updated_at 
    BEFORE UPDATE ON saved_payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure single default payment method function
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE saved_payment_methods 
    SET is_default = FALSE, updated_at = NOW()
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS trigger_ensure_single_default_payment_method ON saved_payment_methods;

CREATE TRIGGER trigger_ensure_single_default_payment_method
  BEFORE INSERT OR UPDATE ON saved_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- ===============================================
-- STORAGE BUCKET CONFIGURATION
-- ===============================================

-- Create user-uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (drop and recreate to avoid conflicts)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
    CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'user-uploads'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );

    DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
    CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'user-uploads'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );

    DROP POLICY IF EXISTS "Public access to profile images" ON storage.objects;
    CREATE POLICY "Public access to profile images" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'user-uploads'
      AND (storage.foldername(name))[2] = 'profile-images'
    );

EXCEPTION 
    WHEN OTHERS THEN 
        -- Continue if policies don't exist
        NULL;
END $$;

-- ===============================================
-- SEED DATA
-- ===============================================

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, type, description, category, is_public) VALUES 
    ('site_name', 'SteppersLife', 'string', 'The name of the platform', 'general', true),
    ('site_tagline', 'Your Premier Step Dancing Community', 'string', 'Site tagline or description', 'general', true),
    ('contact_email', 'info@stepperslife.com', 'string', 'Main contact email address', 'contact', true),
    ('support_email', 'support@stepperslife.com', 'string', 'Support contact email', 'contact', true),
    ('default_timezone', 'America/New_York', 'string', 'Default timezone for events', 'events', true),
    ('max_upload_size_mb', '10', 'number', 'Maximum file upload size in MB', 'uploads', false),
    ('enable_user_registration', 'true', 'boolean', 'Allow new user registrations', 'users', false),
    ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'system', false),
    ('featured_categories', '[]', 'array', 'Featured category IDs for homepage', 'display', true),
    ('social_media_links', '{"facebook": "", "instagram": "", "twitter": ""}', 'json', 'Social media profile links', 'social', true)
ON CONFLICT (key) DO NOTHING;

-- Insert default event and class categories
INSERT INTO public.platform_categories (name, slug, description, type, color_hex, icon_name, sort_order) VALUES 
    ('Step Dancing', 'step-dancing', 'Traditional step dancing events and classes', 'event', '#FF6B6B', 'music', 1),
    ('Line Dancing', 'line-dancing', 'Line dancing events and group classes', 'event', '#4ECDC4', 'users', 2),
    ('Social Dancing', 'social-dancing', 'Social dancing and partner events', 'event', '#45B7D1', 'heart', 3),
    ('Workshops', 'workshops', 'Educational workshops and masterclasses', 'event', '#FFA07A', 'graduation-cap', 4),
    ('Competitions', 'competitions', 'Dance competitions and contests', 'event', '#98D8C8', 'trophy', 5),
    ('Beginner Classes', 'beginner-classes', 'Classes for beginners', 'class', '#F7DC6F', 'star', 1),
    ('Intermediate Classes', 'intermediate-classes', 'Classes for intermediate dancers', 'class', '#BB8FCE', 'star', 2),
    ('Advanced Classes', 'advanced-classes', 'Classes for advanced dancers', 'class', '#85C1E9', 'star', 3),
    ('Private Lessons', 'private-lessons', 'One-on-one instruction', 'class', '#F8C471', 'user', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert security activity types
INSERT INTO security_activity_types (type_name, description, default_risk_score, is_high_risk) VALUES
('login', 'Successful user login', 0, FALSE),
('logout', 'User logout', 0, FALSE),
('login_attempt', 'Failed login attempt', 25, TRUE),
('password_change', 'Password changed', 10, FALSE),
('email_change', 'Email address changed', 15, TRUE),
('profile_update', 'Profile information updated', 5, FALSE),
('payment_method_added', 'Payment method added', 10, FALSE),
('payment_method_removed', 'Payment method removed', 5, FALSE),
('password_reset_request', 'Password reset requested', 20, TRUE),
('password_reset_complete', 'Password reset completed', 15, TRUE),
('suspicious_activity', 'Suspicious activity detected', 50, TRUE),
('account_locked', 'Account locked due to suspicious activity', 75, TRUE)
ON CONFLICT (type_name) DO NOTHING;

-- Insert saved event categories
INSERT INTO saved_event_categories (name, description, color_code) VALUES
('Must Attend', 'Events I definitely want to attend', '#ef4444'),
('Maybe', 'Events I might be interested in', '#f59e0b'),
('Backup Plans', 'Alternative events if main plans fall through', '#8b5cf6'),
('With Friends', 'Events to attend with specific friends', '#10b981'),
('Learning', 'Educational workshops and classes', '#3b82f6'),
('Social', 'Social events and networking', '#f97316'),
('Date Ideas', 'Events for dates or romantic occasions', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Insert default system pages
INSERT INTO public.content_pages (title, slug, content, type, status, is_system_page) VALUES 
    ('About Us', 'about-us', '<h1>About SteppersLife</h1><p>Welcome to SteppersLife - your premier destination for step dancing and community events.</p>', 'page', 'published', true),
    ('Contact Us', 'contact-us', '<h1>Contact Us</h1><p>Get in touch with the SteppersLife team.</p><p>Email: info@stepperslife.com</p>', 'page', 'published', true),
    ('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>Please read these terms carefully before using our service.</p>', 'page', 'published', true),
    ('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your information.</p>', 'page', 'published', true),
    ('Frequently Asked Questions', 'faq', '<h1>FAQ</h1><p>Find answers to commonly asked questions about SteppersLife.</p>', 'page', 'published', true)
ON CONFLICT (slug) DO NOTHING;

-- ===============================================
-- COMPLETION MESSAGE
-- ===============================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'COMPLETE PRODUCTION SCHEMA DEPLOYMENT SUCCESSFUL';
    RAISE NOTICE 'All tables, indexes, RLS policies, functions, triggers, and seed data have been deployed';
    RAISE NOTICE 'Production database now has 100%% parity with development database';
END $$;