TS:';
    RAISE NOTICE '----------------------------------------';
    
    -- Loop through all public tables and show counts
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name
    LOOP
        sql_query := 'SELECT COUNT(*) FROM ' || quote_ident(table_name);
        EXECUTE sql_query INTO row_count;
        RAISE NOTICE '%: %', table_name, row_count;
    END LOOP;
    
    RAISE NOTICE '----------------------------------------';
END $$;

-- ===============================================
-- SAFE DATA CLEARING - ONLY DELETE FROM EXISTING TABLES
-- ===============================================

-- Disable triggers for safe deletion
SET session_replication_role = replica;

-- Function to safely delete from table if it exists
CREATE OR REPLACE FUNCTION safe_delete_from_table(table_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    row_count INTEGER := 0;
    deleted_count INTEGER := 0;
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = safe_delete_from_table.table_name
    ) THEN
        -- Get count before deletion
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_name) INTO row_count;
        
        -- Delete all rows
        EXECUTE 'DELETE FROM ' || quote_ident(table_name);
        
        RAISE NOTICE 'Cleared table %: % rows deleted', table_name, row_count;
        RETURN row_count;
    ELSE
        RAISE NOTICE 'Table % does not exist - skipping', table_name;
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Clear data from tables that exist (in dependency order)
DO $$
DECLARE
    total_cleared INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CLEARING DATA FROM EXISTING TABLES:';
    RAISE NOTICE '========================================';
    
    -- Clear in order of dependencies (most dependent first)
    total_cleared := total_cleared + safe_delete_from_table('inventory_holds');
    total_cleared := total_cleared + safe_delete_from_table('inventory_audit_logs');
    total_cleared := total_cleared + safe_delete_from_table('check_ins');
    total_cleared := total_cleared + safe_delete_from_table('order_items');
    total_cleared := total_cleared + safe_delete_from_table('orders');
    total_cleared := total_cleared + safe_delete_from_table('payments');
    total_cleared := total_cleared + safe_delete_from_table('promo_codes');
    total_cleared := total_cleared + safe_delete_from_table('tickets');
    total_cleared := total_cleared + safe_delete_from_table('ticket_types');
    total_cleared := total_cleared + safe_delete_from_table('seating_sections');
    total_cleared := total_cleared + safe_delete_from_table('event_analytics');
    total_cleared := total_cleared + safe_delete_from_table('events');
    
    -- Clear venues and organizers
    total_cleared := total_cleared + safe_delete_from_table('venues');
    total_cleared := total_cleared + safe_delete_from_table('organizers');
    
    -- Clear analytics data
    total_cleared := total_cleared + safe_delete_from_table('web_analytics_conversions');
    total_cleared := total_cleared + safe_delete_from_table('web_analytics_events');
    total_cleared := total_cleared + safe_delete_from_table('web_analytics_page_views');
    total_cleared := total_cleared + safe_delete_from_table('web_analytics_sessions');
    
    -- Clear instructor data
    total_cleared := total_cleared + safe_delete_from_table('performance_alerts');
    total_cleared := total_cleared + safe_delete_from_table('instructor_revenue_analytics');
    total_cleared := total_cleared + safe_delete_from_table('instructor_student_feedback');
    total_cleared := total_cleared + safe_delete_from_table('instructor_class_performance');
    total_cleared := total_cleared + safe_delete_from_table('instructor_performance_metrics');
    total_cleared := total_cleared + safe_delete_from_table('instructor_profiles');
    
    -- Clear user content (but preserve user accounts)
    total_cleared := total_cleared + safe_delete_from_table('saved_events');
    total_cleared := total_cleared + safe_delete_from_table('saved_payment_methods');
    total_cleared := total_cleared + safe_delete_from_table('security_activity_log');
    
    -- Clear content management
    total_cleared := total_cleared + safe_delete_from_table('content_page_versions');
    total_cleared := total_cleared + safe_delete_from_table('content_pages');
    
    -- Clear configuration
    total_cleared := total_cleared + safe_delete_from_table('configuration_audit_log');
    total_cleared := total_cleared + safe_delete_from_table('pickup_locations');
    total_cleared := total_cleared + safe_delete_from_table('vod_configuration');
    total_cleared := total_cleared + safe_delete_from_table('platform_categories');
    total_cleared := total_cleared + safe_delete_from_table('platform_settings');
    total_cleared := total_cleared + safe_delete_from_table('saved_event_categories');
    total_cleared := total_cleared + safe_delete_from_table('security_activity_types');
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TOTAL ROWS CLEARED: %', total_cleared;
    RAISE NOTICE '========================================';
END $$;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Drop the temporary function
DROP FUNCTION safe_delete_from_table(TEXT);

-- ===============================================
-- INSERT ESSENTIAL SYSTEM DATA
-- ===============================================

-- Only insert essential data if the tables exist
DO $$
BEGIN
    -- Insert essential platform settings if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_settings') THEN
        INSERT INTO platform_settings (key, value, type, description, category, is_public) VALUES 
            ('site_name', 'SteppersLife', 'string', 'The name of the platform', 'general', true),
            ('site_tagline', 'Your Premier Step Dancing Community', 'string', 'Site tagline', 'general', true),
            ('contact_email', 'info@stepperslife.com', 'string', 'Contact email', 'contact', true),
            ('maintenance_mode', 'false', 'boolean', 'Maintenance mode', 'system', false);
        RAISE NOTICE 'Inserted essential platform settings';
    END IF;
    
    -- Insert essential content pages if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_pages') THEN
        INSERT INTO content_pages (title, slug, content, type, status, is_system_page) VALUES 
            ('About Us', 'about-us', '<h1>About SteppersLife</h1><p>Welcome to SteppersLife.</p>', 'page', 'published', true),
            ('Terms of Service', 'terms', '<h1>Terms of Service</h1><p>Terms and conditions.</p>', 'page', 'published', true);
        RAISE NOTICE 'Inserted essential content pages';
    END IF;
    
    -- Insert security activity types if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_activity_types') THEN
        INSERT INTO security_activity_types (type_name, description, default_risk_score, is_high_risk) VALUES
            ('login', 'Successful user login', 0, FALSE),
            ('logout', 'User logout', 0, FALSE),
            ('password_change', 'Password changed', 10, FALSE);
        RAISE NOTICE 'Inserted essential security activity types';
    END IF;
END $$;

-- ===============================================
-- FINAL VERIFICATION
-- ===============================================

DO $$
DECLARE
    table_name TEXT;
    row_count INTEGER;
    sql_query TEXT;
    total_users INTEGER;
    total_admins INTEGER;
    total_rows INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL VERIFICATION - AFTER RESET';
    RAISE NOTICE '========================================';
    
    -- Show final counts for all tables
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name
    LOOP
        sql_query := 'SELECT COUNT(*) FROM ' || quote_ident(table_name);
        EXECUTE sql_query INTO row_count;
        total_rows := total_rows + row_count;
        
        IF row_count > 0 THEN
            RAISE NOTICE '%: % rows', table_name, row_count;
        END IF;
    END LOOP;
    
    -- Check preserved users
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_admins FROM profiles WHERE role IN ('admin', 'super_admin');
    
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'PRESERVED DATA:';
    RAISE NOTICE 'Users: % (preserved)', total_users;
    RAISE NOTICE 'Admins: % (preserved)', total_admins;
    RAISE NOTICE 'Total data rows remaining: %', total_rows;
    RAISE NOTICE '========================================';
    
    IF total_users > 0 AND total_admins > 0 THEN
        RAISE NOTICE 'SUCCESS: Production database reset complete!';
        RAISE NOTICE 'Users and admin accounts preserved.';
        RAISE NOTICE 'Database ready for clean production data.';
    ELSE
        RAISE WARNING 'CHECK REQUIRED: Verify user/admin preservation.';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;-- SAFE PRODUCTION DATABASE RESET - CHECKS TABLE EXISTENCE FIRST
-- This script only deletes from tables that actually exist
-- Preserves: Users, Admin accounts, essential system settings only
-- Clears: ALL existing event/commerce data

-- ===============================================
-- DATABASE VERIFICATION & TABLE DISCOVERY
-- ===============================================

DO $$
DECLARE
    db_name TEXT;
    table_count INTEGER;
    user_count INTEGER;
    admin_count INTEGER;
BEGIN
    -- Get current database name for verification
    SELECT current_database() INTO db_name;
    
    -- Count existing tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    -- Count users and admins
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    SELECT COUNT(*) INTO admin_count 
    FROM profiles 
    WHERE role IN ('admin', 'super_admin');
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SAFE PRODUCTION DATABASE RESET';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Connected to database: %', db_name;
    RAISE NOTICE 'Total public tables found: %', table_count;
    RAISE NOTICE 'Current users: %', user_count;
    RAISE NOTICE 'Current admins: %', admin_count;
    RAISE NOTICE '========================================';
    
    IF admin_count = 0 THEN
        RAISE WARNING 'WARNING: No admin accounts found!';
    END IF;
END $$;

-- ===============================================
-- SHOW EXISTING TABLES AND THEIR ROW COUNTS
-- ===============================================

DO $$
DECLARE
    table_name TEXT;
    row_count INTEGER;
    sql_query TEXT;
BEGIN
    RAISE NOTICE 'CURRENT TABLE DATA COUN