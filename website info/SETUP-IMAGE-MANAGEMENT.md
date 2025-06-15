# 🔧 Image Management Setup Guide

## Issue: Cannot Upload Images

The image management system requires database tables and storage bucket setup in Supabase. Here's how to fix it:

## 🚀 Quick Fix (2 minutes)

### Step 1: Run Database Setup
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `scripts/setup-image-management.sql`
4. Click **Run** to execute the setup

### Step 2: Verify Setup
1. Go back to your app at `/admin/image-management`
2. You should see "✅ Database ready" status
3. Try uploading an image - it should work now!

## 🧪 Current Status: Development Mode

The system is currently running in **development mode** with these features:

- ✅ **Temporary Upload**: Images work locally for testing
- ✅ **Admin Interface**: Full management interface available
- ✅ **Theme Support**: Light/dark logo switching
- ✅ **Categorization**: Organize by type (logos, favicons, etc.)
- ⚠️ **Database Required**: Need to run setup script for persistence

## 📋 What the Setup Script Does

1. **Creates Tables**: `image_assets` and `image_asset_usage` tables
2. **Sets Permissions**: Row-level security for admin-only access
3. **Creates Storage**: `website-assets` bucket for file storage
4. **Adds Indexes**: For fast searching and filtering
5. **Sample Data**: Demo images to test with

## 🎯 After Setup

Once setup is complete, you can:

- ✅ Upload logos for light/dark themes
- ✅ Upload favicons for browser tabs
- ✅ Organize images by category and tags
- ✅ Activate/deactivate images
- ✅ Search and filter your assets
- ✅ See automatic logo switching on website

## 🔍 Troubleshooting

### If Upload Still Doesn't Work:

1. **Check Console**: Open browser dev tools → Console tab
2. **Look for Errors**: Note any red error messages
3. **Check Admin Status**: Ensure you're logged in as admin
4. **Verify Storage**: Go to Supabase → Storage → Check for `website-assets` bucket

### Database Not Ready?

If you see "⚠️ Database setup required":
- Run the SQL setup script in Supabase
- Refresh the page
- Should show "✅ Database ready"

### Still Having Issues?

Current development mode allows testing even without database:
- Upload will work temporarily (in browser memory)
- Images will display correctly
- You can test all features
- Data won't persist until database is set up

## 📱 Mobile Testing

The image management also works on mobile devices:
- Responsive design for phone/tablet
- Touch-friendly upload interface
- Mobile-optimized image preview

---

**TL;DR**: Copy `scripts/setup-image-management.sql` → Run in Supabase SQL Editor → Refresh page → Upload should work! 🎉 