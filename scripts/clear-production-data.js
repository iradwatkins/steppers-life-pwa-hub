/**
 * Production Data Clearing Script
 * 
 * ⚠️  WARNING: This script will permanently delete ALL data except users!
 * Only run this in production when you want to start with a completely clean database.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearProductionData() {
  console.log('🚨 PRODUCTION DATA CLEARING SCRIPT');
  console.log('=====================================');
  console.log('⚠️  This will permanently delete ALL data except users!');
  console.log('📊 Events, orders, tickets, payments will be removed');
  console.log('👥 User accounts and profiles will be preserved');
  console.log('');

  // Safety check - require explicit confirmation
  const args = process.argv.slice(2);
  if (!args.includes('--confirm-delete-all-data')) {
    console.log('🛡️  Safety Check: Add --confirm-delete-all-data to proceed');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/clear-production-data.js --confirm-delete-all-data');
    console.log('');
    process.exit(1);
  }

  try {
    // Read the SQL script
    const sqlPath = path.join(__dirname, '..', 'safe-clear-production-data.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔍 Checking current data before clearing...');
    
    // Check current data counts
    const tables = [
      'profiles', 'organizers', 'venues', 'events', 
      'tickets', 'orders', 'payments', 'saved_events'
    ];

    const beforeCounts = {};
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        beforeCounts[table] = count || 0;
      }
    }

    console.log('📊 Current data counts:');
    Object.entries(beforeCounts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`);
    });
    console.log('');

    // Execute the clearing script
    console.log('🗑️  Executing data clearing script...');
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript });

    if (error) {
      console.error('❌ Error executing clearing script:', error);
      process.exit(1);
    }

    // Verify the clearing worked
    console.log('✅ Data clearing completed! Verifying...');
    
    const afterCounts = {};
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        afterCounts[table] = count || 0;
      }
    }

    console.log('📊 Data counts after clearing:');
    Object.entries(afterCounts).forEach(([table, count]) => {
      const before = beforeCounts[table] || 0;
      const status = table === 'profiles' ? 
        (count > 0 ? '✅ Preserved' : '⚠️  Empty') : 
        (count === 0 ? '✅ Cleared' : '⚠️  Still has data');
      console.log(`   ${table}: ${count} records (was ${before}) ${status}`);
    });

    console.log('');
    console.log('🎉 Production data clearing completed successfully!');
    console.log('');
    console.log('✅ What was preserved:');
    console.log('   - User accounts (auth.users)');
    console.log('   - User profiles (public.profiles)');
    console.log('   - Database structure and schema');
    console.log('');
    console.log('🗑️  What was cleared:');
    console.log('   - All events and related data');
    console.log('   - All orders, tickets, and payments');
    console.log('   - All venues and organizers');
    console.log('   - All analytics and reports');
    console.log('   - All content management data');
    console.log('   - All saved data (wishlists, payment methods)');
    console.log('');
    console.log('📝 Manual cleanup still needed:');
    console.log('   - Storage buckets (event images, user uploads)');
    console.log('   - External service data (Stripe, PayPal)');
    console.log('   - CDN cached content');
    console.log('');
    console.log('🚀 Your production database is now clean and ready!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
clearProductionData(); 