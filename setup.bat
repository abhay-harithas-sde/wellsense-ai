@echo off
echo 🚀 WellSense AI - Quick Setup
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install root dependencies (without postinstall script)
echo 📦 Installing root dependencies...
call npm install --ignore-scripts
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Run setup manually
echo ⚙️ Running setup configuration...
call npm run setup
echo.

REM Install server dependencies
echo 📦 Installing server dependencies...
if exist "server" (
    cd server
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install server dependencies
        pause
        exit /b 1
    )
    
    REM Create .env file if it doesn't exist
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
) else (
    echo ⚠️ Server directory not found. Frontend-only setup completed.
)

echo.
echo 🎉 Setup completed!
echo.
echo 📋 Next steps:
if exist "server" (
    echo 1. Update server/.env with your OpenAI API key if needed
    echo 2. Make sure MongoDB is running
    echo 3. Run: start-server.bat
    echo 4. In another terminal, run: npm run dev
) else (
    echo 1. Run: npm run dev
    echo 2. Open: http://localhost:3000
)
echo.
pause