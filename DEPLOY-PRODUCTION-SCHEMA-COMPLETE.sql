-- COMPLETE PRODUCTION SCHEMA DEPLOYMENT
-- This script creates all missing tables and schema elements for SteppersLife PWA
-- Run this in your Production Supabase SQL Editor

-- =============================================
-- STEP 1: CREATE ENUM TYPES
-- =============================================

-- User roles enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'organizer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event status enum
DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ticket status enum
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('available', 'reserved', 'sold', 'used', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment status enum
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Order status enum
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- STEP 2: CREATE CORE TABLES
-- =============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    phone TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizers table
CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    social_media JSONB DEFAULT '{}',
    logo_url TEXT,
    banner_url TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues table
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'US',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    capacity INTEGER,
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    contact_info JSONB DEFAULT '{}',
    accessibility_features JSONB DEFAULT '[]',
    parking_info TEXT,
    public_transport_info TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    category TEXT,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone TEXT DEFAULT 'America/Chicago',
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    status event_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT false,
    base_price DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    max_attendees INTEGER,
    min_age INTEGER,
    max_age INTEGER,
    dress_code TEXT,
    skill_level TEXT,
    images JSONB DEFAULT '[]',
    video_url TEXT,
    external_links JSONB DEFAULT '{}',
    requirements TEXT,
    what_to_bring TEXT,
    refund_policy TEXT,
    contact_info JSONB DEFAULT '{}',
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    attendee_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Types table
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    quantity_available INTEGER,
    quantity_sold INTEGER DEFAULT 0,
    max_per_order INTEGER DEFAULT 10,
    sale_start_date TIMESTAMP WITH TIME ZONE,
    sale_end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    fee_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    payment_intent_id TEXT,
    payment_method TEXT,
    billing_info JSONB DEFAULT '{}',
    customer_info JSONB DEFAULT '{}',
    promo_code TEXT,
    notes TEXT,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    attendee_info JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ticket_number TEXT UNIQUE NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    status ticket_status DEFAULT 'available',
    attendee_name TEXT,
    attendee_email TEXT,
    attendee_phone TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_in_location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_intent_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    payment_method TEXT,
    payment_gateway TEXT,
    gateway_transaction_id TEXT,
    gateway_response JSONB,
    failure_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Following table (for organizer following functionality)
CREATE TABLE IF NOT EXISTS public.following (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Event Analytics table
CREATE TABLE IF NOT EXISTS public.event_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    ticket_views INTEGER DEFAULT 0,
    checkout_starts INTEGER DEFAULT 0,
    checkout_completions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, date)
);

-- Platform Categories table
CREATE TABLE IF NOT EXISTS public.platform_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.platform_categories(id) ON DELETE CASCADE,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    type TEXT DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Pages table
CREATE TABLE IF NOT EXISTS public.content_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    status TEXT DEFAULT 'draft',
    author_id UUID REFERENCES public.profiles(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Page Versions table
CREATE TABLE IF NOT EXISTS public.content_page_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES public.content_pages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Organizers indexes
CREATE INDEX IF NOT EXISTS idx_organizers_user_id ON public.organizers(user_id);
CREATE INDEX IF NOT EXISTS idx_organizers_is_verified ON public.organizers(is_verified);
CREATE INDEX IF NOT EXISTS idx_organizers_is_active ON public.organizers(is_active);
CREATE INDEX IF NOT EXISTS idx_organizers_city_state ON public.organizers(city, state);

-- Venues indexes
CREATE INDEX IF NOT EXISTS idx_venues_organizer_id ON public.venues(organizer_id);
CREATE INDEX IF NOT EXISTS idx_venues_location ON public.venues(city, state);
CREATE INDEX IF NOT EXISTS idx_venues_coordinates ON public.venues(latitude, longitude);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON public.events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Tickets indexes
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON public.tickets(qr_code);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON public.payments(payment_intent_id);

-- Following indexes
CREATE INDEX IF NOT EXISTS idx_following_follower_id ON public.following(follower_id);
CREATE INDEX IF NOT EXISTS idx_following_following_id ON public.following(following_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_event_analytics_event_id ON public.event_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_event_analytics_date ON public.event_analytics(date);

-- =============================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.following ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_page_versions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 5: CREATE RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizers policies
CREATE POLICY "Anyone can view active organizers" ON public.organizers FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create organizer profiles" ON public.organizers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own organizer profile" ON public.organizers FOR UPDATE USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Organizers can manage own events" ON public.events FOR ALL USING (
    organizer_id IN (SELECT id FROM public.organizers WHERE user_id = auth.uid())
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (user_id = auth.uid());

-- Tickets policies
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own tickets" ON public.tickets FOR UPDATE USING (user_id = auth.uid());

-- Following policies
CREATE POLICY "Users can view all following relationships" ON public.following FOR SELECT USING (true);
CREATE POLICY "Users can manage own following" ON public.following FOR ALL USING (follower_id = auth.uid());

-- Public read policies for categories and settings
CREATE POLICY "Anyone can view active categories" ON public.platform_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view public settings" ON public.platform_settings FOR SELECT USING (is_public = true);

-- Content pages policies
CREATE POLICY "Anyone can view published content" ON public.content_pages FOR SELECT USING (status = 'published');

-- Admin policies (for users with admin role)
CREATE POLICY "Admins can do everything on profiles" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do everything on organizers" ON public.organizers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do everything on events" ON public.events FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- STEP 6: CREATE FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_types_updated_at BEFORE UPDATE ON public.ticket_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STEP 7: INSERT INITIAL DATA
-- =============================================

-- Insert default platform categories
INSERT INTO public.platform_categories (name, slug, description, sort_order) VALUES
('Dance Events', 'dance-events', 'All types of dance events and performances', 1),
('Classes', 'classes', 'Dance classes and workshops', 2),
('Social Events', 'social-events', 'Community social gatherings', 3),
('Competitions', 'competitions', 'Dance competitions and contests', 4),
('Workshops', 'workshops', 'Educational workshops and seminars', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, type, description, is_public) VALUES
('site_name', 'SteppersLife', 'string', 'Platform name', true),
('site_description', 'The premier platform for steppers dance community', 'string', 'Platform description', true),
('contact_email', 'info@stepperslife.com', 'string', 'Main contact email', true),
('default_timezone', 'America/Chicago', 'string', 'Default platform timezone', true),
('default_currency', 'USD', 'string', 'Default currency', true),
('vod_hosting_fee', '2.99', 'number', 'VOD hosting fee per month', false),
('vod_intro_offer', 'true', 'boolean', 'Enable introductory VOD offer', false)
ON CONFLICT (key) DO NOTHING;

-- Insert default content pages
INSERT INTO public.content_pages (slug, title, content, status, published_at) VALUES
('about', 'About Us', '<h1>About SteppersLife</h1><p>Welcome to the premier platform for the steppers dance community.</p>', 'published', NOW()),
('contact', 'Contact Us', '<h1>Contact Us</h1><p>Get in touch with our team.</p>', 'published', NOW()),
('terms', 'Terms of Service', '<h1>Terms of Service</h1><p>Terms and conditions for using our platform.</p>', 'published', NOW()),
('privacy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>How we handle your personal information.</p>', 'published', NOW()),
('faq', 'Frequently Asked Questions', '<h1>FAQ</h1><p>Common questions and answers.</p>', 'published', NOW())
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count tables created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Count total records
SELECT 
    'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'organizers', COUNT(*) FROM public.organizers
UNION ALL
SELECT 'venues', COUNT(*) FROM public.venues
UNION ALL
SELECT 'events', COUNT(*) FROM public.events
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'tickets', COUNT(*) FROM public.tickets
UNION ALL
SELECT 'platform_categories', COUNT(*) FROM public.platform_categories
UNION ALL
SELECT 'platform_settings', COUNT(*) FROM public.platform_settings
UNION ALL
SELECT 'content_pages', COUNT(*) FROM public.content_pages;

-- Verify enum types
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('user_role', 'event_status', 'ticket_status', 'payment_status', 'order_status')
GROUP BY t.typname
ORDER BY t.typname;

COMMIT; 