-- SteppersLife SAFE Production Data Reset Script
-- This script safely clears ALL data except users/profiles
-- Checks table existence before deletion to avoid errors

DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- =======================
    -- DISABLE TRIGGERS TEMPORARILY
    -- =======================
    SET session_replication_role = replica;
    
    RAISE NOTICE 'Starting production data cleanup...';
    
    -- =======================
    -- CLEAR ANALYTICS DATA
    -- =======================
    
    -- Clear event analytics
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_analytics') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.event_analytics;
        RAISE NOTICE 'Cleared event_analytics table';
    END IF;
    
    -- Clear financial reports
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financial_reports') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.financial_reports;
        RAISE NOTICE 'Cleared financial_reports table';
    END IF;
    
    -- Clear attendee reports
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendee_reports') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.attendee_reports;
        RAISE NOTICE 'Cleared attendee_reports table';
    END IF;
    
    -- Clear platform analytics
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platform_analytics') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.platform_analytics;
        RAISE NOTICE 'Cleared platform_analytics table';
    END IF;
    
    -- Clear system metrics
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_metrics') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.system_metrics;
        RAISE NOTICE 'Cleared system_metrics table';
    END IF;
    
    -- =======================
    -- CLEAR ATTENDANCE DATA
    -- =======================
    
    -- Clear check-ins
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'check_ins') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.check_ins;
        RAISE NOTICE 'Cleared check_ins table';
    END IF;
    
    -- =======================
    -- CLEAR PAYMENT DATA
    -- =======================
    
    -- Clear payments
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.payments;
        RAISE NOTICE 'Cleared payments table';
    END IF;
    
    -- =======================
    -- CLEAR ORDER DATA
    -- =======================
    
    -- Clear order items first (foreign key dependency)
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.order_items;
        RAISE NOTICE 'Cleared order_items table';
    END IF;
    
    -- Clear orders
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.orders;
        RAISE NOTICE 'Cleared orders table';
    END IF;
    
    -- =======================
    -- CLEAR TICKET DATA
    -- =======================
    
    -- Clear tickets
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tickets') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.tickets;
        RAISE NOTICE 'Cleared tickets table';
    END IF;
    
    -- Clear ticket types
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ticket_types') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.ticket_types;
        RAISE NOTICE 'Cleared ticket_types table';
    END IF;
    
    -- =======================
    -- CLEAR PROMO CODES
    -- =======================
    
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promo_codes') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.promo_codes;
        RAISE NOTICE 'Cleared promo_codes table';
    END IF;
    
    -- =======================
    -- CLEAR SEATING DATA
    -- =======================
    
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'seating_sections') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.seating_sections;
        RAISE NOTICE 'Cleared seating_sections table';
    END IF;
    
    -- =======================
    -- CLEAR EVENT DATA
    -- =======================
    
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.events;
        RAISE NOTICE 'Cleared events table';
    END IF;
    
    -- =======================
    -- CLEAR VENUE DATA
    -- =======================
    
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'venues') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.venues;
        RAISE NOTICE 'Cleared venues table';
    END IF;
    
    -- =======================
    -- CLEAR ORGANIZER DATA
    -- =======================
    
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizers') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.organizers;
        RAISE NOTICE 'Cleared organizers table';
    END IF;
    
    -- =======================
    -- CLEAR CONTENT DATA
    -- =======================
    
    -- Clear blog posts
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blog_posts') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.blog_posts;
        RAISE NOTICE 'Cleared blog_posts table';
    END IF;
    
    -- Clear blog categories
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blog_categories') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.blog_categories;
        RAISE NOTICE 'Cleared blog_categories table';
    END IF;
    
    -- Clear page content
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'page_content') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.page_content;
        RAISE NOTICE 'Cleared page_content table';
    END IF;
    
    -- =======================
    -- CLEAR USER SAVED DATA
    -- =======================
    
    -- Clear saved events
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_events') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.saved_events;
        RAISE NOTICE 'Cleared saved_events table';
    END IF;
    
    -- Clear saved payment methods
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_payment_methods') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.saved_payment_methods;
        RAISE NOTICE 'Cleared saved_payment_methods table';
    END IF;
    
    -- =======================
    -- CLEAR ACTIVITY LOGS (OPTIONAL)
    -- =======================
    
    -- Uncomment the next block if you want to clear security logs
    /*
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_activity_log') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.security_activity_log;
        RAISE NOTICE 'Cleared security_activity_log table';
    END IF;
    */
    
    -- =======================
    -- CLEAR PLATFORM CONFIG
    -- =======================
    
    -- Clear platform settings
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platform_settings') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.platform_settings;
        RAISE NOTICE 'Cleared platform_settings table';
    END IF;
    
    -- Clear email templates
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_templates') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.email_templates;
        RAISE NOTICE 'Cleared email_templates table';
    END IF;
    
    -- Clear notification templates
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notification_templates') INTO table_exists;
    IF table_exists THEN
        DELETE FROM public.notification_templates;
        RAISE NOTICE 'Cleared notification_templates table';
    END IF;
    
    -- =======================
    -- RE-ENABLE TRIGGERS
    -- =======================
    SET session_replication_role = DEFAULT;
    
    RAISE NOTICE 'Production data cleanup completed successfully!';
    RAISE NOTICE 'Users and profiles have been preserved.';
    RAISE NOTICE 'All business data has been cleared.';
    
END $$; 