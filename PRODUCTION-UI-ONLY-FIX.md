# PRODUCTION UI-ONLY STORAGE FIX

Since SQL commands are blocked, use the Supabase UI to configure storage manually.

## Step 1: Configure Storage Bucket via UI

**Go to**: Storage → Buckets → images bucket

**Settings to configure:**
- ✅ **Public bucket**: ON
- ✅ **File size limit**: 50MB  
- ✅ **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp`

## Step 2: Delete ALL Existing Policies via UI

**Go to**: Storage → Policies → objects table

**Delete these policies if they exist:**
- Public read images
- Authenticated upload  
- Owner update
- Owner delete
- All other policies on objects table

## Step 3: Create NEW Policies via UI

**Go to**: Storage → Policies → objects table → + New Policy

### Policy 1: Public Read
- **Policy name**: `production_public_read`
- **Allowed operation**: `SELECT`
- **Target roles**: Leave empty (applies to all)
- **USING expression**: `bucket_id = 'images'`

### Policy 2: Authenticated Upload
- **Policy name**: `production_auth_upload`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **WITH CHECK expression**: `bucket_id = 'images'`

### Policy 3: Owner Update
- **Policy name**: `production_owner_update`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'images' AND auth.uid() = owner::uuid`

### Policy 4: Owner Delete
- **Policy name**: `production_owner_delete`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'images' AND auth.uid() = owner::uuid`

## Step 4: Verify Setup

**Check**: Storage → Buckets → Should see "images" bucket as public

**Check**: Storage → Policies → Should see 4 new policies on objects table

## Step 5: Test Application

After completing UI setup, test image upload in your application.

## Alternative: Service Role API Key

If UI approach fails, we can switch your app to use service_role key instead of anon key:

**In your environment config**, change from anon key to service_role key for production:

```typescript
const prodConfig = {
  supabaseUrl: 'https://voaxyetbqhmgbvcxsttf.supabase.co',
  // Use service_role key instead of anon key
  supabaseAnonKey: 'YOUR_SERVICE_ROLE_KEY_HERE', 
  appUrl: 'https://stepperslife.com'
};
```

Service role key has higher privileges and can bypass RLS policies.