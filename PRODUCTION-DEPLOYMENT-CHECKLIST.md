# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

## Critical: Image Upload System Production Setup

### ✅ **Pre-Deployment Verification**

1. **Environment Variables**
   - [ ] Production Supabase URL: `https://voaxyetbqhmgbvcxsttf.supabase.co`
   - [ ] Production Supabase Anon Key configured
   - [ ] `VITE_APP_ENV=production` set correctly

2. **Database Schema**
   - [ ] All migrations applied to production database
   - [ ] BMAD follower system deployed
   - [ ] Team member permissions added
   - [ ] Role consolidation (admin/organizer/user) complete

### 🔥 **CRITICAL: Execute Production SQL Script**

**MUST RUN IN PRODUCTION DASHBOARD:**
```
URL: https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql/new
FILE: COMPLETE-PRODUCTION-DEPLOYMENT.sql
```

This script includes:
- ✅ Image storage bucket creation with 50MB limit
- ✅ RLS policies for authenticated uploads
- ✅ BMAD follower system deployment
- ✅ Admin role consolidation
- ✅ Team member QR scanning permissions
- ✅ Event type system
- ✅ Production verification queries

### 📝 **Post-Deployment Testing**

#### Test 1: Profile Image Upload
- [ ] Login to production site
- [ ] Go to Profile page
- [ ] Upload profile picture
- [ ] Verify image displays correctly
- [ ] Check Supabase storage bucket has image

#### Test 2: Event Image Upload  
- [ ] Create new event in production
- [ ] Upload featured image
- [ ] Upload gallery images
- [ ] Verify images display on event page
- [ ] Check images stored in Supabase

#### Test 3: Store Image Upload
- [ ] Create new store listing
- [ ] Upload store photos (up to 5)
- [ ] Verify images display correctly
- [ ] Check community browse page shows images

#### Test 4: Service Image Upload
- [ ] Create new service listing
- [ ] Upload business images (up to 5)
- [ ] Upload portfolio images (up to 10)
- [ ] Verify both types display correctly

### 🔍 **Production Environment Verification**

Run these checks in production Supabase dashboard:

```sql
-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'images';

-- Check storage policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check role distribution
SELECT role, COUNT(*) FROM profiles GROUP BY role;

-- Check BMAD tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'follower_%';
```

### 🚨 **Critical Production Issues to Watch**

1. **Storage Permissions**
   - If uploads fail with "bucket not found" → Re-run storage setup section
   - If uploads fail with "permission denied" → Check RLS policies

2. **Image Display Issues**  
   - If images don't display → Check public bucket access
   - If old images broken → Verify production URL configuration

3. **Role System Issues**
   - If admin features don't work → Verify role consolidation completed
   - If organizer permissions fail → Check organizer policies

### 📋 **Environment-Specific Configuration**

#### Development
- Supabase URL: `https://nwoteszpvvefbopbbvrl.supabase.co`
- Local development server: `http://localhost:8080`

#### Production  
- Supabase URL: `https://voaxyetbqhmgbvcxsttf.supabase.co`
- Production URL: `https://stepperslife.com`

### 🔒 **Security Verification**

- [ ] RLS enabled on all sensitive tables
- [ ] Storage policies restrict access appropriately
- [ ] Admin policies only allow admin role access
- [ ] User data isolation maintained

### 📊 **Performance Verification**

- [ ] Image optimization working (check compression ratios)
- [ ] Upload speeds acceptable in production
- [ ] Large images (up to 50MB) can be uploaded
- [ ] Multiple file uploads work simultaneously

---

## 🎯 **SUCCESS CRITERIA**

✅ **Complete when ALL of the following work in production:**

1. ✅ Profile image upload and display
2. ✅ Event featured and gallery image upload
3. ✅ Store image upload (up to 5 images)
4. ✅ Service business and portfolio images
5. ✅ Images display correctly on website
6. ✅ Images stored properly in Supabase storage
7. ✅ Edit functionality allows image updates
8. ✅ Delete functionality removes images properly

**CRITICAL:** Do not consider deployment complete until ALL image functionality is verified working in the live production environment.
