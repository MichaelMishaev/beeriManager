# AI Assistant - Complete Logging Enhancement

## What Was Enhanced

### 1. **Fixed Logging Issue** ✅
**File:** `src/lib/ai/logger.ts`

- **Before:** Used anon key client (logs failed silently due to RLS)
- **After:** Uses service role client (bypasses RLS, logs saved successfully)

```typescript
// OLD (broken)
import { supabase } from '@/lib/supabase/client'

// NEW (fixed)
import { createClient } from '@/lib/supabase/server'
const supabase = createClient() // Service role
```

### 2. **Complete OpenAI Request Logging** 🔍
**File:** `src/app/api/ai-assistant/route.ts`

Now logging **EVERYTHING** in `metadata` field:

#### For `understand_message` action:
```json
{
  "fullRequest": {
    "model": "gpt-5-mini",
    "max_completion_tokens": 1000,
    "messages": [...], // FULL conversation history
    "timestamp": "2026-01-03T..."
  }
}
```

#### For `extract_data` action:
```json
{
  "fullRequest": {
    "model": "gpt-5-mini",
    "max_completion_tokens": 1000,
    "messages": [...], // FULL conversation history
    "tools": [...], // FULL tools definition
    "tool_choice": "auto",
    "systemPrompt": "...", // FULL system prompt
    "hasContext": true,
    "contextPreview": "...",
    "timestamp": "2026-01-03T..."
  }
}
```

### 3. **Complete OpenAI Response Logging** 📊

#### For `understand_message` action:
```json
{
  "fullResponse": {
    "message": {...}, // FULL assistant message
    "finishReason": "stop",
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 50,
      "total_tokens": 200
    },
    "timestamp": "2026-01-03T..."
  }
}
```

#### For `extract_data` action:
```json
{
  "fullResponse": {
    "message": {...}, // FULL assistant message
    "toolCalls": [...], // FULL tool calls array
    "functionName": "create_events",
    "functionArguments": {...}, // Parsed function arguments
    "finishReason": "tool_calls",
    "usage": {...},
    "timestamp": "2026-01-03T..."
  }
}
```

### 4. **Enhanced Error Logging** ❌

Now capturing **EVERYTHING** about errors:

```json
{
  "fullError": {
    "name": "Error",
    "message": "...",
    "stack": "...",
    "openAIError": {
      "status": 429,
      "code": "rate_limit_exceeded",
      "type": "invalid_request_error",
      "param": null
    },
    "timestamp": "2026-01-03T..."
  },
  "requestBody": {...} // Full original request
}
```

### 5. **Console Logging** 🖥️

Added console error logging for immediate visibility:

```typescript
console.error('[AI Assistant] Critical error:', error)
console.error('[AI Assistant] Error details:', JSON.stringify(error, null, 2))
```

And in logger:
```typescript
console.error('[AI Logger] Error logged to database:', {
  action: params.action,
  error: params.errorMessage,
  timestamp: new Date().toISOString(),
})
```

## What You Can Now See in Production

### Database Table: `ai_chat_logs`

Every row now contains:

1. **Basic Info:**
   - `session_id` - Unique session identifier
   - `level` - info | success | warning | error
   - `action` - initial | select_type | understand_message | extract_data | insert_data
   - `created_at` - Timestamp

2. **User Input:**
   - `user_message` - Full user message
   - `message_length` - Character count

3. **GPT Interaction:**
   - `gpt_model` - "gpt-5-mini"
   - `gpt_round_number` - 1 or 2
   - `gpt_prompt_tokens` - Input tokens
   - `gpt_completion_tokens` - Output tokens
   - `gpt_total_tokens` - Total
   - `gpt_cost` - Cost in USD

4. **Response:**
   - `response_type` - text | function_call | error
   - `function_name` - create_events | create_urgent_message | create_highlight
   - `extracted_data_type` - event | events | urgent_message | highlight

5. **Validation:**
   - `validation_success` - true/false
   - `validation_errors` - Array of error messages (JSON)

6. **Rate Limiting:**
   - `usage_count` - Current usage
   - `daily_limit` - Max allowed
   - `rate_limit_reached` - true/false

7. **Errors:**
   - `error_message` - Error message
   - `error_stack` - Full stack trace

8. **Performance:**
   - `duration_ms` - Request duration

9. **METADATA (NEW - Full Details):**
   ```json
   {
     "fullRequest": {...},   // Complete OpenAI request
     "fullResponse": {...},  // Complete OpenAI response
     "fullError": {...}      // Complete error details
   }
   ```

## How to Check Logs in Production

### Method 1: Using Script
```bash
node scripts/check-ai-logs.js
```

This will show:
- Recent errors with full details
- Recent GPT calls with requests/responses
- Successful extractions
- Cost summary
- Session statistics

### Method 2: Direct Database Query

```sql
-- Get recent errors
SELECT 
  created_at,
  action,
  error_message,
  user_message,
  metadata
FROM ai_chat_logs
WHERE level = 'error'
ORDER BY created_at DESC
LIMIT 10;

-- Get recent successful extractions
SELECT 
  created_at,
  function_name,
  extracted_data_type,
  user_message,
  metadata->'fullResponse'->'functionArguments' as extracted_data
FROM ai_chat_logs
WHERE validation_success = true
ORDER BY created_at DESC
LIMIT 10;

-- Get full request/response for specific session
SELECT 
  action,
  gpt_round_number,
  metadata->'fullRequest' as request,
  metadata->'fullResponse' as response
FROM ai_chat_logs
WHERE session_id = 'ai-session-...'
ORDER BY created_at ASC;
```

### Method 3: Vercel Logs (Console Output)

```bash
vercel logs --prod
```

Will show:
```
[AI Logger] Error logged to database: ...
[AI Assistant] Critical error: ...
[AI Assistant] Error details: ...
```

## Debugging Workflow

1. **User reports error**
2. **Check logs:**
   ```bash
   node scripts/check-ai-logs.js
   ```

3. **Find the error in database:**
   - Look at `error_message` and `error_stack`
   - Check `metadata.fullError` for OpenAI-specific errors
   - Review `metadata.fullRequest` to see what was sent
   - Review `metadata.fullResponse` to see what was received

4. **Identify root cause:**
   - Rate limit? Check `metadata.fullError.openAIError.code`
   - Validation issue? Check `validation_errors`
   - Missing translation? Check `metadata.fullResponse.functionArguments`
   - Context issue? Check `metadata.fullRequest.hasContext` and `contextPreview`

5. **Fix and verify**

## Files Changed

- ✅ `src/lib/ai/logger.ts` - Fixed service role + enhanced error logging
- ✅ `src/app/api/ai-assistant/route.ts` - Complete request/response/error logging
- ✅ TypeScript compilation verified

## Status

- [x] Logging system fixed (service role)
- [x] Complete OpenAI request logging
- [x] Complete OpenAI response logging
- [x] Complete error logging
- [x] Console logging added
- [x] TypeScript compilation verified
- [ ] Deployed to production
- [ ] Logs verified working in production

## Next Steps

1. Deploy to production
2. User tries AI assistant again
3. Check logs to see the actual error
4. Fix the root cause
5. Verify fix works

