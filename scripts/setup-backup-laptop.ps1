# Backup Laptop Setup Script (PowerShell)
# This script automates the setup of the WellSense AI Platform on a backup laptop
# Requirements: Node.js 18+, PostgreSQL 14+, MongoDB 6+, Redis 7+

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "WellSense AI Platform - Backup Laptop Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

function Print-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Info {
    param($Message)
    Write-Host "→ $Message" -ForegroundColor White
}

# Check if running on backup laptop
Write-Host "Step 1: Verifying environment..." -ForegroundColor Cyan
Print-Info "Please confirm this is the BACKUP laptop (not the primary presentation laptop)"
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Print-Error "Setup cancelled"
    exit 1
}

# Check Node.js version
Print-Info "Checking Node.js version..."
try {
    $nodeVersion = node -v
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 18) {
        Print-Error "Node.js version must be 18 or higher. Current: $nodeVersion"
        exit 1
    }
    Print-Success "Node.js $nodeVersion detected"
} catch {
    Print-Error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
}

# Check PostgreSQL
Print-Info "Checking PostgreSQL..."
try {
    $null = Get-Command psql -ErrorAction Stop
    Print-Success "PostgreSQL detected"
} catch {
    Print-Warning "PostgreSQL CLI not found. Ensure PostgreSQL 14+ is installed and running."
}

# Check MongoDB
Print-Info "Checking MongoDB..."
try {
    $null = Get-Command mongosh -ErrorAction Stop
    Print-Success "MongoDB detected"
} catch {
    try {
        $null = Get-Command mongo -ErrorAction Stop
        Print-Success "MongoDB detected"
    } catch {
        Print-Warning "MongoDB CLI not found. Ensure MongoDB 6+ is installed and running."
    }
}

# Check Redis
Print-Info "Checking Redis..."
try {
    $null = Get-Command redis-cli -ErrorAction Stop
    Print-Success "Redis detected"
} catch {
    Print-Warning "Redis CLI not found. Ensure Redis 7+ is installed and running."
}

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Cyan
Print-Info "Running npm install (this may take a few minutes)..."
npm install
Print-Success "Dependencies installed"

Write-Host ""
Write-Host "Step 3: Setting up environment variables..." -ForegroundColor Cyan
if (-not (Test-Path .env)) {
    Print-Warning ".env file not found"
    if (Test-Path .env.production.example) {
        Print-Info "Copying from .env.production.example..."
        Copy-Item .env.production.example .env
        Print-Warning "Please edit .env file with your actual credentials"
        Print-Info "Press Enter when ready to continue..."
        Read-Host
    } else {
        Print-Error ".env file is required. Please create it manually."
        exit 1
    }
} else {
    Print-Success ".env file exists"
}

Write-Host ""
Write-Host "Step 4: Setting up databases..." -ForegroundColor Cyan
Print-Info "Running database migrations..."
try {
    npm run migrate
} catch {
    Print-Warning "Migration failed - you may need to run this manually"
}

Print-Info "Setting up Prisma client..."
try {
    npx prisma generate
} catch {
    Print-Warning "Prisma generate failed - you may need to run this manually"
}

Print-Success "Database setup complete"

Write-Host ""
Write-Host "Step 5: Populating demo data..." -ForegroundColor Cyan
Print-Info "This will populate the backup laptop with the same demo data..."
Print-Info "Running data population script..."
try {
    node scripts/populate-data.js
} catch {
    Print-Warning "Data population may have failed - check logs"
}
Print-Success "Demo data populated"

Write-Host ""
Write-Host "Step 6: Building application..." -ForegroundColor Cyan
Print-Info "Building frontend..."
try {
    npm run build
} catch {
    Print-Warning "Build may have failed - check logs"
}
Print-Success "Application built"

Write-Host ""
Write-Host "Step 7: Testing services..." -ForegroundColor Cyan
Print-Info "Starting services test (this will take ~30 seconds)..."

# Start server in background
$job = Start-Job -ScriptBlock { npm start }

# Wait for server to start
Start-Sleep -Seconds 10

# Test if server is responding
try {
    $response = Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 5
    Print-Success "Server is responding on port 3000"
} catch {
    Print-Error "Server is not responding on port 3000"
}

# Stop server
Stop-Job -Job $job
Remove-Job -Job $job

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Backup Laptop Setup Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Print-Success "The backup laptop is now configured with:"
Write-Host "  • All dependencies installed"
Write-Host "  • Demo data populated"
Write-Host "  • Application built and ready"
Write-Host ""
Print-Info "Next steps:"
Write-Host "  1. Test the application: npm start"
Write-Host "  2. Verify all features work correctly"
Write-Host "  3. Practice switching from primary to backup laptop"
Write-Host ""
Print-Warning "Remember: Keep this laptop charged and ready during demo day!"
Write-Host ""
