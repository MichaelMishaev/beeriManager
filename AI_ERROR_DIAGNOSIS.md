# AI Assistant Error Diagnosis & Fix

## Issue Reported
User reported AI assistant giving error: "לא הבנתי. אנא נסה שוב." (I didn't understand. Please try again.) after confirming event details.

## Root Cause Analysis

### 🔍 Investigation Findings

1. **Logging System Broken** ❌
   - AI logger was using **anon key** client
   - RLS policy only allows **service role** to insert logs
   - Result: All logs failing silently in production
   - Impact: Cannot see actual errors for debugging

2. **System Tests Pass Locally** ✅
   - OpenAI API works correctly
   - Function calling works
   - Russian translations are generated
   - Data extraction succeeds

3. **Production Environment** ❓
   - Without logs, can't see actual production error
   - Likely causes:
     - OpenAI API rate limiting
     - Environment variable mismatch
     - Network timeout
     - Context not being passed correctly

## Fix Applied

### File: `src/lib/ai/logger.ts`

**Changed:**
```typescript
// OLD (broken)
import { supabase } from '@/lib/supabase/client'
private async logToDatabase(entry: AILogEntry) {
  const { error } = await supabase.from('ai_chat_logs').insert({...})
}

// NEW (fixed)
import { createClient } from '@/lib/supabase/server'
private async logToDatabase(entry: AILogEntry) {
  const supabase = createClient() // Use service role client
  const { error } = await supabase.from('ai_chat_logs').insert({...})
}
```

**Why this fixes it:**
- `createClient()` from server.ts uses `SUPABASE_SERVICE_ROLE_KEY`
- Service role bypasses RLS policies
- Logs will now be saved successfully
- Can debug production errors

## Next Steps

### 1. Deploy to Production
```bash
# Build and deploy
npm run build
vercel --prod

# Or let automatic deployment handle it
git add .
git commit -m "Fix: AI logger now uses service role for database writes"
git push origin main
```

### 2. Wait for User to Trigger Error Again
Ask user to try the AI assistant again and reproduce the error.

### 3. Check Production Logs
Once logs are working, run:
```bash
node scripts/check-ai-logs.js
```

This will show:
- Recent errors with stack traces
- GPT API calls and responses
- Validation failures
- Token usage and costs

### 4. Common Issues to Check

If error persists after logging is fixed, check:

**A. Environment Variables (Vercel)**
- `OPENAI_API_KEY` - Must be set and valid
- `SUPABASE_SERVICE_ROLE_KEY` - Must be set
- Verify in Vercel dashboard → Settings → Environment Variables

**B. OpenAI API**
- Rate limits not exceeded
- API key has sufficient credits
- Model `gpt-5-mini` is available

**C. Validation Issues**
- Missing Russian translations
- Invalid date formats
- Missing required fields

**D. Context Passing**
- Check if understanding context is being passed correctly
- Verify extraction prompt includes original message

## Diagnostic Commands

```bash
# Check if table exists and is accessible
node scripts/check-ai-table.js

# Check recent AI activity
node scripts/check-ai-activity.js

# Check production logs (after fix)
node scripts/check-ai-logs.js

# Test OpenAI API
node scripts/test-openai.js

# Full diagnostic
node scripts/diagnose-ai-issue.js
```

## Expected Behavior After Fix

1. User opens AI assistant
2. Selects "אירוע" (event)
3. Enters event details
4. AI confirms understanding
5. User says "נכון" (correct)
6. **AI successfully extracts and shows confirmation preview**
7. All interactions logged to `ai_chat_logs` table

## Files Changed

- ✅ `src/lib/ai/logger.ts` - Fixed to use service role client

## Status

- [x] Issue diagnosed
- [x] Fix implemented
- [x] TypeScript compilation verified
- [ ] Deployed to production
- [ ] Logs verified in production
- [ ] Original error identified and fixed

