-- ======================================================================
-- COMPLETE PRODUCTION DATABASE SYNC SCRIPT
-- Execute this entire script in Supabase Dashboard SQL Editor
-- This combines all development migrations to sync production database
-- ======================================================================

-- ===============================================
-- 1. INITIAL SCHEMA (Core Tables)
-- ===============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'organizer', 'super_admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE ticket_status AS ENUM ('active', 'sold', 'reserved', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role user_role DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event organizers/promoters
CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    organization_name TEXT NOT NULL,
    description TEXT,
    website_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    capacity INTEGER,
    description TEXT,
    amenities JSONB,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organizer_id UUID REFERENCES public.organizers(id),
    venue_id UUID REFERENCES public.venues(id),
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    category TEXT,
    tags TEXT[],
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone TEXT DEFAULT 'America/New_York',
    is_online BOOLEAN DEFAULT false,
    online_link TEXT,
    status event_status DEFAULT 'draft',
    featured_image_url TEXT,
    gallery_images TEXT[],
    max_attendees INTEGER,
    age_restriction TEXT,
    dress_code TEXT,
    parking_info TEXT,
    additional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket types for events
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity_available INTEGER NOT NULL,
    quantity_sold INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sale_start_date TIMESTAMP WITH TIME ZONE,
    sale_end_date TIMESTAMP WITH TIME ZONE,
    max_per_order INTEGER DEFAULT 10,
    includes_perks JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seating sections for venues
CREATE TABLE IF NOT EXISTS public.seating_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id),
    event_id UUID REFERENCES public.events(id),
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    price_modifier DECIMAL(5, 2) DEFAULT 1.00,
    section_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual tickets
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_type_id UUID REFERENCES public.ticket_types(id),
    seating_section_id UUID REFERENCES public.seating_sections(id),
    seat_number TEXT,
    row_number TEXT,
    table_number TEXT,
    status ticket_status DEFAULT 'active',
    reserved_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders/purchases
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    event_id UUID REFERENCES public.events(id),
    order_number TEXT UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    fees_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    status order_status DEFAULT 'pending',
    payment_intent_id TEXT,
    promo_code_used TEXT,
    billing_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items (tickets purchased)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id),
    ticket_type_id UUID REFERENCES public.ticket_types(id),
    price DECIMAL(10, 2) NOT NULL,
    attendee_name TEXT,
    attendee_email TEXT,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT,
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    minimum_order_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment records
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id),
    payment_method TEXT,
    payment_intent_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'pending',
    processor_fee DECIMAL(10, 2),
    net_amount DECIMAL(10, 2),
    payment_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event check-ins
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_item_id UUID REFERENCES public.order_items(id),
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_by UUID REFERENCES public.profiles(id),
    notes TEXT
);

-- Event analytics
CREATE TABLE IF NOT EXISTS public.event_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15, 2),
    metric_data JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 2. CONTENT MANAGEMENT SYSTEM
-- ===============================================

-- Create enum types for content management
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE content_type AS ENUM ('page', 'post', 'faq_item');

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
-- 3. PLATFORM CONFIGURATION SYSTEM
-- ===============================================

-- Create enum types for platform configuration
CREATE TYPE category_type AS ENUM ('event', 'class', 'content');
CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json', 'array');

-- Platform categories
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

-- Platform settings
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

-- VOD configuration
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

-- Pickup locations
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

-- Configuration audit log
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
-- 4. ANALYTICS TABLES
-- ===============================================

-- Web Analytics Tables
CREATE TABLE IF NOT EXISTS public.web_analytics_sessions (
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

CREATE TABLE IF NOT EXISTS public.web_analytics_page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    duration_seconds INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.web_analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB,
    page_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.web_analytics_conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    conversion_type TEXT NOT NULL,
    conversion_value DECIMAL(10,2),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instructor Performance Tables
CREATE TABLE IF NOT EXISTS public.instructor_profiles (
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

CREATE TABLE IF NOT EXISTS public.instructor_performance_metrics (
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

CREATE TABLE IF NOT EXISTS public.instructor_class_performance (
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
    cancellations INTEGER DEFAULT 0,
    no_shows INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.instructor_student_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_date DATE DEFAULT CURRENT_DATE,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.instructor_revenue_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    commission_rate DECIMAL(5,4) DEFAULT 0.15,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    net_revenue DECIMAL(10,2) DEFAULT 0,
    classes_taught INTEGER DEFAULT 0,
    students_served INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(instructor_id, date)
);

CREATE TABLE IF NOT EXISTS public.performance_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    alert_message TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 5. SECURITY AND USER FEATURES
-- ===============================================

-- Saved payment methods
CREATE TABLE IF NOT EXISTS public.saved_payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT NOT NULL,
    payment_type TEXT NOT NULL,
    last_four TEXT,
    exp_month INTEGER,
    exp_year INTEGER,
    brand TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security activity types
CREATE TABLE IF NOT EXISTS public.security_activity_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type_name TEXT UNIQUE NOT NULL,
    description TEXT,
    default_risk_score INTEGER DEFAULT 0,
    is_high_risk BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security activity log
CREATE TABLE IF NOT EXISTS public.security_activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type_id UUID REFERENCES public.security_activity_types(id),
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    risk_score INTEGER DEFAULT 0,
    additional_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved events
CREATE TABLE IF NOT EXISTS public.saved_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Saved event categories
CREATE TABLE IF NOT EXISTS public.saved_event_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.platform_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);

-- Inventory audit logs
CREATE TABLE IF NOT EXISTS public.inventory_audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_type_id UUID REFERENCES public.ticket_types(id),
    action TEXT NOT NULL,
    quantity_change INTEGER,
    previous_quantity INTEGER,
    new_quantity INTEGER,
    reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory holds
CREATE TABLE IF NOT EXISTS public.inventory_holds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_type_id UUID REFERENCES public.ticket_types(id),
    quantity INTEGER NOT NULL,
    held_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Core event system indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type_id ON public.tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Content management indexes
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON public.content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_status ON public.content_pages(status);
CREATE INDEX IF NOT EXISTS idx_content_pages_type ON public.content_pages(type);

-- Platform configuration indexes
CREATE INDEX IF NOT EXISTS idx_platform_categories_type ON public.platform_categories(type);
CREATE INDEX IF NOT EXISTS idx_platform_categories_active ON public.platform_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON public.platform_settings(key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON public.platform_settings(category);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_web_analytics_sessions_user_id ON public.web_analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_page_views_session_id ON public.web_analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_events_session_id ON public.web_analytics_events(session_id);

-- ===============================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events policies  
CREATE POLICY IF NOT EXISTS "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY IF NOT EXISTS "Organizers can manage own events" ON public.events FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.organizers 
        WHERE organizers.id = events.organizer_id 
        AND organizers.user_id = auth.uid()
    )
);

-- Orders policies
CREATE POLICY IF NOT EXISTS "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Content policies
CREATE POLICY IF NOT EXISTS "Public can read published content" ON public.content_pages FOR SELECT USING (status = 'published');

-- Platform settings policies
CREATE POLICY IF NOT EXISTS "Public can read public settings" ON public.platform_settings FOR SELECT USING (is_public = true);

-- Categories policies
CREATE POLICY IF NOT EXISTS "Public can read active categories" ON public.platform_categories FOR SELECT USING (is_active = true);

-- ===============================================
-- 8. FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizers_updated_at ON public.organizers;
CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venues_updated_at ON public.venues;
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 9. INSERT ESSENTIAL DATA
-- ===============================================

-- Insert essential platform settings (only if they don't exist)
INSERT INTO public.platform_settings (key, value, type, description, category, is_public) VALUES 
    ('site_name', 'SteppersLife', 'string', 'The name of the platform', 'general', true),
    ('site_tagline', 'Your Premier Step Dancing Community', 'string', 'Site tagline', 'general', true),
    ('contact_email', 'info@stepperslife.com', 'string', 'Contact email', 'contact', true),
    ('maintenance_mode', 'false', 'boolean', 'Maintenance mode', 'system', false)
ON CONFLICT (key) DO NOTHING;

-- Insert essential content pages (only if they don't exist)
INSERT INTO public.content_pages (title, slug, content, type, status, is_system_page) VALUES 
    ('About Us', 'about-us', '<h1>About SteppersLife</h1><p>Welcome to SteppersLife.</p>', 'page', 'published', true),
    ('Terms of Service', 'terms', '<h1>Terms of Service</h1><p>Terms and conditions.</p>', 'page', 'published', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert essential security activity types (only if they don't exist)
INSERT INTO public.security_activity_types (type_name, description, default_risk_score, is_high_risk) VALUES
    ('login', 'Successful user login', 0, FALSE),
    ('logout', 'User logout', 0, FALSE),
    ('password_change', 'Password changed', 10, FALSE)
ON CONFLICT (type_name) DO NOTHING;

-- Insert default categories (only if they don't exist)
INSERT INTO public.platform_categories (name, slug, description, type, color_hex, icon_name, sort_order) VALUES 
    ('Step Dancing', 'step-dancing', 'Traditional step dancing events', 'event', '#FF6B6B', 'music', 1),
    ('Line Dancing', 'line-dancing', 'Line dancing events', 'event', '#4ECDC4', 'users', 2),
    ('Social Dancing', 'social-dancing', 'Social dancing events', 'event', '#45B7D1', 'heart', 3)
ON CONFLICT (slug) DO NOTHING;

-- ===============================================
-- 10. FINAL VERIFICATION
-- ===============================================

-- Show final table count verification
DO $$
DECLARE
    table_name TEXT;
    row_count INTEGER;
    table_count INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRODUCTION DATABASE SYNC COMPLETE';
    RAISE NOTICE '========================================';
    
    -- Count tables created
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE 'Total tables in production: %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Key tables verified:';
    
    -- Check key tables exist and show counts
    FOR table_name IN VALUES ('profiles'), ('events'), ('organizers'), ('venues'), ('tickets'), ('orders'), ('platform_settings'), ('content_pages')
    LOOP
        BEGIN
            EXECUTE 'SELECT COUNT(*) FROM public.' || quote_ident(table_name) INTO row_count;
            RAISE NOTICE '✅ %: % rows', table_name, row_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ %: Table missing or error', table_name;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Production database is now synced with development!';
    RAISE NOTICE 'All essential tables and data have been created.';
    RAISE NOTICE '========================================';
END $$;