#!/usr/bin/env node

/**
 * Script to create missing database tables in Supabase
 * This will create the tickets and order_items tables that are required
 * but missing from the current database schema.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use production database credentials
const SUPABASE_URL = 'https://voaxyetbqhmgbvcxsttf.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY environment variable is required');
  console.error('Set it with: export SUPABASE_SERVICE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createMissingTables() {
  console.log('🔧 Creating missing database tables...');
  console.log(`📍 Database URL: ${SUPABASE_URL}`);
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/create_missing_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executing SQL script...');
    
    // Split the SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          if (error.message.includes('already exists')) {
            console.log('   ℹ️  Table already exists, continuing...');
          } else {
            throw error;
          }
        } else {
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('✅ All database tables created successfully!');
    
    // Verify the tables were created
    console.log('🔍 Verifying table creation...');
    
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('count')
      .limit(1);
      
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('count')
      .limit(1);
    
    if (!ticketsError && !orderItemsError) {
      console.log('✅ Tables verified successfully!');
      console.log('   - tickets table: accessible');
      console.log('   - order_items table: accessible');
    } else {
      console.error('❌ Table verification failed:');
      if (ticketsError) console.error('   tickets:', ticketsError.message);
      if (orderItemsError) console.error('   order_items:', orderItemsError.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    process.exit(1);
  }
}

async function alternativeMethod() {
  console.log('\n📋 Alternative Method:');
  console.log('If the above method failed, you can manually run the SQL script:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');  
  console.log('3. Copy and paste the contents of database/create_missing_tables.sql');
  console.log('4. Execute the SQL manually');
  console.log('\n📁 SQL file location: database/create_missing_tables.sql');
}

// Run the script
createMissingTables()
  .then(() => {
    console.log('\n🎉 Database migration completed!');
    alternativeMethod();
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    alternativeMethod();
    process.exit(1);
  });