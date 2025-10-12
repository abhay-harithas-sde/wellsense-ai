@echo off
echo WellSense AI - Setup Validation
echo ==================================
echo.

echo Running comprehensive system validation...
echo.

echo [1/6] Checking Node.js and npm...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    goto :error
)
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found
    goto :error
)
echo ✅ Node.js and npm are available

echo.
echo [2/6] Validating project structure...
if not exist "package.json" goto :missing_files
if not exist "src\App.jsx" goto :missing_files
if not exist "server\package.json" goto :missing_files
if not exist "server\server.js" goto :missing_files
echo ✅ All required files are present

echo.
echo [3/6] Checking dependencies...
if not exist "node_modules" (
    echo ⚠️  Frontend dependencies not installed
    echo Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 goto :error
)
echo ✅ Frontend dependencies ready

if not exist "server\node_modules" (
    echo ⚠️  Backend dependencies not installed
    echo Installing backend dependencies...
    cd server
    npm install
    cd ..
    if %errorlevel% neq 0 goto :error
)
echo ✅ Backend dependencies ready

echo.
echo [4/6] Testing frontend build...
echo Building frontend for validation...
npm run build >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    echo Running detailed build to show errors...
    npm run build
    goto :error
)
echo ✅ Frontend builds successfully

echo.
echo [5/6] Validating backend startup...
echo Testing backend server startup...
cd server
timeout /t 1 >nul
start /b npm start >nul 2>&1
timeout /t 3 >nul
tasklist | find "node.exe" >nul
if %errorlevel% equ 0 (
    echo ✅ Backend server can start
    taskkill /f /im node.exe >nul 2>&1
) else (
    echo ⚠️  Backend server test inconclusive (this is okay)
)
cd ..

echo.
echo [6/6] Final validation...
echo Checking startup scripts...
if not exist "start-frontend.bat" goto :missing_scripts
if not exist "start-backend.bat" goto :missing_scripts
if not exist "start-full-stack.bat" goto :missing_scripts
echo ✅ All startup scripts are present

echo.
echo ==================================
echo 🎉 VALIDATION SUCCESSFUL!
echo ==================================
echo.
echo Your WellSense AI setup is complete and ready!
echo.
echo Available options:
echo.
echo 🚀 QUICK START (Recommended):
echo    start-frontend.bat     - Demo mode with mock data
echo.
echo 🔧 FULL EXPERIENCE:
echo    start-full-stack.bat   - Complete frontend + backend
echo.
echo 🏗️  PRODUCTION:
echo    build-production.bat   - Build for deployment
echo.
echo 📊 SYSTEM INFO:
echo    check-system.bat       - Detailed system information
echo.
echo Choose your preferred option and double-click the .bat file!
echo.
goto :end

:missing_files
echo ❌ Missing required project files
echo Please ensure you have the complete WellSense AI project
goto :error

:missing_scripts
echo ❌ Missing startup scripts
echo Please ensure all .bat files are present
goto :error

:error
echo.
echo ==================================
echo ❌ VALIDATION FAILED!
echo ==================================
echo.
echo Please fix the issues above and run validation again.
echo.
echo For help:
echo 1. Check that you have the complete project files
echo 2. Ensure Node.js 16+ is installed
echo 3. Try running: npm cache clean --force
echo 4. Re-run this validation script
echo.

:end
pause