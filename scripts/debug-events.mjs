import { createClient } from '@supabase/supabase-js';

// PRODUCTION DATABASE CREDENTIALS
const supabase = createClient(
  'https://nvryyufpbcruyqqndyjn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cnl5dWZwYmNydXlxcW5keWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzY1MDUsImV4cCI6MjA2NTI1MjUwNX0.W6vriRZnO7n8FPm5Zjd_fe41cY20tWkDOqYF59wulzs'
);

console.log('🔍 DEBUGGING EVENTS STATUS IN PRODUCTION');

async function debugEvents() {
  try {
    // Check all events regardless of status
    const { data: allEvents, error: allError } = await supabase
      .from('events')
      .select('id, title, status, start_date, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allError) {
      console.error('❌ Error fetching all events:', allError);
      return;
    }

    console.log(`📊 Total events found: ${allEvents?.length || 0}`);
    
    if (allEvents && allEvents.length > 0) {
      console.log('\n📋 Recent events (all statuses):');
      allEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. "${event.title}" - Status: ${event.status} - Created: ${new Date(event.created_at).toLocaleDateString()}`);
      });

      // Count by status
      const statusCounts = allEvents.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count} events`);
      });

      // Try to manually update one event
      const testEvent = allEvents[0];
      console.log(`\n🧪 Testing manual update of: "${testEvent.title}"`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('id', testEvent.id)
        .select('id, title, status');

      if (updateError) {
        console.error('❌ Manual update failed:', updateError);
        console.log('🔍 Error details:', updateError.details);
        console.log('🔍 Error hint:', updateError.hint);
      } else {
        console.log('✅ Manual update successful:', updateResult);
      }

    } else {
      console.log('❌ No events found at all');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugEvents();