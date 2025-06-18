import { createClient } from '@supabase/supabase-js';

// PRODUCTION DATABASE CREDENTIALS
const supabase = createClient(
  'https://nvryyufpbcruyqqndyjn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cnl5dWZwYmNydXlxcW5keWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzY1MDUsImV4cCI6MjA2NTI1MjUwNX0.W6vriRZnO7n8FPm5Zjd_fe41cY20tWkDOqYF59wulzs'
);

console.log('🚀 Publishing events in PRODUCTION database...');

async function publishAllDraftEvents() {
  try {
    // First, get all draft events
    const { data: draftEvents, error: fetchError } = await supabase
      .from('events')
      .select('id, title, status')
      .eq('status', 'draft');

    if (fetchError) {
      console.error('❌ Error fetching draft events:', fetchError);
      return;
    }

    console.log(`📋 Found ${draftEvents?.length || 0} draft events`);

    if (!draftEvents || draftEvents.length === 0) {
      console.log('✅ No draft events to publish');
      return;
    }

    // Update events one by one to avoid permission issues
    let successCount = 0;
    for (const event of draftEvents) {
      console.log(`📝 Publishing: "${event.title}"`);
      
      const { data, error } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('id', event.id)
        .select('id, title, status');

      if (error) {
        console.error(`❌ Failed to publish "${event.title}":`, error.message);
      } else {
        console.log(`✅ Published: "${event.title}"`);
        successCount++;
      }
    }

    console.log(`\n🎉 Successfully published ${successCount}/${draftEvents.length} events`);

    // Verify published events
    const { data: publishedEvents, error: verifyError } = await supabase
      .from('events')
      .select('id, title, start_date')
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(5);

    if (verifyError) {
      console.error('❌ Error verifying published events:', verifyError);
    } else {
      console.log(`\n✅ VERIFICATION: ${publishedEvents?.length || 0} published events available for public display`);
      
      if (publishedEvents && publishedEvents.length > 0) {
        console.log('\n📅 Upcoming published events:');
        publishedEvents.forEach(event => {
          console.log(`  🎪 "${event.title}" - ${new Date(event.start_date).toLocaleDateString()}`);
        });
        
        console.log('\n🎯 Epic G.001 IMPLEMENTED: Events page will now show real published events!');
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

publishAllDraftEvents();