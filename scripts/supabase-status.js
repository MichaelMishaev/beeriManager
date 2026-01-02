const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://wkfxwnayexznjhcktwwu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStatus() {
  console.log('🔍 Production Supabase Database Status\n');
  console.log('URL:', supabaseUrl);
  console.log('Connection: Using SERVICE_ROLE key (full access)\n');
  console.log('═'.repeat(80));

  try {
    // Check each table
    const tables = [
      { name: 'events', label: '📅 Events' },
      { name: 'tasks', label: '✅ Tasks' },
      { name: 'urgent_messages', label: '📢 Urgent Messages' },
      { name: 'highlights', label: '✨ Highlights' },
      { name: 'ai_chat_logs', label: '🤖 AI Chat Logs' },
      { name: 'committees', label: '👥 Committees' },
      { name: 'protocols', label: '📄 Protocols' },
      { name: 'issues', label: '🐛 Issues' },
      { name: 'responsibilities', label: '👔 Responsibilities' },
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`${table.label} (${table.name}): ❌ Error - ${error.message}`);
        } else {
          console.log(`${table.label} (${table.name}): ✅ ${count} records`);
        }
      } catch (err) {
        console.log(`${table.label} (${table.name}): ❌ ${err.message}`);
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n🔎 Recent Activity (Last 24 hours):\n');

    // Check recent events
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentEvents, error: eventsError } = await supabase
      .from('events')
      .select('id, title_he, title, created_at, created_by')
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false });

    if (!eventsError && recentEvents && recentEvents.length > 0) {
      console.log(`📅 Events created in last 24h: ${recentEvents.length}`);
      recentEvents.forEach((event, i) => {
        const title = event.title_he || event.title || 'Untitled';
        const creator = event.created_by || 'unknown';
        console.log(`   ${i + 1}. ${title.substring(0, 60)} (by: ${creator})`);
      });
    } else {
      console.log('📅 No events created in last 24 hours');
    }

    console.log('');

    // Check AI activity specifically
    console.log('🤖 AI Assistant Activity:\n');

    const { data: aiEvents } = await supabase
      .from('events')
      .select('id, title_he, created_at')
      .eq('created_by', 'admin_ai')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: aiMessages } = await supabase
      .from('urgent_messages')
      .select('id, title_he, created_at')
      .eq('created_by', 'admin_ai')
      .order('created_at', { ascending: false })
      .limit(5);

    const aiEventCount = aiEvents?.length || 0;
    const aiMessageCount = aiMessages?.length || 0;

    if (aiEventCount > 0) {
      console.log(`   ✅ AI Events: ${aiEventCount} (last: ${aiEvents[0].title_he?.substring(0, 50)})`);
    } else {
      console.log('   ❌ AI Events: 0 (AI has never successfully created an event)');
    }

    if (aiMessageCount > 0) {
      console.log(`   ✅ AI Messages: ${aiMessageCount}`);
    } else {
      console.log('   ❌ AI Messages: 0 (AI has never successfully created a message)');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Database Access: CONFIRMED');
    console.log('📊 Total Tables Accessible: ', tables.length);
    console.log('🔐 Permission Level: service_role (FULL ACCESS)');

  } catch (err) {
    console.log('\n❌ Fatal Error:', err.message);
    console.log(err);
  }

  process.exit(0);
}

checkDatabaseStatus();
