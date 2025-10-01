#!/bin/bash

# Compare Local Schema with Production Schema

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Schema Comparison Tool${NC}"
echo ""

# Export local schema
echo -e "${YELLOW}1. Exporting LOCAL schema...${NC}"
./scripts/export-schema.sh > /dev/null 2>&1

LOCAL_SCHEMA="scripts/schema/full_schema.sql"
PROD_SCHEMA="scripts/schema/production_schema.sql"

if [ ! -f "$LOCAL_SCHEMA" ]; then
    echo -e "${RED}Local schema export failed${NC}"
    exit 1
fi

echo -e "${YELLOW}2. Download PRODUCTION schema from Supabase:${NC}"
echo -e "   Go to Supabase Dashboard → Database → Schema"
echo -e "   Copy the schema and save to: ${YELLOW}$PROD_SCHEMA${NC}"
echo ""
read -p "Press Enter when production schema is saved..."

if [ ! -f "$PROD_SCHEMA" ]; then
    echo -e "${RED}Production schema not found: $PROD_SCHEMA${NC}"
    exit 1
fi

echo -e "${YELLOW}3. Comparing schemas...${NC}"
echo ""

# Simple diff
diff -u "$PROD_SCHEMA" "$LOCAL_SCHEMA" > scripts/schema/schema_diff.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schemas are identical!${NC}"
else
    echo -e "${YELLOW}⚠ Schemas differ. Check: scripts/schema/schema_diff.txt${NC}"
    echo ""
    echo -e "${YELLOW}Summary of differences:${NC}"
    diff -u "$PROD_SCHEMA" "$LOCAL_SCHEMA" | grep -E "^\+|^-" | head -20
    echo ""
    echo -e "${YELLOW}Full diff saved to: scripts/schema/schema_diff.txt${NC}"
fi
