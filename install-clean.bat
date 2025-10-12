@echo off
echo 🧹 WellSense AI - Clean Installation
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Clean any existing installations
if exist "node_modules" (
    echo 🧹 Cleaning existing node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo 🧹 Removing package-lock.json...
    del package-lock.json
)

REM Clear npm cache
echo 🧹 Clearing npm cache...
call npm cache clean --force

REM Install dependencies without running scripts
echo 📦 Installing dependencies (clean)...
call npm install --ignore-scripts
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Root dependencies installed
echo.

REM Create frontend .env file
if not exist ".env" (
    echo ⚙️ Creating frontend .env file...
    (
        echo VITE_API_URL=http://localhost:5000/api
        echo VITE_APP_NAME=WellSense AI
        echo VITE_APP_VERSION=1.0.0
        echo VITE_ENABLE_VOICE_INPUT=true
        echo VITE_ENABLE_IMAGE_ANALYSIS=true
        echo VITE_ENABLE_COMMUNITY=true
    ) > .env
    echo ✅ Frontend .env file created
)

REM Install server dependencies if server exists
if exist "server" (
    echo 📦 Installing server dependencies...
    cd server
    
    if exist "node_modules" (
        rmdir /s /q node_modules
    )
    
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install server dependencies
        cd ..
        pause
        exit /b 1
    )
    
    REM Create server .env file
    if not exist ".env" (
        echo ⚙️ Creating server .env file...
        (
            echo MONGODB_URI=mongodb://localhost:27017/wellsense-ai
            echo NODE_ENV=development
            echo JWT_SECRET=wellsense-ai-super-secret-jwt-key-%RANDOM%
            echo OPENAI_API_KEY=your-openai-api-key-here
            echo PORT=5000
            echo FRONTEND_URL=http://localhost:3000
        ) > .env
        echo ✅ Server .env file created
    )
    
    cd ..
    echo ✅ Server dependencies installed
) else (
    echo ⚠️ Server directory not found. Frontend-only setup.
)

echo.
echo 🎉 Clean installation completed!
echo.
echo 📋 You can now:
if exist "server" (
    echo 1. Start frontend: npm run dev
    echo 2. Start backend: start-server.bat
    echo 3. Or start both: npm run start:full
) else (
    echo 1. Start frontend: npm run dev
    echo 2. Open: http://localhost:3000
)
echo.
echo 💡 If you need to setup the database:
echo    cd server && npm run db:seed
echo.
pause