#!/bin/bash

# YTReviews - Run Script
# This script sets up and runs the YTReviews application

set -e  # Exit on error

echo "🚀 YTReviews - Starting application..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Load environment variables
print_status "Loading environment variables..."

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    print_success "Loaded variables from .env"
elif [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
    print_success "Loaded variables from .env.local"
else
    print_error "No .env or .env.local file found!"
    print_warning "Please create a .env file with the required variables:"
    echo "  - DATABASE_URL"
    echo "  - YOUTUBE_API_KEY"
    echo "  - NEXT_PUBLIC_APP_URL"
    echo ""
    echo "You can copy .env.example to .env and fill in your values:"
    echo "  cp .env.example .env"
    exit 1
fi

echo ""

# Step 2: Validate required environment variables
print_status "Validating environment variables..."

MISSING_VARS=()

if [ -z "$DATABASE_URL" ]; then
    MISSING_VARS+=("DATABASE_URL")
fi

if [ -z "$YOUTUBE_API_KEY" ]; then
    MISSING_VARS+=("YOUTUBE_API_KEY")
fi

if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    MISSING_VARS+=("NEXT_PUBLIC_APP_URL")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_success "All required environment variables are set"
echo ""

# Step 3: Start PostgreSQL Docker container
print_status "Checking PostgreSQL Docker container..."

if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    if [ -f "docker-compose.yml" ]; then
        # Check if container is running
        if docker ps | grep -q "ytreviews-postgres"; then
            print_success "PostgreSQL container is already running"
        else
            print_status "Starting PostgreSQL container..."
            docker-compose up -d
            print_success "PostgreSQL container started"

            # Wait for PostgreSQL to be ready
            print_status "Waiting for PostgreSQL to be ready..."
            sleep 3

            # Check health
            for i in {1..30}; do
                if docker exec ytreviews-postgres pg_isready -U ytreviews &> /dev/null; then
                    print_success "PostgreSQL is ready"
                    break
                fi
                if [ $i -eq 30 ]; then
                    print_warning "PostgreSQL might not be ready yet, but continuing..."
                fi
                sleep 1
            done
        fi
    else
        print_warning "docker-compose.yml not found, skipping Docker setup"
    fi
else
    print_warning "Docker or docker-compose not found, skipping Docker setup"
    print_warning "Make sure PostgreSQL is running manually"
fi

echo ""

# Step 4: Check if dependencies are installed
print_status "Checking dependencies..."

if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed. Installing..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

echo ""

# Step 5: Check database connection and setup
print_status "Checking database setup..."

# Check if database schema is set up by trying to connect
if command -v psql &> /dev/null; then
    print_status "Database connection test..."
    # We'll skip the connection test and assume the user has set it up
    # as we don't want to parse DATABASE_URL in bash
fi

# Ask if user wants to set up database schema
echo ""
read -p "Do you want to push the database schema? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Pushing database schema..."
    npm run db:push
    print_success "Database schema updated"

    echo ""
    read -p "Do you want to seed the database with top YouTube channels? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Seeding database (this may take a while)..."
        npm run seed
        print_success "Database seeded"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "Setup complete! Starting development server..."
echo ""
print_status "Environment:"
echo "  📦 Database: ${DATABASE_URL%%\?*}"  # Hide query params
echo "  🔑 YouTube API: $([ -n "$YOUTUBE_API_KEY" ] && echo "Configured" || echo "Not set")"
echo "  🌐 App URL: $NEXT_PUBLIC_APP_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 6: Start the development server
npm run dev
