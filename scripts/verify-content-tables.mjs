// Verify Content Management System Database Tables
import { createClient } from '@supabase/supabase-js';

// Use the same configuration as the app
const SUPABASE_URL = 'https://nvryyufpbcruyqqndyjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cnl5dWZwYmNydXlxcW5keWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzY1MDUsImV4cCI6MjA2NTI1MjUwNX0.W6vriRZnO7n8FPm5Zjd_fe41cY20tWkDOqYF59wulzs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyContentTables() {
  console.log('🔍 Verifying Content Management System database tables...');
  console.log(`📡 Connecting to: ${SUPABASE_URL}`);
  
  try {
    // Test basic connection
    console.log('🔗 Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ Database connection failed:', connectionError.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Check if content_pages table exists
    console.log('🔍 Checking content_pages table...');
    const { data: pagesData, error: pagesError } = await supabase
      .from('content_pages')
      .select('id, title, slug, status')
      .limit(5);
    
    if (pagesError) {
      if (pagesError.code === '42P01') {
        console.log('❌ content_pages table does not exist');
        console.log('📋 Migration needed: content_pages table');
        return false;
      } else {
        console.log('⚠️  Error checking content_pages:', pagesError.message);
      }
    } else {
      console.log('✅ content_pages table exists');
      if (pagesData && pagesData.length > 0) {
        console.log(`📊 Found ${pagesData.length} content pages:`);
        pagesData.forEach(page => {
          console.log(`  - ${page.title} (/${page.slug}) [${page.status}]`);
        });
      } else {
        console.log('📋 No content pages found (table is empty)');
      }
    }
    
    // Check if content_page_versions table exists
    console.log('🔍 Checking content_page_versions table...');
    const { data: versionsData, error: versionsError } = await supabase
      .from('content_page_versions')
      .select('id, page_id, version_number')
      .limit(5);
    
    if (versionsError) {
      if (versionsError.code === '42P01') {
        console.log('❌ content_page_versions table does not exist');
        console.log('📋 Migration needed: content_page_versions table');
        return false;
      } else {
        console.log('⚠️  Error checking content_page_versions:', versionsError.message);
      }
    } else {
      console.log('✅ content_page_versions table exists');
      if (versionsData && versionsData.length > 0) {
        console.log(`📊 Found ${versionsData.length} content versions`);
      } else {
        console.log('📋 No content versions found (table is empty)');
      }
    }
    
    // Check admin access
    console.log('🔐 Testing admin access patterns...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('ℹ️  No authenticated user (expected for script)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function printMigrationInstructions() {
  console.log('\n🚀 CONTENT MANAGEMENT SYSTEM MIGRATION INSTRUCTIONS');
  console.log('=' * 60);
  console.log('');
  console.log('📋 To complete the production deployment:');
  console.log('');
  console.log('1. 🔗 Go to Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/nvryyufpbcruyqqndyjn/sql');
  console.log('');
  console.log('2. 📝 Copy the migration SQL from:');
  console.log('   supabase/migrations/20250619000000_create_content_management.sql');
  console.log('');
  console.log('3. ⚡ Execute the SQL in the dashboard');
  console.log('');
  console.log('4. ✅ Verify tables are created:');
  console.log('   - content_pages');
  console.log('   - content_page_versions');
  console.log('');
  console.log('5. 🎯 Test the Content Management System:');
  console.log('   - Login as admin user');
  console.log('   - Navigate to /admin/content');
  console.log('   - Verify rich text editor works');
  console.log('   - Create test content page');
  console.log('');
  console.log('🔐 Required: Admin role (admin or super_admin) for access');
  console.log('🌐 Route: https://stepperslife.com/admin/content');
}

// Run verification
const tablesExist = await verifyContentTables();

if (!tablesExist) {
  await printMigrationInstructions();
} else {
  console.log('\n🎉 Content Management System is ready!');
  console.log('🔗 Access at: /admin/content (admin users only)');
}