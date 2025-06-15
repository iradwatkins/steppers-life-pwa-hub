# Database Setup Instructions

## Overview
This directory contains the database schema and migration files for the SteppersLife event management platform.

## Files
- `schema.sql` - Complete database schema with tables, indexes, RLS policies, and triggers
- `README.md` - This file with setup instructions

## Setup Instructions

### 1. Development Database Setup
The development database is already configured and ready to use.

### 2. Production Database Setup
To set up the production database:

1. **Access Supabase Dashboard**
   - Go to https://nvryyufpbcruyqqndyjn.supabase.co
   - Navigate to SQL Editor

2. **Run Schema Migration**
   - Copy the contents of `schema.sql`
   - Paste into the SQL Editor
   - Execute the script

3. **Verify Setup**
   - Check that all tables are created
   - Verify RLS policies are enabled
   - Test authentication flow

### 3. Environment Configuration
The application automatically switches between development and production databases based on the environment:

- **Development:** Uses `https://nwoteszpvvefbopbbvrl.supabase.co`
- **Production:** Uses `https://nvryyufpbcruyqqndyjn.supabase.co`

### 4. Required Tables
The schema creates the following core tables:
- `profiles` - User profiles with roles
- `organizers` - Event organizer information
- `venues` - Event venues
- `events` - Main events table
- `ticket_types` - Ticket configurations
- `tickets` - Individual tickets
- `orders` - Purchase orders
- `order_items` - Items in orders
- `promo_codes` - Promotional codes
- `payments` - Payment records
- `check_ins` - Event check-in tracking

### 5. Row Level Security (RLS)
RLS policies are configured to ensure:
- Users can only access their own data
- Organizers can manage their own events
- Admins have elevated permissions
- Public can view published events

### 6. User Roles
The system supports the following user roles:
- `user` - Standard user (default)
- `organizer` - Can create and manage events
- `admin` - Platform administrator
- `super_admin` - Full system access

## Migration Notes
- The schema is designed to be run from scratch
- All foreign key constraints are properly configured
- Indexes are optimized for common query patterns
- Triggers handle automatic timestamp updates

## Troubleshooting
If you encounter issues:
1. Ensure you have proper permissions in Supabase
2. Check that all environment variables are set correctly
3. Verify the database URL is accessible
4. Review the Supabase logs for any errors