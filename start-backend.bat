@echo off
echo Starting WellSense AI Backend Server...
echo.
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing backend dependencies...
cd server
npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)

echo.
echo Starting backend server...
echo Backend API will be available at: http://localhost:5000
echo Health check: http://localhost:5000/api/health-check
echo.
npm start
cd ..
pause