#!/bin/bash

# Supabase Database Backup Script
# This script creates a backup of your Supabase PostgreSQL database

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '#' | xargs)
fi

# Parse Supabase URL to get connection details
# Expected format: https://xxxxxxxxxxxxx.supabase.co
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local${NC}"
    echo -e "${YELLOW}Please add your Supabase URL to .env.local${NC}"
    exit 1
fi

# Extract project reference from URL (e.g., xxxxxxxxxxxxx from https://xxxxxxxxxxxxx.supabase.co)
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | sed 's/.supabase.co//')

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Supabase Database Backup Tool           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Project Reference:${NC} $PROJECT_REF"
echo ""

# Create backups directory if it doesn't exist
BACKUP_DIR="backups/supabase"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/supabase_backup_${TIMESTAMP}.sql"

echo -e "${GREEN}Backup Methods Available:${NC}"
echo ""
echo -e "1. ${YELLOW}Manual Download via Supabase Dashboard${NC} (Recommended)"
echo -e "   - Visit: https://supabase.com/dashboard/project/$PROJECT_REF/database/backups"
echo -e "   - Click 'Download' on any backup point"
echo -e "   - Save to: $BACKUP_DIR"
echo ""
echo -e "2. ${YELLOW}Using Supabase CLI${NC} (Requires installation)"
echo -e "   - Install: brew install supabase/tap/supabase"
echo -e "   - Login: supabase login"
echo -e "   - Backup: supabase db dump -f $BACKUP_FILE --project-id $PROJECT_REF"
echo ""
echo -e "3. ${YELLOW}Using pg_dump with Database Password${NC} (Advanced)"
echo -e "   - Requires database password from Supabase dashboard"
echo -e "   - Connection string format needed"
echo ""

# Ask user which method they want to use
echo -e "${BLUE}Which method would you like to use?${NC}"
echo -e "  [1] Open Supabase Dashboard (browser)"
echo -e "  [2] Use Supabase CLI (if installed)"
echo -e "  [3] Use pg_dump (need password)"
echo -e "  [4] Export data via API (JSON format)"
echo -e "  [q] Quit"
echo ""
read -p "Enter your choice [1-4, q]: " choice

case $choice in
    1)
        echo -e "${GREEN}Opening Supabase Dashboard...${NC}"
        DASHBOARD_URL="https://supabase.com/dashboard/project/$PROJECT_REF/database/backups"
        echo -e "${YELLOW}Dashboard URL:${NC} $DASHBOARD_URL"

        # Try to open in browser
        if command -v open &> /dev/null; then
            open "$DASHBOARD_URL"
            echo -e "${GREEN}✓ Browser opened${NC}"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$DASHBOARD_URL"
            echo -e "${GREEN}✓ Browser opened${NC}"
        else
            echo -e "${YELLOW}Please open this URL manually in your browser:${NC}"
            echo -e "$DASHBOARD_URL"
        fi

        echo ""
        echo -e "${YELLOW}Steps to download backup:${NC}"
        echo -e "  1. Navigate to the 'Backups' tab"
        echo -e "  2. Click 'Download' on the backup you want"
        echo -e "  3. Save the file to: $BACKUP_DIR"
        ;;

    2)
        echo -e "${GREEN}Checking if Supabase CLI is installed...${NC}"
        if ! command -v supabase &> /dev/null; then
            echo -e "${RED}Error: Supabase CLI is not installed${NC}"
            echo -e "${YELLOW}Install with:${NC} brew install supabase/tap/supabase"
            exit 1
        fi

        echo -e "${GREEN}✓ Supabase CLI found${NC}"
        echo -e "${YELLOW}Creating backup using Supabase CLI...${NC}"

        # Check if logged in
        if ! supabase projects list &> /dev/null; then
            echo -e "${YELLOW}You need to login first${NC}"
            supabase login
        fi

        echo -e "${GREEN}Running backup...${NC}"
        supabase db dump -f "$BACKUP_FILE" --project-id "$PROJECT_REF" --data-only

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Backup created successfully!${NC}"
            echo -e "${YELLOW}File:${NC} $BACKUP_FILE"
            echo -e "${YELLOW}Size:${NC} $(du -h "$BACKUP_FILE" | cut -f1)"
        else
            echo -e "${RED}✗ Backup failed${NC}"
            exit 1
        fi
        ;;

    3)
        echo -e "${YELLOW}Using pg_dump requires your database password${NC}"
        echo ""
        echo -e "To get your connection string:"
        echo -e "  1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
        echo -e "  2. Scroll to 'Connection String'"
        echo -e "  3. Copy the connection string"
        echo ""
        read -p "Enter your database connection string: " DB_CONNECTION_STRING

        if [ -z "$DB_CONNECTION_STRING" ]; then
            echo -e "${RED}Error: No connection string provided${NC}"
            exit 1
        fi

        echo -e "${GREEN}Creating backup with pg_dump...${NC}"
        pg_dump "$DB_CONNECTION_STRING" > "$BACKUP_FILE"

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Backup created successfully!${NC}"
            echo -e "${YELLOW}File:${NC} $BACKUP_FILE"
            echo -e "${YELLOW}Size:${NC} $(du -h "$BACKUP_FILE" | cut -f1)"
        else
            echo -e "${RED}✗ Backup failed${NC}"
            echo -e "${YELLOW}Make sure pg_dump is installed and the connection string is correct${NC}"
            exit 1
        fi
        ;;

    4)
        echo -e "${GREEN}Exporting data via Supabase API (JSON format)...${NC}"
        echo -e "${YELLOW}This will create JSON exports of all tables${NC}"

        # Create a Node.js script to export data
        node scripts/export-supabase-data.js

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Export completed!${NC}"
            echo -e "${YELLOW}Files saved to:${NC} $BACKUP_DIR"
        else
            echo -e "${RED}✗ Export failed${NC}"
            echo -e "${YELLOW}Make sure you have the required dependencies installed${NC}"
        fi
        ;;

    q|Q)
        echo -e "${YELLOW}Backup cancelled${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}Backup process complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Backup location:${NC} $BACKUP_DIR"
echo -e "${YELLOW}Latest backups:${NC}"
ls -lh "$BACKUP_DIR" | tail -5

echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo -e "  - Store backups securely (encrypt sensitive data)"
echo -e "  - Test restore procedures regularly"
echo -e "  - Keep multiple backup versions"
echo -e "  - Consider automated backups via Supabase dashboard"
