#!/bin/bash

# Database Management Script
# Helper script to manage the PostgreSQL Docker container

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    print_error "docker compose is not installed or not in PATH"
    exit 1
fi

# Function to start the database
start_db() {
    print_status "Starting PostgreSQL container..."
    docker compose up -d

    print_status "Waiting for PostgreSQL to be ready..."
    sleep 2

    for i in {1..30}; do
        if docker exec ytreviews-postgres pg_isready -U ytreviews &> /dev/null; then
            print_success "PostgreSQL is running and ready"
            echo ""
            echo "Connection details:"
            echo "  Host: localhost"
            echo "  Port: 5432"
            echo "  Database: ytreviews"
            echo "  User: ytreviews"
            echo "  Password: ytreviews_password"
            echo ""
            echo "Connection string:"
            echo "  postgresql://ytreviews:ytreviews_password@localhost:5432/ytreviews"
            return 0
        fi
        sleep 1
    done

    print_error "PostgreSQL failed to start"
    exit 1
}

# Function to stop the database
stop_db() {
    print_status "Stopping PostgreSQL container..."
    docker compose down
    print_success "PostgreSQL container stopped"
}

# Function to restart the database
restart_db() {
    print_status "Restarting PostgreSQL container..."
    docker compose restart

    print_status "Waiting for PostgreSQL to be ready..."
    sleep 2

    for i in {1..30}; do
        if docker exec ytreviews-postgres pg_isready -U ytreviews &> /dev/null; then
            print_success "PostgreSQL restarted and ready"
            return 0
        fi
        sleep 1
    done
}

# Function to show status
status_db() {
    if docker ps | grep -q "ytreviews-postgres"; then
        print_success "PostgreSQL container is running"
        echo ""
        docker ps --filter "name=ytreviews-postgres" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_error "PostgreSQL container is not running"
        exit 1
    fi
}

# Function to connect to psql
connect_db() {
    if docker ps | grep -q "ytreviews-postgres"; then
        print_status "Connecting to PostgreSQL..."
        docker exec -it ytreviews-postgres psql -U ytreviews -d ytreviews
    else
        print_error "PostgreSQL container is not running"
        print_status "Start it with: ./db.sh start"
        exit 1
    fi
}

# Function to show logs
logs_db() {
    docker compose logs -f postgres
}

# Function to reset database
reset_db() {
    echo -e "${YELLOW}⚠${NC} This will delete all data in the database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping container..."
        docker compose down -v
        print_status "Starting fresh container..."
        docker compose up -d

        print_status "Waiting for PostgreSQL to be ready..."
        sleep 3

        for i in {1..30}; do
            if docker exec ytreviews-postgres pg_isready -U ytreviews &> /dev/null; then
                print_success "Database reset complete"
                print_status "Run './run.sh' or 'npm run db:push' to set up schema"
                return 0
            fi
            sleep 1
        done
    else
        print_status "Reset cancelled"
    fi
}

# Main command handler
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
    status)
        status_db
        ;;
    connect|psql)
        connect_db
        ;;
    logs)
        logs_db
        ;;
    reset)
        reset_db
        ;;
    *)
        echo "YTReviews Database Management"
        echo ""
        echo "Usage: ./db.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start      Start PostgreSQL container"
        echo "  stop       Stop PostgreSQL container"
        echo "  restart    Restart PostgreSQL container"
        echo "  status     Show container status"
        echo "  connect    Connect to PostgreSQL (psql)"
        echo "  logs       Show PostgreSQL logs"
        echo "  reset      Reset database (deletes all data)"
        echo ""
        echo "Examples:"
        echo "  ./db.sh start       # Start the database"
        echo "  ./db.sh connect     # Connect via psql"
        echo "  ./db.sh logs        # View logs"
        exit 1
        ;;
esac
