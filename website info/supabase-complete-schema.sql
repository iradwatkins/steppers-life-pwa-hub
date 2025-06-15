-- SteppersLife Complete Database Schema for 100% Supabase Migration
-- This replaces the Python FastAPI backend with full Supabase functionality

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- USER MANAGEMENT TABLES
-- ===========================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    role VARCHAR(20) DEFAULT 'attendee' CHECK (role IN ('admin', 'organizer', 'attendee', 'staff', 'promoter', 'instructor', 'moderator')),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    bio TEXT,
    avatar_url TEXT,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User payment information
CREATE TABLE IF NOT EXISTS public.user_payment_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('paypal', 'square', 'cashapp', 'bank', 'zelle')),
    account_identifier VARCHAR(255) NOT NULL, -- Email for PayPal, account number for others
    account_name VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User accounts and balances
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) NOT NULL UNIQUE,
    available_balance DECIMAL(10, 2) DEFAULT 0.00,
    pending_balance DECIMAL(10, 2) DEFAULT 0.00,
    total_earned DECIMAL(10, 2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10, 2) DEFAULT 0.00,
    is_frozen BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account transactions
CREATE TABLE IF NOT EXISTS public.account_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'transfer_in', 'transfer_out', 'withdrawal', 'commission', 'refund')),
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    description TEXT,
    reference_id UUID, -- Links to payment, disbursement, etc.
    reference_type VARCHAR(20), -- 'payment', 'disbursement', 'transfer'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- EVENT MANAGEMENT TABLES  
-- ===========================================

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) UNIQUE,
    color VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues
CREATE TABLE IF NOT EXISTS public.venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    description TEXT,
    amenities JSONB DEFAULT '{}',
    images JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    venue_id INTEGER REFERENCES public.venues(id),
    category_id INTEGER REFERENCES public.categories(id),
    organizer_id UUID REFERENCES public.user_profiles(id),
    price DECIMAL(10, 2) DEFAULT 0.00,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    image_url TEXT,
    gallery_images JSONB DEFAULT '[]',
    tags TEXT[],
    requirements TEXT[],
    custom_questions JSONB DEFAULT '[]',
    seating_chart JSONB,
    ticket_types JSONB DEFAULT '[]',
    promo_codes JSONB DEFAULT '[]',
    social_links JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- TICKETING TABLES
-- ===========================================

-- Tickets
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id INTEGER REFERENCES public.events(id) NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    ticket_type VARCHAR(50) DEFAULT 'general',
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    fees DECIMAL(10, 2) DEFAULT 0.00,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded', 'checked_in')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_id VARCHAR(100),
    verification_token VARCHAR(100),
    qr_code TEXT,
    seat_info JSONB,
    custom_answers JSONB DEFAULT '{}',
    attendee_info JSONB DEFAULT '{}',
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES public.user_profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- PAYMENT TABLES
-- ===========================================

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.tickets(id),
    user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    fees DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('square', 'paypal', 'cash', 'cashapp', 'zelle', 'bank')),
    provider_payment_id VARCHAR(255),
    provider_fee DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    failure_reason TEXT,
    refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    refund_reason TEXT,
    webhook_data JSONB,
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment disbursements (payouts to organizers)
CREATE TABLE IF NOT EXISTS public.payment_disbursements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('paypal', 'square', 'cashapp', 'bank', 'zelle')),
    amount DECIMAL(10, 2) NOT NULL,
    fees DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    recipient_info JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    provider_disbursement_id VARCHAR(255),
    provider_response JSONB,
    failure_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- CONTENT MANAGEMENT TABLES
-- ===========================================

-- Magazine categories
CREATE TABLE IF NOT EXISTS public.magazine_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine articles
CREATE TABLE IF NOT EXISTS public.magazine_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    gallery_images JSONB DEFAULT '[]',
    category_id INTEGER REFERENCES public.magazine_categories(id),
    author_id UUID REFERENCES public.user_profiles(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[],
    reading_time INTEGER, -- in minutes
    view_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- EMAIL AND COMMUNICATION TABLES
-- ===========================================

-- Email campaigns
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_id INTEGER,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    content TEXT NOT NULL,
    html_content TEXT,
    recipient_filter JSONB, -- Criteria for selecting recipients
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    bounce_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.user_profiles(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email tracking
CREATE TABLE IF NOT EXISTS public.email_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id INTEGER REFERENCES public.email_campaigns(id),
    user_id UUID REFERENCES public.user_profiles(id),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- SYSTEM CONFIGURATION TABLES
-- ===========================================

-- Payment configuration
CREATE TABLE IF NOT EXISTS public.payment_config (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('square', 'paypal', 'cashapp')),
    is_enabled BOOLEAN DEFAULT true,
    is_live_mode BOOLEAN DEFAULT false,
    config_data JSONB NOT NULL, -- Encrypted credentials and settings
    fee_percentage DECIMAL(5, 4) DEFAULT 0.029, -- 2.9%
    fee_fixed DECIMAL(10, 2) DEFAULT 0.30, -- $0.30
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether frontend can access this
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON public.events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

-- Ticket indexes
CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_payment_status ON public.tickets(payment_status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON public.tickets(ticket_number);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON public.payments(provider);
CREATE INDEX IF NOT EXISTS idx_payments_ticket ON public.payments(ticket_id);

-- Account transaction indexes
CREATE INDEX IF NOT EXISTS idx_account_transactions_user ON public.account_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_type ON public.account_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_account_transactions_created ON public.account_transactions(created_at);

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- User profile policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Event policies
CREATE POLICY "Events are publicly readable when published" ON public.events
    FOR SELECT USING (status = 'published');

CREATE POLICY "Organizers can manage their events" ON public.events
    FOR ALL USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can manage all events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Ticket policies
CREATE POLICY "Users can view own tickets" ON public.tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets for themselves" ON public.tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event organizers can view their event tickets" ON public.tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = tickets.event_id AND organizer_id = auth.uid()
        )
    );

-- Payment policies
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Account policies
CREATE POLICY "Users can view own account" ON public.user_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.account_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Public read access policies
CREATE POLICY "Categories are publicly readable" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Venues are publicly readable" ON public.venues
    FOR SELECT USING (is_active = true);

CREATE POLICY "Magazine categories are publicly readable" ON public.magazine_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Published articles are publicly readable" ON public.magazine_articles
    FOR SELECT USING (status = 'published');

-- Admin-only policies
CREATE POLICY "Only admins can access payment config" ON public.payment_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public settings are readable by all" ON public.system_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Only admins can manage settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to automatically set updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_events
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_tickets
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_payments
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_accounts
    BEFORE UPDATE ON public.user_accounts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create user account when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_accounts (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create account for new users
CREATE TRIGGER on_user_created
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update account balance
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's account balance
    UPDATE public.user_accounts 
    SET 
        available_balance = available_balance + NEW.amount,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Set balance_after in the transaction record
    NEW.balance_after = (
        SELECT available_balance 
        FROM public.user_accounts 
        WHERE user_id = NEW.user_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update balance on new transactions
CREATE TRIGGER on_account_transaction_created
    BEFORE INSERT ON public.account_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();

-- ===========================================
-- SEED DATA
-- ===========================================

-- Insert default categories (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.categories LIMIT 1) THEN
        INSERT INTO public.categories (name, description, slug, color, icon) VALUES
        ('Workshop', 'Learning and skill development sessions', 'workshop', '#3B82F6', 'BookOpen'),
        ('Social', 'Social dancing and community events', 'social', '#10B981', 'Users'),
        ('Competition', 'Competitive stepping events', 'competition', '#F59E0B', 'Trophy'),
        ('Performance', 'Showcase and performance events', 'performance', '#EF4444', 'Star'),
        ('Class', 'Regular instruction classes', 'class', '#8B5CF6', 'GraduationCap'),
        ('Convention', 'Multi-day convention events', 'convention', '#06B6D4', 'Calendar'),
        ('Battle', 'Stepping battles and face-offs', 'battle', '#DC2626', 'Zap'),
        ('Community', 'Community gatherings and meetups', 'community', '#059669', 'Heart');
    END IF;
END $$;

-- Insert magazine categories (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.magazine_categories LIMIT 1) THEN
        INSERT INTO public.magazine_categories (name, slug, description, color, icon) VALUES
        ('News', 'news', 'Latest stepping community news and updates', '#1F2937', 'Newspaper'),
        ('Tutorials', 'tutorials', 'Step-by-step dance tutorials and guides', '#3B82F6', 'PlayCircle'),
        ('Interviews', 'interviews', 'Interviews with stepping legends and artists', '#8B5CF6', 'Mic'),
        ('Events', 'events', 'Event coverage and highlights', '#F59E0B', 'Calendar'),
        ('Culture', 'culture', 'Stepping culture and history articles', '#10B981', 'Globe'),
        ('Health', 'health', 'Health and fitness tips for steppers', '#EF4444', 'Heart');
    END IF;
END $$;

-- Insert default system settings (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.system_settings LIMIT 1) THEN
        INSERT INTO public.system_settings (key, value, description, is_public) VALUES
        ('app_name', '"SteppersLife"', 'Application name', true),
        ('app_version', '"2.0.0"', 'Application version', true),
        ('maintenance_mode', 'false', 'Whether the app is in maintenance mode', true),
        ('registration_enabled', 'true', 'Whether new user registration is enabled', true),
        ('default_currency', '"USD"', 'Default currency for payments', true),
        ('max_file_size_mb', '10', 'Maximum file upload size in MB', true),
        ('supported_file_types', '["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"]', 'Supported file upload types', true);
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;