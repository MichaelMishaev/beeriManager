#!/bin/bash

# Export Database Schema Only (no data)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DB_USER="beeri_dev"
DB_NAME="beeri_manager_dev"
SCHEMA_FILE="scripts/schema/full_schema.sql"

# Create schema directory
mkdir -p scripts/schema

echo -e "${GREEN}Exporting schema from local database...${NC}"

# Export schema only (no data, no ownership)
docker exec beeri_dev_db pg_dump \
    -U $DB_USER \
    -d $DB_NAME \
    --schema-only \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    > "$SCHEMA_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Schema exported to: $SCHEMA_FILE${NC}"
    echo -e "${YELLOW}File size: $(wc -l < $SCHEMA_FILE) lines${NC}"
    echo ""
    echo -e "${GREEN}You can now:${NC}"
    echo -e "  1. Review the schema file"
    echo -e "  2. Run it on production Supabase SQL Editor"
    echo -e "  3. Or use: ./scripts/import-schema.sh"
else
    echo -e "${RED}Schema export failed${NC}"
    exit 1
fi
