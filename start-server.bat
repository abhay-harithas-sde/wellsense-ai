@echo off
echo 🚀 Starting WellSense AI Server...
echo.

REM Check if we're in the right directory
if not exist "server" (
    echo ❌ Please run this from the root directory of WellSense AI
    pause
    exit /b 1
)

cd server

REM Check if .env exists
if not exist ".env" (
    echo ❌ .env file not found. Please run setup.bat first
    pause
    exit /b 1
)

REM Try to initialize database first
echo 🗄️ Initializing database...
node scripts/initDatabase.js --seed --users=10
if %errorlevel% neq 0 (
    echo ⚠️ Database initialization failed, but continuing...
)

echo.
echo 🚀 Starting server...
echo 📋 Server will be available at: http://localhost:5000
echo 🏥 Health check: http://localhost:5000/api/health-check
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node server.js

pause