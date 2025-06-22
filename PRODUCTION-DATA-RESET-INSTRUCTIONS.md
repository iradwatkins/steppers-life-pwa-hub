# 🚨 Production Data Reset Instructions

## ⚠️ CRITICAL WARNING
**This process will permanently delete ALL business data from your production database while preserving user accounts.**

Only proceed if you want to start with a completely clean production database.

---

## 🎯 What This Does

### ✅ **PRESERVES:**
- User accounts (`auth.users`)
- User profiles (`public.profiles`) 
- Database schema and structure
- RLS policies and permissions
- Authentication and security settings

### 🗑️ **DELETES:**
- **All events** and event data
- **All orders**, tickets, and payments
- **All venues** and organizers
- **All analytics** and reports
- **All content** (blog posts, pages)
- **All user saved data** (wishlists, payment methods)

---

## 🛠️ Method 1: Direct SQL (Recommended)

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query

### Step 2: Run Safety Check
Copy and paste this query first to see what data exists:

```sql
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
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'tickets', COUNT(*) FROM public.tickets
ORDER BY table_name;
```

### Step 3: Execute Main Clearing Script
Copy the entire contents of `database/clear-production-data-simple.sql` and paste into SQL Editor.

**⚠️ IMPORTANT:** The script includes `BEGIN` and requires you to manually `COMMIT` or `ROLLBACK`.

### Step 4: Review Results
The script will show before/after counts. Only commit if the results look correct.

### Step 5: Commit Changes
If everything looks good, uncomment and run:
```sql
COMMIT;
```

---

## 🛠️ Method 2: Node.js Script

### Prerequisites
Make sure you have:
- `VITE_SUPABASE_URL` in your environment
- `SUPABASE_SERVICE_ROLE_KEY` in your environment

### Run the Script
```bash
# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run with safety confirmation
node scripts/clear-production-data.js --confirm-delete-all-data
```

---

## 📋 Manual Cleanup After SQL Script

### 1. Clear Supabase Storage Buckets
1. Go to **Storage** in Supabase dashboard
2. Delete all files in these buckets:
   - `user-uploads`
   - `event-images` 
   - Any other custom buckets

### 2. Clear External Services
- **Stripe:** Clear test/production data as needed
- **PayPal:** Clear transaction history if applicable
- **Email services:** Clear templates/campaigns

### 3. Clear CDN/Cache
- Invalidate any CDN caches
- Clear application cache if applicable

---

## 🔍 Verification

After completion, verify the cleanup:

```sql
-- Should show users but empty business tables
SELECT 
    'profiles' as table_name, 
    COUNT(*) as record_count 
FROM public.profiles
UNION ALL
SELECT 'events', COUNT(*) FROM public.events
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders;
```

**Expected Results:**
- `profiles`: Should show your user count (preserved)
- `events`: Should show 0 (cleared)
- `orders`: Should show 0 (cleared)

---

## ✅ Post-Reset State

After successful completion:

### 👥 **Users:**
- Can still log in with existing accounts
- Profile data intact
- Authentication working normally

### 📱 **Application:**
- Functions normally
- Shows empty states (no events, orders, etc.)
- Ready for real production data
- All features work but with clean data

### 🚀 **Ready For:**
- Production launch
- Real event creation
- Live user activity
- Clean analytics from day one

---

## 🆘 Troubleshooting

### If Script Fails:
1. **Foreign Key Errors:** Run `ROLLBACK;` and check table dependencies
2. **Permission Errors:** Ensure you're using service role key or have admin access
3. **Table Not Found:** Some tables might not exist yet - that's normal

### If You Need to Undo:
**⚠️ There is NO undo for this operation.** 

The only recovery is from database backups. Ensure you have a backup before proceeding.

---

## 🎯 Final Checklist

Before marking as complete:

- [ ] SQL script executed successfully
- [ ] Data verification shows expected results  
- [ ] Storage buckets cleared
- [ ] External services cleaned up
- [ ] Application tested and showing clean state
- [ ] Users can still log in normally

**🚀 Production database is now clean and ready for launch!** 