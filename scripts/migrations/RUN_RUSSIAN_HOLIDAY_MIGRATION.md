# Russian Holiday Translation Migration

## Instructions

Run this SQL script in your Supabase SQL editor to add Russian translations for all holiday names:

**File:** `008_add_russian_holiday_translations.sql`

## Steps

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `008_add_russian_holiday_translations.sql`
5. Click "Run" to execute the migration
6. Verify the results - you should see Russian translations in the query output

## What This Does

This migration adds Russian (`ru`) translations to the `hebrew_name_i18n` JSONB column for all 13 holidays:

- Рош Ха-Шана (ראש השנה)
- Йом Кипур (יום כיפור)
- Суккот (סוכות)
- Шмини Ацерет (שמחת תורה)
- Ханука (חנוכה)
- Ту би-Шват (ט״ו בשבט)
- Пурим (פורים)
- Песах (פסח)
- День Памяти (יום הזיכרון)
- День Независимости (יום העצמאות)
- Лаг ба-Омер (ל״ג בעומר)
- Шавуот (שבועות)
- Летние каникулы (חופש קיץ)

## Verification

After running the migration, you can verify it worked by running:

```sql
SELECT hebrew_name, hebrew_name_i18n->>'he' as hebrew, hebrew_name_i18n->>'ru' as russian
FROM holidays
ORDER BY start_date;
```

You should see both Hebrew and Russian names for all holidays.
