-- ENHANCED PRODUCTION DATABASE RESET - VERIFIED CLEAN SLATE
-- This script ensures complete data removal from PRODUCTION database
-- Preserves: Users, Admin accounts, essential system settings only
-- Clears: ALL events, venues, organizers, tickets, orders, analytics, mock data

-- ===============================================
-- DATABASE VERIFICATION & SAFETY CHECKS
-- ===============================================

DO $$
DECLARE
    db_name TEXT;
    total_events INTEGER;
    total_venues INTEGER;
    total_organizers INTEGER;
    total_tickets INTEGER;
BEGIN
    -- Get current database name for verification
    SELECT current_database() INTO db_name;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRODUCTION DATABASE RESET - ENHANCED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Connected to database: %', db_name;
    RAISE NOTICE 'Starting comprehensive data cleanup...';
    
    -- Count existing data before reset
    SELECT COUNT(*) INTO total_events FROM events;
    SELECT COUNT(*) INTO total_venues FROM venues;
    SELECT COUNT(*) INTO total_organizers FROM organizers;
    SELECT COUNT(*) INTO total_tickets FROM tickets;
    
    RAISE NOTICE 'BEFORE RESET:';
    RAISE NOTICE 'Events: %', total_events;
    RAISE NOTICE 'Venues: %', total_venues;
    RAISE NOTICE 'Organizers: %', total_organizers;
    RAISE NOTICE 'Tickets: %', total_tickets;
    RAISE NOTICE '========================================';
END $$;

-- ===============================================
-- DISABLE FOREIGN KEY CONSTRAINTS TEMPORARILY
-- ===============================================

-- Disable triggers to allow safe deletion with foreign keys
SET session_replication_role = replica;

-- ===============================================
-- AGGRESSIVE DATA CLEARING - DELETE ALL RECORDS
-- ===============================================

-- Clear all event-related data (most dependent tables first)
DELETE FROM inventory_holds;
DELETE FROM inventory_audit_logs;
DELETE FROM check_ins;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM payments;
DELETE FROM promo_codes;
DELETE FROM tickets;
DELETE FROM ticket_types;
DELETE FROM seating_sections;
DELETE FROM event_analytics;
DELETE FROM events;

-- Clear venues and organizers
DELETE FROM venues;
DELETE FROM organizers;

-- Clear all analytics data
DELETE FROM web_analytics_conversions;
DELETE FROM web_analytics_events;
DELETE FROM web_analytics_page_views;
DELETE FROM web_analytics_sessions;

-- Clear all instructor performance data
DELETE FROM performance_alerts;
DELETE FROM instructor_revenue_analytics;
DELETE FROM instructor_student_feedback;
DELETE FROM instructor_class_performance;
DELETE FROM instructor_performance_metrics;
DELETE FROM instructor_profiles;

-- Clear all user-generated content (preserve user accounts)
DELETE FROM saved_events;
DELETE FROM saved_payment_methods;
DELETE FROM security_activity_log;

-- Clear content management (will recreate essential pages)
DELETE FROM content_page_versions;
DELETE FROM content_pages;

-- Clear configuration data for fresh start
DELETE FROM configuration_audit_log;
DELETE FROM pickup_locations;
DELETE FROM vod_configuration;
DELETE FROM platform_categories;

-- Clear ALL platform settings (will recreate essential ones only)
DELETE FROM platform_settings;

-- Clear saved event categories
DELETE FROM saved_event_categories;

-- Clear security activity types (will recreate)
DELETE FROM security_activity_types;

-- ===============================================
-- RE-ENABLE FOREIGN KEY CONSTRAINTS
-- ===============================================

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ===============================================
-- VERIFY DATA CLEARING SUCCESS
-- ===============================================

DO $$
DECLARE
    total_events INTEGER;
    total_venues INTEGER;
    total_organizers INTEGER;
    total_tickets INTEGER;
    total_orders INTEGER;
    total_payments INTEGER;
    total_users INTEGER;
    total_admins INTEGER;
BEGIN
    -- Count remaining data after reset
    SELECT COUNT(*) INTO total_events FROM events;
    SELECT COUNT(*) INTO total_venues FROM venues;
    SELECT COUNT(*) INTO total_organizers FROM organizers;
    SELECT COUNT(*) INTO total_tickets FROM tickets;
    SELECT COUNT(*) INTO total_orders FROM orders;
    SELECT COUNT(*) INTO total_payments FROM payments;
    
    -- Verify users are preserved
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_admins FROM profiles WHERE role IN ('admin', 'super_admin');
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AFTER RESET VERIFICATION:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Events: % (should be 0)', total_events;
    RAISE NOTICE 'Venues: % (should be 0)', total_venues;
    RAISE NOTICE 'Organizers: % (should be 0)', total_organizers;
    RAISE NOTICE 'Tickets: % (should be 0)', total_tickets;
    RAISE NOTICE 'Orders: % (should be 0)', total_orders;
    RAISE NOTICE 'Payments: % (should be 0)', total_payments;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRESERVED DATA:';
    RAISE NOTICE 'Total Users: % (preserved)', total_users;
    RAISE NOTICE 'Admin Accounts: % (preserved)', total_admins;
    RAISE NOTICE '========================================';
    
    -- Alert if data clearing failed
    IF total_events > 0 OR total_venues > 0 OR total_organizers > 0 OR total_tickets > 0 THEN
        RAISE WARNING 'DATA CLEARING INCOMPLETE! Some tables still contain data.';
        RAISE WARNING 'Check foreign key constraints and table dependencies.';
    ELSE
        RAISE NOTICE 'SUCCESS: All event/commerce data cleared from production!';
    END IF;
    
    -- Alert if no admin accounts
    IF total_admins = 0 THEN
        RAISE WARNING 'NO ADMIN ACCOUNTS FOUND! Promote a user to admin role.';
    END IF;
END $$;

-- ===============================================
-- INSERT ESSENTIAL SYSTEM DATA ONLY
-- ===============================================

-- Insert ONLY essential platform settings for production
INSERT INTO platform_settings (key, value, type, description, category, is_public) VALUES 
    ('site_name', 'SteppersLife', 'string', 'The name of the platform', 'general', true),
    ('site_tagline', 'Your Premier Step Dancing Community', 'string', 'Site tagline or description', 'general', true),
    ('contact_email', 'info@stepperslife.com', 'string', 'Main contact email address', 'contact', true),
    ('support_email', 'support@stepperslife.com', 'string', 'Support contact email', 'contact', true),
    ('default_timezone', 'America/New_York', 'string', 'Default timezone for events', 'events', true),
    ('max_upload_size_mb', '10', 'number', 'Maximum file upload size in MB', 'uploads', false),
    ('enable_user_registration', 'true', 'boolean', 'Allow new user registrations', 'users', false),
    ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'system', false);

-- Insert ONLY essential system pages
INSERT INTO content_pages (title, slug, content, type, status, is_system_page) VALUES 
    ('About Us', 'about-us', '<h1>About SteppersLife</h1><p>Welcome to SteppersLife - your premier destination for step dancing and community events.</p>', 'page', 'published', true),
    ('Contact Us', 'contact-us', '<h1>Contact Us</h1><p>Get in touch with the SteppersLife team.</p><p>Email: info@stepperslife.com</p>', 'page', 'published', true),
    ('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>Please read these terms carefully before using our service.</p>', 'page', 'published', true),
    ('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your information.</p>', 'page', 'published', true);

-- Insert essential security activity types
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

-- ===============================================
-- RESET SEQUENCES FOR CLEAN PRODUCTION IDS
-- ===============================================

DO $$
DECLARE
    seq_record RECORD;
BEGIN
    -- Reset all sequences to 1 for clean production IDs
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_record.schemaname || '.' || seq_record.sequencename || ' RESTART WITH 1';
    END LOOP;
    
    RAISE NOTICE 'All sequences reset - next IDs will start from 1';
END $$;

-- ===============================================
-- FINAL PRODUCTION READY CONFIRMATION
-- ===============================================

DO $$
DECLARE
    final_events INTEGER;
    final_venues INTEGER;
    final_organizers INTEGER;
    final_users INTEGER;
    final_admins INTEGER;
BEGIN
    -- Final verification counts
    SELECT COUNT(*) INTO final_events FROM events;
    SELECT COUNT(*) INTO final_venues FROM venues;
    SELECT COUNT(*) INTO final_organizers FROM organizers;
    SELECT COUNT(*) INTO final_users FROM auth.users;
    SELECT COUNT(*) INTO final_admins FROM profiles WHERE role IN ('admin', 'super_admin');
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRODUCTION DATABASE RESET COMPLETE';
    RAISE NOTICE '========================================';
    
    IF final_events = 0 AND final_venues = 0 AND final_organizers = 0 THEN
        RAISE NOTICE 'SUCCESS: Production database is now clean!';
        RAISE NOTICE '- Events: 0 (cleared)';
        RAISE NOTICE '- Venues: 0 (cleared)';
        RAISE NOTICE '- Organizers: 0 (cleared)';
        RAISE NOTICE '- Users: % (preserved)', final_users;
        RAISE NOTICE '- Admins: % (preserved)', final_admins;
        RAISE NOTICE '';
        RAISE NOTICE 'Database ready for live products and events!';
    ELSE
        RAISE WARNING 'RESET INCOMPLETE: Some data remains!';
        RAISE WARNING 'Events: %', final_events;
        RAISE WARNING 'Venues: %', final_venues;
        RAISE WARNING 'Organizers: %', final_organizers;
        RAISE WARNING 'Manual intervention may be required.';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;