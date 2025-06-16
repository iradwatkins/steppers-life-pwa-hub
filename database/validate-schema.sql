-- Schema Validation Script for SteppersLife Database
-- Run this after applying schema.sql to verify all tables exist

-- Check if UUID extension is enabled
SELECT 
  extname as "Extension",
  extversion as "Version"
FROM pg_extension 
WHERE extname = 'uuid-ossp';

-- Check if all enum types exist
SELECT 
  t.typname as "Enum Type",
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as "Values"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN ('user_role', 'event_status', 'ticket_status', 'payment_status', 'order_status')
GROUP BY t.typname
ORDER BY t.typname;

-- Check if all tables exist with row counts
SELECT 
  schemaname as "Schema",
  tablename as "Table",
  CASE 
    WHEN has_table_privilege(schemaname||'.'||tablename, 'SELECT') 
    THEN (SELECT count(*) FROM information_schema.tables WHERE table_schema = schemaname AND table_name = tablename)::text
    ELSE 'No Access'
  END as "Exists"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles', 'organizers', 'venues', 'events', 'ticket_types', 
    'seating_sections', 'tickets', 'orders', 'order_items', 
    'promo_codes', 'payments', 'check_ins', 'event_analytics'
  )
ORDER BY tablename;

-- Check Row Level Security policies
SELECT 
  schemaname as "Schema",
  tablename as "Table",
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'organizers', 'events', 'orders', 'order_items')
ORDER BY tablename;

-- Check if critical indexes exist
SELECT 
  indexname as "Index",
  tablename as "Table"
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check if update triggers exist
SELECT 
  trigger_name as "Trigger",
  event_object_table as "Table"
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;