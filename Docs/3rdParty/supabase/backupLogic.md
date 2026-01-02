# Supabase Database Backup System

## Overview
This document explains how to create backups of the BeeriManager production database. It's designed for both manual use and AI agent automation.

---

## 🎯 Quick Start - AI Agent Instructions

**To create a new backup, run:**
```bash
node scripts/backup-supabase-data.js
```

**Expected output:**
- ✅ Success: Backup file created in `backups/` folder
- 📊 Summary: Number of rows backed up per table
- 📦 File size in MB

---

## 📁 Backup Storage Location

### Primary Backup Directory
```
/Users/michaelmishayev/Desktop/Projects/beeriManager/backups/
```

### Subdirectories
```
backups/
├── supabase_full_backup_[timestamp].json    # Main JSON backups
└── supabase/                                 # Optional SQL backups
    └── supabase_backup_[timestamp].sql
```

### Gitignore Protection
✅ **All backup files are automatically excluded from git** (see `.gitignore` line 218)
- Never commit backup files to the repository
- Contains production data with sensitive information
- Backups are for local use only

---

## 🔄 Backup Methods

### Method 1: JSON Export via API (Recommended for AI)
**Script:** `scripts/backup-supabase-data.js`

**Advantages:**
- ✅ Fast and automated
- ✅ No authentication required (uses .env.local)
- ✅ AI-friendly - simple node command
- ✅ Human-readable JSON format
- ✅ Individual table verification

**Command:**
```bash
node scripts/backup-supabase-data.js
```

**Output Example:**
```
🔄 Creating full Supabase backup...

✅ events: 68 rows
✅ tasks: 33 rows
✅ issues: 0 rows
✅ protocols: 2 rows
✅ holidays: 11 rows
✅ committees: 2 rows
✅ anonymous_feedback: 61 rows
✅ vendors: 1 rows
✅ vendor_reviews: 0 rows
✅ app_settings: 1 rows

✅ Full backup saved: /Users/.../backups/supabase_full_backup_2026-01-02T14-13-06.json
📦 Backup size: 0.20 MB
```

**What Gets Backed Up:**
- All rows from all tables
- Timestamp metadata
- Row counts for verification
- Error messages if any table fails

### Method 2: Shell Script (Interactive)
**Script:** `scripts/supabase-backup.sh`

**Features:**
- Multiple backup methods (Dashboard, CLI, pg_dump, API)
- Interactive menu selection
- Browser automation for dashboard downloads
- Colored output for readability

**Command:**
```bash
npm run supabase:backup
# OR
./scripts/supabase-backup.sh
```

**Use When:**
- You need SQL format backups
- You want to use Supabase CLI
- You prefer interactive selection
- You need database schema + data

### Method 3: NPM Scripts
**Available Commands:**
```bash
npm run db:backup           # Generic database backup
npm run supabase:backup     # Supabase-specific interactive backup
npm run supabase:export     # JSON export (same as Method 1)
```

---

## 📋 Tables Included in Backup

The backup script includes these tables:

| Table | Description | Typical Rows |
|-------|-------------|--------------|
| `events` | Calendar events with Google sync | 60-100 |
| `tasks` | Action items with owners | 30-50 |
| `issues` | Problem tracking | 0-20 |
| `protocols` | Historical documents | 2-10 |
| `holidays` | Holiday calendar | 10-15 |
| `committees` | Committee management | 2-5 |
| `anonymous_feedback` | Anonymous feedback system | 50-100 |
| `vendors` | Vendor database | 1-20 |
| `vendor_reviews` | Vendor ratings | 0-50 |
| `app_settings` | Global app settings | 1-5 |

**Note:** `vendor_transactions` may show a warning if not created yet - this is normal.

---

## 🔧 Technical Details

### Backup File Format (JSON)
```json
{
  "timestamp": "2026-01-02T14-13-06-376Z",
  "tables": {
    "events": {
      "rows": 68,
      "data": [
        {
          "id": "uuid",
          "title": "Event Name",
          "date": "2026-01-15",
          "created_at": "2025-12-01T10:00:00Z",
          ...
        }
      ]
    },
    "tasks": {
      "rows": 33,
      "data": [...]
    }
  }
}
```

### Filename Convention
```
supabase_full_backup_[YYYY-MM-DD]T[HH-MM-SS]-[ms]Z.json
```

**Example:**
```
supabase_full_backup_2026-01-02T14-13-06-376Z.json
```

**Breakdown:**
- `supabase_full_backup_` - Prefix
- `2026-01-02` - Date (YYYY-MM-DD)
- `T` - Separator
- `14-13-06` - Time (HH-MM-SS in UTC)
- `-376Z` - Milliseconds + UTC indicator
- `.json` - File extension

---

## 🤖 AI Agent Integration

### Prerequisites Check
```bash
# Verify environment file exists
[ -f .env.local ] && echo "✓ Ready" || echo "✗ Missing .env.local"

# Verify backup script exists
[ -f scripts/backup-supabase-data.js ] && echo "✓ Script found" || echo "✗ Script missing"
```

### Single Command Backup
```bash
node scripts/backup-supabase-data.js
```

### Verification After Backup
```bash
# List recent backups
ls -lh backups/supabase_full_backup_*.json | tail -5

# Show latest backup size
ls -lh backups/supabase_full_backup_*.json | tail -1 | awk '{print $5}'

# Verify JSON is valid
node -e "JSON.parse(require('fs').readFileSync(require('fs').readdirSync('backups').filter(f=>f.includes('supabase_full_backup')).sort().pop().replace(/^/,'backups/')))" && echo "✓ Valid JSON"
```

### Expected Success Indicators
- Exit code: `0`
- Output contains: `✅ Full backup saved:`
- File size: `0.10 - 1.00 MB` (depends on data volume)
- No errors in table backups
- All expected tables present

---

## 🔐 Environment Variables Required

The backup script reads from `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Notes:**
- ✅ `.env.local` is gitignored
- ✅ Backup files are gitignored
- ✅ Service role key grants full database access
- ⚠️ Never expose these values publicly

---

## 📊 Backup Best Practices

### Frequency
- **Before migrations:** Always create backup
- **Before major changes:** Database schema or data modifications
- **Weekly:** Regular automated backups
- **Before deployment:** Production releases

### Retention Policy
- **Keep last 10 backups:** Delete older files manually
- **Archive monthly:** Move to long-term storage
- **Test restores:** Verify backups are usable

### Storage Locations
1. **Local:** `/Users/michaelmishayev/Desktop/Projects/beeriManager/backups/`
2. **Cloud Storage:** (Optional) Upload to Google Drive/Dropbox
3. **External Drive:** (Recommended) Weekly backups to external storage

### File Management
```bash
# List all backups sorted by date
ls -lt backups/supabase_full_backup_*.json

# Count total backups
ls backups/supabase_full_backup_*.json | wc -l

# Delete backups older than 30 days
find backups/ -name "supabase_full_backup_*.json" -mtime +30 -delete

# Keep only last 10 backups
ls -t backups/supabase_full_backup_*.json | tail -n +11 | xargs rm
```

---

## 🚨 Troubleshooting

### Error: "Could not find the table"
**Cause:** Table doesn't exist in schema yet
**Solution:** Normal for tables not yet created (e.g., `vendor_transactions`)
**Action:** No action needed, backup continues

### Error: "NEXT_PUBLIC_SUPABASE_URL not found"
**Cause:** Missing `.env.local` file or environment variables
**Solution:**
```bash
# Check if file exists
ls -la .env.local

# Verify variables are set
grep NEXT_PUBLIC_SUPABASE_URL .env.local
grep SUPABASE_SERVICE_ROLE_KEY .env.local
```

### Error: "Permission denied"
**Cause:** Script not executable or folder permissions
**Solution:**
```bash
chmod +x scripts/backup-supabase-data.js
mkdir -p backups
chmod 755 backups
```

### Backup File Too Large (>10MB)
**Cause:** Database has grown significantly
**Solution:** Consider:
- Archiving old data
- Splitting backups by table
- Using compressed SQL format instead

---

## 🔄 Restore Process

### From JSON Backup
**Note:** Restore is a manual process requiring custom script or Supabase dashboard

**Steps:**
1. **Identify backup file:**
   ```bash
   ls -lt backups/supabase_full_backup_*.json | head -1
   ```

2. **Validate JSON:**
   ```bash
   node -e "console.log(JSON.parse(require('fs').readFileSync('backups/[filename].json')).timestamp)"
   ```

3. **Manual restore via Supabase dashboard:**
   - Navigate to Table Editor
   - Select table
   - Use "Insert" or bulk import
   - Paste JSON data

4. **Programmatic restore (create script if needed):**
   ```javascript
   // scripts/restore-backup.js
   const backup = require('../backups/[filename].json')
   // Use Supabase client to insert data
   ```

### From SQL Backup (if using Method 2)
```bash
psql [connection-string] < backups/supabase/supabase_backup_[timestamp].sql
```

---

## 📝 Maintenance Tasks

### Weekly
- [ ] Run backup script
- [ ] Verify backup file created
- [ ] Check backup file size
- [ ] Confirm all tables present

### Monthly
- [ ] Test restore process
- [ ] Archive old backups
- [ ] Clean up backups folder
- [ ] Verify environment variables

### Before Major Changes
- [ ] Create backup with descriptive name
- [ ] Document what's changing
- [ ] Test backup validity
- [ ] Keep backup until change is stable

---

## 📞 Support & References

### Key Files
- **Backup Script:** `scripts/backup-supabase-data.js`
- **Shell Script:** `scripts/supabase-backup.sh`
- **Environment:** `.env.local`
- **Documentation:** `Docs/3rdParty/supabase/backupLogic.md` (this file)

### Supabase Dashboard
- **Project URL:** https://supabase.com/dashboard/project/[project-id]
- **Backups Section:** https://supabase.com/dashboard/project/[project-id]/database/backups
- **Database Settings:** https://supabase.com/dashboard/project/[project-id]/settings/database

### Related Documentation
- `Docs/3rdParty/supabase/connectRemote.md` - Connection details
- `CLAUDE.md` - Project overview and commands

---

## 🎯 AI Agent Quick Reference Card

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CREATE BACKUP (Primary Command)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
node scripts/backup-supabase-data.js

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VERIFY BACKUP CREATED
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ls -lh backups/supabase_full_backup_*.json | tail -1

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CHECK BACKUP VALIDITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
node -e "const f=require('fs').readdirSync('backups').filter(x=>x.includes('supabase_full_backup')).sort().pop(); console.log('Latest backup:', f, JSON.parse(require('fs').readFileSync('backups/'+f)).timestamp)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COUNT BACKUPS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ls backups/supabase_full_backup_*.json | wc -l
```

---

**Last Updated:** 2026-01-02
**Maintainer:** AI Agent / Developer
**Status:** ✅ Active & Tested
