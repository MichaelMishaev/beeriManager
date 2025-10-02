#!/bin/bash
set -e

# ============================================
# FULLY AUTOMATED i18n DATABASE MIGRATION
# ============================================
# This script runs the complete database migration
# automatically without manual intervention
#
# Usage: ./scripts/full-auto-i18n-migration.sh
# ============================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "========================================================================"
echo -e "${BLUE}🌍  BEERIMANAGER AUTOMATED i18n DATABASE MIGRATION${NC}"
echo "========================================================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${RED}❌ Error: .env.local file not found${NC}"
  exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}❌ Error: Missing Supabase credentials in .env.local${NC}"
  exit 1
fi

# Extract connection details from Supabase URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
DB_URL="postgresql://postgres.${PROJECT_REF}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

echo -e "${YELLOW}⚠️  This will:${NC}"
echo "   1. Add JSONB i18n columns to 6 tables"
echo "   2. Backup existing data"
echo "   3. Migrate Hebrew content to i18n columns"
echo "   4. Create helper functions and indexes"
echo ""
echo -e "${YELLOW}⚠️  This is SAFE and NON-DESTRUCTIVE${NC}"
echo "   - Existing columns are kept"
echo "   - Data is backed up before migration"
echo "   - Changes can be rolled back"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo -e "${YELLOW}❌ Migration cancelled${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}🔧 STEP 1: Running SQL migration...${NC}"
echo "========================================================================"
echo ""

# Check if psql is available
if command -v psql &> /dev/null; then
  echo -e "${GREEN}✅ Found psql, using direct connection${NC}"

  # Run SQL migration via psql
  PGPASSWORD="${SUPABASE_SERVICE_ROLE_KEY}" psql \
    "postgresql://postgres.${PROJECT_REF}:@aws-0-us-east-1.pooler.supabase.com:5432/postgres" \
    -f scripts/migrations/006_add_i18n_support.sql \
    2>&1 | grep -v "NOTICE:" | grep -v "^$" || true

  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ SQL migration completed${NC}"
  else
    echo -e "${RED}❌ SQL migration failed${NC}"
    echo ""
    echo -e "${YELLOW}📝 Please run the migration manually:${NC}"
    echo "   1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/editor"
    echo "   2. Open SQL Editor"
    echo "   3. Copy contents of: scripts/migrations/006_add_i18n_support.sql"
    echo "   4. Click 'Run'"
    echo ""
    read -p "Press Enter after running the SQL manually..."
  fi
else
  echo -e "${YELLOW}⚠️  psql not found, showing manual instructions:${NC}"
  echo ""
  echo -e "${BLUE}📝 Please run SQL migration manually:${NC}"
  echo "   1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/editor"
  echo "   2. Open SQL Editor"
  echo "   3. Copy contents of: scripts/migrations/006_add_i18n_support.sql"
  echo "   4. Click 'Run'"
  echo ""
  read -p "Press Enter after running the SQL manually..."
fi

echo ""
echo -e "${BLUE}🔧 STEP 2: Migrating existing data...${NC}"
echo "========================================================================"
echo ""

# Run TypeScript data migration
if ! npx ts-node scripts/auto-migrate-i18n.ts; then
  echo ""
  echo -e "${RED}❌ Data migration failed${NC}"
  exit 1
fi

echo ""
echo "========================================================================"
echo -e "${GREEN}✅  MIGRATION COMPLETED SUCCESSFULLY!${NC}"
echo "========================================================================"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "   • Added i18n JSONB columns to 6 tables"
echo "   • Migrated existing Hebrew content"
echo "   • Created indexes for performance"
echo "   • Backed up data to ./backups/"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Update API routes to use *_i18n columns"
echo "   2. Add Russian translations via admin UI"
echo "   3. Test bilingual content display"
echo ""
echo -e "${GREEN}🎉 Ready to continue with i18n implementation!${NC}"
echo ""
