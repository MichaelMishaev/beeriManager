const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://wkfxwnayexznjhcktwwu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('🔍 Checking if ai_chat_logs table exists...\n');

  try {
    // Try to query the table structure
    const { data, error } = await supabase
      .from('ai_chat_logs')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table does NOT exist');
        console.log('Error:', error.message);
        console.log('\n💡 Run the migration: npm run db:migrate');
      } else {
        console.log('❌ Error querying table:', error.message);
        console.log('Full error:', JSON.stringify(error, null, 2));
      }
    } else {
      console.log('✅ Table EXISTS and is accessible');
      console.log('Rows in table:', data?.length || 0);
    }

    // Check OpenAI API key
    console.log('\n🔑 Checking OpenAI API key...');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('❌ OPENAI_API_KEY is NOT set!');
    } else if (apiKey.startsWith('sk-')) {
      console.log('✅ OPENAI_API_KEY is set (starts with sk-)');
    } else {
      console.log('⚠️  OPENAI_API_KEY is set but format seems wrong');
    }

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }

  process.exit(0);
}

checkTable();
