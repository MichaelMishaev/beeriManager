#!/bin/bash

# Database Management Commands for Development

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database connection details
DB_USER="beeri_dev"
DB_PASSWORD="dev_password_123"
DB_NAME="beeri_manager_dev"
DB_HOST="localhost"
DB_PORT="5432"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running${NC}"
        exit 1
    fi
}

# Start local database
start_db() {
    echo -e "${GREEN}Starting local PostgreSQL database...${NC}"
    check_docker
    docker-compose up -d postgres
    echo -e "${GREEN}Database started at localhost:5432${NC}"
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    sleep 3
}

# Stop local database
stop_db() {
    echo -e "${YELLOW}Stopping local PostgreSQL database...${NC}"
    docker-compose down
    echo -e "${GREEN}Database stopped${NC}"
}

# Restart database
restart_db() {
    echo -e "${YELLOW}Restarting local PostgreSQL database...${NC}"
    stop_db
    start_db
}

# Connect to database CLI
connect_db() {
    echo -e "${GREEN}Connecting to database...${NC}"
    docker exec -it beeri_dev_db psql -U $DB_USER -d $DB_NAME
}

# Run migration file
run_migration() {
    if [ -z "$1" ]; then
        echo -e "${RED}Usage: ./db-commands.sh migrate <migration_file>${NC}"
        echo -e "${YELLOW}Example: ./db-commands.sh migrate 004_add_vendors.sql${NC}"
        exit 1
    fi

    MIGRATION_FILE="scripts/migrations/$1"

    if [ ! -f "$MIGRATION_FILE" ]; then
        echo -e "${RED}Migration file not found: $MIGRATION_FILE${NC}"
        exit 1
    fi

    echo -e "${GREEN}Running migration: $1${NC}"
    docker exec -i beeri_dev_db psql -U $DB_USER -d $DB_NAME < "$MIGRATION_FILE"
    echo -e "${GREEN}Migration completed${NC}"
}

# Run all migrations
run_all_migrations() {
    echo -e "${GREEN}Running all migrations...${NC}"
    for file in scripts/migrations/*.sql; do
        if [ -f "$file" ]; then
            echo -e "${YELLOW}Running: $(basename $file)${NC}"
            docker exec -i beeri_dev_db psql -U $DB_USER -d $DB_NAME < "$file"
        fi
    done
    echo -e "${GREEN}All migrations completed${NC}"
}

# Reset database (drop and recreate)
reset_db() {
    echo -e "${RED}WARNING: This will delete all data in the local database!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Reset cancelled${NC}"
        exit 0
    fi

    echo -e "${YELLOW}Resetting database...${NC}"
    docker exec -i beeri_dev_db psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    docker exec -i beeri_dev_db psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}Database reset complete${NC}"

    run_all_migrations
}

# Backup database
backup_db() {
    BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p backups
    echo -e "${GREEN}Creating backup: $BACKUP_FILE${NC}"
    docker exec beeri_dev_db pg_dump -U $DB_USER $DB_NAME > "$BACKUP_FILE"
    echo -e "${GREEN}Backup created successfully${NC}"
}

# Restore database from backup
restore_db() {
    if [ -z "$1" ]; then
        echo -e "${RED}Usage: ./db-commands.sh restore <backup_file>${NC}"
        ls -1 backups/*.sql 2>/dev/null || echo -e "${YELLOW}No backups found${NC}"
        exit 1
    fi

    if [ ! -f "$1" ]; then
        echo -e "${RED}Backup file not found: $1${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Restoring from: $1${NC}"
    docker exec -i beeri_dev_db psql -U $DB_USER -d $DB_NAME < "$1"
    echo -e "${GREEN}Restore completed${NC}"
}

# Show database status
status_db() {
    echo -e "${GREEN}Database Status:${NC}"
    docker-compose ps postgres
    echo ""
    echo -e "${GREEN}Connection Info:${NC}"
    echo -e "Host: ${YELLOW}localhost${NC}"
    echo -e "Port: ${YELLOW}5432${NC}"
    echo -e "Database: ${YELLOW}$DB_NAME${NC}"
    echo -e "User: ${YELLOW}$DB_USER${NC}"
    echo -e "Password: ${YELLOW}$DB_PASSWORD${NC}"
}

# Start pgAdmin
start_pgadmin() {
    echo -e "${GREEN}Starting pgAdmin...${NC}"
    check_docker
    docker-compose up -d pgadmin
    echo -e "${GREEN}pgAdmin started at http://localhost:5050${NC}"
    echo -e "${YELLOW}Email: admin@beeri.local${NC}"
    echo -e "${YELLOW}Password: admin${NC}"
}

# Show help
show_help() {
    echo -e "${GREEN}Database Management Commands${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} ./scripts/db-commands.sh <command>"
    echo ""
    echo -e "${GREEN}Commands:${NC}"
    echo -e "  ${YELLOW}start${NC}           - Start local PostgreSQL database"
    echo -e "  ${YELLOW}stop${NC}            - Stop local PostgreSQL database"
    echo -e "  ${YELLOW}restart${NC}         - Restart local PostgreSQL database"
    echo -e "  ${YELLOW}status${NC}          - Show database status and connection info"
    echo -e "  ${YELLOW}connect${NC}         - Connect to database CLI (psql)"
    echo -e "  ${YELLOW}migrate <file>${NC}  - Run specific migration file"
    echo -e "  ${YELLOW}migrate-all${NC}     - Run all migration files in order"
    echo -e "  ${YELLOW}reset${NC}           - Reset database (WARNING: deletes all data)"
    echo -e "  ${YELLOW}backup${NC}          - Create database backup"
    echo -e "  ${YELLOW}restore <file>${NC}  - Restore database from backup"
    echo -e "  ${YELLOW}pgadmin${NC}         - Start pgAdmin web interface"
    echo -e "  ${YELLOW}help${NC}            - Show this help message"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo -e "  ./scripts/db-commands.sh start"
    echo -e "  ./scripts/db-commands.sh migrate 004_add_vendors.sql"
    echo -e "  ./scripts/db-commands.sh backup"
}

# Main command router
case "$1" in
    start)
        start_db
        ;;
    stop)
        stop_db
        ;;
    restart)
        restart_db
        ;;
    connect)
        connect_db
        ;;
    migrate)
        run_migration "$2"
        ;;
    migrate-all)
        run_all_migrations
        ;;
    reset)
        reset_db
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "$2"
        ;;
    status)
        status_db
        ;;
    pgadmin)
        start_pgadmin
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
