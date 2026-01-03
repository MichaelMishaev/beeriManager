const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://wkfxwnayexznjhcktwwu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAILogs() {
  console.log('🔍 Checking AI Chat Logs in Production...\n');

  try {
    // Check for recent logs
    console.log('📝 Fetching recent AI chat logs (last 50)...\n');
    const { data: logs, error: logsError } = await supabase
      .from('ai_chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (logsError) {
      console.log('❌ Error fetching logs:', logsError.message);
      console.log('Full error:', JSON.stringify(logsError, null, 2));
      return;
    }

    if (!logs || logs.length === 0) {
      console.log('📭 No AI chat logs found in database');
      console.log('\nPossible issues:');
      console.log('1. The table doesnt exist');
      console.log('2. Logs are not being saved');
      console.log('3. RLS policies are blocking reads');
      return;
    }

    console.log('✅ Found', logs.length, 'log entries\n');

    // Show errors
    const errors = logs.filter(log => log.level === 'error');
    console.log('❌ Errors:', errors.length);
    if (errors.length > 0) {
      console.log('\nRecent Errors:');
      errors.slice(0, 10).forEach((log, i) => {
        console.log('\n' + (i + 1) + '.', new Date(log.created_at).toLocaleString());
        console.log('   Action:', log.action);
        console.log('   Error:', log.error_message);
        if (log.user_message) {
          console.log('   User message:', log.user_message.substring(0, 100) + '...');
        }
      });
    }

    // Show recent GPT calls
    const gptCalls = logs.filter(log => log.gpt_model);
    console.log('\n🤖 GPT API Calls:', gptCalls.length);
    if (gptCalls.length > 0) {
      console.log('\nRecent GPT Calls:');
      gptCalls.slice(0, 10).forEach((log, i) => {
        console.log('\n' + (i + 1) + '.', new Date(log.created_at).toLocaleString());
        console.log('   Model:', log.gpt_model);
        console.log('   Action:', log.action);
        console.log('   Response type:', log.response_type);
        if (log.function_name) {
          console.log('   Function called:', log.function_name);
        }
        if (log.user_message) {
          console.log('   User message:', log.user_message.substring(0, 80) + '...');
        }
      });
    }

  } catch (err) {
    console.log('❌ Exception:', err.message);
    console.log(err);
  }

  process.exit(0);
}

checkAILogs();
