#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Environment configurations
const environments = {
  development: {
    name: 'Development',
    supabaseUrl: 'https://nwoteszpvvefbopbbvrl.supabase.co',
    serviceRoleKey: process.env.SUPABASE_DEV_SERVICE_ROLE_KEY
  },
  production: {
    name: 'Production', 
    supabaseUrl: 'https://nvryyufpbcruyqqndyjn.supabase.co',
    serviceRoleKey: process.env.SUPABASE_PROD_SERVICE_ROLE_KEY
  }
};

async function updateUserRole(email, role, targetEnv = 'both') {
  console.log(`🔄 Updating ${email} to ${role} role...\n`);
  
  for (const [envKey, config] of Object.entries(environments)) {
    // Skip if targeting specific environment
    if (targetEnv === 'dev' && envKey !== 'development') continue;
    if (targetEnv === 'prod' && envKey !== 'production') continue;
    
    if (!config.serviceRoleKey) {
      console.log(`⚠️  Skipping ${config.name} - no service role key found`);
      continue;
    }

    console.log(`📦 Updating user in ${config.name} environment...`);
    
    const supabase = createClient(config.supabaseUrl, config.serviceRoleKey);
    
    try {
      // Update the user's role in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('email', email)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        console.log(`  ✓ Successfully updated ${email} to ${role} in ${config.name}`);
      } else {
        console.log(`  ⚠️  User ${email} not found in ${config.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Error updating ${email} in ${config.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Role update process completed!');
  console.log(`\n${email} can now access admin features at:`);
  console.log('• /admin/dashboard');
  console.log('• /admin/event-claims'); 
  console.log('• /admin/create-event');
}

// Get command line arguments
const email = process.argv[2] || 'iradwatkins@gmail.com';
const role = process.argv[3] || 'admin';
const targetEnv = process.argv[4] || 'both';

// Validate role
const validRoles = ['user', 'organizer', 'admin', 'super_admin'];
if (!validRoles.includes(role)) {
  console.error(`❌ Invalid role: ${role}`);
  console.log(`Valid roles: ${validRoles.join(', ')}`);
  process.exit(1);
}

// Run the update
updateUserRole(email, role, targetEnv).catch(console.error);