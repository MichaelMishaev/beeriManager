# AI Assistant Rate Limiting

## Overview

The AI assistant now has daily usage limits to control costs and prevent abuse:

- **Daily limit**: 20 AI requests per day
- **Character limit**: 400 characters per message
- **Development**: Rate limits are **disabled** in development environment

## Cost Impact

With these limits:
- Maximum daily cost: 20 requests × ~$0.001 = ~$0.02/day
- Maximum monthly cost: ~$0.60/month
- Previous unlimited usage could have cost significantly more

## Implementation Details

### Database Migration

**File**: `scripts/migrations/011_ai_usage_tracking.sql`

The migration creates:
1. `ai_usage_logs` table - tracks daily request counts
2. `increment_ai_usage()` function - increments and checks limits
3. `get_ai_usage()` function - returns current usage stats

### Running the Migration

**Option 1: Supabase Dashboard** (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `scripts/migrations/011_ai_usage_tracking.sql`
4. Execute the SQL
5. Verify the table was created in the Table Editor

**Option 2: psql CLI**
```bash
psql "your-supabase-connection-string" -f scripts/migrations/011_ai_usage_tracking.sql
```

### File Structure

```
src/
├── lib/ai/
│   ├── rate-limiter.ts          # Core rate limiting logic
│   └── ...
├── app/api/ai-assistant/
│   ├── route.ts                 # Main API with rate limit checks
│   └── check-limit/
│       └── route.ts             # GET endpoint for usage stats
└── components/features/ai-assistant/
    └── AIChatModal.tsx          # UI with character counter
```

## Features

### 1. Daily Usage Tracking
- Tracks total AI requests per day
- Resets automatically at midnight (UTC)
- Shows remaining requests in the UI

### 2. Character Limit
- **Client-side validation**: Warns before sending
- **Server-side validation**: Rejects oversized messages
- **Visual feedback**: Character counter turns orange/red as limit approaches

### 3. User Feedback

**In Initial Greeting:**
```
💡 מגבלה יומית: 20 שימושים ביום | מקסימום 400 תווים להודעה
```

**Character Counter (bottom of input):**
```
📏 123/400 תווים
```

**Usage Counter (bottom of input):**
```
📊 15/20 שימושים
```

**When Limit Reached:**
```
הגעת למגבלה היומית של 20 שימושים 😔

נסה שוב מחר או צור קשר עם המנהל.

שימושים היום: 20/20
```

**When Message Too Long:**
```
ההודעה ארוכה מדי 📏

מקסימום: 400 תווים
ההודעה שלך: 456 תווים

נסה לקצר את ההודעה.
```

## Configuration

### Rate Limits (in `rate-limiter.ts`)

```typescript
export const RATE_LIMITS = {
  DAILY_REQUESTS: 20,          // Max requests per day
  MAX_MESSAGE_LENGTH: 400,     // Max characters per message
} as const
```

### Environment Detection

```typescript
export function shouldApplyRateLimit(): boolean {
  return process.env.NODE_ENV !== 'development'
}
```

- **Production**: Limits are enforced
- **Development**: Limits are bypassed for testing

## API Endpoints

### `GET /api/ai-assistant/check-limit`

**Response:**
```json
{
  "success": true,
  "stats": {
    "currentCount": 5,
    "dailyLimit": 20,
    "remaining": 15,
    "limitReached": false
  },
  "message": "נותרו 15 שימושים היום"
}
```

### `POST /api/ai-assistant`

Now includes rate limiting checks **before** making GPT requests.

**New Error Responses:**

**Rate Limit Reached:**
```json
{
  "success": false,
  "error": "הגעת למגבלה היומית...",
  "rateLimitReached": true,
  "stats": { ... }
}
```

**Message Too Long:**
```json
{
  "success": false,
  "error": "ההודעה ארוכה מדי...",
  "messageTooLong": true
}
```

## Testing

### Manual Testing

1. **Test Character Limit:**
   - Type 400+ characters in the AI modal
   - Verify error message appears

2. **Test Usage Counter:**
   - Open AI modal
   - Check that usage stats appear at bottom
   - Make requests and watch counter update

3. **Test Rate Limit:**
   - Make 20 AI requests
   - Verify 21st request is blocked with message

4. **Test Development Bypass:**
   - Run `npm run dev`
   - Verify no limits in development

### Database Verification

**Check today's usage:**
```sql
SELECT * FROM ai_usage_logs WHERE date = CURRENT_DATE;
```

**Get current stats:**
```sql
SELECT * FROM get_ai_usage();
```

**Manually increment (for testing):**
```sql
SELECT * FROM increment_ai_usage();
```

## Monitoring

### View Usage Logs

```sql
SELECT
  date,
  request_count,
  last_request_at
FROM ai_usage_logs
ORDER BY date DESC
LIMIT 30;
```

### Daily Usage Report

```sql
SELECT
  date,
  request_count,
  CASE
    WHEN request_count >= 20 THEN 'Limit Reached'
    WHEN request_count >= 15 THEN 'High Usage'
    ELSE 'Normal'
  END as status
FROM ai_usage_logs
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

## Troubleshooting

### "Migration already exists" Error
- Migration was already run
- Check if table exists: `SELECT * FROM ai_usage_logs`
- If table exists, no action needed

### Limits Not Working in Production
1. Check `NODE_ENV` is set to `production`
2. Verify migration ran successfully
3. Check browser console for errors
4. Check API logs for rate limit checks

### Wrong Usage Count
1. Check system time/timezone
2. Verify date in `ai_usage_logs` table
3. May need to manually reset: `DELETE FROM ai_usage_logs WHERE date = CURRENT_DATE`

## Future Enhancements

Potential improvements:
- Per-user rate limiting (instead of global)
- Different limits for admin vs regular users
- Analytics dashboard for usage trends
- Email alerts when limits are frequently hit
- Tiered limits based on usage patterns
