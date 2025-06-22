-- PRODUCTION DATA RESET - SIMPLE VERSION
-- ⚠️  WARNING: This permanently deletes all data except users!
-- Run this directly in your Supabase SQL editor

-- =======================
-- SAFETY CHECK
-- =======================
-- Before running, verify you're in the correct database
-- Check that this is indeed production and you want to clear ALL data

-- Verify current data (run this first to see what will be deleted)
SELECT 
    'BEFORE CLEARING - Current Data Count' as status,
    'profiles' as table_name, 
    COUNT(*) as record_count 
FROM public.profiles
UNION ALL
SELECT 'BEFORE CLEARING', 'organizers', COUNT(*) FROM public.organizers
UNION ALL
SELECT 'BEFORE CLEARING', 'venues', COUNT(*) FROM public.venues
UNION ALL
SELECT 'BEFORE CLEARING', 'events', COUNT(*) FROM public.events
UNION ALL
SELECT 'BEFORE CLEARING', 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'BEFORE CLEARING', 'tickets', COUNT(*) FROM public.tickets
ORDER BY table_name;

-- =======================
-- CLEAR ALL DATA (EXCEPT USERS)
-- =======================

-- Start transaction for safety
BEGIN;

-- Clear in correct order to respect foreign key constraints

-- 1. Clear analytics and reports first
TRUNCATE TABLE public.event_analytics CASCADE;
TRUNCATE TABLE public.check_ins CASCADE;

-- 2. Clear payment data
TRUNCATE TABLE public.payments CASCADE;

-- 3. Clear order data (order_items will cascade)
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;

-- 4. Clear ticket data
TRUNCATE TABLE public.tickets CASCADE;
TRUNCATE TABLE public.ticket_types CASCADE;

-- 5. Clear promo codes
TRUNCATE TABLE public.promo_codes CASCADE;

-- 6. Clear seating data
TRUNCATE TABLE public.seating_sections CASCADE;

-- 7. Clear events (this should cascade to related tables)
TRUNCATE TABLE public.events CASCADE;

-- 8. Clear venues
TRUNCATE TABLE public.venues CASCADE;

-- 9. Clear organizers
TRUNCATE TABLE public.organizers CASCADE;

-- 10. Clear user saved data
TRUNCATE TABLE public.saved_events CASCADE;
TRUNCATE TABLE public.saved_payment_methods CASCADE;

-- 11. Clear content management (if tables exist)
-- TRUNCATE TABLE public.blog_posts CASCADE;
-- TRUNCATE TABLE public.blog_categories CASCADE;
-- TRUNCATE TABLE public.page_content CASCADE;

-- =======================
-- VERIFY CLEANUP
-- =======================

-- Check what remains (should only be users/profiles)
SELECT 
    'AFTER CLEARING - Remaining Data' as status,
    'profiles' as table_name, 
    COUNT(*) as record_count 
FROM public.profiles
UNION ALL
SELECT 'AFTER CLEARING', 'organizers', COUNT(*) FROM public.organizers
UNION ALL
SELECT 'AFTER CLEARING', 'venues', COUNT(*) FROM public.venues
UNION ALL
SELECT 'AFTER CLEARING', 'events', COUNT(*) FROM public.events
UNION ALL
SELECT 'AFTER CLEARING', 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'AFTER CLEARING', 'tickets', COUNT(*) FROM public.tickets
ORDER BY table_name;

-- =======================
-- COMMIT OR ROLLBACK
-- =======================

-- If everything looks correct, uncomment the next line:
-- COMMIT;

-- If something went wrong, uncomment this line instead:
-- ROLLBACK;

-- =======================
-- IMPORTANT NOTES
-- =======================

/*
✅ PRESERVED:
- auth.users (all user accounts)
- public.profiles (user profile data)
- Database schema and structure
- RLS policies and permissions

🗑️ CLEARED:
- All events and event data
- All orders, tickets, and payments
- All venues and organizers
- All analytics and reports
- All user saved data (wishlists, etc.)

📋 MANUAL CLEANUP STILL NEEDED:
1. Storage buckets in Supabase:
   - Go to Storage in Supabase dashboard
   - Delete all files in buckets (user-uploads, event-images, etc.)

2. External services:
   - Stripe dashboard: Clear test/production data as needed
   - PayPal: Clear transaction history if applicable
   - Any email service data

3. CDN/Cache:
   - Clear any cached content
   - Invalidate CDN caches

🚀 RESULT:
- Users can still log in with existing accounts
- Application will function but show no events/content
- Perfect clean slate for production launch
*/ 