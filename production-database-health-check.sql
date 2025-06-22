-- PRODUCTION DATABASE HEALTH CHECK
-- Run this in your Supabase SQL Editor to verify database state

-- =====================================================
-- STEP 1: CHECK CURRENT DATABASE STATE
-- =====================================================

SELECT 
    '🔍 PRODUCTION DATABASE HEALTH CHECK' as check_type,
    NOW() as check_time;

-- Count all public tables
SELECT 
    '📊 TOTAL TABLES COUNT' as metric,
    COUNT(*) as value
FROM pg_tables 
WHERE schemaname = 'public';

-- List all existing tables
SELECT 
    '📋 EXISTING TABLES' as category,
    tablename as table_name,
    CASE 
        WHEN tablename IN ('profiles') THEN '✅ Auth Table'
        WHEN tablename IN ('organizers', 'venues', 'events') THEN '🎯 Core Business'
        WHEN tablename IN ('tickets', 'ticket_types', 'orders', 'order_items') THEN '🎫 Ticketing'
        WHEN tablename IN ('payments', 'promo_codes') THEN '💳 Commerce'
        WHEN tablename IN ('saved_events', 'saved_payment_methods') THEN '💾 User Data'
        WHEN tablename IN ('blog_posts', 'blog_categories') THEN '📝 Content'
        WHEN tablename IN ('security_activity_log', 'check_ins') THEN '🔒 Security/Analytics'
        ELSE '❓ Other'
    END as table_category
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- STEP 2: CHECK CRITICAL TABLES
-- =====================================================

-- Check if critical tables exist
SELECT 
    '🎯 CRITICAL TABLES VERIFICATION' as check_category,
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
        ('profiles'),
        ('organizers'),
        ('venues'), 
        ('events'),
        ('ticket_types'),
        ('tickets'),
        ('orders'),
        ('order_items'),
        ('payments'),
        ('promo_codes')
) AS required_tables(table_name)
LEFT JOIN pg_tables pt ON pt.tablename = required_tables.table_name AND pt.schemaname = 'public';

-- =====================================================
-- STEP 3: CHECK ENUM TYPES
-- =====================================================

SELECT 
    '🏷️ ENUM TYPES CHECK' as check_category,
    typname as enum_name,
    '✅ EXISTS' as status
FROM pg_type 
WHERE typtype = 'e' 
AND typname IN ('user_role', 'event_status', 'ticket_status', 'payment_status', 'order_status')
ORDER BY typname;

-- =====================================================
-- STEP 4: CHECK TABLE STRUCTURE
-- =====================================================

-- Check profiles table structure
SELECT 
    '👤 PROFILES TABLE COLUMNS' as check_category,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if events table exists and has proper structure
SELECT 
    '🎪 EVENTS TABLE CHECK' as check_category,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'events' AND schemaname = 'public') 
        THEN CONCAT('✅ EXISTS with ', COUNT(*), ' columns')
        ELSE '❌ MISSING'
    END as status
FROM information_schema.columns 
WHERE table_name = 'events' 
AND table_schema = 'public';

-- =====================================================
-- STEP 5: DATA VERIFICATION
-- =====================================================

-- Check user count (should be preserved)
SELECT 
    '👥 USER DATA' as metric,
    'auth.users' as table_name,
    COUNT(*) as record_count
FROM auth.users;

-- Check profiles count
SELECT 
    '👤 PROFILES DATA' as metric,
    'public.profiles' as table_name,
    COALESCE(COUNT(*), 0) as record_count
FROM public.profiles;

-- =====================================================
-- STEP 6: MISSING TABLES DETECTION
-- =====================================================

WITH required_tables AS (
    SELECT unnest(ARRAY[
        'profiles', 'organizers', 'venues', 'events', 'ticket_types', 
        'tickets', 'orders', 'order_items', 'payments', 'promo_codes',
        'saved_events', 'saved_payment_methods', 'security_activity_log',
        'blog_categories', 'blog_posts', 'seating_sections', 'check_ins'
    ]) as required_table
),
existing_tables AS (
    SELECT tablename as existing_table 
    FROM pg_tables 
    WHERE schemaname = 'public'
)
SELECT 
    '❌ MISSING TABLES' as issue_type,
    rt.required_table as missing_table,
    'NEEDS SCHEMA DEPLOYMENT' as action_needed
FROM required_tables rt
LEFT JOIN existing_tables et ON rt.required_table = et.existing_table
WHERE et.existing_table IS NULL;

-- =====================================================
-- STEP 7: FINAL DIAGNOSIS
-- =====================================================

WITH table_counts AS (
    SELECT COUNT(*) as total_tables
    FROM pg_tables 
    WHERE schemaname = 'public'
),
required_count AS (
    SELECT 17 as required_tables  -- Expected number of tables
)
SELECT 
    '🏥 FINAL DIAGNOSIS' as diagnosis_type,
    tc.total_tables as current_tables,
    rc.required_tables as required_tables,
    CASE 
        WHEN tc.total_tables >= rc.required_tables THEN '🎉 DATABASE IS HEALTHY!'
        WHEN tc.total_tables >= 10 THEN '⚠️ PARTIALLY DEPLOYED - Missing some tables'
        WHEN tc.total_tables <= 3 THEN '🚨 CRITICAL - Need full schema deployment'
        ELSE '❓ UNKNOWN STATE'
    END as health_status,
    CASE 
        WHEN tc.total_tables < rc.required_tables 
        THEN 'RUN DEPLOY-PRODUCTION-SCHEMA-NOW.sql IMMEDIATELY'
        ELSE 'Database appears healthy'
    END as recommendation
FROM table_counts tc, required_count rc;

-- Show final message
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') < 10
        THEN '🚨 ACTION REQUIRED: Copy and run DEPLOY-PRODUCTION-SCHEMA-NOW.sql in this SQL Editor'
        ELSE '✅ Database appears properly configured'
    END as final_message; 