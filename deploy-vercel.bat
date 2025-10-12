@echo off
echo 🚀 Deploying WellSense AI to Vercel...
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo 🔨 Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 📋 Next steps:
echo 1. Install Vercel CLI: npm i -g vercel
echo 2. Login to Vercel: vercel login
echo 3. Deploy: vercel --prod
echo.
echo 🌐 Your app will be available at: https://your-app-name.vercel.app
echo.
pause