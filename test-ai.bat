@echo off
echo WellSense AI - AI Provider Testing
echo ===================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is available
echo.

echo Checking project structure...
if not exist "server\services\aiIntegrationService.js" (
    echo ❌ AI integration service not found
    echo Please run 'setup-ai.bat' first
    pause
    exit /b 1
)

echo ✅ AI integration service found
echo.

echo Testing AI providers...
echo This will test all configured AI providers and show their status
echo.
node test-ai-providers.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ AI testing failed
    echo.
    echo Troubleshooting tips:
    echo 1. Check your .env file for correct API keys
    echo 2. Ensure you have internet connection
    echo 3. Verify API keys are valid and have credits
    echo 4. Run 'setup-ai.bat' if you haven't already
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ AI Provider Testing Complete!
echo.
echo Your AI integration is working properly.
echo You can now start the full application with confidence.
echo.
echo To start the application:
echo • Frontend only: start-frontend.bat
echo • Full stack: start-full-stack.bat
echo.
pause