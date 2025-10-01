#!/bin/bash

# Import Schema to Database

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCHEMA_FILE="scripts/schema/full_schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}Schema file not found: $SCHEMA_FILE${NC}"
    echo -e "${YELLOW}Run ./scripts/export-schema.sh first${NC}"
    exit 1
fi

echo -e "${YELLOW}Import Options:${NC}"
echo -e "  ${GREEN}1${NC} - Import to LOCAL database (Docker)"
echo -e "  ${GREEN}2${NC} - Show SQL (for manual copy to Supabase)"
echo -e "  ${GREEN}3${NC} - Cancel"
echo ""
read -p "Choose option (1-3): " option

case $option in
    1)
        echo -e "${YELLOW}Importing schema to local database...${NC}"
        docker exec -i beeri_dev_db psql -U beeri_dev -d beeri_manager_dev < "$SCHEMA_FILE"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Schema imported successfully!${NC}"
        else
            echo -e "${RED}Import failed${NC}"
            exit 1
        fi
        ;;
    2)
        echo -e "${GREEN}Schema SQL:${NC}"
        echo -e "${YELLOW}Copy the content below and paste in Supabase SQL Editor${NC}"
        echo -e "${YELLOW}================================================${NC}"
        cat "$SCHEMA_FILE"
        echo -e "${YELLOW}================================================${NC}"
        ;;
    3)
        echo -e "${YELLOW}Cancelled${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
