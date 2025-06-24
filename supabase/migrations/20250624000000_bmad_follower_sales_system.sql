-- BMAD METHOD: Follower-Organizer Sales Delegation System
-- This migration implements the core BMAD functionality for followers to sell tickets
-- on behalf of organizers with commission tracking and sales attribution

-- =============================================
-- STEP 1: CREATE ENUM TYPES FOR BMAD SYSTEM
-- =============================================

-- Commission structure types
DO $$ BEGIN
    CREATE TYPE commission_type AS ENUM ('percentage', 'fixed_amount', 'tiered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Follower sales permission status
DO $$ BEGIN
    CREATE TYPE follower_permission_status AS ENUM ('active', 'suspended', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Commission payment status
DO $$ BEGIN
    CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'disputed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- STEP 2: FOLLOWER SALES PERMISSIONS TABLE
-- =============================================

-- Table to manage which followers can sell tickets for which organizers
CREATE TABLE IF NOT EXISTS public.follower_sales_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE NOT NULL,
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Permission details
    status follower_permission_status DEFAULT 'active',
    can_sell_tickets BOOLEAN DEFAULT true,
    can_create_promo_codes BOOLEAN DEFAULT false,
    can_view_sales_analytics BOOLEAN DEFAULT true,
    
    -- Commission structure
    commission_type commission_type DEFAULT 'percentage',
    commission_rate DECIMAL(5,2) DEFAULT 5.00, -- 5% default
    commission_fixed_amount DECIMAL(10,2) DEFAULT 0.00,
    commission_tiers JSONB DEFAULT '[]'::jsonb, -- For tiered commissions
    
    -- Limits and restrictions
    max_tickets_per_order INTEGER DEFAULT 10,
    max_daily_sales DECIMAL(10,2), -- Optional daily sales limit
    max_monthly_sales DECIMAL(10,2), -- Optional monthly sales limit
    allowed_events JSONB DEFAULT '[]'::jsonb, -- Specific events if restricted
    
    -- Metadata
    notes TEXT,
    granted_by UUID REFERENCES public.profiles(id), -- Who granted the permission
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(organizer_id, follower_id),
    CHECK (commission_rate >= 0 AND commission_rate <= 100),
    CHECK (commission_fixed_amount >= 0)
);

-- =============================================
-- STEP 3: FOLLOWER TRACKABLE LINKS TABLE
-- =============================================

-- Extend trackable links specifically for follower sales
CREATE TABLE IF NOT EXISTS public.follower_trackable_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_permission_id UUID REFERENCES public.follower_sales_permissions(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    
    -- Link details
    link_code TEXT UNIQUE NOT NULL,
    vanity_url TEXT UNIQUE,
    full_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER, -- Optional usage limit
    current_uses INTEGER DEFAULT 0,
    
    -- Promo code integration
    promo_code TEXT, -- Optional associated promo code
    discount_type TEXT, -- 'percentage', 'fixed_amount'
    discount_value DECIMAL(10,2) DEFAULT 0.00,
    
    -- Analytics
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0.00,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    last_clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 4: FOLLOWER SALES ATTRIBUTION TABLE
-- =============================================

-- Track which sales were made by which followers
CREATE TABLE IF NOT EXISTS public.follower_sales_attribution (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Core relationships
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    follower_permission_id UUID REFERENCES public.follower_sales_permissions(id) ON DELETE CASCADE NOT NULL,
    trackable_link_id UUID REFERENCES public.follower_trackable_links(id) ON DELETE SET NULL,
    
    -- Attribution details
    attribution_method TEXT DEFAULT 'trackable_link', -- 'trackable_link', 'promo_code', 'manual'
    click_session_id TEXT, -- To track from click to purchase
    referrer_data JSONB DEFAULT '{}'::jsonb,
    
    -- Sales details
    sale_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate_used DECIMAL(5,2) NOT NULL,
    
    -- Metadata
    attributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 5: FOLLOWER COMMISSION TRACKING TABLE
-- =============================================

-- Track commission earnings and payments for followers
CREATE TABLE IF NOT EXISTS public.follower_commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Core relationships
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    organizer_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE NOT NULL,
    sales_attribution_id UUID REFERENCES public.follower_sales_attribution(id) ON DELETE CASCADE NOT NULL,
    
    -- Commission details
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    base_sale_amount DECIMAL(10,2) NOT NULL,
    
    -- Status and payment
    status commission_status DEFAULT 'pending',
    payment_method TEXT, -- 'bank_transfer', 'paypal', 'stripe', etc.
    payment_reference TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    
    -- Constraints
    CHECK (commission_amount >= 0),
    CHECK (commission_rate >= 0 AND commission_rate <= 100),
    CHECK (base_sale_amount >= 0)
);

-- =============================================
-- STEP 6: FOLLOWER EARNINGS SUMMARY TABLE
-- =============================================

-- Materialized view-like table for follower earnings summaries
CREATE TABLE IF NOT EXISTS public.follower_earnings_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Core relationships
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    organizer_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE NOT NULL,
    
    -- Summary period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'yearly'
    
    -- Earnings summary
    total_sales DECIMAL(10,2) DEFAULT 0.00,
    total_commission DECIMAL(10,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    total_tickets_sold INTEGER DEFAULT 0,
    
    -- Commission breakdown
    pending_commission DECIMAL(10,2) DEFAULT 0.00,
    approved_commission DECIMAL(10,2) DEFAULT 0.00,
    paid_commission DECIMAL(10,2) DEFAULT 0.00,
    
    -- Performance metrics
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    total_clicks INTEGER DEFAULT 0,
    
    -- Metadata
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(follower_id, organizer_id, period_start, period_end, period_type)
);

-- =============================================
-- STEP 7: CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Follower sales permissions indexes
CREATE INDEX IF NOT EXISTS idx_follower_sales_permissions_organizer_id ON public.follower_sales_permissions(organizer_id);
CREATE INDEX IF NOT EXISTS idx_follower_sales_permissions_follower_id ON public.follower_sales_permissions(follower_id);
CREATE INDEX IF NOT EXISTS idx_follower_sales_permissions_status ON public.follower_sales_permissions(status);
CREATE INDEX IF NOT EXISTS idx_follower_sales_permissions_active ON public.follower_sales_permissions(organizer_id, follower_id) WHERE status = 'active';

-- Follower trackable links indexes
CREATE INDEX IF NOT EXISTS idx_follower_trackable_links_permission_id ON public.follower_trackable_links(follower_permission_id);
CREATE INDEX IF NOT EXISTS idx_follower_trackable_links_event_id ON public.follower_trackable_links(event_id);
CREATE INDEX IF NOT EXISTS idx_follower_trackable_links_link_code ON public.follower_trackable_links(link_code);
CREATE INDEX IF NOT EXISTS idx_follower_trackable_links_vanity_url ON public.follower_trackable_links(vanity_url);
CREATE INDEX IF NOT EXISTS idx_follower_trackable_links_active ON public.follower_trackable_links(is_active);

-- Sales attribution indexes
CREATE INDEX IF NOT EXISTS idx_follower_sales_attribution_order_id ON public.follower_sales_attribution(order_id);
CREATE INDEX IF NOT EXISTS idx_follower_sales_attribution_permission_id ON public.follower_sales_attribution(follower_permission_id);
CREATE INDEX IF NOT EXISTS idx_follower_sales_attribution_link_id ON public.follower_sales_attribution(trackable_link_id);
CREATE INDEX IF NOT EXISTS idx_follower_sales_attribution_date ON public.follower_sales_attribution(attributed_at);

-- Commission tracking indexes
CREATE INDEX IF NOT EXISTS idx_follower_commissions_follower_id ON public.follower_commissions(follower_id);
CREATE INDEX IF NOT EXISTS idx_follower_commissions_organizer_id ON public.follower_commissions(organizer_id);
CREATE INDEX IF NOT EXISTS idx_follower_commissions_status ON public.follower_commissions(status);
CREATE INDEX IF NOT EXISTS idx_follower_commissions_earned_date ON public.follower_commissions(earned_at);
CREATE INDEX IF NOT EXISTS idx_follower_commissions_payment_date ON public.follower_commissions(payment_date);

-- Earnings summary indexes
CREATE INDEX IF NOT EXISTS idx_follower_earnings_summary_follower_id ON public.follower_earnings_summary(follower_id);
CREATE INDEX IF NOT EXISTS idx_follower_earnings_summary_organizer_id ON public.follower_earnings_summary(organizer_id);
CREATE INDEX IF NOT EXISTS idx_follower_earnings_summary_period ON public.follower_earnings_summary(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_follower_earnings_summary_type ON public.follower_earnings_summary(period_type);

-- =============================================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.follower_sales_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_trackable_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_sales_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_earnings_summary ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 9: CREATE RLS POLICIES
-- =============================================

-- Follower sales permissions policies
CREATE POLICY "Organizers can manage follower permissions" ON public.follower_sales_permissions
    FOR ALL USING (
        organizer_id IN (SELECT id FROM public.organizers WHERE user_id = auth.uid())
    );

CREATE POLICY "Followers can view their own permissions" ON public.follower_sales_permissions
    FOR SELECT USING (follower_id = auth.uid());

-- Follower trackable links policies
CREATE POLICY "Followers can manage their own trackable links" ON public.follower_trackable_links
    FOR ALL USING (
        follower_permission_id IN (
            SELECT id FROM public.follower_sales_permissions 
            WHERE follower_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Organizers can view follower links" ON public.follower_trackable_links
    FOR SELECT USING (
        follower_permission_id IN (
            SELECT id FROM public.follower_sales_permissions 
            WHERE organizer_id IN (
                SELECT id FROM public.organizers WHERE user_id = auth.uid()
            )
        )
    );

-- Sales attribution policies
CREATE POLICY "Followers can view their own sales attribution" ON public.follower_sales_attribution
    FOR SELECT USING (
        follower_permission_id IN (
            SELECT id FROM public.follower_sales_permissions 
            WHERE follower_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can view follower sales attribution" ON public.follower_sales_attribution
    FOR SELECT USING (
        follower_permission_id IN (
            SELECT id FROM public.follower_sales_permissions 
            WHERE organizer_id IN (
                SELECT id FROM public.organizers WHERE user_id = auth.uid()
            )
        )
    );

-- Commission tracking policies
CREATE POLICY "Followers can view their own commissions" ON public.follower_commissions
    FOR SELECT USING (follower_id = auth.uid());

CREATE POLICY "Organizers can manage commissions for their followers" ON public.follower_commissions
    FOR ALL USING (
        organizer_id IN (SELECT id FROM public.organizers WHERE user_id = auth.uid())
    );

-- Earnings summary policies
CREATE POLICY "Followers can view their own earnings" ON public.follower_earnings_summary
    FOR SELECT USING (follower_id = auth.uid());

CREATE POLICY "Organizers can view follower earnings" ON public.follower_earnings_summary
    FOR SELECT USING (
        organizer_id IN (SELECT id FROM public.organizers WHERE user_id = auth.uid())
    );

-- Admin policies (for users with admin role)
CREATE POLICY "Admins can manage all follower permissions" ON public.follower_sales_permissions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can manage all follower commissions" ON public.follower_commissions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =============================================
-- STEP 10: CREATE TRIGGERS AND FUNCTIONS
-- =============================================

-- Update timestamps trigger
CREATE TRIGGER update_follower_sales_permissions_updated_at 
    BEFORE UPDATE ON public.follower_sales_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follower_trackable_links_updated_at 
    BEFORE UPDATE ON public.follower_trackable_links 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create sales attribution when order is created
CREATE OR REPLACE FUNCTION create_follower_sales_attribution()
RETURNS TRIGGER AS $$
DECLARE
    attribution_link_id UUID;
    follower_perm_id UUID;
    commission_amt DECIMAL(10,2);
    commission_rt DECIMAL(5,2);
BEGIN
    -- Check if this order came from a follower trackable link
    -- This would be determined by a session cookie or URL parameter
    -- For now, we'll use a hypothetical tracking mechanism
    
    -- Look for trackable link in order metadata (if stored there)
    IF NEW.promo_code IS NOT NULL THEN
        SELECT ftl.id, ftl.follower_permission_id, fsp.commission_rate
        INTO attribution_link_id, follower_perm_id, commission_rt
        FROM public.follower_trackable_links ftl
        JOIN public.follower_sales_permissions fsp ON ftl.follower_permission_id = fsp.id
        WHERE ftl.promo_code = NEW.promo_code
        AND fsp.status = 'active'
        LIMIT 1;
        
        IF follower_perm_id IS NOT NULL THEN
            -- Calculate commission
            commission_amt := (NEW.total_amount * commission_rt / 100);
            
            -- Create sales attribution
            INSERT INTO public.follower_sales_attribution (
                order_id,
                follower_permission_id,
                trackable_link_id,
                attribution_method,
                sale_amount,
                commission_amount,
                commission_rate_used
            ) VALUES (
                NEW.id,
                follower_perm_id,
                attribution_link_id,
                'promo_code',
                NEW.total_amount,
                commission_amt,
                commission_rt
            );
            
            -- Update trackable link stats
            UPDATE public.follower_trackable_links 
            SET 
                conversion_count = conversion_count + 1,
                revenue_generated = revenue_generated + NEW.total_amount,
                commission_earned = commission_earned + commission_amt,
                current_uses = current_uses + 1
            WHERE id = attribution_link_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic sales attribution
CREATE TRIGGER create_follower_sales_attribution_trigger
    AFTER INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION create_follower_sales_attribution();

-- Function to create commission record when sales attribution is created
CREATE OR REPLACE FUNCTION create_follower_commission()
RETURNS TRIGGER AS $$
DECLARE
    follower_uid UUID;
    organizer_uid UUID;
BEGIN
    -- Get follower and organizer IDs
    SELECT fsp.follower_id, fsp.organizer_id
    INTO follower_uid, organizer_uid
    FROM public.follower_sales_permissions fsp
    WHERE fsp.id = NEW.follower_permission_id;
    
    -- Create commission record
    INSERT INTO public.follower_commissions (
        follower_id,
        organizer_id,
        sales_attribution_id,
        commission_amount,
        commission_rate,
        base_sale_amount,
        status
    ) VALUES (
        follower_uid,
        organizer_uid,
        NEW.id,
        NEW.commission_amount,
        NEW.commission_rate_used,
        NEW.sale_amount,
        'pending'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic commission creation
CREATE TRIGGER create_follower_commission_trigger
    AFTER INSERT ON public.follower_sales_attribution
    FOR EACH ROW EXECUTE FUNCTION create_follower_commission();

-- =============================================
-- STEP 11: INITIAL DATA AND CONFIGURATION
-- =============================================

-- Insert default platform settings for BMAD system
INSERT INTO public.platform_settings (key, value, type, description, is_public) VALUES
('bmad_default_commission_rate', '5.0', 'number', 'Default commission rate for new followers (%)', false),
('bmad_max_commission_rate', '25.0', 'number', 'Maximum commission rate allowed (%)', false),
('bmad_min_commission_amount', '1.0', 'number', 'Minimum commission amount to trigger payout ($)', false),
('bmad_commission_payment_schedule', 'monthly', 'string', 'How often commissions are paid out', false),
('bmad_auto_approve_commissions', 'false', 'boolean', 'Whether commissions are auto-approved', false),
('bmad_follower_signup_enabled', 'true', 'boolean', 'Whether followers can request sales permissions', true)
ON CONFLICT (key) DO NOTHING;

-- Create initial admin notification for BMAD system deployment
INSERT INTO public.content_pages (slug, title, content, status, published_at) VALUES
('bmad-system-deployed', 'BMAD Follower Sales System Deployed', 
'The BMAD (Build, Manage, Advertise, Delegate) follower sales delegation system has been successfully deployed. 

Key Features:
- Followers can now sell tickets on behalf of organizers
- Commission tracking and management
- Trackable links for sales attribution
- Earnings dashboards for followers
- Organizer controls for follower permissions

Next Steps:
1. Update followerService.ts to use real database calls
2. Create follower dashboard UI
3. Add organizer follower management interface
4. Test the complete sales flow', 
'published', NOW())
ON CONFLICT (slug) DO NOTHING;