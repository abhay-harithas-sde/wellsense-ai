@echo off
echo 🚀 Starting WellSense AI Demo Platform
echo ========================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16+ from nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js is available

echo.
echo [2/3] Installing dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install >nul 2>&1
)
if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    npm install >nul 2>&1
    cd ..
)
echo ✅ Dependencies ready

echo.
echo [3/3] Starting WellSense AI...
echo.
echo 🎯 DEMO MODE ACTIVE
echo ==================
echo • Frontend: http://localhost:3000
echo • Backend API: http://localhost:5000 (if available)
echo • Features: All working with mock data
echo • AI Integration: Fallback responses active
echo.
echo Starting servers...
echo.

REM Start backend in background (will use mock data if DB fails)
echo Starting backend server...
start /b cmd /c "cd server && npm start >backend.log 2>&1"

REM Wait a moment for backend to initialize
timeout /t 3 >nul

REM Start frontend
echo Starting frontend application...
echo.
echo 🌟 WellSense AI will open in your browser shortly...
echo 📱 Access: http://localhost:3000
echo.
npm run dev

echo.
echo Demo session ended.
pause