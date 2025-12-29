# AI Assistant - Urgent Messages Guide

## Overview
The AI assistant now supports creating urgent messages with automatic Hebrew-to-Russian translation, relative dates, and multi-line formatting.

## What Was Fixed (2025-12-17)

### 1. Auto-Translation to Russian ✅
**Problem:** Users were getting "לא הבנתי. אנא נסה שוב." because the AI couldn't extract Russian translations.

**Solution:** Updated SYSTEM_PROMPT to automatically translate Hebrew to Russian.

**How it works:**
- User writes **only in Hebrew**
- AI automatically generates:
  - `title_he`: Original Hebrew text
  - `title_ru`: Auto-translated Russian text
  - `description_he`: Hebrew description (if provided)
  - `description_ru`: Russian translation (if provided)

### 2. Relative Date Support ✅
**Problem:** Users couldn't use relative dates like "5 ימים" (5 days).

**Solution:** Added relative date parsing to SYSTEM_PROMPT.

**Supported formats:**
- **Absolute dates:**
  - `15/03/2025`
  - `15 במרץ`
  - `15.03.2025`

- **Relative dates (NEW):**
  - `5 ימים` → Today + 5 days
  - `שבוע` / `למשך שבוע` → Today + 7 days
  - `עד סוף החודש` → Last day of current month
  - `עד סוף השבוע` → Next Saturday

### 3. Line Breaks in Descriptions ✅
**Problem:** Users wanted multi-line messages but couldn't input them.

**Solution:**
1. Changed input from `<input>` to `<textarea>` with auto-resize
2. Added `whitespace-pre-line` CSS class to preserve line breaks in display
3. Smart Enter key behavior:
   - **Desktop**: Enter sends message, Shift+Enter creates new line
   - **Mobile**: Enter creates new line, "שלח" button sends message

**How to use line breaks:**

**On Desktop (Keyboard):**
- Type your message
- Press **Shift+Enter** to create a new line
- Press **Enter** alone to send

**On Mobile (Touch):**
- Type your message
- Press **Enter** (or Return) on keyboard to create a new line
- Tap the **"שלח"** button to send

The textarea auto-expands as you type (max 4 lines visible, then scrolls).

**Example input:**
```
חג חנוכה שמח לכולם! 🕎

מזכירים:
• הדלקת נרות היום ב-17:30
• מסיבת חנוכה ביום רביעי
• תחרות סביבונים ביום שישי

תראה הודעה זו למשך 5 ימים
```

The AI will create a message with proper line breaks that displays as:
```
חג חנוכה שמח לכולם! 🕎

מזכירים:
• הדלקת נרות היום ב-17:30
• מסיבת חנוכה ביום רביעי
• תחרות סביבונים ביום שישי
```

## Usage Examples

### Example 1: Simple White Shirt Reminder
**User input:**
```
תזכורת חולצה לבנה למחר עד 20/03/2025
```

**AI extracts:**
```json
{
  "type": "white_shirt",
  "title_he": "תזכורת חולצה לבנה למחר",
  "title_ru": "Напоминание о белой рубашке на завтра",
  "end_date": "2025-03-20"
}
```

### Example 2: Urgent Cancellation with Relative Date
**User input:**
```
ביטול לימודים מחר בגלל מזג אוויר! תראה הודעה למשך 3 ימים
```

**AI extracts:**
```json
{
  "type": "urgent",
  "title_he": "ביטול לימודים מחר בגלל מזג אוויר",
  "title_ru": "Отмена занятий завтра из-за погоды",
  "end_date": "2025-12-20"  // Today (17th) + 3 days
}
```

### Example 3: Multi-line Holiday Message
**User input:**
```
חג חנוכה שמח! 🕎

פרטים:
• הדלקת נרות ב-17:30
• מסיבה ביום רביעי
• תחרות סביבונים ביום שישי

תראה למשך שבוע
```

**AI extracts:**
```json
{
  "type": "info",
  "title_he": "חג חנוכה שמח! 🕎",
  "title_ru": "С праздником Ханука! 🕎",
  "description_he": "פרטים:\n• הדלקת נרות ב-17:30\n• מסיבה ביום רביעי\n• תחרות סביבונים ביום שישי",
  "description_ru": "Детали:\n• Зажигание свечей в 17:30\n• Вечеринка в среду\n• Конкурс дрейделов в пятницу",
  "end_date": "2025-12-24"  // Today + 7 days
}
```

## Technical Implementation

### Files Changed:
1. **`src/lib/ai/openai.ts`** - Updated SYSTEM_PROMPT with:
   - Auto-translation instructions
   - Relative date parsing rules
   - Current date context

2. **`src/components/features/ai-assistant/AIChatModal.tsx`** - Complete rewrite of input:
   - Changed `<input>` → `<textarea>` with auto-resize
   - Mobile detection for smart Enter key behavior
   - Visual hint showing keyboard shortcuts
   - Auto-expanding textarea (1-4 lines visible)

3. **`src/components/features/urgent/UrgentMessagesBanner.tsx`** - Added `whitespace-pre-line` to:
   - White shirt message descriptions (line 99)
   - Regular message descriptions (line 146)

4. **`src/components/features/ai-assistant/AIConfirmationPreview.tsx`** - Added `whitespace-pre-line` to preview (lines 252, 257)

5. **`src/app/api/ai-assistant/route.ts`** - Updated user-facing prompt to mention relative dates

### CSS Classes Added:
```css
whitespace-pre-line
```
This Tailwind class:
- Preserves line breaks (`\n`)
- Collapses multiple spaces
- Wraps text normally

## Message Types

| Type | Icon | Use Case | Example |
|------|------|----------|---------|
| `white_shirt` | 👕 | White shirt reminders | "תזכורת חולצה לבנה למחר" |
| `urgent` | 🚨 | Urgent announcements | "ביטול לימודים מחר" |
| `info` | ℹ️ | General information | "חג חנוכה שמח" |
| `warning` | ⚠️ | Important warnings | "שינוי בשעות הפעילות" |

The AI automatically detects the message type based on keywords:
- "חולצה לבנה" → `white_shirt`
- "דחוף", "ביטול" → `urgent`
- "אזהרה" → `warning`
- Default → `info`

## Testing

To test the changes:

1. **Navigate to AI Assistant:**
   ```
   http://localhost:4500/he/admin → AI Assistant widget
   ```

2. **Select "2️⃣ הודעה דחופה"**

3. **Try these test cases:**

   ```
   ✅ Test 1: חג חנוכה שמח! תראה למשך 5 ימים
   Expected: Creates message with end_date = today + 5 days

   ✅ Test 2: תזכורת חולצה לבנה למחר עד 25/12/2025
   Expected: White shirt message with absolute date

   ✅ Test 3: ביטול לימודים

   מחר אין לימודים בגלל מזג אוויר

   תראה עד סוף השבוע
   Expected: Multi-line message with line breaks
   ```

4. **Verify:**
   - ✅ AI extracts data correctly
   - ✅ Preview shows both Hebrew and Russian
   - ✅ Line breaks are preserved
   - ✅ Message appears on homepage after creation
   - ✅ Can dismiss and share message

## Debugging

If you get "לא הבנתי. אנא נסה שוב.":

1. **Check the date format:**
   - ❌ "למשך 5" (missing "ימים")
   - ✅ "5 ימים" or "למשך 5 ימים"

2. **Verify end date is specified:**
   - ❌ "חג חנוכה שמח" (no date)
   - ✅ "חג חנוכה שמח למשך שבוע"

3. **Check browser console** for AI extraction errors:
   ```javascript
   // In /api/ai-assistant route
   console.log('[AI Assistant] Function args:', functionArgs)
   ```

## Future Enhancements

Potential improvements:
- [ ] Support for Hebrew date formats (ט"ו באדר)
- [ ] Recurring messages (weekly white shirt reminders)
- [ ] Image attachments
- [ ] Push notification integration
- [ ] Message scheduling (create now, publish later)

---

**Last Updated:** 2025-12-17
**Version:** 1.1
**Status:** ✅ Production Ready
