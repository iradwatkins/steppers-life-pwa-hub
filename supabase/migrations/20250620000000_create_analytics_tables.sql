-- Epic E.005 & E.006: Analytics and Instructor Performance Tables
-- Create tables for web analytics and instructor performance tracking

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
    conversion_type TEXT NOT NULL, -- 'ticket_purchase', 'event_registration', 'newsletter_signup', etc.
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
    specialties TEXT[], -- Array of specialties like ['HIIT', 'Yoga', 'Dance']
    certifications TEXT[], -- Array of certifications
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
    class_id UUID, -- Would reference classes table when implemented
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
    class_id UUID, -- Would reference classes table when implemented
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    aspects JSONB, -- Store structured feedback aspects
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
    class_id UUID, -- Optional reference to specific class
    message TEXT NOT NULL,
    threshold_value DECIMAL(10,4),
    current_value DECIMAL(10,4),
    acknowledged BOOLEAN DEFAULT false,
    actions TEXT[], -- Array of suggested actions
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Inventory Management Enhancement (B.011)
CREATE TABLE IF NOT EXISTS inventory_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_type_id UUID, -- Would reference ticket_types when available
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
    ticket_type_id UUID, -- Would reference ticket_types when available
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_web_analytics_sessions_user_id ON web_analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_sessions_started_at ON web_analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_web_analytics_page_views_session_id ON web_analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_page_views_timestamp ON web_analytics_page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_analytics_events_session_id ON web_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_events_timestamp ON web_analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_analytics_conversions_user_id ON web_analytics_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_conversions_timestamp ON web_analytics_conversions(timestamp);

CREATE INDEX IF NOT EXISTS idx_instructor_profiles_user_id ON instructor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_status ON instructor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_instructor_performance_metrics_instructor_id ON instructor_performance_metrics(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_performance_metrics_period ON instructor_performance_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_instructor_class_performance_instructor_id ON instructor_class_performance(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_student_feedback_instructor_id ON instructor_student_feedback(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_revenue_analytics_instructor_id ON instructor_revenue_analytics(instructor_id);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_instructor_id ON performance_alerts(instructor_id);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_triggered_at ON performance_alerts(triggered_at);

CREATE INDEX IF NOT EXISTS idx_inventory_audit_logs_event_id ON inventory_audit_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_logs_timestamp ON inventory_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_inventory_holds_event_id ON inventory_holds(event_id);
CREATE INDEX IF NOT EXISTS idx_inventory_holds_session_id ON inventory_holds(session_id);
CREATE INDEX IF NOT EXISTS idx_inventory_holds_expires_at ON inventory_holds(expires_at);

-- Enable Row Level Security
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

-- Create RLS Policies (Basic policies for admin access and user data access)
-- Web Analytics - Admin only for most data, users can see their own
CREATE POLICY "Admins can view all analytics sessions" ON web_analytics_sessions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Users can view their own analytics sessions" ON web_analytics_sessions FOR SELECT USING (user_id = auth.uid());

-- Similar policies for other analytics tables...
CREATE POLICY "Admins can view all page views" ON web_analytics_page_views FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Users can view their own page views" ON web_analytics_page_views FOR SELECT USING (user_id = auth.uid());

-- Instructor profiles - Instructors can manage their own, admins can manage all
CREATE POLICY "Instructors can view and edit their own profile" ON instructor_profiles FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all instructor profiles" ON instructor_profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Public can view active instructor profiles" ON instructor_profiles FOR SELECT USING (status = 'active');

-- Performance metrics - Instructors can view their own, admins can view all
CREATE POLICY "Instructors can view their own metrics" ON instructor_performance_metrics FOR SELECT USING (
    instructor_id IN (
        SELECT id FROM instructor_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all performance metrics" ON instructor_performance_metrics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Feedback - Public can read, authenticated users can submit
CREATE POLICY "Public can view feedback" ON instructor_student_feedback FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit feedback" ON instructor_student_feedback FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND student_id = auth.uid()
);

-- Inventory - Admins and organizers can manage
CREATE POLICY "Admins can manage inventory audit logs" ON inventory_audit_logs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Organizers can view their event inventory logs" ON inventory_audit_logs FOR SELECT USING (
    event_id IN (
        SELECT id FROM events WHERE organizer_id IN (
            SELECT id FROM organizers WHERE user_id = auth.uid()
        )
    )
);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_instructor_profiles_updated_at 
    BEFORE UPDATE ON instructor_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instructor_class_performance_updated_at 
    BEFORE UPDATE ON instructor_class_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_holds_updated_at 
    BEFORE UPDATE ON inventory_holds 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();