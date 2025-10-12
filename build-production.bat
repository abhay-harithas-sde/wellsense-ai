@echo off
echo Building WellSense AI for Production...
echo.

echo Installing dependencies...
npm run install:all
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building frontend for production...
npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build frontend
    pause
    exit /b 1
)

echo.
echo Production build completed successfully!
echo Built files are in the 'dist' folder
echo.
echo To serve the production build:
echo 1. Copy the 'dist' folder to your web server
echo 2. Start the backend server with: npm run server
echo 3. Configure your web server to serve the static files
echo.
pause