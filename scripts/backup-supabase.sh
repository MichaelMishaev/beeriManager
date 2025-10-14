#!/bin/bash

# Supabase Database Backup Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -E "^NEXT_PUBLIC_SUPABASE_URL=|^SUPABASE_SERVICE_ROLE_KEY=" | xargs)
fi

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local${NC}"
    exit 1
fi

# Create backup directory
BACKUP_DIR="backups/db-backups"
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.json"

echo -e "${GREEN}Creating Supabase backup...${NC}"
echo -e "${YELLOW}Backup file: $BACKUP_FILE${NC}"

# Extract database host from URL
DB_HOST=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's|http://||')

# Tables to backup
TABLES=(
    "events"
    "tasks"
    "responsibilities"
    "issues"
    "protocols"
    "committees"
    "anonymous_feedback"
    "comments"
    "app_settings"
    "vendors"
    "whatsapp_groups"
)

# Create JSON backup
echo "{" > "$BACKUP_FILE"
echo "  \"backup_timestamp\": \"$TIMESTAMP\"," >> "$BACKUP_FILE"
echo "  \"database\": \"$DB_HOST\"," >> "$BACKUP_FILE"
echo "  \"tables\": {" >> "$BACKUP_FILE"

FIRST=true
for TABLE in "${TABLES[@]}"; do
    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        echo "," >> "$BACKUP_FILE"
    fi

    echo -e "${YELLOW}Backing up table: $TABLE${NC}"
    echo "    \"$TABLE\": [" >> "$BACKUP_FILE"

    # Fetch data from Supabase
    curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/$TABLE?select=*" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        | jq -c '.[]' | while read -r row; do
            echo "      $row," >> "$BACKUP_FILE"
        done

    # Remove trailing comma from last row
    sed -i '' '$ s/,$//' "$BACKUP_FILE"
    echo -n "    ]" >> "$BACKUP_FILE"
done

echo "" >> "$BACKUP_FILE"
echo "  }" >> "$BACKUP_FILE"
echo "}" >> "$BACKUP_FILE"

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip "$BACKUP_FILE"

echo -e "${GREEN}Backup created successfully: $BACKUP_FILE.gz${NC}"
echo -e "${YELLOW}Size: $(du -h "$BACKUP_FILE.gz" | cut -f1)${NC}"

# List recent backups
echo ""
echo -e "${GREEN}Recent backups:${NC}"
ls -lh "$BACKUP_DIR" | tail -5
