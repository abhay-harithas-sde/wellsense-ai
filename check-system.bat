@echo off
echo WellSense AI - System Check
echo ================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo Minimum required version: 16.0.0
    goto :error
) else (
    echo ✅ Node.js is installed
)

echo.
echo Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    goto :error
) else (
    echo ✅ npm is available
)

echo.
echo Checking project structure...
if exist "package.json" (
    echo ✅ Frontend package.json found
) else (
    echo ❌ Frontend package.json missing
    goto :error
)

if exist "server\package.json" (
    echo ✅ Backend package.json found
) else (
    echo ❌ Backend package.json missing
    goto :error
)

if exist "src\App.jsx" (
    echo ✅ Frontend source files found
) else (
    echo ❌ Frontend source files missing
    goto :error
)

if exist "server\server.js" (
    echo ✅ Backend server file found
) else (
    echo ❌ Backend server file missing
    goto :error
)

echo.
echo Checking environment configuration...
if exist ".env" (
    echo ✅ Environment file exists
) else (
    echo ⚠️  Environment file not found (optional)
    echo   You can copy .env.example to .env for custom configuration
)

echo.
echo Checking ports availability...
netstat -an | find "3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is in use (frontend port)
    echo   You may need to close other applications
) else (
    echo ✅ Port 3000 is available
)

netstat -an | find "5000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 5000 is in use (backend port)
    echo   You may need to close other applications
) else (
    echo ✅ Port 5000 is available
)

echo.
echo ================================
echo ✅ System Check Complete!
echo.
echo Your system is ready for WellSense AI!
echo.
echo Next steps:
echo 1. Run 'start-frontend.bat' for demo mode
echo 2. Run 'start-full-stack.bat' for complete experience
echo 3. Run 'build-production.bat' for production build
echo.
goto :end

:error
echo.
echo ================================
echo ❌ System Check Failed!
echo.
echo Please fix the issues above and run this check again.
echo.

:end
pause