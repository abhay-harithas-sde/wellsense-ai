@echo off
echo 🔧 WellSense AI - Fix and Start
echo =================================
echo.

echo [1/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Install from nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js available

echo.
echo [2/4] Clearing cache and reinstalling...
if exist "node_modules" (
    echo Removing old node_modules...
    rmdir /s /q node_modules
)

echo Installing fresh dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

echo.
echo [3/4] Checking environment configuration...
if not exist ".env" (
    echo Creating .env file...
    echo VITE_API_URL=http://localhost:5000/api > .env
    echo VITE_APP_NAME=WellSense AI >> .env
    echo VITE_DEMO_MODE=true >> .env
)
echo ✅ Environment configured

echo.
echo [4/4] Starting WellSense AI...
echo.
echo 🎯 FIXES APPLIED:
echo • Fixed process.env references for Vite
echo • Added proper environment variables
echo • Enhanced Vite configuration
echo • Fresh dependency installation
echo.
echo 🚀 Starting development server...
echo 🌐 Will open: http://localhost:3000
echo.

npm run dev

pause