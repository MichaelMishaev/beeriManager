const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLogs() {
  try {
    console.log('Checking ai_chat_logs table...\n');

    // Get recent ai_chat_logs
    const { data, error } = await supabase
      .from('ai_chat_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) {
      console.log('❌ Error accessing ai_chat_logs:', error.message);
      console.log('📝 Table may not exist yet. Creating it is recommended.');
      return;
    }

    if (!data || data.length === 0) {
      console.log('📭 No logs found in ai_chat_logs table');
      console.log('This is normal if the AI assistant hasn\'t been used yet with the new logging system.');
      return;
    }

    console.log(`✅ Found ${data.length} recent log entries:\n`);

    data.forEach((log, index) => {
      console.log(`--- Log ${index + 1} ---`);
      console.log(`Timestamp: ${log.timestamp}`);
      console.log(`Level: ${log.level}`);
      console.log(`Action: ${log.action}`);
      console.log(`Session: ${log.session_id}`);

      if (log.user_message) {
        console.log(`User Message: ${log.user_message.substring(0, 100)}...`);
      }

      if (log.response_type) {
        console.log(`Response Type: ${log.response_type}`);
      }

      if (log.function_name) {
        console.log(`Function: ${log.function_name}`);
      }

      if (log.validation_success !== null) {
        console.log(`Validation: ${log.validation_success ? '✅ Success' : '❌ Failed'}`);
      }

      if (log.validation_errors) {
        console.log(`Errors: ${JSON.stringify(log.validation_errors)}`);
      }

      if (log.error_message) {
        console.log(`Error: ${log.error_message}`);
      }

      console.log('');
    });

  } catch (err) {
    console.log('❌ Exception:', err.message);
    console.log(err);
  }

  process.exit(0);
}

checkLogs();
