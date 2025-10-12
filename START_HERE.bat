@echo off
echo.
echo ========================================
echo 🚀 WellSense AI - Quick Start
echo ========================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

echo Installing dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo ✅ Dependencies ready
echo.

echo 🎬 Starting WellSense AI Demo
echo ==============================
echo.
echo Features available:
echo • Complete health dashboard
echo • AI chat with fallback responses
echo • Nutrition tracking and analysis  
echo • Workout planning
echo • Mental wellness features
echo • Community platform
echo • Progress analytics
echo.
echo 🌐 Will open: http://localhost:3000
echo.
echo Starting development server...
echo.

npm run dev

pause