const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://wkfxwnayexznjhcktwwu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAIActivity() {
  console.log('🔍 Checking AI Assistant Activity in Production...\n');

  try {
    // Check for recent events created by AI
    console.log('📅 Checking events created by AI...');
    const { data: aiEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', 'admin_ai')
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventsError) {
      console.log('❌ Error:', eventsError.message);
    } else if (aiEvents && aiEvents.length > 0) {
      console.log(`✅ Found ${aiEvents.length} events created by AI assistant:`);
      aiEvents.forEach((event, i) => {
        console.log(`  ${i + 1}. ${event.title_he || event.title} (${new Date(event.created_at).toLocaleString()})`);
      });
    } else {
      console.log('📭 No events created by AI assistant');
    }

    console.log('');

    // Check for urgent messages created by AI
    console.log('📢 Checking urgent messages created by AI...');
    const { data: aiMessages, error: messagesError } = await supabase
      .from('urgent_messages')
      .select('*')
      .eq('created_by', 'admin_ai')
      .order('created_at', { ascending: false })
      .limit(10);

    if (messagesError) {
      console.log('❌ Error:', messagesError.message);
    } else if (aiMessages && aiMessages.length > 0) {
      console.log(`✅ Found ${aiMessages.length} urgent messages created by AI:`);
      aiMessages.forEach((msg, i) => {
        console.log(`  ${i + 1}. ${msg.title_he} (${new Date(msg.created_at).toLocaleString()})`);
      });
    } else {
      console.log('📭 No urgent messages created by AI assistant');
    }

    console.log('');

    // Check for highlights created by AI
    console.log('✨ Checking highlights created by AI...');
    const { data: aiHighlights, error: highlightsError } = await supabase
      .from('highlights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (highlightsError) {
      console.log('❌ Error:', highlightsError.message);
    } else if (aiHighlights && aiHighlights.length > 0) {
      console.log(`✅ Found ${aiHighlights.length} recent highlights:`);
      aiHighlights.forEach((highlight, i) => {
        console.log(`  ${i + 1}. ${highlight.title_he || highlight.title} (${new Date(highlight.created_at).toLocaleString()})`);
      });
    } else {
      console.log('📭 No highlights found');
    }

    console.log('');
    console.log('─'.repeat(80));
    console.log('\n💡 Summary:');

    const totalAIItems = (aiEvents?.length || 0) + (aiMessages?.length || 0);

    if (totalAIItems === 0) {
      console.log('❌ No AI-created content found in production');
      console.log('This suggests the AI assistant may not be working properly in production.');
    } else {
      console.log(`✅ Found ${totalAIItems} items created by AI assistant`);
      console.log('The AI is working, but logs are not being saved to the database.');
      console.log('\nPossible reasons:');
      console.log('1. The logToDatabase() function is failing silently');
      console.log('2. RLS policies are blocking the insert');
      console.log('3. The table structure doesn\'t match the code');
    }

  } catch (err) {
    console.log('❌ Exception:', err.message);
    console.log(err);
  }

  process.exit(0);
}

checkAIActivity();
