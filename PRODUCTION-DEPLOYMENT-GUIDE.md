# Production Database Deployment Guide

## 🚨 CRITICAL: Production Database Missing 80% of Required Tables

Your production Supabase database (`https://nvryyufpbcruyqqndyjn.supabase.co`) is missing most of the required tables, which is why the application is not functioning properly in production.

## Quick Deployment Steps

### Step 1: Access Production Supabase
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to your production project: `nvryyufpbcruyqqndyjn`
3. Click on "SQL Editor" in the left sidebar

### Step 2: Deploy Complete Schema
1. Open the file `DEPLOY-PRODUCTION-SCHEMA-COMPLETE.sql` from this repository
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click "RUN" to execute the script

### Step 3: Verify Deployment
The script includes verification queries at the end that will show:
- All tables created
- Record counts for each table
- Enum types verification

### Step 4: Test Application
After running the script, your production application should work properly with:
- User registration and authentication
- Event creation and management
- Ticket purchasing
- Payment processing
- All admin functionality

## What This Script Creates

### Core Tables (14 tables)
- `profiles` - User profiles extending auth.users
- `organizers` - Event organizer information
- `venues` - Event venue details
- `events` - Main events table
- `ticket_types` - Different ticket types per event
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `tickets` - Individual tickets with QR codes
- `payments` - Payment processing records
- `following` - User following relationships
- `event_analytics` - Event performance metrics
- `platform_categories` - Event/content categories
- `platform_settings` - Platform configuration
- `content_pages` - Static content management

### Security Features
- Row Level Security (RLS) enabled on all tables
- Comprehensive security policies
- Admin-only access controls
- User data protection

### Performance Optimizations
- 25+ database indexes for fast queries
- Optimized for event discovery
- Efficient user and order lookups
- Analytics query optimization

### Automated Features
- Auto-updating timestamps
- User profile creation on registration
- Data validation and constraints
- Foreign key relationships

## Initial Data Included

### Platform Categories
- Dance Events
- Classes  
- Social Events
- Competitions
- Workshops

### Platform Settings
- Site configuration
- Contact information
- Currency and timezone defaults
- VOD hosting settings

### Content Pages
- About Us
- Contact Us
- Terms of Service
- Privacy Policy
- FAQ

## Safety Features

- Uses `IF NOT EXISTS` to prevent conflicts
- Won't overwrite existing data
- Includes rollback capabilities
- Comprehensive error handling

## Expected Results

After deployment, you should see:
- **15+ tables** in your public schema
- **5 enum types** for data validation
- **25+ indexes** for performance
- **Default data** for immediate use
- **Full RLS security** enabled

## Troubleshooting

If you encounter any errors:
1. Check the Supabase logs for specific error messages
2. Ensure you have admin permissions on the database
3. Verify your database connection is stable
4. Contact support if issues persist

## Post-Deployment Checklist

- [ ] All tables created successfully
- [ ] Verification queries show expected results
- [ ] Application loads without database errors
- [ ] User registration works
- [ ] Event creation functions properly
- [ ] Admin dashboard accessible

## Next Steps

Once the database is deployed:
1. Test all major application features
2. Create your first admin user
3. Add sample events for testing
4. Configure payment processing
5. Set up email notifications

---

**⚠️ IMPORTANT**: This deployment must be completed before your production application will function properly. The missing tables are causing all the database errors you're experiencing. 