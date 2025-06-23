-- SteppersLife Event Management Database Schema
-- Complete schema for event ticketing and management platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'organizer', 'super_admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE ticket_status AS ENUM ('active', 'sold', 'reserved', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
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
CREATE TABLE public.organizers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    organization_name TEXT NOT NULL,
    description TEXT,
    website_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    profile_picture_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues
CREATE TABLE public.venues (
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
CREATE TABLE public.events (
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
CREATE TABLE public.ticket_types (
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
CREATE TABLE public.seating_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id),
    event_id UUID REFERENCES public.events(id),
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    price_modifier DECIMAL(5, 2) DEFAULT 1.00,
    section_type TEXT, -- 'general', 'vip', 'table', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual tickets
CREATE TABLE public.tickets (
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
CREATE TABLE public.orders (
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
CREATE TABLE public.order_items (
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
CREATE TABLE public.promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT, -- 'percentage', 'fixed_amount'
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
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id),
    payment_method TEXT, -- 'stripe', 'paypal', etc.
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
CREATE TABLE public.check_ins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_item_id UUID REFERENCES public.order_items(id),
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_by UUID REFERENCES public.profiles(id),
    notes TEXT
);

-- Event analytics
CREATE TABLE public.event_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15, 2),
    metric_data JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_event_id ON public.orders(event_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_tickets_ticket_type_id ON public.tickets(ticket_type_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Organizers: Users can manage their own organizer profiles
CREATE POLICY "Users can view own organizer profile" ON public.organizers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own organizer profile" ON public.organizers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own organizer profile" ON public.organizers FOR UPDATE USING (auth.uid() = user_id);

-- Events: Public can view published events, organizers can manage their own
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Organizers can manage own events" ON public.events FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.organizers 
        WHERE organizers.id = events.organizer_id 
        AND organizers.user_id = auth.uid()
    )
);

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: Users can only see items from their own orders
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Order items: Users can create items for their own orders
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Functions for automatic timestamps
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
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON public.promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();