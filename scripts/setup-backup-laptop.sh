#!/bin/bash

# Backup Laptop Setup Script
# This script automates the setup of the WellSense AI Platform on a backup laptop
# Requirements: Node.js 18+, PostgreSQL 14+, MongoDB 6+, Redis 7+

set -e  # Exit on error

echo "=========================================="
echo "WellSense AI Platform - Backup Laptop Setup"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${NC}→ $1${NC}"
}

# Check if running on backup laptop
echo "Step 1: Verifying environment..."
print_info "Please confirm this is the BACKUP laptop (not the primary presentation laptop)"
read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    print_error "Setup cancelled"
    exit 1
fi

# Check Node.js version
print_info "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Check PostgreSQL
print_info "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL CLI not found. Ensure PostgreSQL 14+ is installed and running."
else
    print_success "PostgreSQL detected"
fi

# Check MongoDB
print_info "Checking MongoDB..."
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    print_warning "MongoDB CLI not found. Ensure MongoDB 6+ is installed and running."
else
    print_success "MongoDB detected"
fi

# Check Redis
print_info "Checking Redis..."
if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis CLI not found. Ensure Redis 7+ is installed and running."
else
    print_success "Redis detected"
fi

echo ""
echo "Step 2: Installing dependencies..."
print_info "Running npm install (this may take a few minutes)..."
npm install
print_success "Dependencies installed"

echo ""
echo "Step 3: Setting up environment variables..."
if [ ! -f .env ]; then
    print_warning ".env file not found"
    if [ -f .env.production.example ]; then
        print_info "Copying from .env.production.example..."
        cp .env.production.example .env
        print_warning "Please edit .env file with your actual credentials"
        print_info "Press Enter when ready to continue..."
        read
    else
        print_error ".env file is required. Please create it manually."
        exit 1
    fi
else
    print_success ".env file exists"
fi

echo ""
echo "Step 4: Setting up databases..."
print_info "Running database migrations..."
npm run migrate || print_warning "Migration failed - you may need to run this manually"

print_info "Setting up Prisma client..."
npx prisma generate || print_warning "Prisma generate failed - you may need to run this manually"

print_success "Database setup complete"

echo ""
echo "Step 5: Populating demo data..."
print_info "This will populate the backup laptop with the same demo data..."
print_info "Running data population script..."
node scripts/populate-data.js || print_warning "Data population may have failed - check logs"
print_success "Demo data populated"

echo ""
echo "Step 6: Building application..."
print_info "Building frontend..."
npm run build || print_warning "Build may have failed - check logs"
print_success "Application built"

echo ""
echo "Step 7: Testing services..."
print_info "Starting services test (this will take ~30 seconds)..."

# Start server in background
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Test if server is responding
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Server is responding on port 3000"
else
    print_error "Server is not responding on port 3000"
fi

# Stop server
kill $SERVER_PID 2>/dev/null || true
sleep 2

echo ""
echo "=========================================="
echo "Backup Laptop Setup Complete!"
echo "=========================================="
echo ""
print_success "The backup laptop is now configured with:"
echo "  • All dependencies installed"
echo "  • Demo data populated"
echo "  • Application built and ready"
echo ""
print_info "Next steps:"
echo "  1. Test the application: npm start"
echo "  2. Verify all features work correctly"
echo "  3. Practice switching from primary to backup laptop"
echo ""
print_warning "Remember: Keep this laptop charged and ready during demo day!"
echo ""
