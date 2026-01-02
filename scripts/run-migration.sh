#!/bin/bash

# Run Supabase migration using psql
# Usage: ./scripts/run-migration.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Running January 2026 calendar migration...${NC}\n"

# Supabase connection details
DB_URL="postgresql://postgres.wkfxwnayexznjhcktwwu:[YOUR-DB-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Migration file
MIGRATION_FILE="supabase/migrations/20260104000000_import_january_2026_calendar.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Migration file: $MIGRATION_FILE${NC}"
echo -e "${YELLOW}📊 Counting INSERT statements...${NC}\n"

# Count INSERT statements
INSERT_COUNT=$(grep -c "^INSERT INTO events" "$MIGRATION_FILE" || echo "0")
echo -e "${GREEN}Found $INSERT_COUNT events to import${NC}\n"

# Ask for database password
echo -e "${YELLOW}Please enter your Supabase database password:${NC}"
echo -e "${YELLOW}(You can find it in: Supabase Dashboard > Project Settings > Database > Connection Pooling)${NC}"
read -s DB_PASSWORD

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Password cannot be empty${NC}"
    exit 1
fi

# Construct connection string
CONN_STRING="postgresql://postgres.wkfxwnayexznjhcktwwu:${DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

echo -e "\n${YELLOW}🔗 Connecting to Supabase...${NC}"

# Execute migration
if psql "$CONN_STRING" -f "$MIGRATION_FILE" 2>&1 | tee /tmp/migration-output.log; then
    echo -e "\n${GREEN}✅ Migration completed successfully!${NC}"
    echo -e "${GREEN}📊 Imported $INSERT_COUNT events${NC}"
else
    echo -e "\n${RED}❌ Migration failed. Check output above for errors.${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 All January 2026 calendar events have been imported!${NC}"
echo -e "${YELLOW}💡 Tip: Refresh your app to see the new events${NC}\n"
