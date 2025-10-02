# 🚀 Final SQL Migration - Copy & Paste This!

## Quick Instructions

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/wkfxwnayexznjhcktwwu/sql
   ```

2. **Click "New Query"**

3. **Copy the ENTIRE contents** of this file:
   ```
   scripts/migrations/007_migrate_i18n_data_with_audit.sql
   ```

4. **Paste into SQL Editor**

5. **Click "Run"**

---

## What This Does

- Sets session variables to satisfy the audit_log trigger
- Migrates 6 events to i18n format
- Migrates 5 tasks to i18n format
- Shows verification results

**Total:** 11 database items will be migrated

---

## Expected Result

You should see output like:

```
table_name | total | migrated
-----------+-------+----------
events     |   6   |    6
tasks      |   5   |    5
```

Plus sample data showing Hebrew content in `title_he` column.

---

## After Running This

Run this to verify everything worked:

```bash
node scripts/auto-migrate-i18n-data.js
```

Should show:
```
✅ Total migrated: 43
⏭️  Total skipped: 11 (already done by SQL)
❌ Total failed: 0
```

---

## Test Your Bilingual App

**Hebrew:**
```
http://localhost:4500/he
```

**Russian:**
```
http://localhost:4500/ru
```

Click the **globe icon** to switch languages!

---

**Status:** Ready to execute ✅
**Time:** 2 minutes
**Risk:** Low (non-destructive, only adds i18n data)
