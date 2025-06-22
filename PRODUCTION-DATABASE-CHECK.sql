-- PRODUCTION DATABASE CHECK - Verify Current Data
-- This script shows what data currently exists in production database
-- Use this to verify before and after running reset script

DO $$
DECLARE
    db_name TEXT;
    total_events INTEGER;
    total_venues INTEGER;
    total_organizers INTEGER;
    total_tickets INTEGER;
    total_orders INTEGER;
    total_payments INTEGER;
    total_users INTEGER;
    total_admins INTEGER;
    total_analytics INTEGER;
    total_instructors INTEGER;
BEGIN
    -- Get current database name
    SELECT current_database() INTO db_name;
    
    -- Count all major data tables
    SELECT COUNT(*) INTO total_events FROM events;
    SELECT COUNT(*) INTO total_venues FROM venues;
    SELECT COUNT(*) INTO total_organizers FROM organizers;
    SELECT COUNT(*) INTO total_tickets FROM tickets;
    SELECT COUNT(*) INTO total_orders FROM orders;
    SELECT COUNT(*) INTO total_payments FROM payments;
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_admins FROM profiles WHERE role IN ('admin', 'super_admin');
    SELECT COUNT(*) INTO total_analytics FROM web_analytics_sessions;
    SELECT COUNT(*) INTO total_instructors FROM instructor_profiles;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRODUCTION DATABASE STATUS CHECK';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database: %', db_name;
    RAISE NOTICE '';
    RAISE NOTICE 'CURRENT DATA COUNTS:';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Events: %', total_events;
    RAISE NOTICE 'Venues: %', total_venues;
    RAISE NOTICE 'Organizers: %', total_organizers;
    RAISE NOTICE 'Tickets: %', total_tickets;
    RAISE NOTICE 'Orders: %', total_orders;
    RAISE NOTICE 'Payments: %', total_payments;
    RAISE NOTICE 'Analytics Sessions: %', total_analytics;
    RAISE NOTICE 'Instructor Profiles: %', total_instructors;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Users (preserved): %', total_users;
    RAISE NOTICE 'Admin Accounts (preserved): %', total_admins;
    RAISE NOTICE '========================================';
    
    -- Provide recommendations
    IF total_events > 0 OR total_venues > 0 OR total_organizers > 0 THEN
        RAISE NOTICE 'RECOMMENDATION: Run production reset to clear mock data';
        RAISE NOTICE 'Command: npm run reset:prod';
    ELSE
        RAISE NOTICE 'STATUS: Production database appears clean';
        RAISE NOTICE 'Ready for live events and products';
    END IF;
    
    IF total_admins = 0 THEN
        RAISE WARNING 'WARNING: No admin accounts found!';
        RAISE WARNING 'Create admin account before going live';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;