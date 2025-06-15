// Test script to verify database connection and setup
import { createClient } from '@supabase/supabase-js';

// Test both environments
const devConfig = {
  url: 'https://nwoteszpvvefbopbbvrl.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53b3Rlc3pwdnZlZmJvcGJidnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzY1MzQsImV4cCI6MjA2NTI1MjUzNH0.x9Ncuy3O_ZHEjcG-9x_Psa5eHweviIyKuh0OiFCbExI'
};

const prodConfig = {
  url: 'https://nvryyufpbcruyqqndyjn.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cnl5dWZwYmNydXlxcW5keWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzY1MDUsImV4cCI6MjA2NTI1MjUwNX0.W6vriRZnO7n8FPm5Zjd_fe41cY20tWkDOqYF59wulzs'
};

async function testConnection(config, name) {
  console.log(`\n🔍 Testing ${name} database connection...`);
  console.log(`URL: ${config.url}`);
  
  const supabase = createClient(config.url, config.key);
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${name} connection failed:`, error.message);
      return false;
    }
    
    console.log(`✅ ${name} connection successful`);
    console.log(`📊 Profiles table exists with ${data?.length || 0} records`);
    
    // Test table structure
    const { data: tableInfo } = await supabase.rpc('get_table_info', { table_name: 'profiles' }).limit(1);
    console.log(`📋 Schema check: ${tableInfo ? 'OK' : 'Tables may not exist yet'}`);
    
    return true;
  } catch (err) {
    console.log(`❌ ${name} test failed:`, err.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 SteppersLife Database Connection Test');
  console.log('========================================');
  
  const devResult = await testConnection(devConfig, 'Development');
  const prodResult = await testConnection(prodConfig, 'Production');
  
  console.log('\n📈 Test Summary:');
  console.log(`Development: ${devResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Production: ${prodResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (devResult && prodResult) {
    console.log('\n🎉 All database connections are working!');
    console.log('\nNext steps:');
    console.log('1. Run the schema.sql file on production database');
    console.log('2. Test user registration and event creation');
    console.log('3. Verify role-based access control');
  } else {
    console.log('\n⚠️  Some connections failed. Check configuration.');
  }
}

runTests().catch(console.error);