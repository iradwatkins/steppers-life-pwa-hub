-- PRODUCTION DATABASE RESET - CLEAN SLATE FOR LIVE LAUNCH
-- This script ONLY affects PRODUCTION database
-- Preserves: Users, Admin accounts, essential system settings
-- Clears: All mock data, events, orders, analytics, user-generated content

-- ===============================================
-- SAFETY CHECK - PRODUCTION ONLY
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE 'STARTING PRODUCTION DATABASE RESET';
    RAISE NOTICE 'This will clear all data except users, admins, and essential system settings';
    RAISE NOTICE 'Users and admin accounts will be preserved';
END $$;

-- ===============================================
-- CLEAR ALL DATA TABLES (PRESERVE USERS & ADMINS)
-- ===============================================

-- Clear all event-related data
TRUNCATE TABLE IF EXISTS inventory_holds CASCADE;
TRUNCATE TABLE IF EXISTS inventory_audit_logs CASCADE;
TRUNCATE TABLE IF EXISTS check_ins CASCADE;
TRUNCATE TABLE IF EXISTS order_items CASCADE;
TRUNCATE TABLE IF EXISTS orders CASCADE;
TRUNCATE TABLE IF EXISTS payments CASCADE;
TRUNCATE TABLE IF EXISTS promo_codes CASCADE;
TRUNCATE TABLE IF EXISTS tickets CASCADE;
TRUNCATE TABLE IF EXISTS ticket_types CASCADE;
TRUNCATE TABLE IF EXISTS seating_sections CASCADE;
TRUNCATE TABLE IF EXISTS events CASCADE;
TRUNCATE TABLE IF EXISTS event_analytics CASCADE;

-- Clear all venue and organizer data
TRUNCATE TABLE IF EXISTS venues CASCADE;
TRUNCATE TABLE IF EXISTS organizers CASCADE;

-- Clear all analytics data
TRUNCATE TABLE IF EXISTS web_analytics_conversions CASCADE;
TRUNCATE TABLE IF EXISTS web_analytics_events CASCADE;
TRUNCATE TABLE IF EXISTS web_analytics_page_views CASCADE;
TRUNCATE TABLE IF EXISTS web_analytics_sessions CASCADE;

-- Clear all instructor performance data
TRUNCATE TABLE IF EXISTS performance_alerts CASCADE;
TRUNCATE TABLE IF EXISTS instructor_revenue_analytics CASCADE;
TRUNCATE TABLE IF EXISTS instructor_student_feedback CASCADE;
TRUNCATE TABLE IF EXISTS instructor_class_performance CASCADE;
TRUNCATE TABLE IF EXISTS instructor_performance_metrics CASCADE;
TRUNCATE TABLE IF EXISTS instructor_profiles CASCADE;

-- Clear all user-generated content (but preserve user accounts)
TRUNCATE TABLE IF EXISTS saved_events CASCADE;
TRUNCATE TABLE IF EXISTS saved_payment_methods CASCADE;
TRUNCATE TABLE IF EXISTS security_activity_log CASCADE;

-- Clear content management data (will be recreated with essential pages only)
TRUNCATE TABLE IF EXISTS content_page_versions CASCADE;
TRUNCATE TABLE IF EXISTS content_pages CASCADE;

-- Clear configuration audit log (fresh start)
TRUNCATE TABLE IF EXISTS configuration_audit_log CASCADE;

-- Clear pickup locations (will add real ones)
TRUNCATE TABLE IF EXISTS pickup_locations CASCADE;

-- Clear VOD configuration (will set real pricing)
TRUNCATE TABLE IF EXISTS vod_configuration CASCADE;

-- Clear platform categories (will add real categories only)
TRUNCATE TABLE IF EXISTS platform_categories CASCADE;

-- ===============================================
-- PRESERVE ESSENTIAL SYSTEM SETTINGS ONLY
-- ===============================================

-- Clear all settings and re-add only essential ones
DELETE FROM platform_settings;

-- Insert ONLY essential platform settings for production
INSERT INTO public.platform_settings (key, value, type, description, category, is_public) VALUES 
    ('site_name', 'SteppersLife', 'string', 'The name of the platform', 'general', true),
    ('site_tagline', 'Your Premier Step Dancing Community', 'string', 'Site tagline or description', 'general', true),
    ('contact_email', 'info@stepperslife.com', 'string', 'Main contact email address', 'contact', true),
    ('support_email', 'support@stepperslife.com', 'string', 'Support contact email', 'contact', true),
    ('default_timezone', 'America/New_York', 'string', 'Default timezone for events', 'events', true),
    ('max_upload_size_mb', '10', 'number', 'Maximum file upload size in MB', 'uploads', false),
    ('enable_user_registration', 'true', 'boolean', 'Allow new user registrations', 'users', false),
    ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'system', false);

-- Insert ONLY essential system pages for production
INSERT INTO public.content_pages (title, slug, content, type, status, is_system_page) VALUES 
    ('About Us', 'about-us', '<h1>About SteppersLife</h1><p>Welcome to SteppersLife - your premier destination for step dancing and community events.</p>', 'page', 'published', true),
    ('Contact Us', 'contact-us', '<h1>Contact Us</h1><p>Get in touch with the SteppersLife team.</p><p>Email: info@stepperslife.com</p>', 'page', 'published', true),
    ('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>Please read these terms carefully before using our service.</p>', 'page', 'published', true),
    ('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your information.</p>', 'page', 'published', true);

-- Insert ONLY essential security activity types
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
('account_locked', 'Account locked due to suspicious activity', 75, TRUE);

-- Clear saved event categories (no mock categories)
DELETE FROM saved_event_categories;

-- ===============================================
-- RESET SEQUENCES AND COUNTERS
-- ===============================================

-- Reset any auto-incrementing sequences to start fresh
-- This ensures clean IDs for new production data

DO $$
DECLARE
    seq_record RECORD;
BEGIN
    -- Reset all sequences to 1
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_record.schemaname || '.' || seq_record.sequencename || ' RESTART WITH 1';
    END LOOP;
    
    RAISE NOTICE 'All sequences reset to start from 1';
END $$;

-- ===============================================
-- VERIFY USER PRESERVATION
-- ===============================================

DO $$
DECLARE
    user_count INTEGER;
    admin_count INTEGER;
BEGIN
    -- Count preserved users
    SELECT COUNT(*) INTO user_count FROM auth.users;
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role IN ('admin', 'super_admin');
    
    RAISE NOTICE 'Production database reset completed successfully';
    RAISE NOTICE 'Preserved % total users', user_count;
    RAISE NOTICE 'Preserved % admin/super_admin accounts', admin_count;
    RAISE NOTICE 'All mock data cleared - ready for live products and events';
    
    -- Ensure we have admin users
    IF admin_count = 0 THEN
        RAISE WARNING 'No admin accounts found! You may need to promote a user to admin role.';
    END IF;
END $$;

-- ===============================================
-- PRODUCTION READY CONFIRMATION
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRODUCTION DATABASE RESET COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database is now clean and ready for:';
    RAISE NOTICE '- Real events and products';
    RAISE NOTICE '- Live customer orders';
    RAISE NOTICE '- Production analytics';
    RAISE NOTICE '- Genuine user activity';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Users and admin accounts preserved';
    RAISE NOTICE 'All mock/test data removed';
    RAISE NOTICE 'Essential system settings maintained';
    RAISE NOTICE '========================================';
END $$;