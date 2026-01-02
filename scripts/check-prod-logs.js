const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://wkfxwnayexznjhcktwwu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductionLogs() {
  console.log('🔍 Connecting to Production Supabase...\n');
  console.log('URL:', supabaseUrl);
  console.log('');

  try {
    // First, check if ai_chat_logs table exists
    console.log('📋 Checking ai_chat_logs table...\n');

    const { data: logs, error: logsError } = await supabase
      .from('ai_chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (logsError) {
      console.log('❌ Error accessing ai_chat_logs:', logsError.message);

      if (logsError.message.includes('does not exist')) {
        console.log('\n⚠️  The ai_chat_logs table does not exist in production!');
        console.log('This is why database logging is not working.');
        console.log('\nTo fix this, you need to create the table. Here\'s the SQL:\n');
        console.log(`
CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  session_id TEXT,
  level TEXT,
  action TEXT,
  user_id TEXT,
  user_message TEXT,
  message_length INTEGER,
  gpt_model TEXT,
  gpt_round_number INTEGER,
  gpt_prompt_tokens INTEGER,
  gpt_completion_tokens INTEGER,
  gpt_total_tokens INTEGER,
  gpt_cost DECIMAL(10, 6),
  response_type TEXT,
  function_name TEXT,
  extracted_data_type TEXT,
  validation_success BOOLEAN,
  validation_errors JSONB,
  usage_count INTEGER,
  daily_limit INTEGER,
  rate_limit_reached BOOLEAN,
  error_message TEXT,
  error_stack TEXT,
  duration_ms INTEGER,
  metadata JSONB
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_created_at ON public.ai_chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_session_id ON public.ai_chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_level ON public.ai_chat_logs(level);

-- Enable RLS (optional)
ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "Service role can do anything" ON public.ai_chat_logs
  FOR ALL USING (auth.role() = 'service_role');
        `);
      }
      return;
    }

    if (!logs || logs.length === 0) {
      console.log('📭 No logs found in ai_chat_logs table');
      console.log('Table exists but is empty. Logs will start appearing when the AI assistant is used.');
      return;
    }

    console.log(`✅ Found ${logs.length} recent log entries:\n`);
    console.log('=' .repeat(80));

    logs.forEach((log, index) => {
      console.log(`\n📝 Log #${index + 1}`);
      console.log('─'.repeat(80));
      console.log(`Created: ${log.created_at}`);
      console.log(`Level: ${log.level?.toUpperCase()}`);
      console.log(`Action: ${log.action}`);
      console.log(`Session: ${log.session_id?.substring(0, 20)}...`);

      if (log.user_message) {
        console.log(`User: ${log.user_message.substring(0, 100)}${log.user_message.length > 100 ? '...' : ''}`);
      }

      if (log.response_type) {
        console.log(`Response Type: ${log.response_type}`);
      }

      if (log.function_name) {
        console.log(`Function Called: ${log.function_name}`);
      }

      if (log.validation_success !== null) {
        console.log(`Validation: ${log.validation_success ? '✅ Success' : '❌ Failed'}`);
      }

      if (log.validation_errors) {
        console.log(`Validation Errors:`, JSON.stringify(log.validation_errors, null, 2));
      }

      if (log.error_message) {
        console.log(`❌ Error: ${log.error_message}`);
      }

      if (log.gpt_total_tokens) {
        console.log(`GPT Tokens: ${log.gpt_total_tokens} (Prompt: ${log.gpt_prompt_tokens}, Completion: ${log.gpt_completion_tokens})`);
      }

      if (log.duration_ms) {
        console.log(`Duration: ${log.duration_ms}ms`);
      }

      if (log.metadata) {
        console.log(`Metadata:`, JSON.stringify(log.metadata, null, 2));
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total logs retrieved: ${logs.length}`);

  } catch (err) {
    console.log('❌ Exception:', err.message);
    console.log(err);
  }

  process.exit(0);
}

checkProductionLogs();
