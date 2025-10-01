#!/bin/bash

# Script to run SQL files on Supabase
# Usage: ./scripts/run-sql.sh scripts/create-app-settings-table.sql

if [ -z "$1" ]; then
  echo "Usage: $0 <sql-file>"
  exit 1
fi

SQL_FILE="$1"

if [ ! -f "$SQL_FILE" ]; then
  echo "Error: File $SQL_FILE not found"
  exit 1
fi

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

echo "Running SQL file: $SQL_FILE"
echo "This will execute on your Supabase database."
echo ""
echo "Please run this SQL manually in the Supabase SQL Editor:"
echo "1. Go to https://supabase.com/dashboard/project/wkfxwnayexznjhcktwwu/editor"
echo "2. Copy and paste the contents of: $SQL_FILE"
echo "3. Click 'Run'"
echo ""
cat "$SQL_FILE"
