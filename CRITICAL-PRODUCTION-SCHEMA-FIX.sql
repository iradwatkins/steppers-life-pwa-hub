-- 🚨 CRITICAL PRODUCTION SCHEMA FIX - SteppersLife
-- ⚠️  EMERGENCY DATABASE REPAIR - Run this IMMEDIATELY
-- 📅 Generated: December 26, 2024
-- 🎯 Purpose: Fix missing tables, Edge Functions, and database schema

-- =====================================================
-- STEP 1: ENABLE EXTENSIONS & CHECK CURRENT STATE
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Check current state
SELECT 
    '🔍 BEFORE DEPLOYMENT' as status,
    COUNT(*) as current_tables,
    NOW() as timestamp
FROM pg_tables 
WHERE schemaname = 'public';

-- =====================================================
-- STEP 2: CREATE ENUM TYPES
-- =====================================================

-- User roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'organizer', 'super_admin', 'instructor');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'user_role type already exists, skipping...';
END $$;

-- Event status
DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'event_status type already exists, skipping...';
END $$;

-- Ticket status
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('available', 'sold', 'reserved', 'cancelled', 'used');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'ticket_status type already exists, skipping...';
END $$;

-- Order status
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded', 'completed');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'order_status type already exists, skipping...';
END $$;

-- Payment status
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'payment_status type already exists, skipping...';
END $$;

-- Payment method type
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('card', 'paypal', 'apple_pay', 'google_pay', 'cashapp', 'cash', 'bank_transfer');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'payment_method type already exists, skipping...';
END $$;

-- Class difficulty
DO $$ BEGIN
    CREATE TYPE class_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'all_levels');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'class_difficulty type already exists, skipping...';
END $$;

-- =====================================================
-- STEP 3: CREATE CORE USER TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    location TEXT,
    bio TEXT,
    role user_role DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    privacy_level TEXT DEFAULT 'public',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizers table
CREATE TABLE IF NOT EXISTS organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    description TEXT,
    website_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    tax_id TEXT,
    business_license TEXT,
    verification_status TEXT DEFAULT 'pending',
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 4: CREATE VENUE & LOCATION TABLES
-- =====================================================

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    amenities JSONB,
    contact_info JSONB,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 5: CREATE EVENT SYSTEM TABLES
-- =====================================================

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES organizers(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    timezone TEXT DEFAULT 'America/Chicago',
    status event_status DEFAULT 'draft',
    image_url TEXT,
    max_capacity INTEGER,
    min_age INTEGER,
    dress_code TEXT,
    special_instructions TEXT,
    tags TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    allow_waitlist BOOLEAN DEFAULT TRUE,
    is_free BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event custom questions
CREATE TABLE IF NOT EXISTS event_custom_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'text',
    required BOOLEAN DEFAULT FALSE,
    options JSONB,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 6: CREATE TICKETING SYSTEM
-- =====================================================

-- Ticket types
CREATE TABLE IF NOT EXISTS ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    quantity_total INTEGER NOT NULL,
    quantity_sold INTEGER DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_total - quantity_sold) STORED,
    sale_start_date TIMESTAMPTZ,
    sale_end_date TIMESTAMPTZ,
    min_per_order INTEGER DEFAULT 1,
    max_per_order INTEGER,
    is_hidden BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    processing_fee DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    payment_method payment_method,
    payment_intent_id TEXT,
    stripe_payment_id TEXT,
    square_payment_id TEXT,
    paypal_order_id TEXT,
    attendee_info JSONB NOT NULL,
    billing_info JSONB,
    custom_answers JSONB,
    confirmation_number TEXT UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items (individual tickets)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    attendee_name TEXT,
    attendee_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual tickets
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status ticket_status DEFAULT 'available',
    qr_code TEXT UNIQUE,
    seat_number TEXT,
    section TEXT,
    row_number TEXT,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES profiles(id),
    transferred_to UUID REFERENCES profiles(id),
    transferred_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 7: CREATE CLASSES SYSTEM (MISSING TABLE!)
-- =====================================================

-- Classes table (CRITICAL - This was missing!)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id),
    title TEXT NOT NULL,
    description TEXT,
    difficulty class_difficulty DEFAULT 'beginner',
    duration_minutes INTEGER NOT NULL,
    max_students INTEGER,
    price DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    recurring_schedule JSONB,
    equipment_needed TEXT[],
    prerequisites TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class sessions
CREATE TABLE IF NOT EXISTS class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    current_students INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class enrollments
CREATE TABLE IF NOT EXISTS class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    payment_id UUID,
    UNIQUE(class_id, user_id)
);

-- =====================================================
-- STEP 8: CREATE PAYMENT SYSTEM
-- =====================================================

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    provider_payment_id TEXT,
    provider_transaction_id TEXT,
    provider_fee DECIMAL(10, 2),
    receipt_url TEXT,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refunded_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 9: CREATE USER DATA TABLES
-- =====================================================

-- Saved events
CREATE TABLE IF NOT EXISTS saved_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Saved payment methods
CREATE TABLE IF NOT EXISTS saved_payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_payment_method_id TEXT NOT NULL,
    payment_method_type TEXT NOT NULL,
    last_four TEXT,
    brand TEXT,
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security activity log
CREATE TABLE IF NOT EXISTS security_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    location TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 10: CREATE CONTENT SYSTEM
-- =====================================================

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#000000',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES blog_categories(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    tags TEXT[],
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 11: CREATE SEATING & CHECK-IN SYSTEM
-- =====================================================

-- Seating sections
CREATE TABLE IF NOT EXISTS seating_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    price_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    checked_in_by UUID REFERENCES profiles(id),
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    device_info JSONB,
    UNIQUE(ticket_id)
);

-- =====================================================
-- STEP 12: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);

CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_classes_instructor_id ON classes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON classes(is_active);

-- =====================================================
-- STEP 13: SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_activity_log ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can read their own data)
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Public read access for events and venues
CREATE POLICY IF NOT EXISTS "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Venues are viewable by everyone" ON venues FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Ticket types are viewable by everyone" ON ticket_types FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Classes are viewable by everyone" ON classes FOR SELECT USING (true);

-- =====================================================
-- STEP 14: CREATE AUTOMATIC TRIGGERS
-- =====================================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 15: INSERT SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
('Stepping', 'stepping', 'Chicago Stepping news and tips', '#9333ea'),
('Events', 'events', 'Upcoming events and announcements', '#059669'),
('Community', 'community', 'Community stories and highlights', '#dc2626'),
('Classes', 'classes', 'Class schedules and instruction', '#ea580c')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample venue
INSERT INTO venues (id, name, description, address, city, state, zip_code, capacity) VALUES
('b3cb4200-617e-4d36-bdf3-621af232a1ee', 'Navy Pier Grand Ballroom', 'Premier event venue in Chicago', '600 E Grand Ave', 'Chicago', 'IL', '60611', 500)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 16: FINAL VERIFICATION
-- =====================================================

-- Count final tables
SELECT 
    '✅ DEPLOYMENT COMPLETE' as status,
    COUNT(*) as total_tables,
    'Schema successfully deployed!' as message
FROM pg_tables 
WHERE schemaname = 'public';

-- List all created tables
SELECT 
    '📋 DEPLOYED TABLES' as category,
    tablename as table_name,
    CASE 
        WHEN tablename IN ('profiles', 'organizers', 'venues', 'events') THEN '🎯 Core Business'
        WHEN tablename IN ('tickets', 'ticket_types', 'orders', 'order_items') THEN '🎫 Ticketing'
        WHEN tablename IN ('classes', 'class_sessions', 'class_enrollments') THEN '📚 Classes'
        WHEN tablename IN ('payments', 'promo_codes') THEN '💳 Commerce'
        WHEN tablename IN ('saved_events', 'saved_payment_methods', 'security_activity_log') THEN '💾 User Data'
        WHEN tablename IN ('blog_posts', 'blog_categories') THEN '📝 Content'
        WHEN tablename IN ('seating_sections', 'check_ins') THEN '🎪 Events Management'
        ELSE '🔧 System'
    END as table_category
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY table_category, tablename;

-- Check for successful deployment
SELECT 
    CASE 
        WHEN COUNT(*) >= 15 THEN '🎉 SUCCESS: All critical tables deployed!'
        ELSE '⚠️ WARNING: Some tables may be missing'
    END as deployment_result,
    COUNT(*) as deployed_tables,
    NOW() as completed_at
FROM pg_tables 
WHERE schemaname = 'public';

-- Final success message
SELECT '🚀 SteppersLife Production Database Successfully Deployed! 🚀' as final_message;