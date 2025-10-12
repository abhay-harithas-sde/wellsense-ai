@echo off
echo Starting WellSense AI Full Stack Application...
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
echo Installing all dependencies...
npm run install:all
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting both frontend and backend...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000
echo.
npm run start:full
pause