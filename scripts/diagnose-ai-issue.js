const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://wkfxwnayexznjhcktwwu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function diagnoseAI() {
  console.log('🔍 AI Assistant Diagnostic Report\n');
  console.log('='.repeat(80) + '\n');

  // 1. Check table and RLS
  console.log('1️⃣  Checking ai_chat_logs table and RLS...');
  try {
    const { data, error } = await supabase
      .from('ai_chat_logs')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Table access error:', error.message);
    } else {
      console.log('✅ Table exists and is accessible');
    }

    // Try to insert a test log
    const { error: insertError } = await supabase
      .from('ai_chat_logs')
      .insert({
        session_id: 'test-diagnostic',
        level: 'info',
        action: 'initial',
        user_message: 'Diagnostic test',
      });

    if (insertError) {
      console.log('❌ CRITICAL: Cannot insert logs!');
      console.log('   Error:', insertError.message);
      console.log('   Code:', insertError.code);
      console.log('   This explains why no logs are saved!');
    } else {
      console.log('✅ Log insertion works');
      // Clean up
      await supabase
        .from('ai_chat_logs')
        .delete()
        .eq('session_id', 'test-diagnostic');
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }

  console.log('');

  // 2. Test OpenAI API with actual tools
  console.log('2️⃣  Testing OpenAI API with function calling...');
  try {
    const testMessage = 'הבנתי - מסיבת פורים ב-15 במרץ 2026 בשעה 17:00 בגן הילדים. נכון?';
    
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      max_completion_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: 'אתה עוזר AI. חלץ אירוע מההודעה הבאה. תרגם לרוסית.'
        },
        {
          role: 'user',
          content: 'המשתמש אישר: "מסיבת פורים ב-15 במרץ 2026 בשעה 17:00 בגן הילדים". צור אירוע.'
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'create_events',
            description: 'Create calendar events',
            parameters: {
              type: 'object',
              properties: {
                events: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      title_ru: { type: 'string' },
                      start_datetime: { type: 'string' },
                    },
                    required: ['title', 'start_datetime'],
                  },
                },
              },
              required: ['events'],
            },
          },
        },
      ],
      tool_choice: 'auto',
    });

    const message = response.choices[0].message;
    console.log('Response type:', message.tool_calls ? 'function_call' : 'text');
    
    if (message.tool_calls) {
      console.log('✅ Function called:', message.tool_calls[0].function.name);
      const args = JSON.parse(message.tool_calls[0].function.arguments);
      console.log('Arguments:', JSON.stringify(args, null, 2));
      
      if (args.events && args.events[0]) {
        if (args.events[0].title_ru) {
          console.log('✅ Russian translation included');
        } else {
          console.log('⚠️  Missing Russian translation!');
        }
      }
    } else {
      console.log('⚠️  AI responded with text instead of function');
      console.log('Message:', message.content);
    }

    console.log('Tokens used:', response.usage?.total_tokens || 0);
  } catch (err) {
    console.log('❌ OpenAI API error:', err.message);
    if (err.status) console.log('   Status:', err.status);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 Diagnosis Summary:\n');
  console.log('If logs cannot be inserted:');
  console.log('  → RLS policy issue - logs fail silently');
  console.log('  → Fix: Update RLS policy or use service role key\n');
  console.log('If OpenAI doesn\'t call function:');
  console.log('  → Prompt issue or model limitation');
  console.log('  → Check system prompt and context\n');
  console.log('If missing Russian translation:');
  console.log('  → AI not following translation instructions');
  console.log('  → Validation will fail\n');

  process.exit(0);
}

diagnoseAI();
