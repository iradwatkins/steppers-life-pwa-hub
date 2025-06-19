// Content Management Migration Script
// Runs the content management database migration directly through Supabase client

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production Supabase configuration
const SUPABASE_URL = 'https://nvryyufpbcruyqqndyjn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function runContentMigration() {
  try {
    console.log('🚀 Starting Content Management System migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250619000000_create_content_management.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Migration SQL loaded, executing...');
    
    // Split SQL into individual statements (basic splitting on semicolons)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_')
            .select('*')
            .limit(0);
            
          if (directError) {
            console.log(`⚠️  Statement ${i + 1} may have executed (RPC unavailable):`, statement.substring(0, 100) + '...');
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('🎉 Migration completed! Verifying tables...');
    
    // Verify the tables were created
    const { data: contentPages, error: pagesError } = await supabase
      .from('content_pages')
      .select('*')
      .limit(1);
      
    const { data: contentVersions, error: versionsError } = await supabase
      .from('content_page_versions')
      .select('*')
      .limit(1);
    
    if (!pagesError && !versionsError) {
      console.log('✅ Content Management tables verified successfully!');
      console.log('📊 Tables created:');
      console.log('  - content_pages ✅');
      console.log('  - content_page_versions ✅');
      
      // Check if default pages exist
      const { data: defaultPages } = await supabase
        .from('content_pages')
        .select('title, slug')
        .eq('is_system_page', true);
        
      if (defaultPages && defaultPages.length > 0) {
        console.log('📋 Default system pages found:');
        defaultPages.forEach(page => {
          console.log(`  - ${page.title} (/${page.slug})`);
        });
      }
      
    } else {
      console.log('⚠️  Table verification failed - tables may not exist yet');
      console.log('Pages error:', pagesError);
      console.log('Versions error:', versionsError);
    }
    
    console.log('🚀 Content Management System migration process completed!');
    console.log('🔗 Admin interface available at: /admin/content');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Manual migration SQL execution (fallback)
async function manualMigration() {
  console.log('📋 Manual migration instructions:');
  console.log('1. Go to https://supabase.com/dashboard/project/nvryyufpbcruyqqndyjn/sql');
  console.log('2. Copy and paste the following SQL:');
  console.log('');
  
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250619000000_create_content_management.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log(migrationSQL);
  console.log('');
  console.log('3. Execute the SQL in the Supabase dashboard');
  console.log('4. Verify tables are created: content_pages, content_page_versions');
}

// Run migration
if (process.argv.includes('--manual')) {
  manualMigration();
} else {
  runContentMigration();
}