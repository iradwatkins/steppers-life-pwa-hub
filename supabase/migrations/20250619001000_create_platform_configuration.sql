-- Platform Configuration System Database Schema
-- For managing platform settings, categories, and configuration

-- Create enum types for platform configuration
CREATE TYPE category_type AS ENUM ('event', 'class', 'content');
CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json', 'array');

-- Event and class categories management
CREATE TABLE public.platform_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    type category_type NOT NULL,
    color_hex TEXT DEFAULT '#3B82F6', -- Default blue color
    icon_name TEXT, -- For UI icons
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
CREATE TABLE public.platform_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type setting_type DEFAULT 'string',
    description TEXT,
    category TEXT DEFAULT 'general', -- group settings by category
    is_public BOOLEAN DEFAULT false, -- whether setting can be read by non-admins
    validation_rules JSONB DEFAULT '{}', -- JSON schema for validation
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VOD hosting configuration
CREATE TABLE public.vod_configuration (
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
CREATE TABLE public.pickup_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    phone TEXT,
    email TEXT,
    hours_of_operation JSONB, -- Store business hours
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
CREATE TABLE public.configuration_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_platform_categories_type ON public.platform_categories(type);
CREATE INDEX idx_platform_categories_active ON public.platform_categories(is_active);
CREATE INDEX idx_platform_categories_sort ON public.platform_categories(sort_order);
CREATE INDEX idx_platform_categories_parent ON public.platform_categories(parent_id);
CREATE INDEX idx_platform_settings_key ON public.platform_settings(key);
CREATE INDEX idx_platform_settings_category ON public.platform_settings(category);
CREATE INDEX idx_platform_settings_public ON public.platform_settings(is_public);
CREATE INDEX idx_pickup_locations_active ON public.pickup_locations(is_active);
CREATE INDEX idx_pickup_locations_location ON public.pickup_locations(city, state);
CREATE INDEX idx_configuration_audit_table ON public.configuration_audit_log(table_name, record_id);
CREATE INDEX idx_configuration_audit_time ON public.configuration_audit_log(changed_at DESC);

-- Row Level Security policies
ALTER TABLE public.platform_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vod_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_audit_log ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "Public can read active categories" ON public.platform_categories
    FOR SELECT USING (is_active = true);

-- Public can read public settings
CREATE POLICY "Public can read public settings" ON public.platform_settings
    FOR SELECT USING (is_public = true);

-- Public can read active pickup locations
CREATE POLICY "Public can read active pickup locations" ON public.pickup_locations
    FOR SELECT USING (is_active = true);

-- Admin users can manage all platform configuration
CREATE POLICY "Admin users can manage categories" ON public.platform_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admin users can manage settings" ON public.platform_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admin users can manage VOD config" ON public.vod_configuration
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admin users can manage pickup locations" ON public.pickup_locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Audit log is read-only for admins
CREATE POLICY "Admin users can read audit log" ON public.configuration_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Function to update sort order when reordering categories
CREATE OR REPLACE FUNCTION reorder_categories(category_ids UUID[])
RETURNS VOID AS $$
DECLARE
    category_id UUID;
    new_order INTEGER := 0;
BEGIN
    -- Update sort order based on array position
    FOREACH category_id IN ARRAY category_ids
    LOOP
        UPDATE public.platform_categories 
        SET sort_order = new_order,
            updated_at = NOW(),
            updated_by = auth.uid()
        WHERE id = category_id;
        
        new_order := new_order + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log configuration changes
CREATE OR REPLACE FUNCTION log_configuration_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert audit log entry
    INSERT INTO public.configuration_audit_log (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_by
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
CREATE TRIGGER trigger_log_category_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.platform_categories
    FOR EACH ROW
    EXECUTE FUNCTION log_configuration_changes();

CREATE TRIGGER trigger_log_settings_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION log_configuration_changes();

CREATE TRIGGER trigger_log_vod_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.vod_configuration
    FOR EACH ROW
    EXECUTE FUNCTION log_configuration_changes();

CREATE TRIGGER trigger_log_pickup_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.pickup_locations
    FOR EACH ROW
    EXECUTE FUNCTION log_configuration_changes();

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
    ('social_media_links', '{"facebook": "", "instagram": "", "twitter": ""}', 'json', 'Social media profile links', 'social', true);

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
    ('Private Lessons', 'private-lessons', 'One-on-one instruction', 'class', '#F8C471', 'user', 4);

-- Insert default VOD configuration
INSERT INTO public.vod_configuration (
    hosting_fee_amount,
    hosting_fee_currency,
    introductory_offer_enabled,
    introductory_offer_amount,
    introductory_offer_description
) VALUES (
    5.00,
    'USD',
    true,
    0.00,
    'Free hosting for your first 3 months!'
);

-- Insert example pickup location
INSERT INTO public.pickup_locations (
    name,
    address,
    city,
    state,
    zip_code,
    phone,
    email,
    hours_of_operation,
    special_instructions
) VALUES (
    'SteppersLife Main Office',
    '123 Dance Street',
    'Nashville',
    'TN',
    '37201',
    '(615) 555-0123',
    'pickup@stepperslife.com',
    '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00", "saturday": "10:00-14:00", "sunday": "closed"}',
    'Please bring photo ID for pickup. Ring doorbell if office appears closed.'
);