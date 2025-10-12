@echo off
echo 🎬 WellSense AI - Frontend Demo
echo ================================
echo.

echo This will start the frontend with full mock data
echo Perfect for demonstrations and feature testing
echo.

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Install from nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js available
echo.

echo Installing dependencies if needed...
if not exist "node_modules" (
    npm install >nul 2>&1
)

echo.
echo 🚀 Starting WellSense AI Frontend Demo
echo =====================================
echo.
echo Features available:
echo ✅ Complete health dashboard
echo ✅ AI chat with fallback responses  
echo ✅ Nutrition tracking and analysis
echo ✅ Workout planning interface
echo ✅ Mental wellness features
echo ✅ Community platform
echo ✅ Progress tracking and analytics
echo ✅ Responsive design (mobile/desktop)
echo.
echo 🌐 Opening http://localhost:3000
echo.

npm run dev