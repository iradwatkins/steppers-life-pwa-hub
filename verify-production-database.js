// Production Database Verification Script
// This will check what tables actually exist in production

import { createClient } from '@supabase/supabase-js'

// Production Supabase credentials
const PRODUCTION_SUPABASE_URL = 'https://nvryyufpbcruyqqndyjn.supabase.co'
const PRODUCTION_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cnl5dWZwYmNydXlxcW5keWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzOTQyNTQsImV4cCI6MjA0OTk3MDI1NH0.Gx8bL92geNZNj2X2qBfklTTF8GxJUKsF9aStWu7Akxg'

const supabase = createClient(PRODUCTION_SUPABASE_URL, PRODUCTION_SUPABASE_ANON_KEY)

async function verifyProductionDatabase() {
  console.log('🔍 CHECKING PRODUCTION DATABASE STATE...')
  console.log('=' .repeat(60))
  
  try {
    // Check what tables exist
    console.log('\n📊 CHECKING EXISTING TABLES:')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list')
      .select('*')

    if (tablesError) {
      console.log('❌ Could not check tables with RPC, trying direct query...')
      
      // Try direct query to information_schema
      const { data: directTables, error: directError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')

      if (directError) {
        console.log('❌ Direct query failed:', directError.message)
        console.log('\n🔧 MANUAL VERIFICATION NEEDED:')
        console.log('Go to: https://supabase.com/dashboard/project/nvryyufpbcruyqqndyjn')
        console.log('Navigate to: Table Editor')
        console.log('Count the tables you see')
        return
      }
      
      console.log('✅ Found tables via direct query:', directTables?.length || 0)
      directTables?.forEach(table => console.log(`   - ${table.table_name}`))
    }

    // Check specific critical tables
    console.log('\n🎯 CHECKING CRITICAL TABLES:')
    const criticalTables = [
      'profiles',
      'organizers', 
      'venues',
      'events',
      'ticket_types',
      'tickets',
      'orders',
      'order_items',
      'payments',
      'promo_codes'
    ]

    const tableStatus = {}
    
    for (const tableName of criticalTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1)
        
        if (error) {
          tableStatus[tableName] = `❌ MISSING - ${error.message}`
        } else {
          tableStatus[tableName] = '✅ EXISTS'
        }
      } catch (err) {
        tableStatus[tableName] = `❌ ERROR - ${err.message}`
      }
    }

    // Display results
    console.log('\nCRITICAL TABLES STATUS:')
    Object.entries(tableStatus).forEach(([table, status]) => {
      console.log(`${status.padEnd(40)} ${table}`)
    })

    // Count missing tables
    const missingTables = Object.values(tableStatus).filter(status => status.includes('❌')).length
    const existingTables = criticalTables.length - missingTables

    console.log('\n📈 SUMMARY:')
    console.log(`✅ Existing tables: ${existingTables}/${criticalTables.length}`)
    console.log(`❌ Missing tables: ${missingTables}/${criticalTables.length}`)
    
    if (missingTables > 0) {
      console.log('\n🚨 PRODUCTION DATABASE NEEDS SCHEMA DEPLOYMENT!')
      console.log('=' .repeat(60))
      console.log('ACTION REQUIRED:')
      console.log('1. Go to: https://supabase.com/dashboard/project/nvryyufpbcruyqqndyjn')
      console.log('2. Navigate to: SQL Editor')
      console.log('3. Copy & paste the entire contents of: DEPLOY-PRODUCTION-SCHEMA-NOW.sql')
      console.log('4. Click "Run"')
      console.log('5. Run this verification script again')
    } else {
      console.log('\n🎉 PRODUCTION DATABASE IS PROPERLY CONFIGURED!')
    }

  } catch (error) {
    console.error('❌ Database verification failed:', error.message)
    console.log('\n🔧 MANUAL VERIFICATION STEPS:')
    console.log('1. Go to: https://supabase.com/dashboard/project/nvryyufpbcruyqqndyjn')
    console.log('2. Navigate to: Table Editor')
    console.log('3. Count how many tables you see')
    console.log('4. Should see 15+ tables if schema is deployed')
    console.log('5. If you see only 2-3 tables, run DEPLOY-PRODUCTION-SCHEMA-NOW.sql')
  }
}

// Run verification
verifyProductionDatabase() 