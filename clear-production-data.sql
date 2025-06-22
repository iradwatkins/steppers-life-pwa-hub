-- SteppersLife Production Data Reset Script
-- This script clears ALL data except users/profiles while preserving the database structure
-- ⚠️  WARNING: This will permanently delete all events, orders, tickets, and related data
-- Only run this on production if you want to start with a completely clean database

-- =======================
-- DISABLE TRIGGERS TEMPORARILY
-- =======================
SET session_replication_role = replica;

-- =======================
-- CLEAR ALL BUSINESS DATA (Keep Users/Profiles)
-- =======================

-- Clear analytics and reporting data
DELETE FROM public.event_analytics;
DELETE FROM public.financial_reports;
DELETE FROM public.attendee_reports;
DELETE FROM public.platform_analytics;
DELETE FROM public.system_metrics;

-- Clear check-ins and attendance
DELETE FROM public.check_ins;

-- Clear payment records
DELETE FROM public.payments;

-- Clear order items and orders
DELETE FROM public.order_items;
DELETE FROM public.orders;

-- Clear tickets and ticket types
DELETE FROM public.tickets;
DELETE FROM public.ticket_types;

-- Clear promo codes
DELETE FROM public.promo_codes;

-- Clear seating sections
DELETE FROM public.seating_sections;

-- Clear events
DELETE FROM public.events;

-- Clear venues
DELETE FROM public.venues;

-- Clear organizers
DELETE FROM public.organizers;

-- Clear content management data
DELETE FROM public.blog_posts;
DELETE FROM public.blog_categories;
DELETE FROM public.page_content;

-- Clear saved events/wishlists
DELETE FROM public.saved_events;

-- Clear saved payment methods
DELETE FROM public.saved_payment_methods;

-- Clear security activity logs (optional - comment out if you want to keep audit trail)
DELETE FROM public.security_activity_log;

-- Clear platform configuration (reset to defaults)
DELETE FROM public.platform_settings;
DELETE FROM public.email_templates;
DELETE FROM public.notification_templates;

-- Clear user uploads (files will need to be manually deleted from storage bucket)
-- Note: This only clears the metadata, actual files in storage buckets need separate cleanup

-- =======================
-- RESET SEQUENCES AND COUNTERS
-- =======================

-- Reset any auto-incrementing sequences
-- ALTER SEQUENCE IF EXISTS <sequence_name> RESTART WITH 1;

-- =======================
-- RE-ENABLE TRIGGERS
-- =======================
SET session_replication_role = DEFAULT;

-- =======================
-- VERIFY CLEANUP
-- =======================

-- Check remaining data (should only show users/profiles)
SELECT 
    'profiles' as table_name, 
    COUNT(*) as record_count 
FROM public.profiles
UNION ALL
SELECT 'organizers', COUNT(*) FROM public.organizers
UNION ALL
SELECT 'venues', COUNT(*) FROM public.venues
UNION ALL
SELECT 'events', COUNT(*) FROM public.events
UNION ALL
SELECT 'tickets', COUNT(*) FROM public.tickets
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'payments', COUNT(*) FROM public.payments
UNION ALL
SELECT 'saved_events', COUNT(*) FROM public.saved_events
UNION ALL
SELECT 'saved_payment_methods', COUNT(*) FROM public.saved_payment_methods
ORDER BY table_name;

-- =======================
-- IMPORTANT NOTES
-- =======================

-- 1. This script preserves:
--    - auth.users (Supabase authentication)
--    - public.profiles (user profile data)

-- 2. This script deletes:
--    - All events and related data
--    - All orders, tickets, and payments
--    - All venues and organizers
--    - All analytics and reports
--    - All content management data
--    - All saved data (wishlists, payment methods)

-- 3. Manual cleanup required:
--    - Storage buckets (user uploads, event images)
--    - Any external service data (Stripe, PayPal records)
--    - CDN cached content

-- 4. After running this script:
--    - Users can still log in with existing accounts
--    - All business data will be cleared
--    - Application will function but show no events/content
--    - Perfect for production launch with clean data

COMMIT; 