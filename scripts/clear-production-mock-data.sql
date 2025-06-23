-- Clear all mock data from production database
-- This script removes test/mock data to prepare for real production use

BEGIN;

-- Delete test orders and related data
DELETE FROM order_items WHERE order_id IN (
  SELECT id FROM orders WHERE created_at < NOW() - INTERVAL '1 day'
  AND (
    billing_details->>'firstName' LIKE '%Test%' OR
    billing_details->>'firstName' LIKE '%Mock%' OR
    billing_details->>'email' LIKE '%test%' OR
    billing_details->>'email' LIKE '%example%'
  )
);

DELETE FROM orders WHERE created_at < NOW() - INTERVAL '1 day'
AND (
  billing_details->>'firstName' LIKE '%Test%' OR
  billing_details->>'firstName' LIKE '%Mock%' OR
  billing_details->>'email' LIKE '%test%' OR
  billing_details->>'email' LIKE '%example%'
);

-- Clear test events (keep only real events)
DELETE FROM ticket_types WHERE event_id IN (
  SELECT id FROM events WHERE 
  title LIKE '%Test%' OR 
  title LIKE '%Mock%' OR 
  title LIKE '%Sample%' OR
  description LIKE '%test%' OR
  description LIKE '%mock%'
);

DELETE FROM events WHERE 
title LIKE '%Test%' OR 
title LIKE '%Mock%' OR 
title LIKE '%Sample%' OR
description LIKE '%test%' OR
description LIKE '%mock%';

-- Clear test user accounts (keep admin accounts)
DELETE FROM profiles WHERE id IN (
  SELECT id FROM auth.users WHERE 
  email LIKE '%test%' OR 
  email LIKE '%example%' OR
  email LIKE '%mock%'
);

-- Clear test venues
DELETE FROM venues WHERE 
name LIKE '%Test%' OR 
name LIKE '%Mock%' OR 
name LIKE '%Sample%';

-- Clear test organizers (keep real ones)
DELETE FROM organizers WHERE 
company_name LIKE '%Test%' OR 
company_name LIKE '%Mock%' OR 
contact_email LIKE '%test%' OR
contact_email LIKE '%example%';

-- Reset any test configuration
UPDATE platform_configuration 
SET configuration = jsonb_set(
  configuration, 
  '{maintenance_mode}', 
  'false'::jsonb
) WHERE key = 'global_settings';

-- Ensure analytics tables are clean
DELETE FROM event_analytics WHERE created_at < NOW() - INTERVAL '7 days';
DELETE FROM financial_reports WHERE created_at < NOW() - INTERVAL '7 days';

-- Clear test content
DELETE FROM content_items WHERE 
title LIKE '%Test%' OR 
title LIKE '%Mock%' OR 
title LIKE '%Sample%';

-- Clear test blog posts
DELETE FROM blog_posts WHERE 
title LIKE '%Test%' OR 
title LIKE '%Mock%' OR 
title LIKE '%Sample%';

-- Clear test email campaigns
DELETE FROM email_campaigns WHERE 
name LIKE '%Test%' OR 
name LIKE '%Mock%';

-- Update system settings for production
INSERT INTO platform_configuration (key, configuration, updated_at)
VALUES (
  'payment_settings',
  '{
    "environment": "production",
    "square_environment": "production", 
    "paypal_environment": "production",
    "stripe_environment": "production",
    "mock_payments": false,
    "email_receipts": true
  }'::jsonb,
  NOW()
) ON CONFLICT (key) DO UPDATE SET
  configuration = EXCLUDED.configuration,
  updated_at = EXCLUDED.updated_at;

-- Log the cleanup
INSERT INTO system_logs (level, message, metadata, created_at)
VALUES (
  'INFO',
  'Production database cleanup completed - mock data removed',
  '{"action": "production_cleanup", "timestamp": "' || NOW()::text || '"}'::jsonb,
  NOW()
);

COMMIT;

-- Verify cleanup
SELECT 'Events' as table_name, COUNT(*) as remaining_count FROM events
UNION ALL
SELECT 'Orders' as table_name, COUNT(*) as remaining_count FROM orders  
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as remaining_count FROM auth.users
UNION ALL
SELECT 'Venues' as table_name, COUNT(*) as remaining_count FROM venues
UNION ALL
SELECT 'Organizers' as table_name, COUNT(*) as remaining_count FROM organizers;