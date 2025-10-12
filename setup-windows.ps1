# WellSense AI - Windows Setup Script
# Run this script in PowerShell as Administrator

Write-Host "🚀 Setting up WellSense AI on Windows..." -ForegroundColor Green

# Check if Node.js is installed
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host "🗄️ Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️ MongoDB not detected. Attempting to start..." -ForegroundColor Yellow
    try {
        Start-Service -Name "MongoDB" -ErrorAction Stop
        Write-Host "✅ MongoDB service started" -ForegroundColor Green
    } catch {
        Write-Host "❌ MongoDB not found. Please install MongoDB or use MongoDB Atlas" -ForegroundColor Red
        Write-Host "   Download: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
        Write-Host "   Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor Cyan
    }
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️ .env file not found. Creating default .env file..." -ForegroundColor Yellow
    @"
MONGODB_URI=mongodb://localhost:27017/wellsense-ai
NODE_ENV=development
JWT_SECRET=wellsense-ai-super-secret-jwt-key-$(Get-Random)
OPENAI_API_KEY=your-openai-api-key-here
PORT=5000
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created. Please update OPENAI_API_KEY with your actual key." -ForegroundColor Green
}

# Initialize database with demo data
Write-Host "🌱 Initializing database with demo data..." -ForegroundColor Yellow
try {
    node scripts/initDatabase.js --seed --users=10
    Write-Host "✅ Database initialized successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Database initialization failed. You can run it manually later:" -ForegroundColor Yellow
    Write-Host "   cd server && node scripts/initDatabase.js --seed" -ForegroundColor Cyan
}

# Go back to root
Set-Location ..

Write-Host "`n🎉 Setup completed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update server/.env with your OpenAI API key" -ForegroundColor White
Write-Host "2. Start the backend: cd server && npm start" -ForegroundColor White
Write-Host "3. Start the frontend: npm run dev" -ForegroundColor White
Write-Host "4. Open http://localhost:3000 in your browser" -ForegroundColor White

Write-Host "`n🔧 Useful commands:" -ForegroundColor Cyan
Write-Host "   npm run start:full    # Start both frontend and backend" -ForegroundColor White
Write-Host "   npm run install:all   # Install all dependencies" -ForegroundColor White

Write-Host "`n🆘 If you encounter issues:" -ForegroundColor Cyan
Write-Host "   Check SETUP_WINDOWS.md for detailed troubleshooting" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")